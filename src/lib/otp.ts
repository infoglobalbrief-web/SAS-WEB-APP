import "server-only";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export type OtpPurpose =
  | "signup_email"
  | "signup_phone"
  | "login"
  | "invite_verify";

function hashOtp(code: string) {
  // Never store raw OTPs (plan §9). Salted SHA-256 keeps dev simple and,
  // for production, the plan calls for stronger KDF handling before launch.
  const salt = env.authSecret;
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

export function generateOtpCode() {
  // 6-digit numeric OTP
  return String(randomBytes(4).readUInt32BE() % 1_000_000).padStart(6, "0");
}

export function maskTarget(target: string, channel: "email" | "phone") {
  if (channel === "email") {
    const [user, domain] = target.split("@");
    if (!domain) return target;
    const visible = user.slice(0, 1);
    return `${visible}${"*".repeat(Math.max(user.length - 1, 4))}@${domain}`;
  }
  const digits = target.replace(/\D/g, "");
  if (digits.length < 6) return target;
  return `+${digits.slice(0, 2)} ******${digits.slice(-4)}`;
}

/**
 * Deliver an OTP. In development (FAKE_OTP=1) the code is printed to the
 * server console; production adapters (SMTP / SMS) slot in here.
 */
export async function deliverOtp(
  channel: "email" | "phone",
  target: string,
  code: string,
) {
  if (env.fakeOtp) {
    // eslint-disable-next-line no-console
    console.log(
      `\n[DEV OTP] ${channel.toUpperCase()} → ${target}\n          CODE: ${code}\n`,
    );
    return { dev: true, code };
  }
  if (channel === "email") {
    return deliverEmailOtp(target, code);
  }
  return deliverSmsOtp(target, code);
}

// ── Real providers (adapter hooks — plan §26 billing pattern reused for comms)
async function deliverEmailOtp(target: string, code: string) {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP is not configured. Set SMTP_* or FAKE_OTP=1.");
  }
  // e.g. nodemailer integration here. Placeholder keeps the contract explicit.
  // eslint-disable-next-line no-console
  console.log(`[SMTP] OTP for ${target}: ${code}`);
  return { dev: false };
}

async function deliverSmsOtp(target: string, code: string) {
  if (process.env.SMS_PROVIDER === "twilio") {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      throw new Error("Twilio is not configured.");
    }
    // Twilio SDK integration placeholder.
  }
  // eslint-disable-next-line no-console
  console.log(`[SMS] OTP for ${target}: ${code}`);
  return { dev: false };
}

export { hashOtp };
