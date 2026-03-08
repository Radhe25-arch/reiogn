import { NextRequest } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { clearAuthCookies, verifyRefreshToken } from '@/lib/jwt'
import { ok } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('rg_refresh')?.value

  if (refreshToken) {
    const payload = await verifyRefreshToken(refreshToken)
    if (payload) {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { revokedAt: new Date() },
      }).catch(() => {})

      await prisma.auditLog.create({
        data: { userId: payload.sub, action: 'LOGOUT', severity: 'INFO' },
      }).catch(() => {})
    }
  }

  clearAuthCookies()
  return ok({ message: 'Logged out' })
}
