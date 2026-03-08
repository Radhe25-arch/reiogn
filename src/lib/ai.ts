// ============================================================
//  REIOGN — Multi-Provider AI Engine
//  Key rotation + fallback chain + smart routing
//  Anthropic × N | Gemini × N | Groq × N | OpenAI × N
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import OpenAI    from 'openai'

export interface AIResponse {
  content:      string
  inputTokens:  number
  outputTokens: number
  costUsd:      number
  model:        string
  provider:     string
  keyIndex:     number
}

// ── Load all keys for a provider from env ─────────────────────────────────
// Reads PROVIDER_KEY_1 through PROVIDER_KEY_N + PROVIDER_API_KEY fallback
function loadKeys(prefix: string): string[] {
  const keys: string[] = []
  const single = process.env[`${prefix}_API_KEY`]
  if (single && single.length > 10) keys.push(single)
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`${prefix}_KEY_${i}`]
    if (k && k.length > 10) keys.push(k)
  }
  return [...new Set(keys)]
}

// Round-robin counters (in-memory, resets on restart — that's fine)
const counters: Record<string, number> = {}
function nextKey(provider: string, keys: string[]): { key: string; index: number } {
  if (!keys.length) throw new Error(`No API keys for ${provider}`)
  const i = (counters[provider] ?? 0) % keys.length
  counters[provider] = i + 1
  return { key: keys[i], index: i }
}

// ── Tool prompts ──────────────────────────────────────────────────────────

const TOOL_PROMPTS: Record<string, string> = {
  DEEP_WORK_ENGINE: `You are the Deep Work Engine — an elite cognitive performance optimizer built into REIOGN.
Given the user's goal, generate a structured deep work session plan with:
1. Cognitive load assessment (1-10 scale)
2. Recommended session blocks (duration, focus zones, task breakdown)
3. Break cadence and recovery protocol
4. Environmental setup checklist
5. Key metrics to track success
Be specific, actionable, and rigorous. Format with clear sections.`,

  COGNITIVE_CLONE: `You are the Cognitive Clone engine inside REIOGN.
Analyze the user's problem and simulate how a high-performance version of them would approach it.
Provide:
1. First-principles analysis
2. Mental models most applicable here
3. Step-by-step thinking process
4. Blind spots to watch for
5. The decision you'd make and why
Be direct, sharp, and contrarian where necessary.`,

  RESEARCH_BUILDER: `You are the Research Builder — a counter-intuitive research strategist inside REIOGN.
Given the user's topic, construct a research strategy that:
1. Starts from desired outcomes, works backward
2. Identifies non-obvious primary sources
3. Lists the 5 most underrated angles to explore
4. Suggests specific search operators, databases, and experts to contact
5. Provides a synthesis framework
Avoid generic advice. Be precise and actionable.`,

  SKILL_ROI_ANALYZER: `You are the Skill ROI Analyzer inside REIOGN.
For the given skill, compute detailed ROI projections across 3, 12, and 36-month horizons.
Include:
1. Market demand score (1-10) with reasoning
2. Income impact estimate (low/mid/high scenarios)
3. Time-to-competency estimate
4. Competing skills that provide better ROI
5. Specific resources to learn this skill fastest
6. Final ROI verdict: BUY / HOLD / SKIP`,

  MEMORY_INTELLIGENCE: `You are the Memory Intelligence engine inside REIOGN.
For the content the user wants to retain, generate:
1. A structured memory map (hierarchical breakdown)
2. 5 spaced repetition checkpoints (day 1, 3, 7, 21, 60)
3. 3 vivid memory anchors / mnemonics
4. Retrieval trigger questions
5. Connection links to existing knowledge`,

  EXECUTION_OPTIMIZER: `You are the Execution Optimizer inside REIOGN.
Take the user's goal and generate:
1. Critical path analysis (what MUST happen first)
2. Parallelization opportunities
3. Day-by-day micro-action plan for the first 7 days
4. Top 3 execution killers to avoid
5. A "minimum viable execution" version if time is short`,

  OPPORTUNITY_RADAR: `You are the Opportunity Radar inside REIOGN.
Scan the user's context and identify:
1. Top 7 non-obvious, high-leverage opportunities
2. For each: Impact, Effort, Time sensitivity, Why most miss it
3. Ranked by (Impact × Time-sensitivity) ÷ Effort
4. The single best opportunity to pursue NOW
5. One contrarian opportunity everyone ignores`,

  DECISION_SIMULATOR: `You are the Decision Simulator inside REIOGN.
For the user's decision, run a multi-scenario simulation:
1. Scenario A (optimistic)
2. Scenario B (realistic)
3. Scenario C (pessimistic)
4. Regret minimization analysis (Bezos framework)
5. Risk scores (financial, time, reputational, opportunity cost)
6. Final verdict with confidence level`,

  FOCUS_SHIELD: `You are the Focus Shield inside REIOGN.
Generate:
1. Top distraction patterns (digital, environmental, internal)
2. A personalized focus protocol
3. Environmental design changes
4. A "focus trigger" ritual (5-minute pre-work routine)
5. Emergency re-focus protocol`,

  WEALTH_MAPPER: `You are the Wealth Mapper inside REIOGN.
Generate a comprehensive wealth-building roadmap:
1. Current financial state assessment
2. 3-month quick wins
3. 12-month foundation building plan
4. 36-month wealth acceleration strategy
5. Asset allocation recommendation (specific percentages)
6. The single highest-leverage financial move this week`,
}

// ── Tier + provider routing ───────────────────────────────────────────────

