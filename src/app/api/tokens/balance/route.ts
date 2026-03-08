import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'
import { ok } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isErrorResponse(auth)) return auth

  try {
    const ledger = await prisma.tokenLedger.findUnique({
      where: { userId: auth.user.sub },
    })

    return ok({
      balance:    ledger?.balance    ?? 0,
      totalSpent: ledger?.totalSpent ?? 0,
      totalEarned: ledger?.totalEarned ?? 0,
    })
  } catch {
    // If DB unavailable, return zeros gracefully
    return ok({ balance: 0, totalSpent: 0, totalEarned: 0 })
  }
}
