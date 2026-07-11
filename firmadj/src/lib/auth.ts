'use server';

import { cookies } from 'next/headers';
import { getUserByEmail } from './data';
import { Role, User } from './types';

export type Session = {
  userId: string;
  email: string;
  role: Role;
  name: string;
};

const COOKIE_NAME = 'firmadj_session';

export async function demoLogin(email: string, password: string): Promise<{ success: boolean; role?: Role; error?: string }> {
  const expected = ['client@firmadj.demo', 'dj@firmadj.demo', 'admin@firmadj.demo'];
  if (!expected.includes(email.toLowerCase())) {
    return { success: false, error: 'Ukendt demobruger' };
  }
  if (password !== 'Demo1234!') {
    return { success: false, error: 'Forkert adgangskode' };
  }
  const user = getUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Demobruger ikke fundet i databasen' };
  }
  const session: Session = { userId: user.id, email: user.email, role: user.role, name: user.name };
  (await cookies()).set(COOKIE_NAME, JSON.stringify(session), { httpOnly: true, secure: false, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return { success: true, role: user.role };
}

export async function getSession(): Promise<Session | null> {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(cookie) as Session;
  } catch {
    return null;
  }
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireRole(role: Role | Role[]): Promise<Session> {
  const session = await requireSession();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) throw new Error('Forbidden');
  return session;
}
