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
  { id:'TRIAL',   name:'Trial',   price:'Free',    tokens:500,   color:'rgba(255,255,255,0.4)', features:['500 tokens total','All 10 AI tools','Basic support'] },
  { id:'STARTER', name:'Starter', price:'₹499/mo', tokens:2000,  color:'#b8ff00',               features:['2,000 tokens/month','All 10 AI tools','Priority support','History export'] },
  { id:'PRO',     name:'Pro',     price:'₹999/mo', tokens:6000,  color:'#00f0c8',               features:['6,000 tokens/month','All 10 AI tools','24/7 support','API access','History export'] },
  { id:'ELITE',   name:'Elite',   price:'₹2499/mo',tokens:20000, color:'#ff9500',               features:['20,000 tokens/month','All 10 AI tools','Dedicated support','API access','White-label','Custom tools'] },
]

const TIPS = [
  { icon:'⚡', title:'Chain tools for 10x output', desc:'Run Opportunity Radar first, then feed its output directly into Decision Simulator for compounded intelligence.' },
  { icon:'🎯', title:'Be specific for better results', desc:'The more context you give — numbers, timelines, constraints — the more precise and actionable your output will be.' },
  { icon:'🔄', title:'Tokens are refunded on error', desc:'If any tool fails for any reason, your tokens are automatically refunded. You never lose tokens on bad runs.' },
  { icon:'💾', title:'Session history is saved', desc:'Your last 20 sessions are saved per browser. Click any history item to instantly restore and review past results.' },
  { icon:'🧠', title:'Heavy tools use Claude AI', desc:'HEAVY tier tools run on Anthropic Claude — the most powerful AI for complex reasoning and multi-step analysis.' },
  { icon:'🚀', title:'Light tools are near-instant', desc:'LIGHT tier tools (5 tokens) run on ultra-fast Groq inference — results in under 3 seconds.' },
]

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  anthropic: { label:'Claude',  color:'#b8ff00' },
  gemini:    { label:'Gemini',  color:'#00f0c8' },
  groq:      { label:'Groq',    color:'#ff9500' },
  openai:    { label:'GPT',     color:'#74b9ff' },
}

const TIER_COLORS: Record<string, string> = { LIGHT:'#00f0c8', MEDIUM:'#b8ff00', HEAVY:'#ff9500' }

