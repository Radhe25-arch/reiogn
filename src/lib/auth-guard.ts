import { NextRequest } from 'next/server'
import { getTokenFromRequest, verifyAccessToken, JwtPayload } from './jwt'
import { err } from './utils'

export async function requireAuth(
  req: NextRequest
): Promise<{ user: JwtPayload } | ReturnType<typeof err>> {
  const token = getTokenFromRequest(req)
  if (!token) return err('Unauthorized — no token', 401, 'NO_TOKEN')

  const payload = await verifyAccessToken(token)
  if (!payload) return err('Unauthorized — invalid or expired token', 401, 'INVALID_TOKEN')

  return { user: payload }
}

export function isErrorResponse(
  result: { user: JwtPayload } | ReturnType<typeof err>
): result is ReturnType<typeof err> {
  return !('user' in result)
}
