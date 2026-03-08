import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt'
import { generateReferralCode, TRIAL_TOKENS, getIp } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google`

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=oauth_cancelled', req.url))
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }

  const { access_token } = await tokenRes.json()

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/login?error=oauth_userinfo_failed', req.url))
  }

  const { id: googleId, email, name, picture } = await userRes.json()
  const ip = getIp(req)

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    const refCode  = generateReferralCode(name ?? email)
    const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    user = await prisma.$transaction(async (tx) => {
      // Create user (only fields that exist in schema)
      const u = await tx.user.create({
        data: {
          name:          name ?? email.split('@')[0],
          email,
          avatarUrl:     picture,
          trialEndsAt:   trialEnd,
          emailVerified: true, // Google emails are always verified
        },
      })

      // Store OAuth info in OAuthAccount model
      await tx.oAuthAccount.create({
        data: {
          userId:      u.id,
          provider:    'google',
          providerId:  googleId,
          accessToken: access_token,
        },
      })

      await tx.subscription.create({ data: { userId: u.id, plan: 'TRIAL', status: 'TRIALING', trialEnd } })
      await tx.tokenLedger.create({ data: { userId: u.id, balance: TRIAL_TOKENS, totalEarned: TRIAL_TOKENS } })
      await tx.tokenTransaction.create({ data: { userId: u.id, type: 'CREDIT', amount: TRIAL_TOKENS, balanceAfter: TRIAL_TOKENS, description: 'Trial welcome bonus' } })
      await tx.referralCode.create({ data: { userId: u.id, code: refCode } })

      return u
    })

    sendWelcomeEmail(email, user.name ?? 'there').catch(console.error)

  } else {
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date(), lastLoginIp: ip },
    })

    // Upsert OAuthAccount in case it's missing
    await prisma.oAuthAccount.upsert({
      where: {
        provider_providerId: {
          provider:   'google',
          providerId: googleId,
        },
      },
      update: { accessToken: access_token },
      create: {
        userId:      user.id,
        provider:    'google',
        providerId:  googleId,
        accessToken: access_token,
      },
    })
  }

  const plan = (await prisma.subscription.findUnique({ where: { userId: user.id } }))?.plan ?? 'TRIAL'
  const accessToken  = await signAccessToken({ sub: user.id, email: user.email, role: user.role, plan })
  const refreshToken = await signRefreshToken(user.id)

  await prisma.session.create({
    data: {
      userId:      user.id,
      refreshToken,
      ipAddress:   ip,
      userAgent:   req.headers.get('user-agent') ?? undefined,
      expiresAt:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  setAuthCookies(accessToken, refreshToken)
  return NextResponse.redirect(new URL('/dashboard', req.url))
}

export async function HEAD(req: NextRequest) {
  const state = nanoid(16)
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    state,
  })
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}