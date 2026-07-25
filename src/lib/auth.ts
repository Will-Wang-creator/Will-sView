import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  createUser,
  recordLogin,
  activateSubscription as dbActivateSubscription,
} from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export interface User {
  id: string;
  email: string;
  name: string;
  isSubscribed: boolean;
  subscriptionEnd?: string;
  memberSince: string;
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  memberSince: string;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
}): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    memberSince: user.memberSince,
    isSubscribed: user.isSubscribed,
    subscriptionEnd: user.subscriptionEnd ?? undefined,
  };
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    isSubscribed: user.isSubscribed,
    subscriptionEnd: user.subscriptionEnd,
    memberSince: user.memberSince,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await findUserByEmail(payload.email as string);
    if (!user) return null;
    return toPublicUser(user);
  } catch {
    return null;
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function login(
  email: string,
  password: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ user: User; token: string } | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  await recordLogin(user.id, user.email, meta?.ipAddress, meta?.userAgent);

  const publicUser = toPublicUser(user);
  const token = await createToken(publicUser);
  return { user: publicUser, token };
}

export async function register(
  email: string,
  password: string,
  name: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ user: User; token: string } | null> {
  const existing = await findUserByEmail(email);
  if (existing) return null;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash, name);

  await recordLogin(user.id, user.email, meta?.ipAddress, meta?.userAgent);

  const publicUser = toPublicUser(user);
  const token = await createToken(publicUser);
  return { user: publicUser, token };
}

export async function activateSubscription(
  email: string,
  endDate: string,
  planId?: string
): Promise<void> {
  await dbActivateSubscription(email, endDate, planId);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const user = await findUserByEmail(email);
  if (!user) return undefined;
  return toPublicUser(user);
}
