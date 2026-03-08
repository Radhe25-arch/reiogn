import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'

// ── HTTP responses ────────────────────────────────────────────────────────
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, error: message, code }, { status })
}

// ── Password ──────────────────────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ── Referral code generator ───────────────────────────────────────────────
export function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X')
  return `REIOGN-${prefix}${nanoid(4).toUpperCase()}`
}

// ── Token cost per tool ───────────────────────────────────────────────────
export const TOOL_TOKEN_COST: Record<string, number> = {
  DEEP_WORK_ENGINE:    15,
  COGNITIVE_CLONE:     30,
  RESEARCH_BUILDER:    15,
  SKILL_ROI_ANALYZER:   5,
  MEMORY_INTELLIGENCE: 15,
  EXECUTION_OPTIMIZER: 15,
  OPPORTUNITY_RADAR:   30,
  DECISION_SIMULATOR:  30,
  FOCUS_SHIELD:         5,
  WEALTH_MAPPER:       30,
}

// ── Referral bonus per plan ───────────────────────────────────────────────
export const REFERRAL_BONUS: Record<string, number> = {
  TRIAL:   50,
  STARTER: 100,
  PRO:     150,
  ELITE:   250,
}

// ── Trial tokens ──────────────────────────────────────────────────────────
export const TRIAL_TOKENS = 500

// ── IP extraction ─────────────────────────────────────────────────────────
export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
