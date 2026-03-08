import { NextRequest, NextResponse } from 'next/server'

// ── Security headers applied to every response ────────────────────────────
export function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options',    'nosniff')
  res.headers.set('X-Frame-Options',           'DENY')
  res.headers.set('X-XSS-Protection',          '1; mode=block')
  res.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=()')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com https://api.groq.com https://api.openai.com; " +
    "frame-src https://api.razorpay.com https://checkout.razorpay.com;"
  )
  return res
}

// ── Input sanitization ────────────────────────────────────────────────────
export function sanitizeString(input: unknown, maxLen = 4000): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, '') // basic XSS strip
}

export function sanitizeEmail(input: unknown): string {
  const s = sanitizeString(input, 254)
  return s.toLowerCase().replace(/[^a-z0-9@._+-]/g, '')
}

// ── IP extraction ─────────────────────────────────────────────────────────
export function getIpFromRequest(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??        // Cloudflare
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Bot detection ─────────────────────────────────────────────────────────
export function isSuspiciousRequest(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') ?? ''
  const suspicious = [
    'curl/', 'wget/', 'python-requests', 'axios/', 'node-fetch',
    'scrapy', 'bot', 'crawler', 'spider',
  ]
  // Only block on auth endpoints, not API in general
  return suspicious.some(s => ua.toLowerCase().includes(s))
}

// ── CORS helper ───────────────────────────────────────────────────────────
export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return {
    'Access-Control-Allow-Origin':  origin === allowed ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age':       '86400',
  }
}
