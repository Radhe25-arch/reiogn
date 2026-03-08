import { NextRequest }          from 'next/server'
import { prisma }               from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'
import { ok } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErrorResponse(auth)) return auth

  const user = await prisma.user.findUnique({
    where:   { id: auth.user.sub },
    include: {
      subscription: true,
      tokenLedger:  true,
      referralCode: true,
    },
  })

  if (!user) return new Response('Not found', { status: 404 })

  return ok({
    id:           user.id,
    name:         user.name,
    email:        user.email,
    role:         user.role,
    plan:         user.subscription?.plan ?? 'TRIAL',
    planStatus:   user.subscription?.status ?? 'TRIALING',
    tokens:       user.tokenLedger?.balance ?? 0,
    referralCode: user.referralCode?.code ?? null,
    trialEndsAt:  user.trialEndsAt,
    createdAt:    user.createdAt,
  })
}
