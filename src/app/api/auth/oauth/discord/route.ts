import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { generateReferralCode, TRIAL_TOKENS, getIp } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

const DISCORD_CLIENT_ID     = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/discord`

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=oauth_cancelled', req.url))
  }

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
    }),
  })

  const { access_token } = await tokenRes.json()
  if (!access_token) return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))

  const userRes    = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${access_token}` } })
  const discordUser = await userRes.json()

  if (!discordUser.email) return NextResponse.redirect(new URL('/login?error=no_email', req.url))

  const ip = getIp(req)
  let user = await prisma.user.findUnique({ where: { email: discordUser.email } })

  if (!user) {
    const avatar   = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null
    const refCode  = generateReferralCode(discordUser.username ?? discordUser.email)
    const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name:        discordUser.global_name ?? discordUser.username,
          email:       discordUser.email,
          avatarUrl:   avatar,
          provider:    'DISCORD',
          oauthId:     discordUser.id,
          trialEndsAt: trialEnd,
          emailVerifiedAt: discordUser.verified ? new Date() : null,
        },
      })
      await tx.subscription.create({ data: { userId: u.id, plan: 'TRIAL', status: 'TRIALING', trialEnd } })
      await tx.tokenLedger.create({ data: { userId: u.id, balance: TRIAL_TOKENS, totalEarned: TRIAL_TOKENS } })
      await tx.tokenTransaction.create({ data: { userId: u.id, type: 'CREDIT', amount: TRIAL_TOKENS, balanceAfter: TRIAL_TOKENS, description: 'Trial welcome bonus' } })
      await tx.referralCode.create({ data: { userId: u.id, code: refCode } })
      return u
    })

    sendWelcomeEmail(discordUser.email, user.name ?? 'there').catch(console.error)
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
