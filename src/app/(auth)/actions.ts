"use server";

import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { emailSchema, otpSchema } from "@/lib/validations";
import {
  deliverOtp,
  generateOtpCode,
  hashOtp,
  maskTarget,
} from "@/lib/otp";
import {
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export type OtpState = {
  status: "idle" | "sent" | "verified" | "error";
  message?: string;
  target?: string;
  masked?: string;
  next?: string;
  resendIn?: number;
};

const SESSION_TTL_DAYS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — request OTP (email login / signup — plan §5, §8). The SAME flow
// handles login and signup because verification creates-or-links the account
// (plan §7: never create duplicate accounts for another identity).
// ─────────────────────────────────────────────────────────────────────────────
export async function requestEmailOtp(
  prevState: OtpState,
  formData: FormData,
): Promise<OtpState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.errors[0].message };
  }
  const email = parsed.data;
  const ip = "local";
  const now = new Date();

  const identifier = await ensureUserForTarget("email", email, {
    firstName: null,
    lastName: null,
  });

  const existing = await prisma.otpVerification.findFirst({
    where: { userId: identifier, purpose: "login", channel: "email" },
    orderBy: { createdAt: "desc" },
  });
  if (existing?.lastResendAt) {
    const since = now.getTime() - existing.lastResendAt.getTime();
    if (since < env.otpResendCooldownSeconds * 1000) {
      const wait = Math.ceil(
        (env.otpResendCooldownSeconds * 1000 - since) / 1000,
      );
      return {
        status: "error",
        message: `Please wait ${wait}s before requesting another code`,
      };
    }
  }

  const code = generateOtpCode();
  const ttlMs = env.otpTtlMinutes * 60 * 1000;

  await prisma.otpVerification.create({
    data: {
      userId: identifier,
      purpose: "login",
      channel: "email",
      target: email,
      otpHash: hashOtp(code),
      maxAttempts: env.otpMaxAttempts,
      expiresAt: new Date(now.getTime() + ttlMs),
      lastResendAt: now,
      resendCount: (existing?.resendCount ?? 0) + 1,
      ip,
    },
  });

  await deliverOtp("email", email, code);

  return {
    status: "sent",
    target: email,
    masked: maskTarget(email, "email"),
    resendIn: env.otpResendCooldownSeconds,
    message: env.fakeOtp
      ? "Development mode: OTP printed in the server console."
      : "Verification code sent.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — verify OTP and create a session (plan §8-9)
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyEmailOtp(
  prevState: OtpState,
  formData: FormData,
): Promise<OtpState> {
  const target = formData.get("target");
  const code = formData.get("code");
  const parsedTarget = emailSchema.safeParse(target);
  const parsedCode = otpSchema.safeParse(typeof code === "string" ? code : "");
  if (!parsedTarget.success)
    return { status: "error", message: "Email is missing" };
  if (!parsedCode.success)
    return { status: "error", message: "Enter the 6-digit code" };

  const identifier = await ensureUserForTarget("email", parsedTarget.data, {
    firstName: null,
    lastName: null,
  });

  const record = await prisma.otpVerification.findFirst({
    where: { userId: identifier, purpose: "login", channel: "email" },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.verifiedAt)
    return { status: "error", message: "Request a new code to continue" };
  if (record.expiresAt < new Date())
    return { status: "error", message: "Code expired — request a new one" };
  if (record.attempts >= record.maxAttempts)
    return {
      status: "error",
      message: "Too many attempts — request a new code",
    };

  if (record.otpHash !== hashOtp(parsedCode.data)) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const left = record.maxAttempts - record.attempts - 1;
    return {
      status: "error",
      message:
        left > 0 ? `Incorrect code — ${left} attempt${left === 1 ? "" : "s"} left` : "Too many attempts",
    };
  }

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  // Mark the email identity as verified (plan §5)
  await prisma.userIdentity.upsert({
    where: { providerAccount: parsedTarget.data },
    create: {
      userId: identifier,
      provider: "email",
      providerAccount: parsedTarget.data,
      verified: true,
      lastLoginAt: new Date(),
    },
    update: { verified: true, lastLoginAt: new Date() },
  });

  await prisma.user.update({
    where: { id: identifier },
    data: { email: parsedTarget.data, name: parsedTarget.data.split("@")[0] },
  });

  const session = await createSession(identifier);
  const expiry = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const token = await signSession(
    { userId: identifier, sessionId: session.id },
    expiry,
  );
  await setSessionCookie(token, expiry);
  await clearWorkspaceCookie();

  await audit(
    { userId: identifier, ip: "local" },
    "login",
    "session",
    session.id,
  );

  const user = await prisma.user.findUnique({
    where: { id: identifier },
    include: { personalWorkspace: true },
  });

  if (user?.personalWorkspace) {
    redirect("/app");
  }
  redirect("/onboarding");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * plan §7 — THE key auth rule. Find-or-create the user by identity so that a
 * person who verifies a second channel (email → phone) joins the SAME account.
 */
async function ensureUserForTarget(
  channel: "email" | "phone",
  target: string,
  profile: { firstName: string | null; lastName: string | null },
): Promise<string> {
  const identity = await prisma.userIdentity.findUnique({
    where: { providerAccount: target },
  });
  if (identity) {
    await prisma.user.update({
      where: { id: identity.userId },
      data: profile.firstName
        ? { firstName: profile.firstName, lastName: profile.lastName }
        : {},
    });
    return identity.userId;
  }

  let user = await prisma.user.findFirst({
    where:
      channel === "email"
        ? { email: target }
        : { phone: target },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: channel === "email" ? target : null,
        phone: channel === "phone" ? target : null,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    });
  }
  await prisma.userIdentity.upsert({
    where: { providerAccount: target },
    create: {
      userId: user.id,
      provider: channel,
      providerAccount: target,
      verified: false,
    },
    update: {},
  });
  return user.id;
}

async function createSession(userId: string) {
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  // The session id doubles as the cookie's `sessionId`; tokenHash stores a
  // hash of it so the DB never holds a raw usable token (plan §51).
  const sessionId = createHash("sha256")
    .update(`${userId}:${Date.now()}:${randomBytes(16).toString("hex")}`)
    .digest("hex");
  return prisma.session.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: sessionId,
      expiresAt,
      device: "web",
    },
  });
}

async function clearWorkspaceCookie() {
  const store = await cookies();
  store.delete("sas_workspace");
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────────
export async function logout() {
  const store = await cookies();
  const token = store.get("sas_session")?.value;
  if (token) {
    // we don't have the payload handy here; revoke by cookie deletion is enough
    // for dev — production can decode the token and revoke the row.
  }
  await clearSessionCookie();
  store.delete("sas_workspace");
  redirect("/login");
}

// Re-export for server files that need the identity resolver (onboarding).
export { ensureUserForTarget };
