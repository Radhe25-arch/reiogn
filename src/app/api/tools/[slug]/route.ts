import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'
import { callAI } from '@/lib/ai'
import { TOOL_TOKEN_COST, ok, err } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds

// Slug → ToolName enum mapping
const SLUG_TO_TOOL: Record<string, string> = {
  'deep-work-engine':    'DEEP_WORK_ENGINE',
  'cognitive-clone':     'COGNITIVE_CLONE',
  'research-builder':    'RESEARCH_BUILDER',
  'skill-roi-analyzer':  'SKILL_ROI_ANALYZER',
  'memory-intelligence': 'MEMORY_INTELLIGENCE',
  'execution-optimizer': 'EXECUTION_OPTIMIZER',
  'opportunity-radar':   'OPPORTUNITY_RADAR',
  'decision-simulator':  'DECISION_SIMULATOR',
  'focus-shield':        'FOCUS_SHIELD',
  'wealth-mapper':       'WEALTH_MAPPER',
}

const TOOL_WEIGHT: Record<string, 'LIGHT' | 'MEDIUM' | 'HEAVY'> = {
  SKILL_ROI_ANALYZER:  'LIGHT',
  FOCUS_SHIELD:        'LIGHT',
  DEEP_WORK_ENGINE:    'MEDIUM',
  RESEARCH_BUILDER:    'MEDIUM',
  MEMORY_INTELLIGENCE: 'MEDIUM',
  EXECUTION_OPTIMIZER: 'MEDIUM',
  COGNITIVE_CLONE:     'HEAVY',
  OPPORTUNITY_RADAR:   'HEAVY',
  DECISION_SIMULATOR:  'HEAVY',
  WEALTH_MAPPER:       'HEAVY',
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireAuth(req)
  if (isErrorResponse(auth)) return auth

  const toolName = SLUG_TO_TOOL[params.slug]
  if (!toolName) return err('Unknown tool', 404)

  const body = await req.json().catch(() => null)
  if (!body?.message?.trim()) return err('message is required')

  const tokenCost = TOOL_TOKEN_COST[toolName] ?? 15

  // ── Check subscription & tokens ──────────────────────────────────────────
  let subscription: { plan: string; status: string } | null = null
  let ledger: { balance: number; totalSpent: number } | null = null

  try {
    ;[subscription, ledger] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId: auth.user.sub } }),
      prisma.tokenLedger.findUnique({ where: { userId: auth.user.sub } }),
    ])
  } catch {
    return err('Database unavailable. Please try again.', 503)
  }

  // Must have an active subscription
  const isActive =
    subscription &&
    ['TRIALING', 'ACTIVE'].includes(subscription.status)

  if (!isActive) {
    return err('Active subscription required. Please upgrade your plan.', 403)
  }

  const balance = ledger?.balance ?? 0
  if (balance < tokenCost) {
    return err(`Insufficient tokens. Need ${tokenCost}, have ${balance}.`, 402)
  }

  // ── Deduct tokens (optimistic) ────────────────────────────────────────────
  let updatedLedger: { balance: number; totalSpent: number }
  try {
    updatedLedger = await prisma.tokenLedger.update({
      where: { userId: auth.user.sub },
      data: {
        balance:    { decrement: tokenCost },
        totalSpent: { increment: tokenCost },
      },
    })
  } catch {
    return err('Failed to deduct tokens. Please try again.', 503)
  }

  // ── Call AI ────────────────────────────────────────────────────────────────
  const start = Date.now()
  let aiResult: Awaited<ReturnType<typeof callAI>>

  try {
    aiResult = await callAI(toolName, body.message)
  } catch (e) {
    // Refund tokens on AI failure
    try {
      await prisma.tokenLedger.update({
        where: { userId: auth.user.sub },
        data: {
          balance:    { increment: tokenCost },
          totalSpent: { decrement: tokenCost },
        },
      })
    } catch { /* best effort refund */ }

    return err(`AI unavailable: ${(e as Error).message}. Tokens refunded.`, 503)
  }

  const durationMs = Date.now() - start

  // ── Persist usage log (non-blocking) ─────────────────────────────────────
  prisma.toolUsage.create({
    data: {
      userId:      auth.user.sub,
      tool:        toolName as any,
      weight:      TOOL_WEIGHT[toolName] as any,
      tokensUsed:  tokenCost,
      inputTokens: aiResult.inputTokens,
      outputTokens:aiResult.outputTokens,
      aiCostUsd:   aiResult.costUsd,
      provider:    aiResult.provider,
      durationMs,
      success:     true,
    },
  }).catch(() => { /* non-fatal */ })

  prisma.tokenTransaction.create({
    data: {
      userId:      auth.user.sub,
      type:        'DEBIT',
      amount:      tokenCost,
      balanceAfter: updatedLedger.balance,
      description: `${toolName} usage`,
      toolName:    toolName as any,
    },
  }).catch(() => { /* non-fatal */ })

  return ok({
    tool:            toolName,
    result:          aiResult.content,
    tokensUsed:      tokenCost,
    tokensRemaining: updatedLedger.balance,
    model:           aiResult.model,
    provider:        aiResult.provider,
    durationMs,
  })
}
