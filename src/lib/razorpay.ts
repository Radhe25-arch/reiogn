import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ── Plan metadata ─────────────────────────────────────────────────────────
export const PLAN_MAP = {
  STARTER: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER!,
    tokens:         1_000,
    priceINR:       1_499,
    label:          'Starter',
  },
  PRO: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO!,
    tokens:         5_000,
    priceINR:       3_999,
    label:          'Pro',
  },
  ELITE: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_ELITE!,
    tokens:         15_000,
    priceINR:       7_999,
    label:          'Elite',
  },
} as const

export type PlanKey = keyof typeof PLAN_MAP

// ── Verify webhook signature ──────────────────────────────────────────────
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  )
}

// ── Create subscription ───────────────────────────────────────────────────
export async function createSubscription(planKey: PlanKey, totalCount = 12) {
  const plan = PLAN_MAP[planKey]
  return razorpay.subscriptions.create({
    plan_id:     plan.razorpayPlanId,
    total_count: totalCount,
    quantity:    1,
  } as Parameters<typeof razorpay.subscriptions.create>[0])
}
