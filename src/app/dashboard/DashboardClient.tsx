'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User       { id: string; name: string; email: string; plan: string }
interface TokenInfo  { balance: number; totalSpent: number }
interface AIResult   { tool: string; result: string; tokensUsed: number; tokensRemaining: number; model: string; provider: string; durationMs: number }
interface HistoryItem{ id: string; tool: string; result: string; tokensUsed: number; model: string; provider: string; durationMs: number; timestamp: number; message: string }

const TOOLS = [
  { id:'DEEP_WORK_ENGINE',    slug:'deep-work-engine',    name:'Deep Work Engine',    icon:'⚡', cost:15, tier:'MEDIUM', color:'lime', desc:'Structure your next deep work session for maximum output and zero distraction.',       placeholder:'e.g. I need to write 5000 words of my thesis today. My focus peaks at 9am...' },
  { id:'COGNITIVE_CLONE',     slug:'cognitive-clone',     name:'Cognitive Clone',     icon:'🧠', cost:30, tier:'HEAVY',  color:'teal', desc:'Simulate your high-performance self and get decisions your best version would make.',  placeholder:'e.g. I am deciding whether to quit my job and start a SaaS. Current MRR is $0...' },
  { id:'RESEARCH_BUILDER',    slug:'research-builder',    name:'Research Builder',    icon:'🔬', cost:15, tier:'MEDIUM', color:'lime', desc:'Build a counter-intuitive research strategy from first principles.',                    placeholder:'e.g. I want to understand the Indian EV market from first principles...' },
  { id:'SKILL_ROI_ANALYZER',  slug:'skill-roi-analyzer',  name:'Skill ROI Analyzer',  icon:'📊', cost:5,  tier:'LIGHT',  color:'teal', desc:'Get precise ROI projections across 3, 12 and 36-month horizons for any skill.',       placeholder:'e.g. Should I learn Rust or TypeScript as a backend developer in 2025?' },
  { id:'MEMORY_INTELLIGENCE', slug:'memory-intelligence', name:'Memory Intelligence', icon:'💡', cost:15, tier:'MEDIUM', color:'lime', desc:'Build spaced-repetition memory maps that make knowledge stick permanently.',            placeholder:'e.g. I need to memorize the entire OSI model and how each layer interacts...' },
  { id:'EXECUTION_OPTIMIZER', slug:'execution-optimizer', name:'Execution Optimizer', icon:'🚀', cost:15, tier:'MEDIUM', color:'teal', desc:'Get your critical path and a laser-focused 7-day action plan.',                        placeholder:'e.g. Launch my SaaS MVP in 30 days. I have evenings and weekends free...' },
  { id:'OPPORTUNITY_RADAR',   slug:'opportunity-radar',   name:'Opportunity Radar',   icon:'📡', cost:30, tier:'HEAVY',  color:'lime', desc:'Surface high-leverage hidden opportunities most people completely overlook.',          placeholder:'e.g. I am a 24-year-old developer in Mumbai with ₹2L savings and 2 years experience...' },
  { id:'DECISION_SIMULATOR',  slug:'decision-simulator',  name:'Decision Simulator',  icon:'⚖️', cost:30, tier:'HEAVY',  color:'teal', desc:'Run a multi-scenario decision simulation with probability-weighted outcomes.',        placeholder:'e.g. I got two offers: ₹18L at startup vs ₹24L at MNC. I value learning over salary...' },
  { id:'FOCUS_SHIELD',        slug:'focus-shield',        name:'Focus Shield',        icon:'🛡️', cost:5,  tier:'LIGHT',  color:'lime', desc:'Get your personalized distraction protocol and reclaim stolen attention.',            placeholder:'e.g. I get distracted by Instagram every 20 mins, I work from home...' },
  { id:'WEALTH_MAPPER',       slug:'wealth-mapper',       name:'Wealth Mapper',       icon:'💰', cost:30, tier:'HEAVY',  color:'teal', desc:'Build your complete 36-month wealth roadmap with concrete milestones.',               placeholder:'e.g. 26yo, ₹60K/month salary, ₹5L savings, no investments yet, want ₹1Cr by 30...' },
]

const PLANS = [
  { id:'TRIAL',   name:'Trial',   monthlyPrice:'Free',    yearlyPrice:'Free',      monthlyRaw:0,    yearlyRaw:0,     tokens:500,   color:'rgba(255,255,255,0.5)', glow:'rgba(255,255,255,0.06)', features:['500 tokens total','All 10 AI tools','Basic support'],                                                             yearlySave:'' },
  { id:'STARTER', name:'Starter', monthlyPrice:'₹399/mo', yearlyPrice:'₹299/mo',   monthlyRaw:399,  yearlyRaw:299,   tokens:2000,  color:'#b8ff00',               glow:'rgba(184,255,0,0.07)',   features:['2,000 tokens/month','All 10 AI tools','Priority support','History export'],                                      yearlySave:'Save ₹1,200/yr' },
  { id:'PRO',     name:'Pro',     monthlyPrice:'₹849/mo', yearlyPrice:'₹599/mo',   monthlyRaw:849,  yearlyRaw:599,   tokens:6000,  color:'#00f0c8',               glow:'rgba(0,240,200,0.07)',   features:['6,000 tokens/month','All 10 AI tools','24/7 support','API access','History export'],                             yearlySave:'Save ₹3,000/yr' },
  { id:'ELITE',   name:'Elite',   monthlyPrice:'₹1,999/mo',yearlyPrice:'₹1,399/mo',monthlyRaw:1999, yearlyRaw:1399,  tokens:20000, color:'#ff9500',               glow:'rgba(255,149,0,0.07)',   features:['20,000 tokens/month','All 10 AI tools','Dedicated support','API access','White-label','Custom tools'],            yearlySave:'Save ₹7,200/yr' },
]

const TIPS = [
  { icon:'⚡', title:'Chain tools for 10x output', desc:'Run Opportunity Radar first, then feed its output directly into Decision Simulator for compounded intelligence.' },
  { icon:'🎯', title:'Be specific for better results', desc:'The more context you give — numbers, timelines, constraints — the more precise and actionable your output will be.' },
  { icon:'🔄', title:'Tokens refunded on error', desc:'If any tool fails for any reason, your tokens are automatically refunded. You never lose tokens on bad runs.' },
  { icon:'🧠', title:'Heavy tools use Claude AI', desc:'HEAVY tier tools run on Anthropic Claude — the most powerful AI for complex reasoning and multi-step analysis.' },
]

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  anthropic: { label:'Claude',  color:'#b8ff00' },
  gemini:    { label:'Gemini',  color:'#00f0c8' },
  groq:      { label:'Groq',    color:'#ff9500' },
  openai:    { label:'GPT',     color:'#74b9ff' },
}

const TIER_COLORS: Record<string, string> = { LIGHT:'#00f0c8', MEDIUM:'#b8ff00', HEAVY:'#ff9500' }

type MainView = 'home' | 'billing' | 'settings'

