import { Injectable } from '@nestjs/common';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import {
  activateSubscription as dbActivateSubscription,
  createUser,
  findUserByEmail,
  recordLogin,
} from '../lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production',
);

export interface PublicUser {
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
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    memberSince: user.memberSince,
    isSubscribed: user.isSubscribed,
    subscriptionEnd: user.subscriptionEnd ?? undefined,
  };
}

@Injectable()
export class AuthService {
  async createToken(user: PublicUser): Promise<string> {
    return new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      isSubscribed: user.isSubscribed,
      subscriptionEnd: user.subscriptionEnd,
      memberSince: user.memberSince,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }

  async verifyToken(token: string): Promise<PublicUser | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = await findUserByEmail(payload.email as string);
      if (!user) return null;
      return toPublicUser(user);
    } catch {
      return null;
    }
  }

  async login(
    email: string,
    password: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ user: PublicUser; token: string } | null> {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    await recordLogin(user.id, user.email, meta?.ipAddress, meta?.userAgent);

    const publicUser = toPublicUser(user);
    const token = await this.createToken(publicUser);
    return { user: publicUser, token };
  }

  async register(
    email: string,
    password: string,
    name: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ user: PublicUser; token: string } | null> {
    const existing = await findUserByEmail(email);
    if (existing) return null;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, name);

    await recordLogin(user.id, user.email, meta?.ipAddress, meta?.userAgent);

    const publicUser = toPublicUser(user);
    const token = await this.createToken(publicUser);
    return { user: publicUser, token };
  }

  async activateSubscription(
    email: string,
    endDate: string,
    planId?: string,
  ): Promise<void> {
    await dbActivateSubscription(email, endDate, planId);
  }
}

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
