import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const secret = new TextEncoder().encode(env.authSecret);
const COOKIE_NAME = "sas_session";

export type SessionPayload = {
  userId: string;
  sessionId: string;
};

export async function signSession(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string | undefined;
    const sessionId = payload.sessionId as string | undefined;
    if (!userId || !sessionId) return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;

export async function getSessionToken() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