type SideSection = 'tools' | 'billing' | 'settings'

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
  const [sideSection, setSideSection] = useState<SideSection>('tools')
  const [queuePos, setQueuePos]       = useState<number|null>(null)
  const [elapsed, setElapsed]         = useState(0)
  const [mainView, setMainView]       = useState<'home'|'billing'>('home')
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

  const currentPlan = PLANS.find(p => p.id === user?.plan) ?? PLANS[0]
  const tokenPct    = Math.min(100, Math.round(((tokens?.balance??0)/currentPlan.tokens)*100))

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
          --bg:#07080f;--s1:#0a0b15;--s2:#0f1120;--s3:#141628;
          --lime:#b8ff00;--teal:#00f0c8;--rose:#ff4f72;--amber:#ff9500;
          --bd:rgba(255,255,255,0.05);--bd2:rgba(255,255,255,0.09);--bd3:rgba(255,255,255,0.14);
          --t1:#ffffff;--t2:rgba(255,255,255,0.68);--t3:rgba(255,255,255,0.38);--t4:rgba(255,255,255,0.16);
        }
        html,body{min-height:100vh;background:var(--bg);color:var(--t1);font-family:'Inter',sans-serif;overflow:hidden;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px;}

        .layout{display:flex;height:100vh;overflow:hidden;}

        /* ── Sidebar ── */
        .sidebar{
          width:${sidebarOpen?'260px':'0'};min-width:${sidebarOpen?'260px':'0'};
          height:100vh;display:flex;flex-direction:column;
          background:var(--s1);border-right:1px solid var(--bd);
          overflow:hidden;transition:min-width .28s cubic-bezier(.4,0,.2,1),width .28s cubic-bezier(.4,0,.2,1);
          flex-shrink:0;
        }
        .sb-top{padding:18px 16px 14px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .sb-logo{display:flex;align-items:center;gap:9px;text-decoration:none;flex:1;min-width:0;}
        .sb-mark{width:30px;height:30px;border-radius:8px;background:rgba(184,255,0,0.1);border:1px solid rgba(184,255,0,0.15);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:#b8ff00;}
        .sb-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:#fff;white-space:nowrap;letter-spacing:-.3px;}

        /* Sidebar nav */
        .sb-nav{display:flex;gap:2px;padding:10px 10px 0;flex-shrink:0;}
        .sb-nav-btn{flex:1;padding:6px 4px;border-radius:6px;background:transparent;border:none;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;transition:all .18s;}
        .sb-nav-btn.active{background:rgba(184,255,0,0.08);color:#b8ff00;border:1px solid rgba(184,255,0,0.12);}

        .sb-section{padding:14px 16px 6px;font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.18);letter-spacing:2px;text-transform:uppercase;flex-shrink:0;}
        .sb-tools{flex:1;overflow-y:auto;padding:0 8px 8px;}
        .sb-tool{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:8px;cursor:pointer;transition:all .15s;white-space:nowrap;border:1px solid transparent;width:100%;background:none;text-align:left;}
        .sb-tool:hover{background:rgba(255,255,255,0.03);}
        .sb-tool.active{background:rgba(184,255,0,0.07);border-color:rgba(184,255,0,0.14);}
        .sb-tool.active.t{background:rgba(0,240,200,0.07);border-color:rgba(0,240,200,0.14);}
        .sb-icon{font-size:13px;flex-shrink:0;width:20px;text-align:center;}
        .sb-info{flex:1;min-width:0;}
        .sb-tname{font-size:11.5px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sb-tcost{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.25);margin-top:1px;}
        .sb-tool.active .sb-tcost{color:rgba(184,255,0,0.55);}
        .sb-tool.active.t .sb-tcost{color:rgba(0,240,200,0.55);}
        .sb-tier{width:4px;height:4px;border-radius:50%;flex-shrink:0;}

        /* Sidebar footer */
        .sb-foot{padding:12px;border-top:1px solid var(--bd);flex-shrink:0;}
        .sb-plan-chip{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(255,255,255,0.02);border:1px solid var(--bd);border-radius:7px;margin-bottom:8px;}
        .sb-plan-name{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;}
        .sb-plan-badge{font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 7px;border-radius:3px;}
        .sb-user{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px;}
        .sb-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#b8ff00,#00f0c8);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:#07080f;flex-shrink:0;}
        .sb-uname{font-size:11.5px;font-weight:500;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sb-uemail{font-size:9.5px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .logout-btn{width:100%;padding:7px;background:transparent;border:1px solid rgba(255,79,114,0.15);border-radius:6px;color:rgba(255,79,114,0.5);font-size:10.5px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;letter-spacing:.3px;}
        .logout-btn:hover{background:rgba(255,79,114,0.07);color:#ff6b8a;border-color:rgba(255,79,114,0.28);}

        /* Billing sidebar panel */
        .sb-billing{flex:1;overflow-y:auto;padding:8px;}
        .sb-bill-item{padding:10px;border-radius:8px;border:1px solid var(--bd);background:rgba(255,255,255,0.01);margin-bottom:6px;cursor:pointer;transition:all .18s;}
        .sb-bill-item:hover{border-color:var(--bd2);background:rgba(255,255,255,0.03);}
        .sb-bill-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
        .sb-bill-val{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;}

        /* ── Main ── */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .topbar{height:54px;border-bottom:1px solid var(--bd);display:flex;align-items:center;padding:0 22px;gap:12px;background:rgba(10,11,21,0.85);backdrop-filter:blur(16px);flex-shrink:0;}
        .tb-toggle{width:30px;height:30px;border:1px solid var(--bd);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:all .2s;font-size:12px;flex-shrink:0;}
        .tb-toggle:hover{border-color:rgba(184,255,0,0.2);color:#fff;}
        .tb-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tb-spacer{flex:1;}
        .tb-actions{display:flex;align-items:center;gap:8px;}
        .tb-btn{padding:6px 12px;background:transparent;border:1px solid var(--bd2);border-radius:6px;color:var(--t3);font-size:11px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;}
        .tb-btn:hover{border-color:rgba(184,255,0,0.2);color:#b8ff00;}
        .token-chip{display:flex;align-items:center;gap:6px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);padding:5px 12px;border-radius:5px;flex-shrink:0;}
        .tok-n{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:#b8ff00;}
        .tok-l{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(184,255,0,0.45);letter-spacing:1px;text-transform:uppercase;}

        /* ── Content ── */
        .content{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;}

        /* ── Hero ── */
        .hero{background:linear-gradient(135deg,rgba(12,14,26,0.9) 0%,rgba(15,17,32,0.9) 50%,rgba(10,12,20,0.9) 100%);border:1px solid var(--bd2);border-radius:16px;padding:28px 32px;position:relative;overflow:hidden;}
        .hero::before{content:'';position:absolute;top:-60px;right:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(184,255,0,0.06),transparent 70%);pointer-events:none;}
        .hero::after{content:'';position:absolute;bottom:-40px;left:20%;width:200px;height:200px;background:radial-gradient(circle,rgba(0,240,200,0.04),transparent 70%);pointer-events:none;}
        .hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px;}
        .hero-greeting{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;margin-bottom:6px;line-height:1.2;}
        .hero-sub{font-size:13px;color:var(--t3);line-height:1.6;max-width:420px;}
        .hero-cta{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;}
        .hero-btn-primary{padding:10px 20px;background:#b8ff00;color:#07080f;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.3px;}
        .hero-btn-primary:hover{background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.3);}
        .hero-btn-sec{padding:10px 20px;background:transparent;color:var(--t2);border:1px solid var(--bd2);border-radius:8px;font-size:12px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;}
        .hero-btn-sec:hover{border-color:rgba(255,255,255,0.2);color:#fff;}

        /* Stats row */
        .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;}
        .stat-card{background:rgba(255,255,255,0.02);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;position:relative;overflow:hidden;}
        .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
        .stat-card.lime::before{background:linear-gradient(90deg,#b8ff00,transparent);}
        .stat-card.teal::before{background:linear-gradient(90deg,#00f0c8,transparent);}
        .stat-card.amber::before{background:linear-gradient(90deg,#ff9500,transparent);}
        .stat-card.rose::before{background:linear-gradient(90deg,#ff4f72,transparent);}
        .stat-n{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:3px;}
        .stat-l{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--t4);letter-spacing:1.5px;text-transform:uppercase;}
        .stat-sub{font-size:10px;color:var(--t3);margin-top:4px;}

        /* Token progress */
        .tok-progress{margin-top:16px;}
        .tok-prog-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .tok-prog-label{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.3);letter-spacing:1.5px;text-transform:uppercase;}
        .tok-prog-val{font-family:'JetBrains Mono',monospace;font-size:10px;color:#b8ff00;}
        .prog-bar{height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;}
        .prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#b8ff00,#00f0c8);transition:width .6s ease;}

        /* Section header */
        .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .sec-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;}
        .sec-sub{font-size:11px;color:var(--t3);}
        .sec-link{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(184,255,0,0.6);cursor:pointer;letter-spacing:.8px;background:none;border:none;transition:color .2s;}
        .sec-link:hover{color:#b8ff00;}

        /* Tool grid */
        .tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;}
        .tool-card{background:rgba(12,14,26,0.7);border:1px solid var(--bd);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;text-align:left;width:100%;position:relative;overflow:hidden;}
        .tool-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(184,255,0,0.03),transparent);opacity:0;transition:opacity .2s;}
        .tool-card:hover{border-color:rgba(184,255,0,0.22);background:rgba(12,14,26,0.95);transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.4);}
        .tool-card:hover::after{opacity:1;}
        .tool-card.t:hover{border-color:rgba(0,240,200,0.22);}
        .tool-card.t::after{background:linear-gradient(135deg,rgba(0,240,200,0.03),transparent);}
        .tc-badges{position:absolute;top:12px;right:12px;display:flex;gap:4px;}
        .tc-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:2px 6px;border-radius:2px;letter-spacing:.8px;text-transform:uppercase;}
        .tc-badge.hot{color:#ff9500;background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.2);}
        .tc-badge.new{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.15);}
        .tc-icon{font-size:22px;margin-bottom:12px;display:block;}
        .tc-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:5px;}
        .tc-desc{font-size:11px;color:var(--t3);line-height:1.6;margin-bottom:12px;}
        .tc-foot{display:flex;align-items:center;justify-content:space-between;}
        .tc-cost{font-family:'JetBrains Mono',monospace;font-size:9px;}
        .tc-tier{font-family:'JetBrains Mono',monospace;font-size:7.5px;padding:2px 6px;border-radius:3px;letter-spacing:.8px;}

        /* Popular section */
        .popular-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}
        .pop-card{background:rgba(12,14,26,0.7);border:1px solid var(--bd2);border-radius:12px;padding:18px 20px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;}
        .pop-card:hover{background:rgba(12,14,26,0.95);transform:translateX(3px);}
        .pop-icon{font-size:24px;flex-shrink:0;}
        .pop-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:3px;}
        .pop-desc{font-size:11px;color:var(--t3);line-height:1.5;}
        .pop-arrow{margin-left:auto;color:rgba(255,255,255,0.15);font-size:16px;flex-shrink:0;transition:transform .2s;}
        .pop-card:hover .pop-arrow{transform:translateX(3px);color:rgba(184,255,0,0.5);}

        /* Tips */
        .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}
        .tip-card{background:rgba(255,255,255,0.015);border:1px solid var(--bd);border-radius:10px;padding:16px;}
        .tip-icon{font-size:18px;margin-bottom:8px;}
        .tip-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;margin-bottom:5px;}
        .tip-desc{font-size:11px;color:var(--t3);line-height:1.6;}

        /* Activity feed */
        .activity-list{display:flex;flex-direction:column;gap:8px;}
        .activity-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.015);border:1px solid var(--bd);border-radius:9px;cursor:pointer;transition:all .18s;}
        .activity-item:hover{border-color:var(--bd2);background:rgba(255,255,255,0.03);}
        .act-icon{font-size:16px;flex-shrink:0;}
        .act-tool{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;}
        .act-msg{font-size:11px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .act-meta{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
        .act-time{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--t4);}

        /* Billing view */
        .billing-hero{background:linear-gradient(135deg,rgba(12,14,26,0.9),rgba(15,17,32,0.9));border:1px solid var(--bd2);border-radius:16px;padding:28px 32px;text-align:center;position:relative;overflow:hidden;margin-bottom:20px;}
        .billing-hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:400px;height:400px;background:radial-gradient(circle,rgba(184,255,0,0.05),transparent 70%);pointer-events:none;}
        .billing-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:8px;}
        .billing-sub{font-size:13px;color:var(--t3);max-width:460px;margin:0 auto;}
        .plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;}
        .plan-card{background:rgba(12,14,26,0.7);border:1px solid var(--bd);border-radius:14px;padding:22px;transition:all .2s;position:relative;overflow:hidden;}
        .plan-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .plan-card.current{border-color:rgba(184,255,0,0.25);background:rgba(184,255,0,0.03);}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.4);}
        .plan-current-badge{position:absolute;top:12px;right:12px;font-family:'JetBrains Mono',monospace;font-size:7.5px;padding:3px 8px;border-radius:3px;background:rgba(184,255,0,0.1);color:#b8ff00;border:1px solid rgba(184,255,0,0.2);letter-spacing:.8px;text-transform:uppercase;}
        .plan-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;}
        .plan-price{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;margin-bottom:4px;}
        .plan-tokens{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:16px;}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:7px;margin-bottom:18px;}
        .plan-features li{font-size:11.5px;color:var(--t2);display:flex;align-items:center;gap:7px;}
        .plan-features li::before{content:'✓';font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;flex-shrink:0;}
        .plan-btn{width:100%;padding:10px;border-radius:8px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none;}
        .plan-btn.active{background:#b8ff00;color:#07080f;}
        .plan-btn.active:hover{background:#cbff1a;box-shadow:0 0 20px rgba(184,255,0,0.3);}
        .plan-btn.inactive{background:transparent;color:var(--t3);border:1px solid var(--bd2);}
        .plan-btn.inactive:hover{border-color:rgba(255,255,255,0.2);color:#fff;}

        /* Tabs */
        .tabs{display:flex;gap:2px;background:rgba(255,255,255,0.03);border:1px solid var(--bd);border-radius:8px;padding:3px;}
        .tab{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--t3);transition:all .18s;}
        .tab.active{background:rgba(184,255,0,0.1);color:#b8ff00;border:1px solid rgba(184,255,0,0.15);}

        /* Tool panel */
        .tool-panel{background:rgba(12,14,26,0.75);border:1px solid var(--bd2);border-radius:12px;overflow:hidden;}
        .tool-panel.lime{border-color:rgba(184,255,0,0.16);}
        .tool-panel.teal{border-color:rgba(0,240,200,0.16);}
        .tp-head{padding:18px 22px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px;}
        .tp-icon{font-size:22px;}
        .tp-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;}
        .tp-desc{font-size:11.5px;color:var(--t3);margin-top:2px;}
        .tp-badges{margin-left:auto;display:flex;gap:6px;align-items:center;flex-shrink:0;}
        .badge{font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 8px;border-radius:3px;letter-spacing:.8px;text-transform:uppercase;}
        .badge.lime{color:#b8ff00;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);}
        .badge.teal{color:#00f0c8;background:rgba(0,240,200,0.07);border:1px solid rgba(0,240,200,0.14);}
        .badge.amber{color:#ff9500;background:rgba(255,149,0,0.07);border:1px solid rgba(255,149,0,0.14);}
        .tp-body{padding:20px 22px;}
        .field-label{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.28);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;display:block;}
        textarea{width:100%;background:#0a0c1a;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;color:#fff;font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:120px;transition:border-color .2s;line-height:1.7;}
        textarea:focus{border-color:rgba(184,255,0,0.28);}
        textarea::placeholder{color:rgba(255,255,255,0.1);}
        .tp-foot{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap;}
        .run-btn{padding:11px 24px;background:#b8ff00;color:#07080f;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .22s;display:inline-flex;align-items:center;gap:7px;flex-shrink:0;}
        .run-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.3);}
        .run-btn:disabled{opacity:.5;cursor:not-allowed;}
        .run-btn.t{background:#00f0c8;}
        .run-btn.t:hover:not(:disabled){background:#00ffd8;box-shadow:0 0 24px rgba(0,240,200,0.3);}
        .cost-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);}
        .spinner{width:13px;height:13px;border:2px solid rgba(7,8,15,.3);border-top-color:#07080f;border-radius:50%;animation:spin .65s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .queue-bar{background:rgba(184,255,0,0.05);border:1px solid rgba(184,255,0,0.12);border-radius:9px;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:12px;}
        .queue-bar.t{background:rgba(0,240,200,0.05);border-color:rgba(0,240,200,0.12);}
        .q-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;animation:blink 1.2s infinite;flex-shrink:0;}
        .q-dot.t{background:#00f0c8;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
        .q-text{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);flex:1;}
        .q-elapsed{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.2);}
        .error-box{background:rgba(255,79,114,0.06);border:1px solid rgba(255,79,114,0.18);border-radius:8px;padding:11px 15px;font-size:12px;color:#ff6b8a;margin-top:10px;display:flex;align-items:flex-start;gap:7px;line-height:1.55;}
        .result-card{background:rgba(10,12,20,0.95);border:1px solid rgba(184,255,0,0.16);border-radius:12px;overflow:hidden;}
        .result-card.t{border-color:rgba(0,240,200,0.16);}
        .rc-head{padding:13px 20px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .rc-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:2px;text-transform:uppercase;flex:1;}
        .rc-meta{display:flex;gap:6px;align-items:center;}
        .rc-body{padding:20px 22px;max-height:520px;overflow-y:auto;}
        .rc-body pre{white-space:pre-wrap;word-break:break-word;font-family:'Inter',sans-serif;font-size:13px;color:#fff;line-height:1.8;}
        .hist-list{display:flex;flex-direction:column;gap:10px;}
        .hist-item{background:rgba(12,14,26,0.65);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;cursor:pointer;transition:all .18s;}
        .hist-item:hover{border-color:var(--bd2);background:rgba(12,14,26,0.9);}
        .hi-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .hi-name{font-family:'Syne',sans-serif;font-size:12.5px;font-weight:700;color:#fff;}
        .hi-time{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.2);margin-left:auto;}
        .hi-msg{font-size:11.5px;color:rgba(255,255,255,0.4);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .hi-meta{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}
        .provider-dot{display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.8px;}
        .pd-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .empty-state{text-align:center;padding:56px 24px;}
        .es-icon{font-size:36px;margin-bottom:14px;}
        .es-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;}
        .es-sub{font-size:12px;color:var(--t3);line-height:1.6;}
        .divider{height:1px;background:var(--bd);margin:4px 0;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.8)}}
      `}</style>

      <div className="layout">
        {/* ── Sidebar ── */}
        <div className="sidebar">
          <div className="sb-top">
            <a href="/" className="sb-logo">
              <div className="sb-mark">R</div>
              <span className="sb-name">REIOGN</span>
            </a>
          </div>

          {/* Nav tabs */}
          <div className="sb-nav">
            {(['tools','billing','settings'] as SideSection[]).map(s => (
              <button key={s} className={`sb-nav-btn ${sideSection===s?'active':''}`}
                onClick={() => { setSideSection(s); if(s==='billing'){setActiveTool(null);setMainView('billing')} else setMainView('home') }}>
                {s}
              </button>
            ))}
          </div>

          {sideSection === 'tools' && (
            <>
              <div className="sb-section">AI Tools</div>
              <div className="sb-tools">
                {TOOLS.map(tool => (
                  <button key={tool.id} className={`sb-tool ${activeTool?.id===tool.id?'active':''} ${tool.color==='teal'?'t':''}`} onClick={() => selectTool(tool)}>
                    <span className="sb-icon">{tool.icon}</span>
                    <div className="sb-info">
                      <div className="sb-tname">{tool.name}</div>
                      <div className="sb-tcost">{tool.cost} tokens · {tool.tier}</div>
                    </div>
                    <div className="sb-tier" style={{ background:TIER_COLORS[tool.tier] }} />
                  </button>
                ))}
              </div>
            </>
          )}

          {sideSection === 'billing' && (
            <>
              <div className="sb-section">Billing</div>
              <div className="sb-billing">
                <div className="sb-bill-item" onClick={() => { setMainView('billing'); setActiveTool(null) }}>
                  <div className="sb-bill-label">Current Plan</div>
                  <div className="sb-bill-val" style={{ color:currentPlan.color }}>{currentPlan.name}</div>
                </div>
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Tokens Left</div>
                  <div className="sb-bill-val" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString() ?? '—'}</div>
                </div>
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Tokens Used</div>
                  <div className="sb-bill-val">{tokens?.totalSpent?.toLocaleString() ?? '0'}</div>
                </div>
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Sessions</div>
                  <div className="sb-bill-val">{history.length}</div>
                </div>
                <div style={{ marginTop:8 }}>
                  <button className="run-btn" style={{ width:'100%', justifyContent:'center', fontSize:11 }}
                    onClick={() => { setMainView('billing'); setActiveTool(null) }}>
                    Upgrade Plan →
                  </button>
                </div>
              </div>
            </>
          )}

          {sideSection === 'settings' && (
            <>
              <div className="sb-section">Settings</div>
              <div className="sb-billing">
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Account</div>
                  <div className="sb-bill-val" style={{ fontSize:11 }}>{user?.email}</div>
                </div>
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Member Since</div>
                  <div className="sb-bill-val" style={{ fontSize:11 }}>2025</div>
                </div>
                <div className="sb-bill-item">
                  <div className="sb-bill-label">Plan</div>
                  <div className="sb-bill-val" style={{ color:currentPlan.color, fontSize:11 }}>{currentPlan.name}</div>
                </div>
              </div>
            </>
          )}

          <div className="sb-foot">
            <div className="sb-plan-chip">
              <span className="sb-plan-name">Plan</span>
              <span className="sb-plan-badge" style={{ color:currentPlan.color, background:`${currentPlan.color}14`, border:`1px solid ${currentPlan.color}28` }}>{currentPlan.name}</span>
            </div>
            {user && (
              <div className="sb-user">
                <div className="sb-av">{(user.name?.slice(0,2)??'RE').toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="sb-uname">{user.name}</div>
                  <div className="sb-uemail">{user.email}</div>
                </div>
              </div>
            )}
            <button className="logout-btn" onClick={logout}>↩ Sign out</button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="main">
          <div className="topbar">
            <button className="tb-toggle" onClick={() => setSidebarOpen(o=>!o)}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <span className="tb-title">
              {mainView==='billing' ? '💳 Billing & Plans' : activeTool ? `${activeTool.icon} ${activeTool.name}` : 'Dashboard'}
            </span>
            <div className="tb-spacer" />
            <div className="tb-actions">
              {activeTool && (
                <button className="tb-btn" onClick={() => { setActiveTool(null); setMainView('home') }}>← Back</button>
              )}
              {mainView!=='billing' && (
                <button className="tb-btn" onClick={() => { setMainView('billing'); setActiveTool(null) }}>💳 Upgrade</button>
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

            {/* ══ BILLING VIEW ══ */}
            {mainView === 'billing' && (
              <>
                <div className="billing-hero">
                  <div className="billing-title">Choose Your Plan</div>
                  <div className="billing-sub">Scale your cognitive performance with the right token allocation. Upgrade, downgrade, or cancel anytime.</div>
                </div>

                <div className="plans-grid">
                  {PLANS.map(plan => (
                    <div key={plan.id} className={`plan-card ${user?.plan===plan.id?'current':''}`}
                      style={{ ['--plan-color' as string]: plan.color }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${plan.color},transparent)` }} />
                      {user?.plan===plan.id && <div className="plan-current-badge">Current</div>}
                      <div className="plan-name">{plan.name}</div>
                      <div className="plan-price" style={{ color:plan.color }}>{plan.price}</div>
                      <div className="plan-tokens">{plan.tokens.toLocaleString()} TOKENS / MONTH</div>
                      <ul className="plan-features">
                        {plan.features.map((f,i) => (
                          <li key={i} style={{ ['--check-color' as string]: plan.color }}>
                            <span style={{ color:plan.color }}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <button className={`plan-btn ${user?.plan===plan.id?'inactive':'active'}`}
                        style={user?.plan!==plan.id ? { background:plan.color, color:'#07080f' } : {}}>
                        {user?.plan===plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Usage breakdown */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">Token Usage</span>
                    <span className="sec-sub">This billing cycle</span>
                  </div>
                  <div className="stats-row">
                    <div className="stat-card lime">
                      <div className="stat-n" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString()??'—'}</div>
                      <div className="stat-l">Tokens Remaining</div>
                    </div>
                    <div className="stat-card teal">
                      <div className="stat-n" style={{ color:'#00f0c8' }}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                      <div className="stat-l">Tokens Used</div>
                    </div>
                    <div className="stat-card amber">
                      <div className="stat-n" style={{ color:'#ff9500' }}>{history.length}</div>
                      <div className="stat-l">Total Sessions</div>
                    </div>
                    <div className="stat-card rose">
                      <div className="stat-n">{currentPlan.tokens.toLocaleString()}</div>
                      <div className="stat-l">Plan Limit</div>
                    </div>
                  </div>
                  <div className="tok-progress" style={{ marginTop:16, background:'rgba(255,255,255,0.02)', border:'1px solid var(--bd)', borderRadius:10, padding:'14px 16px' }}>
                    <div className="tok-prog-head">
                      <span className="tok-prog-label">Usage This Cycle</span>
                      <span className="tok-prog-val">{tokenPct}% remaining</span>
                    </div>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width:`${tokenPct}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ HOME VIEW ══ */}
            {mainView === 'home' && !activeTool && (
              <>
                {/* Hero */}
                <div className="hero">
                  <div className="hero-top">
                    <div>
                      <div className="hero-greeting">
                        {user ? `Hey ${user.name?.split(' ')[0]} 👋` : 'Welcome back 👋'}
                      </div>
                      <div className="hero-sub">
                        Your AI performance toolkit is ready. Pick a tool and start executing — every output is precision-engineered for results.
                      </div>
                      <div className="hero-cta">
                        <button className="hero-btn-primary" onClick={() => selectTool(TOOLS[0])}>⚡ Start Deep Work</button>
                        <button className="hero-btn-sec" onClick={() => { setMainView('billing'); }}>💳 View Plans</button>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.2)', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>Current Plan</div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:currentPlan.color }}>{currentPlan.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stats-row">
                    <div className="stat-card lime">
                      <div className="stat-n" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString()??'—'}</div>
                      <div className="stat-l">Tokens Left</div>
                      <div className="stat-sub">{tokenPct}% remaining</div>
                    </div>
                    <div className="stat-card teal">
                      <div className="stat-n" style={{ color:'#00f0c8' }}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                      <div className="stat-l">Tokens Used</div>
                    </div>
                    <div className="stat-card amber">
                      <div className="stat-n" style={{ color:'#ff9500' }}>{history.length}</div>
                      <div className="stat-l">Sessions</div>
                    </div>
                    <div className="stat-card rose">
                      <div className="stat-n">{TOOLS.length}</div>
                      <div className="stat-l">AI Tools</div>
                      <div className="stat-sub">All unlocked</div>
                    </div>
                  </div>

                  {/* Token progress */}
                  <div className="tok-progress">
                    <div className="tok-prog-head">
                      <span className="tok-prog-label">Token Balance</span>
                      <span className="tok-prog-val">{tokens?.balance?.toLocaleString()??'—'} / {currentPlan.tokens.toLocaleString()}</span>
                    </div>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width:`${tokenPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Popular tools */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">🔥 Most Popular</span>
                    <button className="sec-link" onClick={() => {}}>View all →</button>
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
                    <span className="sec-sub">Get more from REIOGN</span>
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

                {/* Upgrade CTA */}
                {user?.plan === 'TRIAL' && (
                  <div style={{ background:'linear-gradient(135deg,rgba(184,255,0,0.06),rgba(0,240,200,0.04))', border:'1px solid rgba(184,255,0,0.15)', borderRadius:14, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:'#fff', marginBottom:6 }}>You&apos;re on the Free Trial</div>
                      <div style={{ fontSize:12, color:'var(--t3)', maxWidth:380, lineHeight:1.6 }}>Upgrade to Starter and get 2,000 tokens every month — enough for 130+ deep work sessions.</div>
                    </div>
                    <button className="hero-btn-primary" onClick={() => { setMainView('billing'); }}>
                      Upgrade Now →
                    </button>
                  </div>
                )}

                {/* AI providers status */}
                <div>
                  <div className="sec-head">
                    <span className="sec-title">AI Providers</span>
                    <span className="sec-sub">Powering your tools</span>
                  </div>
                  <div className="stats-row">
                    {Object.entries(PROVIDER_LABELS).map(([key, val]) => (
                      <div key={key} className="stat-card" style={{ cursor:'default' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:val.color }} />
                          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:'#fff' }}>{val.label}</span>
                        </div>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,0.2)', letterSpacing:1.2, textTransform:'uppercase' }}>
                          {key==='anthropic'?'Heavy tier':key==='gemini'?'Medium tier':key==='groq'?'Light tier':'Fallback'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer spacer */}
                <div style={{ height:20 }} />
              </>
            )}

            {/* ══ TOOL VIEW ══ */}
            {mainView === 'home' && activeTool && (
              <>
                {/* Tabs */}
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
                            <div className={`q-dot ${activeTool.color==='teal'?'t':''}`} />
                            <span className="q-text">{queuePos ? `Processing · queue position ${queuePos}` : `${activeTool.name} is thinking…`}</span>
                            <span className="q-elapsed">{elapsed}s</span>
                          </div>
                        )}
                        <div className="tp-foot">
                          <button className={`run-btn ${activeTool.color==='teal'?'t':''}`} onClick={runTool} disabled={aiLoading||!message.trim()}>
                            {aiLoading ? <><div className="spinner" />Running…</> : `Run ${activeTool.name} →`}
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
                              <div className="pd-dot" style={{ background:PROVIDER_LABELS[result.provider]?.color??'#fff' }} />
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
                            <div className="pd-dot" style={{ background:PROVIDER_LABELS[item.provider]?.color??'#fff' }} />
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
