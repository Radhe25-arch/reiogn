import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

export const redis: Redis =
  globalThis.__redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    password:             process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 2,
    enableReadyCheck:     false,
    lazyConnect:          true,
    connectTimeout:       3000,
  })

if (process.env.NODE_ENV !== 'production') globalThis.__redis = redis

// ── Rate limiter ──────────────────────────────────────────────────────────
// Fails OPEN — if Redis is unavailable, requests are allowed through
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const redisKey = `rl:${key}`
    const current  = await redis.incr(redisKey)
    if (current === 1) await redis.expire(redisKey, windowSeconds)
    if (current > limit) {
      const ttl = await redis.ttl(redisKey)
      return { allowed: false, retryAfter: ttl }
    }
    return { allowed: true }
  } catch (e) {
    console.warn('[rateLimit] Redis unavailable, failing open:', (e as Error).message)
    return { allowed: true }
  }
}

// ── Session cache ─────────────────────────────────────────────────────────
export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  try {
    await redis.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds)
  } catch { /* non-critical */ }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(`cache:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

export async function cacheDel(key: string) {
  try {
    await redis.del(`cache:${key}`)
  } catch { /* non-critical */ }
}