type Tier = 'LIGHT' | 'MEDIUM' | 'HEAVY'

const TOOL_TIER: Record<string, Tier> = {
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

// Fallback chain per tier — tries providers in order until one succeeds
const PROVIDER_CHAIN: Record<Tier, string[]> = {
  LIGHT:  ['groq', 'gemini', 'anthropic', 'openai'],
  MEDIUM: ['gemini', 'groq',  'anthropic', 'openai'],
  HEAVY:  ['anthropic', 'gemini', 'openai', 'groq'],
}

// ── Anthropic ─────────────────────────────────────────────────────────────

const ANTHROPIC_MODEL: Record<Tier, string> = {
  HEAVY:  'claude-3-5-sonnet-20241022',
  MEDIUM: 'claude-3-5-haiku-20241022',
  LIGHT:  'claude-3-haiku-20240307',
}
const ANTHROPIC_COST: Record<Tier, { in: number; out: number }> = {
  HEAVY:  { in: 3.0,  out: 15.0 },
  MEDIUM: { in: 0.8,  out: 4.0  },
  LIGHT:  { in: 0.25, out: 1.25 },
}

async function callAnthropic(tier: Tier, sys: string, msg: string): Promise<AIResponse> {
  const { key, index } = nextKey('anthropic', loadKeys('ANTHROPIC'))
  const client = new Anthropic({ apiKey: key })
  const model  = ANTHROPIC_MODEL[tier]
  const res    = await client.messages.create({ model, max_tokens: 2000, system: sys, messages: [{ role: 'user', content: msg }] })
  const i = res.usage.input_tokens, o = res.usage.output_tokens
  const c = ANTHROPIC_COST[tier]
  return { content: (res.content[0] as { text: string }).text, inputTokens: i, outputTokens: o, costUsd: (i*c.in + o*c.out)/1e6, model, provider: 'anthropic', keyIndex: index }
}

// ── Gemini ────────────────────────────────────────────────────────────────

async function callGemini(tier: Tier, sys: string, msg: string): Promise<AIResponse> {
  const { key, index } = nextKey('gemini', loadKeys('GEMINI'))
  const model = tier === 'HEAVY' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest'
  const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const body  = {
    system_instruction: { parts: [{ text: sys }] },
    contents: [{ role: 'user', parts: [{ text: msg }] }],
    generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
  }
  const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data.error?.message}`)
  const content   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const i = data.usageMetadata?.promptTokenCount ?? 0
  const o = data.usageMetadata?.candidatesTokenCount ?? 0
  const costUsd = tier === 'HEAVY' ? (i*3.5 + o*10.5)/1e6 : (i*0.075 + o*0.30)/1e6
  return { content, inputTokens: i, outputTokens: o, costUsd, model, provider: 'gemini', keyIndex: index }
}

// ── Groq (free, ultra-fast) ───────────────────────────────────────────────

async function callGroq(sys: string, msg: string): Promise<AIResponse> {
  const { key, index } = nextKey('groq', loadKeys('GROQ'))
  const client = new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' })
  const model  = 'llama-3.3-70b-versatile'
  const res    = await client.chat.completions.create({
    model, temperature: 0.7, max_tokens: 2000,
    messages: [{ role: 'system', content: sys }, { role: 'user', content: msg }],
  })
  const i = res.usage?.prompt_tokens ?? 0, o = res.usage?.completion_tokens ?? 0
  return { content: res.choices[0]?.message?.content ?? '', inputTokens: i, outputTokens: o, costUsd: 0, model, provider: 'groq', keyIndex: index }
}

// ── OpenAI fallback ───────────────────────────────────────────────────────

async function callOpenAI(sys: string, msg: string): Promise<AIResponse> {
  const { key, index } = nextKey('openai', loadKeys('OPENAI'))
  const client = new OpenAI({ apiKey: key })
  const model  = 'gpt-4o-mini'
  const res    = await client.chat.completions.create({
    model, temperature: 0.7, max_tokens: 2000,
    messages: [{ role: 'system', content: sys }, { role: 'user', content: msg }],
  })
  const i = res.usage?.prompt_tokens ?? 0, o = res.usage?.completion_tokens ?? 0
  return { content: res.choices[0]?.message?.content ?? '', inputTokens: i, outputTokens: o, costUsd: (i*0.15 + o*0.60)/1e6, model, provider: 'openai', keyIndex: index }
}

// ── Main — auto-route + fallback chain ────────────────────────────────────

export async function callAI(toolName: string, userMessage: string): Promise<AIResponse> {
  const tier   = TOOL_TIER[toolName] ?? 'MEDIUM'
  const chain  = PROVIDER_CHAIN[tier]
  const sys    = TOOL_PROMPTS[toolName] ?? 'You are a helpful AI assistant inside REIOGN.'
  const errors: string[] = []

  for (const provider of chain) {
    try {
      switch (provider) {
        case 'anthropic': return await callAnthropic(tier, sys, userMessage)
        case 'gemini':    return await callGemini(tier, sys, userMessage)
        case 'groq':      return await callGroq(sys, userMessage)
        case 'openai':    return await callOpenAI(sys, userMessage)
      }
    } catch (e) {
      errors.push(`${provider}: ${(e as Error).message}`)
      console.warn(`[AI] ${provider} failed, trying next`)
      continue
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(' | ')}`)
}

export function getProviderStatus() {
  return {
    anthropic: loadKeys('ANTHROPIC').length,
    gemini:    loadKeys('GEMINI').length,
    groq:      loadKeys('GROQ').length,
    openai:    loadKeys('OPENAI').length,
  }
}
