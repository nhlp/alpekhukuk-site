import { SignJWT, jwtVerify } from "jose";

import type { Role } from "@/generated/prisma/client";

export const SESSION_COOKIE = "alpek_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 gün

export type SessionPayload = {
  userId: string;
  role: Role;
  name: string;
  slug: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET tanımlı değil (.env dosyasını kontrol edin).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.role === "string" &&
      typeof payload.name === "string" &&
      typeof payload.slug === "string"
    ) {
      return {
        userId: payload.userId,
        role: payload.role as Role,
        name: payload.name,
        slug: payload.slug,
      };
    }
    return null;
  } catch {
    return null;
  }
}
