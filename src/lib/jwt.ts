import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export interface JwtPayload {
  sub:   string   // userId
  email: string
  role:  string
  plan:  string
  name?: string
}

// ── Sign ────────────────────────────────────────────────────────────────
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRY ?? '15m')
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRY ?? '7d')
    .sign(REFRESH_SECRET)
}

// ── Verify ───────────────────────────────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload as { sub: string }
  } catch {
    return null
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────
export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies()
  cookieStore.set('rg_access', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,           // 15 min
    path: '/',
  })
  cookieStore.set('rg_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    path: '/',
  })
}

export function clearAuthCookies() {
  const cookieStore = cookies()
  cookieStore.delete('rg_access')
  cookieStore.delete('rg_refresh')
}

// ── Extract from request ──────────────────────────────────────────────────
export function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Cookie
  const cookie = req.cookies.get('rg_access')?.value
  if (cookie) return cookie
  // 2. Bearer header
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}
