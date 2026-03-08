import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, ok, err, getIp } from '@/lib/utils'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { rateLimit } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  // Rate limit
  try {
    const rl = await rateLimit(`login:${ip}`, 10, 900)
    if (!rl.allowed) return err(`Too many attempts. Retry in ${rl.retryAfter}s`, 429)
  } catch { /* Redis down — allow */ }

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON body')

  const { email, password } = body
  if (!email || !password) return err('email and password are required')

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } }).catch(() => null)
  if (!user || !user.passwordHash) return err('Invalid email or password', 401)

  // Check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const secs = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
    return err(`Account locked. Retry in ${secs}s`, 423)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    const attempts = user.loginAttempts + 1
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: attempts, lockedUntil } }).catch(() => {})
    return err('Invalid email or password', 401)
  }

  // Reset attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
  }).catch(() => {})

  const [access, refresh] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role, plan: 'TRIAL' }),
    signRefreshToken(user.id),
  ])

  setAuthCookies(access, refresh)
  return ok({ user: { id: user.id, name: user.name, email: user.email } })
}