// ── Ring Chart ──────────────────────────────────────────────
function RingChart({ pct, color, size = 120 }: { pct: number; color: string; size?: number }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 6px ${color}88)` }}/>
    </svg>
  )
}

// ── Mini Sparkline ───────────────────────────────────────────
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  if (!data.length) return null
  const w = 200, h = height
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  const area = `0,${h} ${pts} ${w},${h}`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Tool Usage Bars ──────────────────────────────────────────
function ToolBars({ history }: { history: HistoryItem[] }) {
  const counts: Record<string, number> = {}
  history.forEach(h => { counts[h.tool] = (counts[h.tool]||0) + h.tokensUsed })
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const max = entries[0]?.[1] || 1
  if (!entries.length) return (
    <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.15)', fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>
      NO DATA YET — RUN A TOOL
    </div>
  )
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {entries.map(([name, val], i) => {
        const tool = TOOLS.find(t => t.name === name)
        const color = tool?.color === 'teal' ? '#00f0c8' : '#b8ff00'
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:14, textAlign:'center', fontSize:12 }}>{tool?.icon??'🤖'}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.65)' }}>{name}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.3)' }}>{val} tkn</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${(val/max)*100}%`, height:'100%', background:color, borderRadius:3, transition:'width 1s cubic-bezier(.4,0,.2,1)', boxShadow:`0 0 6px ${color}66` }}/>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardClient() {
  const router  = useRouter()
  const [user, setUser]               = useState<User | null>(null)
  const [tokens, setTokens]           = useState<TokenInfo | null>(null)
  const [loading, setLoading]         = useState(true)
  const [activeTool, setActiveTool]   = useState<typeof TOOLS[0] | null>(null)
  const [message, setMessage]         = useState('')
  const [aiLoading, setAiLoading]     = useState(false)
  const [result, setResult]           = useState<AIResult | null>(null)
  const [error, setError]             = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [history, setHistory]         = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab]     = useState<'tool'|'history'>('tool')
  const [queuePos, setQueuePos]       = useState<number|null>(null)
  const [elapsed, setElapsed]         = useState(0)
  const [mainView, setMainView]       = useState<MainView>('home')
  const [billingCycle, setBillingCycle] = useState<'monthly'|'yearly'>('monthly')
  const [liveTime, setLiveTime]       = useState(new Date())
  const resultRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null)

  const fetchUser = useCallback(async () => {
    try {
      const [meRes, tokRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/tokens/balance')])
      if (meRes.status === 401) { router.push('/login'); return }
      const [me, tok] = await Promise.all([meRes.json(), tokRes.json()])
      if (me.success)  setUser(me.data)
      if (tok.success) setTokens(tok.data)
    } catch { /**/ } finally { setLoading(false) }
  }, [router])

  useEffect(() => { fetchUser() }, [fetchUser])

  // Live clock
  useEffect(() => {
    const iv = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  // Auto-refresh tokens every 30s
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const r = await fetch('/api/tokens/balance')
        const d = await r.json()
        if (d.success) setTokens(d.data)
      } catch { /**/ }
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('reiogn_history')
      if (saved) setHistory(JSON.parse(saved))
    } catch { /**/ }
  }, [])

  function saveHistory(items: HistoryItem[]) {
    setHistory(items)
    try { sessionStorage.setItem('reiogn_history', JSON.stringify(items.slice(0,20))) } catch { /**/ }
  }

  async function runTool() {
    if (!activeTool || !message.trim()) return
    setAiLoading(true); setError(''); setResult(null); setQueuePos(null); setElapsed(0)
    const start = Date.now()
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-start)/1000)), 500)
    setQueuePos(Math.floor(Math.random()*3)+1)
    setTimeout(() => setQueuePos(null), 2000)
    try {
      const res  = await fetch(`/api/tools/${activeTool.slug}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message }) })
      const data = await res.json()
      if (!res.ok) {
        if (res.status===403) setError('Active subscription required. Please upgrade your plan.')
        else if (res.status===402) setError(`Insufficient tokens. Need ${activeTool.cost} tokens.`)
        else setError(data.error || 'Something went wrong. Your tokens were not charged.')
        return
      }
      setResult(data.data)
      setTokens(t => t ? { ...t, balance:data.data.tokensRemaining, totalSpent:t.totalSpent+data.data.tokensUsed } : null)
      const item: HistoryItem = { id:Date.now().toString(), tool:activeTool.name, result:data.data.result, tokensUsed:data.data.tokensUsed, model:data.data.model, provider:data.data.provider??'anthropic', durationMs:data.data.durationMs, timestamp:Date.now(), message }
      saveHistory([item,...history])
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    } catch { setError('Network error. Please check your connection. Tokens were not charged.') }
    finally {
      setAiLoading(false); setQueuePos(null)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method:'POST' }).catch(()=>{})
    router.push('/login')
  }

  function selectTool(tool: typeof TOOLS[0]) {
    setActiveTool(tool); setResult(null); setError(''); setMessage(''); setActiveTab('tool'); setMainView('home')
  }

  function goHome() {
    setActiveTool(null); setMainView('home'); setResult(null); setError('')
  }

  const currentPlan = PLANS.find(p => p.id === user?.plan) ?? PLANS[0]
  const tokenPct    = Math.min(100, Math.round(((tokens?.balance??0)/currentPlan.tokens)*100))
  const spentPct    = Math.min(100, Math.round(((tokens?.totalSpent??0)/currentPlan.tokens)*100))

  // Sparkline data from history (tokens used per session, last 10)
  const sparkData = history.slice(0,10).map(h => h.tokensUsed).reverse()

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#07080f', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:10, height:10, borderRadius:'50%', background:'#b8ff00', animation:'pulse 1s ease-in-out infinite', boxShadow:'0 0 20px #b8ff00' }} />
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:2 }}>LOADING</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.8)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --bg:#07080f;--s1:#090a14;--s2:#0c0d1a;
          --lime:#b8ff00;--teal:#00f0c8;--rose:#ff4f72;--amber:#ff9500;
          --bd:rgba(255,255,255,0.05);--bd2:rgba(255,255,255,0.09);--bd3:rgba(255,255,255,0.15);
          --t1:#ffffff;--t2:rgba(255,255,255,0.68);--t3:rgba(255,255,255,0.38);--t4:rgba(255,255,255,0.16);
        }
        html,body{min-height:100vh;background:var(--bg);color:var(--t1);font-family:'Inter',sans-serif;overflow:hidden;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:4px;}
        .layout{display:flex;height:100vh;overflow:hidden;}

        /* ── Sidebar ── */
        .sidebar{
          width:${sidebarOpen?'252px':'0'};min-width:${sidebarOpen?'252px':'0'};
          height:100vh;display:flex;flex-direction:column;
          background:var(--s1);border-right:1px solid var(--bd);
          overflow:hidden;transition:min-width .26s cubic-bezier(.4,0,.2,1),width .26s cubic-bezier(.4,0,.2,1);
          flex-shrink:0;
        }

        /* Logo area */
        .sb-top{padding:16px 14px 12px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .sb-logo{display:flex;align-items:center;gap:9px;text-decoration:none;flex:1;min-width:0;}
        .sb-mark{width:28px;height:28px;border-radius:7px;background:rgba(184,255,0,0.1);border:1px solid rgba(184,255,0,0.18);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;color:#b8ff00;}
        .sb-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;letter-spacing:-.3px;}

        /* Dashboard home button */
        .sb-home{margin:8px 10px 0;padding:8px 11px;display:flex;align-items:center;gap:9px;border-radius:8px;cursor:pointer;transition:all .15s;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);text-align:left;width:calc(100% - 20px);flex-shrink:0;}
        .sb-home:hover{background:rgba(184,255,0,0.05);border-color:rgba(184,255,0,0.12);}
        .sb-home.active{background:rgba(184,255,0,0.07);border-color:rgba(184,255,0,0.16);}
        .sb-home-icon{font-size:13px;flex-shrink:0;}
        .sb-home-label{font-family:'Syne',sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);white-space:nowrap;}
        .sb-home.active .sb-home-label{color:#b8ff00;}

        /* Tool list */
        .sb-section{padding:12px 14px 5px;font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.16);letter-spacing:2.5px;text-transform:uppercase;flex-shrink:0;}
        .sb-tools{flex:1;overflow-y:auto;padding:0 8px 8px;min-height:0;}
        .sb-tool{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;cursor:pointer;transition:all .13s;white-space:nowrap;border:1px solid transparent;width:100%;background:none;text-align:left;}
        .sb-tool:hover{background:rgba(255,255,255,0.025);}
        .sb-tool.active{background:rgba(184,255,0,0.07);border-color:rgba(184,255,0,0.14);}
        .sb-tool.active.t{background:rgba(0,240,200,0.07);border-color:rgba(0,240,200,0.14);}
        .sb-icon{font-size:13px;flex-shrink:0;width:18px;text-align:center;}
        .sb-info{flex:1;min-width:0;}
        .sb-tname{font-size:11.5px;font-weight:500;color:rgba(255,255,255,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sb-tcost{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.22);margin-top:1px;}
        .sb-tier-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}

        /* Sidebar divider */
        .sb-divider{height:1px;background:var(--bd);margin:6px 12px;flex-shrink:0;}

        /* Bottom nav: Billing + Settings */
        .sb-bottom-nav{padding:6px 8px;display:flex;gap:5px;flex-shrink:0;}
        .sb-nav-btn{flex:1;padding:7px 6px;border-radius:7px;background:transparent;border:1px solid transparent;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px;}
        .sb-nav-btn:hover{background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.55);border-color:var(--bd);}
        .sb-nav-btn.active{background:rgba(184,255,0,0.07);color:#b8ff00;border-color:rgba(184,255,0,0.15);}
        .sb-nav-btn.active.teal-btn{background:rgba(0,240,200,0.07);color:#00f0c8;border-color:rgba(0,240,200,0.15);}

        /* Sidebar footer: user + logout */
        .sb-foot{padding:8px 10px 12px;flex-shrink:0;border-top:1px solid var(--bd);}
        .sb-user{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:7px;min-width:0;}
        .sb-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#b8ff00,#00f0c8);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:#07080f;flex-shrink:0;}
        .sb-uinfo{flex:1;min-width:0;overflow:hidden;}
        .sb-uname{font-size:11.5px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;}
        .sb-uemail{font-size:9px;color:rgba(255,255,255,0.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;margin-top:1px;}
        .sb-plan-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .logout-btn{width:100%;padding:7px;background:transparent;border:1px solid rgba(255,79,114,0.13);border-radius:6px;color:rgba(255,79,114,0.45);font-size:10px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;letter-spacing:.3px;}
        .logout-btn:hover{background:rgba(255,79,114,0.06);color:#ff6b8a;border-color:rgba(255,79,114,0.26);}

        /* ── Main ── */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .topbar{height:52px;border-bottom:1px solid var(--bd);display:flex;align-items:center;padding:0 20px;gap:12px;background:rgba(9,10,20,0.9);backdrop-filter:blur(20px);flex-shrink:0;}
        .tb-toggle{width:28px;height:28px;border:1px solid var(--bd);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.35);transition:all .18s;font-size:11px;flex-shrink:0;}
        .tb-toggle:hover{border-color:rgba(184,255,0,0.2);color:#fff;}
        .tb-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tb-spacer{flex:1;}
        .tb-live{display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.2);flex-shrink:0;}
        .tb-live-dot{width:5px;height:5px;border-radius:50%;background:#b8ff00;animation:blink 2s infinite;flex-shrink:0;}
        .tb-btn{padding:5px 11px;background:transparent;border:1px solid var(--bd2);border-radius:6px;color:var(--t3);font-size:11px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;}
        .tb-btn:hover{border-color:rgba(184,255,0,0.2);color:#b8ff00;}
        .token-chip{display:flex;align-items:center;gap:6px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);padding:5px 11px;border-radius:5px;flex-shrink:0;}
        .tok-n{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:#b8ff00;}
        .tok-l{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(184,255,0,0.4);letter-spacing:1px;text-transform:uppercase;}

        /* ── Content ── */
        .content{flex:1;overflow-y:auto;padding:22px;display:flex;flex-direction:column;gap:18px;}

        /* ── Widgets ── */
        .widgets-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}
        .widget{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden;}
        .widget::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
        .widget.lime::before{background:linear-gradient(90deg,#b8ff00,transparent);}
        .widget.teal::before{background:linear-gradient(90deg,#00f0c8,transparent);}
        .widget.amber::before{background:linear-gradient(90deg,#ff9500,transparent);}
        .widget.rose::before{background:linear-gradient(90deg,#ff4f72,transparent);}
        .w-label{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.22);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;}
        .w-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;line-height:1;}
        .w-sub{font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;}

        /* ── Chart widgets ── */
        .chart-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:900px){.chart-row{grid-template-columns:1fr;}}
        .chart-card{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:18px;}
        .chart-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;}
        .chart-sub{font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:14px;}

        /* ── Ring widget ── */
        .ring-widget{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:18px;display:flex;align-items:center;gap:18px;}
        .ring-center{position:relative;flex-shrink:0;}
        .ring-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;}
        .ring-pct{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#fff;}
        .ring-sublabel{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.25);letter-spacing:1.5px;text-transform:uppercase;}

        /* ── Hero ── */
        .hero{background:linear-gradient(135deg,rgba(12,14,26,0.95) 0%,rgba(14,16,28,0.95) 100%);border:1px solid var(--bd2);border-radius:14px;padding:26px 28px;position:relative;overflow:hidden;}
        .hero::before{content:'';position:absolute;top:-80px;right:-60px;width:320px;height:320px;background:radial-gradient(circle,rgba(184,255,0,0.055),transparent 70%);pointer-events:none;}
        .hero-greeting{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;margin-bottom:5px;line-height:1.2;}
        .hero-sub{font-size:13px;color:var(--t3);line-height:1.6;max-width:400px;margin-bottom:16px;}
        .hero-cta{display:flex;gap:8px;flex-wrap:wrap;}
        .btn-primary{padding:10px 20px;background:#b8ff00;color:#07080f;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;}
        .btn-primary:hover{background:#cbff1a;box-shadow:0 0 22px rgba(184,255,0,0.3);}
        .btn-sec{padding:10px 20px;background:transparent;color:var(--t2);border:1px solid var(--bd2);border-radius:8px;font-size:12px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;}
        .btn-sec:hover{border-color:rgba(255,255,255,0.2);color:#fff;}

        /* Section header */
        .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .sec-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;}
        .sec-sub{font-size:10.5px;color:var(--t3);}

        /* Popular strip */
        .popular-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}
        .pop-card{background:rgba(12,14,26,0.7);border:1px solid var(--bd2);border-radius:11px;padding:16px 18px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:13px;}
        .pop-card:hover{background:rgba(14,16,28,0.95);transform:translateX(3px);border-color:rgba(184,255,0,0.18);}
        .pop-icon{font-size:22px;flex-shrink:0;}
        .pop-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:3px;}
        .pop-desc{font-size:10.5px;color:var(--t3);line-height:1.5;}
        .pop-arrow{margin-left:auto;color:rgba(255,255,255,0.13);font-size:18px;flex-shrink:0;transition:all .18s;}
        .pop-card:hover .pop-arrow{transform:translateX(3px);color:rgba(184,255,0,0.5);}

        /* Tool grid — bigger cards */
        .tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}
        .tool-card{background:rgba(11,13,24,0.75);border:1px solid var(--bd);border-radius:13px;padding:22px;cursor:pointer;transition:all .18s;text-align:left;width:100%;position:relative;overflow:hidden;}
        .tool-card:hover{border-color:rgba(184,255,0,0.22);background:rgba(12,14,26,0.98);transform:translateY(-3px);box-shadow:0 10px 36px rgba(0,0,0,0.45);}
        .tool-card.t:hover{border-color:rgba(0,240,200,0.22);}
        .tc-badges{position:absolute;top:12px;right:12px;display:flex;gap:4px;}
        .tc-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:2px 6px;border-radius:2px;letter-spacing:.8px;text-transform:uppercase;}
        .tc-badge.hot{color:#ff9500;background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.2);}
        .tc-badge.new{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.15);}
        .tc-icon{font-size:26px;margin-bottom:13px;display:block;}
        .tc-name{font-family:'Syne',sans-serif;font-size:14.5px;font-weight:700;color:#fff;margin-bottom:6px;}
        .tc-desc{font-size:12px;color:var(--t3);line-height:1.65;margin-bottom:14px;}
        .tc-foot{display:flex;align-items:center;justify-content:space-between;}
        .tc-cost{font-family:'JetBrains Mono',monospace;font-size:9.5px;}
        .tc-tier{font-family:'JetBrains Mono',monospace;font-size:7.5px;padding:2px 7px;border-radius:3px;letter-spacing:.8px;}

        /* Activity */
        .activity-list{display:flex;flex-direction:column;gap:7px;}
        .activity-item{display:flex;align-items:center;gap:11px;padding:11px 13px;background:rgba(255,255,255,0.013);border:1px solid var(--bd);border-radius:9px;cursor:pointer;transition:all .15s;}
        .activity-item:hover{border-color:var(--bd2);background:rgba(255,255,255,0.025);}
        .act-icon{font-size:15px;flex-shrink:0;}
        .act-tool{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;}
        .act-msg{font-size:10.5px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .act-meta{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
        .act-time{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--t4);}

        /* Tips */
        .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;}
        .tip-card{background:rgba(255,255,255,0.013);border:1px solid var(--bd);border-radius:10px;padding:16px;}
        .tip-icon{font-size:18px;margin-bottom:8px;}
        .tip-title{font-family:'Syne',sans-serif;font-size:12.5px;font-weight:700;color:#fff;margin-bottom:5px;}
        .tip-desc{font-size:11px;color:var(--t3);line-height:1.65;}

        /* ── BILLING ── */
        .billing-hero{background:linear-gradient(135deg,rgba(10,12,22,0.98),rgba(14,16,30,0.98));border:1px solid rgba(184,255,0,0.1);border-radius:16px;padding:32px;text-align:center;position:relative;overflow:hidden;margin-bottom:20px;}
        .billing-hero::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(184,255,0,0.055),transparent 65%);pointer-events:none;}
        .billing-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px;}
        .billing-sub{font-size:13px;color:var(--t3);max-width:440px;margin:0 auto 20px;line-height:1.6;}
        .billing-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.16);padding:6px 14px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#b8ff00;letter-spacing:2px;text-transform:uppercase;}

        .cycle-toggle{display:inline-flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:50px;padding:4px;gap:0;margin:16px auto 0;}
        .cycle-btn{padding:8px 22px;border-radius:50px;border:none;cursor:pointer;font-family:"Syne",sans-serif;font-size:12px;font-weight:700;transition:all .22s;background:transparent;color:rgba(255,255,255,0.35);}
        .cycle-btn.on{background:#b8ff00;color:#07080f;box-shadow:0 0 18px rgba(184,255,0,0.35);}
        .cycle-btn.yearly-on{background:linear-gradient(135deg,#00f0c8,#b8ff00);color:#07080f;box-shadow:0 0 18px rgba(0,240,200,0.35);}
        .save-badge{display:inline-block;background:linear-gradient(135deg,rgba(0,240,200,0.15),rgba(184,255,0,0.15));border:1px solid rgba(0,240,200,0.25);color:#00f0c8;font-family:"JetBrains Mono",monospace;font-size:8px;padding:3px 9px;border-radius:3px;letter-spacing:1.5px;text-transform:uppercase;margin-left:8px;vertical-align:middle;}
        .yearly-save-tag{font-family:"JetBrains Mono",monospace;font-size:8px;color:#00f0c8;background:rgba(0,240,200,0.08);border:1px solid rgba(0,240,200,0.18);padding:2px 8px;border-radius:3px;letter-spacing:1px;display:inline-block;margin-top:5px;}
        .orig-price{font-family:"Syne",sans-serif;font-size:13px;color:rgba(255,255,255,0.22);text-decoration:line-through;margin-left:6px;font-weight:400;}
        .plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
        .plan-card{background:rgba(11,13,22,0.8);border:1px solid var(--bd);border-radius:14px;padding:24px;transition:all .2s;position:relative;overflow:hidden;}
        .plan-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .plan-card.current{border-color:rgba(184,255,0,0.2);}
        .plan-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,0.5);}
        .plan-glow{position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;pointer-events:none;opacity:0.4;}
        .plan-current-badge{position:absolute;top:12px;right:12px;font-family:'JetBrains Mono',monospace;font-size:7px;padding:3px 8px;border-radius:3px;background:rgba(184,255,0,0.1);color:#b8ff00;border:1px solid rgba(184,255,0,0.2);letter-spacing:.8px;text-transform:uppercase;}
        .plan-icon{font-size:24px;margin-bottom:12px;}
        .plan-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;margin-bottom:4px;}
        .plan-price{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;margin-bottom:3px;}
        .plan-tokens-label{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.28);letter-spacing:1.5px;margin-bottom:18px;text-transform:uppercase;}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
        .plan-features li{font-size:12px;color:var(--t2);display:flex;align-items:center;gap:7px;line-height:1.4;}
        .plan-btn{width:100%;padding:11px;border-radius:9px;font-family:'Syne',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .18s;border:none;}
        .plan-btn.active{background:#b8ff00;color:#07080f;}
        .plan-btn.active:hover{background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.35);}
        .plan-btn.inactive{background:transparent;color:var(--t3);border:1px solid var(--bd2);}
        .plan-btn.inactive:hover{border-color:rgba(255,255,255,0.2);color:#fff;}

        /* Usage breakdown */
        .usage-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;}
        .usage-card{background:rgba(11,13,22,0.7);border:1px solid var(--bd);border-radius:10px;padding:16px;}

        /* ── SETTINGS ── */
        .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:800px){.settings-grid{grid-template-columns:1fr;}}
        .settings-card{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:20px;}
        .settings-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:14px;}
        .settings-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
        .settings-row:last-child{border-bottom:none;}
        .settings-key{font-size:12px;color:var(--t3);}
        .settings-val{font-family:'JetBrains Mono',monospace;font-size:11px;color:#fff;}

        /* Tabs */
        .tabs{display:flex;gap:2px;background:rgba(255,255,255,0.025);border:1px solid var(--bd);border-radius:8px;padding:3px;}
        .tab{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--t3);transition:all .16s;}
        .tab.active{background:rgba(184,255,0,0.09);color:#b8ff00;border:1px solid rgba(184,255,0,0.14);}

        /* Tool panel */
        .tool-panel{background:rgba(11,13,24,0.8);border:1px solid var(--bd2);border-radius:13px;overflow:hidden;}
        .tool-panel.lime{border-color:rgba(184,255,0,0.15);}
        .tool-panel.teal{border-color:rgba(0,240,200,0.15);}
        .tp-head{padding:18px 22px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px;}
        .tp-icon{font-size:24px;}
        .tp-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;}
        .tp-desc{font-size:12px;color:var(--t3);margin-top:2px;}
        .tp-badges{margin-left:auto;display:flex;gap:6px;align-items:center;flex-shrink:0;}
        .badge{font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 8px;border-radius:3px;letter-spacing:.8px;text-transform:uppercase;}
        .badge.lime{color:#b8ff00;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);}
        .badge.teal{color:#00f0c8;background:rgba(0,240,200,0.07);border:1px solid rgba(0,240,200,0.14);}
        .badge.amber{color:#ff9500;background:rgba(255,149,0,0.07);border:1px solid rgba(255,149,0,0.14);}
        .tp-body{padding:20px 22px;}
        .field-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.25);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;display:block;}
        textarea{width:100%;background:#09091a;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;color:#fff;font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:120px;transition:border-color .2s;line-height:1.7;}
        textarea:focus{border-color:rgba(184,255,0,0.26);}
        textarea::placeholder{color:rgba(255,255,255,0.09);}
        .tp-foot{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap;}
        .run-btn{padding:11px 24px;background:#b8ff00;color:#07080f;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px;flex-shrink:0;}
        .run-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.3);}
        .run-btn:disabled{opacity:.5;cursor:not-allowed;}
        .run-btn.t{background:#00f0c8;}
        .run-btn.t:hover:not(:disabled){background:#00ffd8;box-shadow:0 0 24px rgba(0,240,200,0.3);}
        .cost-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.18);}
        .spinner{width:13px;height:13px;border:2px solid rgba(7,8,15,.3);border-top-color:#07080f;border-radius:50%;animation:spin .65s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .queue-bar{background:rgba(184,255,0,0.04);border:1px solid rgba(184,255,0,0.11);border-radius:9px;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:12px;}
        .queue-bar.t{background:rgba(0,240,200,0.04);border-color:rgba(0,240,200,0.11);}
        .q-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;animation:blink 1.2s infinite;flex-shrink:0;}
        .q-dot.t{background:#00f0c8;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        .q-text{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.38);flex:1;}
        .q-elapsed{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.18);}
        .error-box{background:rgba(255,79,114,0.05);border:1px solid rgba(255,79,114,0.16);border-radius:8px;padding:11px 15px;font-size:12px;color:#ff6b8a;margin-top:10px;display:flex;align-items:flex-start;gap:7px;line-height:1.55;}
        .result-card{background:rgba(9,10,20,0.97);border:1px solid rgba(184,255,0,0.15);border-radius:12px;overflow:hidden;}
        .result-card.t{border-color:rgba(0,240,200,0.15);}
        .rc-head{padding:12px 20px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .rc-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;flex:1;}
        .rc-meta{display:flex;gap:6px;align-items:center;}
        .rc-body{padding:20px 22px;max-height:520px;overflow-y:auto;}
        .rc-body pre{white-space:pre-wrap;word-break:break-word;font-family:'Inter',sans-serif;font-size:13px;color:#fff;line-height:1.8;}
        .hist-list{display:flex;flex-direction:column;gap:10px;}
        .hist-item{background:rgba(11,13,24,0.65);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;cursor:pointer;transition:all .16s;}
        .hist-item:hover{border-color:var(--bd2);background:rgba(12,14,26,0.9);}
        .hi-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .hi-name{font-family:'Syne',sans-serif;font-size:12.5px;font-weight:700;color:#fff;}
        .hi-time{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.18);margin-left:auto;}
        .hi-msg{font-size:11.5px;color:rgba(255,255,255,0.38);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .hi-meta{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}
        .provider-dot{display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.8px;}
        .pd-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .empty-state{text-align:center;padding:50px 24px;}
        .es-icon{font-size:34px;margin-bottom:14px;}
        .es-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;}
        .es-sub{font-size:12px;color:var(--t3);line-height:1.6;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.8)}}
      `}</style>

      <div className="layout">

        {/* ══ SIDEBAR ══ */}
        <div className="sidebar">

          {/* Logo */}
          <div className="sb-top">
            <a href="/" className="sb-logo">
              <div className="sb-mark">R</div>
              <span className="sb-name">REIOGN</span>
            </a>
          </div>

          {/* Dashboard home button */}
          <button className={`sb-home ${mainView==='home'&&!activeTool?'active':''}`} onClick={goHome}>
            <span className="sb-home-icon">🏠</span>
            <span className="sb-home-label">Dashboard</span>
          </button>

          {/* Tool list */}
          <div className="sb-section">AI Tools</div>
          <div className="sb-tools">
            {TOOLS.map(tool => (
              <button key={tool.id}
                className={`sb-tool ${activeTool?.id===tool.id?'active':''} ${tool.color==='teal'?'t':''}`}
                onClick={() => selectTool(tool)}>
                <span className="sb-icon">{tool.icon}</span>
                <div className="sb-info">
                  <div className="sb-tname">{tool.name}</div>
                  <div className="sb-tcost">{tool.cost} tokens · {tool.tier}</div>
                </div>
                <div className="sb-tier-dot" style={{ background:TIER_COLORS[tool.tier] }}/>
              </button>
            ))}
          </div>

          {/* ── Bottom: Billing + Settings ── */}
          <div className="sb-divider"/>
          <div className="sb-bottom-nav">
            <button
              className={`sb-nav-btn ${mainView==='billing'?'active':''}`}
              onClick={() => { setMainView('billing'); setActiveTool(null) }}>
              💳 Billing
            </button>
            <button
              className={`sb-nav-btn teal-btn ${mainView==='settings'?'active teal-btn':''}`}
              onClick={() => { setMainView('settings'); setActiveTool(null) }}>
              ⚙️ Settings
            </button>
          </div>

          {/* User info + logout */}
          <div className="sb-foot">
            {user && (
              <div className="sb-user">
                <div className="sb-av">{(user.name?.slice(0,2)??'RE').toUpperCase()}</div>
                <div className="sb-uinfo">
                  <span className="sb-uname">{user.name}</span>
                  <span className="sb-uemail">{user.email}</span>
                </div>
                <div className="sb-plan-dot" style={{ background:currentPlan.color }}/>
              </div>
            )}
            <button className="logout-btn" onClick={logout}>↩ Sign out</button>
          </div>

        </div>

        {/* ══ MAIN ══ */}
        <div className="main">
          <div className="topbar">
            <button className="tb-toggle" onClick={() => setSidebarOpen(o=>!o)}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <span className="tb-title">
              {mainView==='billing' ? '💳 Billing & Plans'
                : mainView==='settings' ? '⚙️ Settings'
                : activeTool ? `${activeTool.icon} ${activeTool.name}`
                : 'Dashboard'}
            </span>
            <div className="tb-spacer"/>
            <div className="tb-live">
              <div className="tb-live-dot"/>
              {liveTime.toLocaleTimeString()}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              {activeTool && (
                <button className="tb-btn" onClick={goHome}>← Back</button>
              )}
              {tokens && (
                <div className="token-chip">
                  <span className="tok-n">{tokens.balance.toLocaleString()}</span>
                  <span className="tok-l">tokens</span>
                </div>
              )}
            </div>
          </div>

          <div className="content">

            {/* ════ BILLING VIEW ════ */}
            {mainView === 'billing' && (
              <>
                <div className="billing-hero">
                  <div className="billing-badge"><span>●</span> Subscription Management</div>
                  <div style={{ height:14 }}/>
                  <div className="billing-title">Upgrade Your Intelligence</div>
                  <div className="billing-sub">More tokens. More sessions. More leverage. Scale your cognitive performance with the right plan.</div>
                  {/* Billing cycle toggle */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop:20, gap:8 }}>
                    <div className="cycle-toggle">
                      <button
                        className={`cycle-btn ${billingCycle==='monthly'?'on':''}`}
                        onClick={() => setBillingCycle('monthly')}>
                        Monthly
                      </button>
                      <button
                        className={`cycle-btn ${billingCycle==='yearly'?'yearly-on':''}`}
                        onClick={() => setBillingCycle('yearly')}>
                        Yearly
                      </button>
                    </div>
                    {billingCycle==='yearly' && (
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#00f0c8', letterSpacing:1.5, textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:'#00f0c8', display:'inline-block' }}/>
                        Up to 30% off — billed annually
                      </div>
                    )}
                  </div>
                </div>

                <div className="plans-grid">
                  {PLANS.map(plan => {
                    const isCurrent = user?.plan === plan.id
                    const icons = ['🆓','⚡','🚀','👑']
                    const idx = PLANS.indexOf(plan)
                    const price = billingCycle==='yearly' ? plan.yearlyPrice : plan.monthlyPrice
                    const origPrice = billingCycle==='yearly' ? plan.monthlyPrice : null
                    return (
                      <div key={plan.id} className={`plan-card ${isCurrent?'current':''}`}
                        style={{ background:`linear-gradient(160deg,rgba(11,13,22,0.95),${plan.glow} 120%)` }}>
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${plan.color},transparent)` }}/>
                        <div className="plan-glow" style={{ background:`radial-gradient(circle,${plan.color},transparent)` }}/>
                        {isCurrent && <div className="plan-current-badge">● Current</div>}
                        {billingCycle==='yearly' && plan.yearlySave && (
                          <div style={{ position:'absolute', top:12, left:12, fontFamily:"'JetBrains Mono',monospace", fontSize:7, padding:'3px 8px', borderRadius:3, background:'rgba(0,240,200,0.1)', color:'#00f0c8', border:'1px solid rgba(0,240,200,0.2)', letterSpacing:'.8px', textTransform:'uppercase' }}>
                            🔥 Best Value
                          </div>
                        )}
                        <div className="plan-icon" style={{ marginTop: billingCycle==='yearly'&&plan.yearlySave ? 20 : 0 }}>{icons[idx]}</div>
                        <div className="plan-name" style={{ color:plan.color }}>{plan.name}</div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:3 }}>
                          <div className="plan-price" style={{ color:'#fff' }}>{price}</div>
                          {origPrice && plan.yearlyRaw > 0 && (
                            <span className="orig-price">{origPrice}</span>
                          )}
                        </div>
                        {billingCycle==='yearly' && plan.yearlySave ? (
                          <div className="yearly-save-tag">💰 {plan.yearlySave}</div>
                        ) : <div style={{ height:4 }}/>}
                        <div className="plan-tokens-label" style={{ marginTop:8 }}>{plan.tokens.toLocaleString()} tokens / month</div>
                        <ul className="plan-features">
                          {plan.features.map((f,i) => (
                            <li key={i}><span style={{ color:plan.color, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>✓</span>{f}</li>
                          ))}
                        </ul>
                        <button
                          className={`plan-btn ${isCurrent?'inactive':'active'}`}
                          style={!isCurrent ? { background:plan.color, color:'#07080f' } : {}}>
                          {isCurrent ? 'Current Plan' : billingCycle==='yearly' ? `Get ${plan.name} Yearly →` : `Upgrade to ${plan.name} →`}
                        </button>
                        {billingCycle==='yearly' && plan.yearlyRaw > 0 && (
                          <div style={{ textAlign:'center', marginTop:8, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.2)', letterSpacing:1 }}>
                            Billed ₹{(plan.yearlyRaw*12).toLocaleString()} / year
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Usage breakdown */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">Token Usage This Cycle</span>
                    <span className="sec-sub" style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#b8ff00', display:'inline-block', animation:'blink 2s infinite' }}/>
                      Live
                    </span>
                  </div>
                  <div className="usage-grid">
                    <div className="usage-card">
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Tokens Left</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#b8ff00' }}>{tokens?.balance?.toLocaleString()??'—'}</div>
                    </div>
                    <div className="usage-card">
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Tokens Used</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#00f0c8' }}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                    </div>
                    <div className="usage-card">
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Sessions</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#ff9500' }}>{history.length}</div>
                    </div>
                    <div className="usage-card">
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Plan Limit</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'rgba(255,255,255,0.5)' }}>{currentPlan.tokens.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ marginTop:12, background:'rgba(255,255,255,0.02)', border:'1px solid var(--bd)', borderRadius:10, padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.22)', letterSpacing:2, textTransform:'uppercase' }}>Usage</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#b8ff00' }}>{tokenPct}% remaining</span>
                    </div>
                    <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${tokenPct}%`, height:'100%', background:'linear-gradient(90deg,#b8ff00,#00f0c8)', borderRadius:4, transition:'width .8s cubic-bezier(.4,0,.2,1)', boxShadow:'0 0 8px rgba(184,255,0,0.4)' }}/>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════ SETTINGS VIEW ════ */}
            {mainView === 'settings' && (
              <>
                <div style={{ background:'var(--s2)', border:'1px solid var(--bd)', borderRadius:14, padding:'24px 28px', marginBottom:4 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Account Settings</div>
                  <div style={{ fontSize:13, color:'var(--t3)' }}>Manage your account, preferences, and subscription.</div>
                </div>
                <div className="settings-grid">
                  <div className="settings-card">
                    <div className="settings-title">Profile</div>
                    <div className="settings-row"><span className="settings-key">Full Name</span><span className="settings-val">{user?.name??'—'}</span></div>
                    <div className="settings-row"><span className="settings-key">Email</span><span className="settings-val" style={{ fontSize:10 }}>{user?.email??'—'}</span></div>
                    <div className="settings-row"><span className="settings-key">Member Since</span><span className="settings-val">2025</span></div>
                    <div className="settings-row"><span className="settings-key">User ID</span><span className="settings-val" style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{user?.id?.slice(0,12)??'—'}…</span></div>
                  </div>
                  <div className="settings-card">
                    <div className="settings-title">Subscription</div>
                    <div className="settings-row"><span className="settings-key">Current Plan</span><span className="settings-val" style={{ color:currentPlan.color }}>{currentPlan.name}</span></div>
                    <div className="settings-row"><span className="settings-key">Token Limit</span><span className="settings-val">{currentPlan.tokens.toLocaleString()}/mo</span></div>
                    <div className="settings-row"><span className="settings-key">Tokens Left</span><span className="settings-val" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString()??'—'}</span></div>
                    <div className="settings-row"><span className="settings-key">Tokens Used</span><span className="settings-val">{tokens?.totalSpent?.toLocaleString()??'0'}</span></div>
                  </div>
                  <div className="settings-card">
                    <div className="settings-title">AI Models</div>
                    {[{name:'Claude AI',role:'Heavy tools',color:'#b8ff00'},{name:'Gemini Pro',role:'Medium tools',color:'#00f0c8'},{name:'Groq LLaMA',role:'Light tools',color:'#ff9500'}].map((m,i)=>(
                      <div key={i} className="settings-row">
                        <span className="settings-key" style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:m.color, display:'inline-block' }}/>
                          {m.name}
                        </span>
                        <span className="settings-val" style={{ color:m.color, fontSize:9, letterSpacing:1 }}>{m.role.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="settings-card">
                    <div className="settings-title">Danger Zone</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:14, lineHeight:1.6 }}>These actions are permanent and cannot be undone.</div>
                    <button onClick={logout} style={{ width:'100%', padding:'10px', background:'rgba(255,79,114,0.07)', border:'1px solid rgba(255,79,114,0.2)', borderRadius:8, color:'#ff6b8a', fontSize:12, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:600 }}>
                      Sign Out →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ════ HOME VIEW ════ */}
            {mainView === 'home' && !activeTool && (
              <>
                {/* Hero */}
                <div className="hero">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
                    <div>
                      <div className="hero-greeting">
                        {user ? `Hey ${user.name?.split(' ')[0]} 👋` : 'Welcome back 👋'}
                      </div>
                      <div className="hero-sub">Your AI performance toolkit is ready. Pick a tool and start executing.</div>
                      <div className="hero-cta">
                        <button className="btn-primary" onClick={() => selectTool(TOOLS[0])}>⚡ Start Deep Work</button>
                        <button className="btn-sec" onClick={() => setMainView('billing')}>💳 View Plans</button>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7.5, color:'rgba(255,255,255,0.18)', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>Current Plan</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:currentPlan.color }}>{currentPlan.name}</div>
                    </div>
                  </div>
                </div>

                {/* Live stat widgets */}
                <div className="widgets-row">
                  <div className="widget lime">
                    <div className="w-label">Tokens Left</div>
                    <div className="w-val" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString()??'—'}</div>
                    <div className="w-sub">{tokenPct}% of {currentPlan.tokens.toLocaleString()} remaining</div>
                  </div>
                  <div className="widget teal">
                    <div className="w-label">Tokens Used</div>
                    <div className="w-val" style={{ color:'#00f0c8' }}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                    <div className="w-sub">This billing cycle</div>
                  </div>
                  <div className="widget amber">
                    <div className="w-label">Sessions</div>
                    <div className="w-val" style={{ color:'#ff9500' }}>{history.length}</div>
                    <div className="w-sub">{history.length > 0 ? `Last: ${new Date(history[0].timestamp).toLocaleTimeString()}` : 'No sessions yet'}</div>
                  </div>
                  <div className="widget rose">
                    <div className="w-label">AI Tools</div>
                    <div className="w-val">{TOOLS.length}</div>
                    <div className="w-sub">All unlocked</div>
                  </div>
                </div>

                {/* Charts row */}
                <div className="chart-row">
                  {/* Token usage ring */}
                  <div className="ring-widget">
                    <div className="ring-center">
                      <RingChart pct={tokenPct} color="#b8ff00" size={110}/>
                      <div className="ring-label">
                        <div className="ring-pct">{tokenPct}%</div>
                        <div className="ring-sublabel">Left</div>
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:'#fff', marginBottom:5 }}>Token Balance</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.6, marginBottom:12 }}>
                        {tokens?.balance?.toLocaleString()??'—'} remaining of {currentPlan.tokens.toLocaleString()} total
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
                        <div style={{ width:`${tokenPct}%`, height:'100%', background:'linear-gradient(90deg,#b8ff00,#00f0c8)', borderRadius:3, transition:'width 1s', boxShadow:'0 0 8px rgba(184,255,0,0.3)' }}/>
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${spentPct}%`, height:'100%', background:'rgba(255,149,0,0.6)', borderRadius:3 }}/>
                      </div>
                      <div style={{ display:'flex', gap:14, marginTop:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div style={{ width:6, height:6, borderRadius:1, background:'#b8ff00' }}/>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.3)' }}>Remaining</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div style={{ width:6, height:6, borderRadius:1, background:'rgba(255,149,0,0.6)' }}/>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.3)' }}>Used</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token per session sparkline */}
                  <div className="chart-card">
                    <div className="chart-title">Session Activity</div>
                    <div className="chart-sub">Tokens per run · last {Math.min(10,sparkData.length)} sessions</div>
                    {sparkData.length > 1 ? (
                      <>
                        <Sparkline data={sparkData} color="#00f0c8" height={48}/>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.2)' }}>Oldest</span>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.2)' }}>Latest</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding:'20px 0', textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.12)', letterSpacing:1 }}>
                        RUN TOOLS TO SEE ACTIVITY
                      </div>
                    )}
                  </div>
                </div>

                {/* Tool usage breakdown */}
                <div className="chart-card">
                  <div className="sec-head" style={{ marginBottom:12 }}>
                    <div>
                      <div className="chart-title">Top Tools by Token Usage</div>
                      <div className="chart-sub">Based on your session history</div>
                    </div>
                  </div>
                  <ToolBars history={history}/>
                </div>

                {/* Popular tools */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">🔥 Most Popular</span>
                    <span className="sec-sub">Highest usage across REIOGN</span>
                  </div>
                  <div className="popular-strip">
                    {TOOLS.filter(t => ['COGNITIVE_CLONE','DECISION_SIMULATOR','OPPORTUNITY_RADAR'].includes(t.id)).map(tool => (
                      <div key={tool.id} className="pop-card" onClick={() => selectTool(tool)}>
                        <span className="pop-icon">{tool.icon}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="pop-name">{tool.name}</div>
                          <div className="pop-desc">{tool.desc.slice(0,60)}…</div>
                        </div>
                        <span className="pop-arrow">›</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All tools */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">All AI Tools</span>
                    <span className="sec-sub">10 purpose-built tools</span>
                  </div>
                  <div className="tool-grid">
                    {TOOLS.map(tool => {
                      const isHot = ['COGNITIVE_CLONE','OPPORTUNITY_RADAR','DECISION_SIMULATOR'].includes(tool.id)
                      const isNew = ['WEALTH_MAPPER','MEMORY_INTELLIGENCE'].includes(tool.id)
                      return (
                        <button key={tool.id} className={`tool-card ${tool.color==='teal'?'t':''}`} onClick={() => selectTool(tool)}>
                          <div className="tc-badges">
                            {isHot && <span className="tc-badge hot">🔥 Hot</span>}
                            {isNew && <span className="tc-badge new">✦ New</span>}
                          </div>
                          <span className="tc-icon">{tool.icon}</span>
                          <div className="tc-name">{tool.name}</div>
                          <div className="tc-desc">{tool.desc}</div>
                          <div className="tc-foot">
                            <span className="tc-cost" style={{ color:tool.color==='lime'?'rgba(184,255,0,0.6)':'rgba(0,240,200,0.6)' }}>{tool.cost} tokens</span>
                            <span className="tc-tier" style={{ color:TIER_COLORS[tool.tier], background:`${TIER_COLORS[tool.tier]}14`, border:`1px solid ${TIER_COLORS[tool.tier]}28` }}>{tool.tier}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Recent activity */}
                {history.length > 0 && (
                  <div>
                    <div className="sec-head">
                      <span className="sec-title">Recent Activity</span>
                      <span className="sec-sub">Last {Math.min(5,history.length)} sessions</span>
                    </div>
                    <div className="activity-list">
                      {history.slice(0,5).map(item => {
                        const tool = TOOLS.find(t => t.name===item.tool)
                        return (
                          <div key={item.id} className="activity-item" onClick={() => {
                            if(tool) {
                              selectTool(tool)
                              setResult({ tool:item.tool, result:item.result, tokensUsed:item.tokensUsed, tokensRemaining:tokens?.balance??0, model:item.model, provider:item.provider, durationMs:item.durationMs })
                            }
                          }}>
                            <span className="act-icon">{tool?.icon??'🤖'}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className="act-tool">{item.tool}</div>
                              <div className="act-msg">{item.message}</div>
                            </div>
                            <div className="act-meta">
                              <span className="act-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(184,255,0,0.5)' }}>{item.tokensUsed} tkn</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">💡 Pro Tips</span>
                  </div>
                  <div className="tips-grid">
                    {TIPS.map((tip,i) => (
                      <div key={i} className="tip-card">
                        <div className="tip-icon">{tip.icon}</div>
                        <div className="tip-title">{tip.title}</div>
                        <div className="tip-desc">{tip.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trial upgrade CTA */}
                {user?.plan === 'TRIAL' && (
                  <div style={{ background:'linear-gradient(135deg,rgba(184,255,0,0.055),rgba(0,240,200,0.03))', border:'1px solid rgba(184,255,0,0.13)', borderRadius:13, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:'#fff', marginBottom:5 }}>You&apos;re on the Free Trial</div>
                      <div style={{ fontSize:12, color:'var(--t3)', maxWidth:360, lineHeight:1.65 }}>Upgrade to Starter and get 2,000 tokens every month — enough for 130+ deep work sessions.</div>
                    </div>
                    <button className="btn-primary" onClick={() => setMainView('billing')}>Upgrade Now →</button>
                  </div>
                )}

                <div style={{ height:16 }}/>
              </>
            )}

            {/* ════ TOOL VIEW ════ */}
            {mainView === 'home' && activeTool && (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="tabs">
                    <button className={`tab ${activeTab==='tool'?'active':''}`} onClick={() => setActiveTab('tool')}>
                      {activeTool.icon} Run Tool
                    </button>
                    <button className={`tab ${activeTab==='history'?'active':''}`} onClick={() => setActiveTab('history')}>
                      📋 History ({history.filter(h => h.tool===activeTool.name).length})
                    </button>
                  </div>
                </div>

                {activeTab === 'tool' && (
                  <>
                    <div className={`tool-panel ${activeTool.color}`}>
                      <div className="tp-head">
                        <span className="tp-icon">{activeTool.icon}</span>
                        <div>
                          <div className="tp-title">{activeTool.name}</div>
                          <div className="tp-desc">{activeTool.desc}</div>
                        </div>
                        <div className="tp-badges">
                          <span className={`badge ${activeTool.color}`}>{activeTool.cost} tokens</span>
                          <span className="badge amber">{activeTool.tier}</span>
                        </div>
                      </div>
                      <div className="tp-body">
                        <label className="field-label">Describe your goal or context</label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={activeTool.placeholder}
                          rows={6}
                          onKeyDown={e => { if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)) runTool() }}
                        />
                        {error && <div className="error-box"><span>⚠</span><span>{error}</span></div>}
                        {aiLoading && (
                          <div className={`queue-bar ${activeTool.color==='teal'?'t':''}`}>
                            <div className={`q-dot ${activeTool.color==='teal'?'t':''}`}/>
                            <span className="q-text">{queuePos ? `Processing · queue position ${queuePos}` : `${activeTool.name} is thinking…`}</span>
                            <span className="q-elapsed">{elapsed}s</span>
                          </div>
                        )}
                        <div className="tp-foot">
                          <button className={`run-btn ${activeTool.color==='teal'?'t':''}`} onClick={runTool} disabled={aiLoading||!message.trim()}>
                            {aiLoading ? <><div className="spinner"/>Running…</> : `Run ${activeTool.name} →`}
                          </button>
                          <span className="cost-hint">⌘+Enter to run · {activeTool.cost} tokens · auto-refunded on error</span>
                        </div>
                      </div>
                    </div>

                    {result && (
                      <div ref={resultRef} className={`result-card ${activeTool.color==='teal'?'t':''}`}>
                        <div className="rc-head">
                          <span className="rc-title">Result · {result.tool.replace(/_/g,' ')}</span>
                          <div className="rc-meta">
                            <div className="provider-dot">
                              <div className="pd-dot" style={{ background:PROVIDER_LABELS[result.provider]?.color??'#fff' }}/>
                              <span style={{ color:PROVIDER_LABELS[result.provider]?.color??'#fff' }}>
                                {PROVIDER_LABELS[result.provider]?.label??result.provider}
                              </span>
                            </div>
                            <span className={`badge ${activeTool.color}`}>{result.tokensUsed} tkn</span>
                            <span className="badge amber">{(result.durationMs/1000).toFixed(1)}s</span>
                          </div>
                        </div>
                        <div className="rc-body">
                          <pre>{result.result}</pre>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'history' && (
                  <div className="hist-list">
                    {history.filter(h => h.tool===activeTool.name).length === 0 ? (
                      <div className="empty-state">
                        <div className="es-icon">📋</div>
                        <div className="es-title">No history yet</div>
                        <div className="es-sub">Run {activeTool.name} and your sessions will appear here.</div>
                      </div>
                    ) : history.filter(h => h.tool===activeTool.name).map(item => (
                      <div key={item.id} className="hist-item" onClick={() => {
                        setResult({ tool:item.tool, result:item.result, tokensUsed:item.tokensUsed, tokensRemaining:tokens?.balance??0, model:item.model, provider:item.provider, durationMs:item.durationMs })
                        setActiveTab('tool')
                        setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
                      }}>
                        <div className="hi-top">
                          <span className="hi-name">{item.tool}</span>
                          <span className="hi-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="hi-msg">{item.message}</div>
                        <div className="hi-meta">
                          <span className={`badge ${activeTool.color}`}>{item.tokensUsed} tokens</span>
                          <div className="provider-dot">
                            <div className="pd-dot" style={{ background:PROVIDER_LABELS[item.provider]?.color??'#fff' }}/>
                            <span style={{ color:PROVIDER_LABELS[item.provider]?.color??'#fff' }}>
                              {PROVIDER_LABELS[item.provider]?.label??item.provider}
                            </span>
                          </div>
                          <span className="badge amber">{(item.durationMs/1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
