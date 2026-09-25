import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type AuthSession = {
  user: AuthUser;
  sessionId: string;
};

/**
 * Resolve the authenticated user from the session cookie.
 * `cache()` de-duplicates DB lookups within a single request tree.
 */
export const getAuthUser = cache(async (): Promise<AuthSession | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  const payload: SessionPayload | null = await verifySessionToken(token);
  if (!payload) return null;

  // The session row is the source of truth for revocation / expiry.
  const session = await prisma.session.findUnique({
    where: { tokenHash: payload.sessionId },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    },
    sessionId: session.id,
  };
});

export async function requireUser(): Promise<AuthSession> {
  const session = await getAuthUser();
  if (!session) redirect("/login");
  return session;
}
