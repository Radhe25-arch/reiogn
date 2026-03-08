import { NextRequest } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { hashPassword, generateReferralCode, TRIAL_TOKENS, ok, err, getIp } from '@/lib/utils'
import { rateLimit }    from '@/lib/redis'
import { sendWelcomeEmail } from '@/lib/email'
import { nanoid }       from 'nanoid'

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  // Rate limit — fails open if Redis unavailable
  try {
    const rl = await rateLimit(`signup:${ip}`, 5, 3600)
    if (!rl.allowed) return err(`Too many requests. Retry in ${rl.retryAfter}s`, 429)
  } catch { /* Redis down — allow through */ }

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON body')

  const { name, email, password, referralCode } = body

  if (!name || !email || !password)
    return err('name, email and password are required')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return err('Invalid email address')

  if (password.length < 8)
    return err('Password must be at least 8 characters')

  // Check existing user
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return err('An account with this email already exists', 409)
  } catch (dbErr) {
    console.error('[signup] DB connection error:', dbErr)
    return err('Database unavailable. Please try again shortly.', 503)
  }

  const passwordHash = await hashPassword(password)
  const refCode      = generateReferralCode(name)
  const now          = new Date()
  const trialEnd     = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  let user: Awaited<ReturnType<typeof prisma.user.create>>
  try {
    user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          emailVerifyToken: nanoid(32),
          trialEndsAt: trialEnd,
        },
      })
      await tx.subscription.create({ data: { userId: u.id, plan: 'TRIAL', status: 'TRIALING', trialEnd } })
      await tx.tokenLedger.create({ data: { userId: u.id, balance: TRIAL_TOKENS, totalEarned: TRIAL_TOKENS } })
      await tx.tokenTransaction.create({ data: { userId: u.id, type: 'CREDIT', amount: TRIAL_TOKENS, balanceAfter: TRIAL_TOKENS, description: 'Trial welcome bonus' } })
      await tx.referralCode.create({ data: { userId: u.id, code: refCode } })

      if (referralCode) {
        const rc = await tx.referralCode.findUnique({ where: { code: referralCode } })
        if (rc && rc.userId !== u.id) {
          await tx.referral.create({ data: { referrerId: rc.userId, referredUserId: u.id, referralCodeId: rc.id, bonusGranted: false } })
          await tx.referralCode.update({ where: { id: rc.id }, data: { usedCount: { increment: 1 } } })
        }
      }
      return u
    })
  } catch (txErr) {
    console.error('[signup] Transaction error:', txErr)
    return err('Account creation failed. Please try again.', 500)
  }

  // Non-critical — don't fail signup if these error
  try { await prisma.auditLog.create({ data: { userId: user.id, action: 'SIGNUP', ipAddress: ip, severity: 'INFO' } }) } catch { /* ok */ }

  const accessToken  = await signAccessToken({ sub: user.id, email, role: 'USER', plan: 'TRIAL' })
  const refreshToken = await signRefreshToken(user.id)

  try {
    await prisma.session.create({
      data: { userId: user.id, refreshToken, ipAddress: ip, userAgent: req.headers.get('user-agent') ?? undefined, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })
  } catch { /* non-critical */ }

  setAuthCookies(accessToken, refreshToken)
  sendWelcomeEmail(email, name).catch(console.error)

  return ok({ user: { id: user.id, name, email, role: 'USER', plan: 'TRIAL' }, accessToken, redirectTo: '/dashboard' }, 201)
}
