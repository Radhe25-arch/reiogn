import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { generateReferralCode, TRIAL_TOKENS, getIp } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

const GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/github`

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=oauth_cancelled', req.url))
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
  })

  const { access_token } = await tokenRes.json()
  if (!access_token) return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))

  const userRes  = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'REIOGN' } })
  const emailRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'REIOGN' } })

  const githubUser   = await userRes.json()
  const emails: any[] = await emailRes.json()
  const primaryEmail = emails.find(e => e.primary && e.verified)?.email ?? githubUser.email

  if (!primaryEmail) return NextResponse.redirect(new URL('/login?error=no_email', req.url))

  const ip = getIp(req)
  let user = await prisma.user.findUnique({ where: { email: primaryEmail } })

  if (!user) {
    const refCode  = generateReferralCode(githubUser.login ?? primaryEmail)
    const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name:        githubUser.name ?? githubUser.login,
          email:       primaryEmail,
          avatarUrl:   githubUser.avatar_url,
          provider:    'GITHUB',
          oauthId:     String(githubUser.id),
          trialEndsAt: trialEnd,
          emailVerifiedAt: new Date(),
        },
      })
      await tx.subscription.create({ data: { userId: u.id, plan: 'TRIAL', status: 'TRIALING', trialEnd } })
      await tx.tokenLedger.create({ data: { userId: u.id, balance: TRIAL_TOKENS, totalEarned: TRIAL_TOKENS } })
      await tx.tokenTransaction.create({ data: { userId: u.id, type: 'CREDIT', amount: TRIAL_TOKENS, balanceAfter: TRIAL_TOKENS, description: 'Trial welcome bonus' } })
      await tx.referralCode.create({ data: { userId: u.id, code: refCode } })
      return u
    })

    sendWelcomeEmail(primaryEmail, user.name ?? 'there').catch(console.error)
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), lastLoginIp: ip } })
  }

  const plan = (await prisma.subscription.findUnique({ where: { userId: user.id } }))?.plan ?? 'TRIAL'
  const accessToken  = await signAccessToken({ sub: user.id, email: user.email, role: user.role, plan })
  const refreshToken = await signRefreshToken(user.id)

  await prisma.session.create({
    data: { userId: user.id, refreshToken, ipAddress: ip, userAgent: req.headers.get('user-agent') ?? undefined, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  })

  setAuthCookies(accessToken, refreshToken)
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
