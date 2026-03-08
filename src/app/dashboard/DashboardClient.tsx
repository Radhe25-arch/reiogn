'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User  { id: string; name: string; email: string; plan: string }
interface TokenInfo { balance: number; totalSpent: number }
interface AIResult  { tool: string; result: string; tokensUsed: number; tokensRemaining: number; model: string; provider: string; durationMs: number }
interface HistoryItem { id: string; tool: string; result: string; tokensUsed: number; model: string; provider: string; durationMs: number; timestamp: number; message: string }

const TOOLS = [
  { id: 'DEEP_WORK_ENGINE',    slug: 'deep-work-engine',    name: 'Deep Work Engine',    icon: '⚡', cost: 15, tier: 'MEDIUM', color: 'lime', desc: 'Structure your next deep work session',        placeholder: 'e.g. I need to write 5000 words of my thesis today. My focus peaks at 9am...' },
  { id: 'COGNITIVE_CLONE',     slug: 'cognitive-clone',     name: 'Cognitive Clone',     icon: '🧠', cost: 30, tier: 'HEAVY',  color: 'teal', desc: 'Simulate your high-performance self',           placeholder: 'e.g. I am deciding whether to quit my job and start a SaaS. Current MRR is $0...' },
  { id: 'RESEARCH_BUILDER',    slug: 'research-builder',    name: 'Research Builder',    icon: '🔬', cost: 15, tier: 'MEDIUM', color: 'lime', desc: 'Build a counter-intuitive research strategy',   placeholder: 'e.g. I want to understand the Indian EV market from first principles...' },
  { id: 'SKILL_ROI_ANALYZER',  slug: 'skill-roi-analyzer',  name: 'Skill ROI Analyzer',  icon: '📊', cost: 5,  tier: 'LIGHT',  color: 'teal', desc: 'Get ROI projections across 3/12/36 months',    placeholder: 'e.g. Should I learn Rust or TypeScript as a backend developer in 2025?' },
  { id: 'MEMORY_INTELLIGENCE', slug: 'memory-intelligence', name: 'Memory Intelligence', icon: '💡', cost: 15, tier: 'MEDIUM', color: 'lime', desc: 'Build spaced repetition memory maps',           placeholder: 'e.g. I need to memorize the entire OSI model and how each layer interacts...' },
  { id: 'EXECUTION_OPTIMIZER', slug: 'execution-optimizer', name: 'Execution Optimizer', icon: '🚀', cost: 15, tier: 'MEDIUM', color: 'teal', desc: 'Get your critical path & 7-day action plan',   placeholder: 'e.g. Launch my SaaS MVP in 30 days. I have evenings and weekends free...' },
  { id: 'OPPORTUNITY_RADAR',   slug: 'opportunity-radar',   name: 'Opportunity Radar',   icon: '📡', cost: 30, tier: 'HEAVY',  color: 'lime', desc: 'Surface high-leverage hidden opportunities',   placeholder: 'e.g. I am a 24-year-old developer in Mumbai with ₹2L savings and 2 years experience...' },
  { id: 'DECISION_SIMULATOR',  slug: 'decision-simulator',  name: 'Decision Simulator',  icon: '⚖️', cost: 30, tier: 'HEAVY',  color: 'teal', desc: 'Run a multi-scenario decision simulation',     placeholder: 'e.g. I got two offers: ₹18L at startup vs ₹24L at MNC. I value learning over salary...' },
  { id: 'FOCUS_SHIELD',        slug: 'focus-shield',        name: 'Focus Shield',        icon: '🛡️', cost: 5,  tier: 'LIGHT',  color: 'lime', desc: 'Get your personalized distraction protocol',  placeholder: 'e.g. I get distracted by Instagram every 20 mins, I work from home, have notifications on...' },
  { id: 'WEALTH_MAPPER',       slug: 'wealth-mapper',       name: 'Wealth Mapper',       icon: '💰', cost: 30, tier: 'HEAVY',  color: 'teal', desc: 'Build your 36-month wealth roadmap',          placeholder: 'e.g. 26yo, ₹60K/month salary, ₹5L savings, no investments yet, want to hit ₹1Cr by 30...' },
]

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  anthropic: { label: 'Claude',  color: '#b8ff00' },
  gemini:    { label: 'Gemini',  color: '#00f0c8' },
  groq:      { label: 'Groq',    color: '#ff9500' },
  openai:    { label: 'GPT',     color: '#74b9ff' },
}

const TIER_COLORS: Record<string, string> = {
  LIGHT: '#00f0c8', MEDIUM: '#b8ff00', HEAVY: '#ff9500',
}

export default function DashboardClient() {
  const router  = useRouter()
  const [user, setUser]           = useState<User | null>(null)
  const [tokens, setTokens]       = useState<TokenInfo | null>(null)
  const [loading, setLoading]     = useState(true)
  const [activeTool, setActiveTool] = useState<typeof TOOLS[0] | null>(null)
  const [message, setMessage]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [result, setResult]       = useState<AIResult | null>(null)
  const [error, setError]         = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [history, setHistory]     = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'tool' | 'history'>('tool')
  const [queuePos, setQueuePos]   = useState<number | null>(null)
  const [elapsed, setElapsed]     = useState(0)
  const resultRef  = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      const [meRes, tokRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/tokens/balance')])
      if (meRes.status === 401) { router.push('/login'); return }
      const [me, tok] = await Promise.all([meRes.json(), tokRes.json()])
      if (me.success)  setUser(me.data)
      if (tok.success) setTokens(tok.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [router])

  useEffect(() => { fetchUser() }, [fetchUser])

  // Load history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('reiogn_history')
      if (saved) setHistory(JSON.parse(saved))
    } catch { /* ok */ }
  }, [])

  function saveHistory(items: HistoryItem[]) {
    setHistory(items)
    try { sessionStorage.setItem('reiogn_history', JSON.stringify(items.slice(0, 20))) } catch { /* ok */ }
  }

  async function runTool() {
    if (!activeTool || !message.trim()) return
    setAiLoading(true); setError(''); setResult(null); setQueuePos(null); setElapsed(0)

    // Start elapsed timer
    const start = Date.now()
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500)

    // Simulate queue position for UX (clears after 2s)
    setQueuePos(Math.floor(Math.random() * 3) + 1)
    setTimeout(() => setQueuePos(null), 2000)

    try {
      const res  = await fetch(`/api/tools/${activeTool.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403) setError('Active subscription required. Please upgrade your plan.')
        else if (res.status === 402) setError(`Insufficient tokens. Need ${activeTool.cost} tokens.`)
        else setError(data.error || 'Something went wrong. Your tokens were not charged.')
        return
      }

      setResult(data.data)
      setTokens(t => t ? { ...t, balance: data.data.tokensRemaining, totalSpent: t.totalSpent + data.data.tokensUsed } : null)

      // Save to history
      const item: HistoryItem = {
        id: Date.now().toString(), tool: activeTool.name, result: data.data.result,
        tokensUsed: data.data.tokensUsed, model: data.data.model,
        provider: data.data.provider ?? 'anthropic', durationMs: data.data.durationMs,
        timestamp: Date.now(), message,
      }
      saveHistory([item, ...history])
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch {
      setError('Network error. Please check your connection. Tokens were not charged.')
    } finally {
      setAiLoading(false)
      setQueuePos(null)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.push('/login')
  }

  function selectTool(tool: typeof TOOLS[0]) {
    setActiveTool(tool); setResult(null); setError(''); setMessage(''); setActiveTab('tool')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#07080f', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:10, height:10, borderRadius:'50%', background:'#b8ff00', animation:'pulse 1s ease-in-out infinite', boxShadow:'0 0 20px #b8ff00' }} />
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:2 }}>LOADING</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.8)}}`}</style>
    </div>
  )

  const provInfo = activeTool ? PROVIDER_LABELS[result?.provider ?? ''] : null

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
          width:${sidebarOpen ? '252px' : '0'};min-width:${sidebarOpen ? '252px' : '0'};
          height:100vh;display:flex;flex-direction:column;
          background:var(--s1);border-right:1px solid var(--bd);
          overflow:hidden;transition:min-width .28s cubic-bezier(.4,0,.2,1),width .28s cubic-bezier(.4,0,.2,1);
          flex-shrink:0;
        }
        .sb-top{padding:16px 14px 12px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .sb-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex:1;min-width:0;}
        .sb-mark{width:28px;height:28px;border-radius:7px;overflow:hidden;background:rgba(184,255,0,0.1);flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .sb-mark img{width:28px;height:28px;object-fit:cover;}
        .sb-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;letter-spacing:-.2px;}
        .sb-section{padding:14px 14px 6px;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.18);letter-spacing:2px;text-transform:uppercase;flex-shrink:0;}
        .sb-tools{flex:1;overflow-y:auto;padding:0 8px 8px;}
        .sb-tool{
          display:flex;align-items:center;gap:9px;padding:8px 8px;border-radius:7px;
          cursor:pointer;transition:all .15s;white-space:nowrap;border:1px solid transparent;
          width:100%;background:none;text-align:left;
        }
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
        .sb-foot{padding:12px;border-top:1px solid var(--bd);flex-shrink:0;}
        .sb-user{display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px;}
        .sb-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#b8ff00,#00f0c8);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:#07080f;flex-shrink:0;}
        .sb-uname{font-size:11.5px;font-weight:500;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sb-uemail{font-size:9.5px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .logout-btn{width:100%;padding:7px;background:transparent;border:1px solid rgba(255,79,114,0.15);border-radius:6px;color:rgba(255,79,114,0.5);font-size:10.5px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;letter-spacing:.3px;}
        .logout-btn:hover{background:rgba(255,79,114,0.07);color:#ff6b8a;border-color:rgba(255,79,114,0.28);}

        /* ── Main ── */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .topbar{height:52px;border-bottom:1px solid var(--bd);display:flex;align-items:center;padding:0 20px;gap:12px;background:rgba(10,11,21,0.8);backdrop-filter:blur(16px);flex-shrink:0;}
        .tb-toggle{width:30px;height:30px;border:1px solid var(--bd);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:all .2s;font-size:12px;flex-shrink:0;}
        .tb-toggle:hover{border-color:rgba(184,255,0,0.2);color:#fff;}
        .tb-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tb-spacer{flex:1;}
        .token-chip{display:flex;align-items:center;gap:6px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);padding:5px 11px;border-radius:5px;flex-shrink:0;}
        .tok-n{font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:600;color:#b8ff00;}
        .tok-l{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(184,255,0,0.45);letter-spacing:1px;text-transform:uppercase;}

        /* ── Content ── */
        .content{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}

        /* Welcome banner */
        .welcome{background:linear-gradient(135deg,rgba(12,14,26,0.8) 0%,rgba(15,17,32,0.8) 100%);border:1px solid var(--bd2);border-radius:12px;padding:22px 24px;position:relative;overflow:hidden;}
        .welcome::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(184,255,0,0.05),transparent 70%);pointer-events:none;}
        .wlc-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;}
        .wlc-greeting{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:4px;}
        .wlc-sub{font-size:12.5px;color:var(--t3);line-height:1.55;}
        .wlc-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px;}
        .wlc-stat{background:rgba(255,255,255,0.03);border:1px solid var(--bd);border-radius:7px;padding:8px 14px;text-align:center;}
        .wlc-stat-n{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;}
        .wlc-stat-l{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--t4);letter-spacing:1.2px;text-transform:uppercase;margin-top:2px;}

        /* Tool grid (home) */
        .tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
        .mini-card{background:rgba(12,14,26,0.65);border:1px solid var(--bd);border-radius:10px;padding:16px;cursor:pointer;transition:all .18s;text-align:left;width:100%;}
        .mini-card:hover{border-color:rgba(184,255,0,0.2);background:rgba(12,14,26,0.95);transform:translateY(-2px);}
        .mini-card.t:hover{border-color:rgba(0,240,200,0.2);}
        .mini-card.preferred{border-color:rgba(184,255,0,0.18);background:rgba(184,255,0,0.04);}
        .mini-card.popular{border-color:rgba(0,240,200,0.15);background:rgba(0,240,200,0.03);}
        .pref-badge{position:absolute;top:10px;right:10px;font-family:"JetBrains Mono",monospace;font-size:7.5px;padding:2px 6px;border-radius:2px;letter-spacing:.8px;text-transform:uppercase;}
        .pref-badge.hot{color:#ff9500;background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.2);}
        .pref-badge.new{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.15);}
        .mc-icon{font-size:18px;margin-bottom:8px;display:block;}
        .mc-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#fff;margin-bottom:3px;}
        .mc-cost{font-family:'JetBrains Mono',monospace;font-size:8.5px;}

        /* Tabs */
        .tabs{display:flex;gap:2px;background:rgba(255,255,255,0.03);border:1px solid var(--bd);border-radius:8px;padding:3px;}
        .tab{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--t3);transition:all .18s;}
        .tab.active{background:rgba(184,255,0,0.1);color:#b8ff00;border:1px solid rgba(184,255,0,0.15);}

        /* Tool panel */
        .tool-panel{background:rgba(12,14,26,0.75);border:1px solid var(--bd2);border-radius:12px;overflow:hidden;}
        .tool-panel.lime{border-color:rgba(184,255,0,0.16);}
        .tool-panel.teal{border-color:rgba(0,240,200,0.16);}
        .tp-head{padding:16px 20px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;}
        .tp-icon{font-size:20px;}
        .tp-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;}
        .tp-desc{font-size:11px;color:var(--t3);margin-top:2px;}
        .tp-badges{margin-left:auto;display:flex;gap:6px;align-items:center;flex-shrink:0;}
        .badge{font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 7px;border-radius:3px;letter-spacing:.8px;text-transform:uppercase;}
        .badge.lime{color:#b8ff00;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);}
        .badge.teal{color:#00f0c8;background:rgba(0,240,200,0.07);border:1px solid rgba(0,240,200,0.14);}
        .badge.amber{color:#ff9500;background:rgba(255,149,0,0.07);border:1px solid rgba(255,149,0,0.14);}
        .tp-body{padding:18px 20px;}
        .field-label{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.28);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:7px;display:block;}
        textarea{width:100%;background:#0a0c1a;border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:12px 14px;color:#fff;font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:110px;transition:border-color .2s;line-height:1.6;}
        textarea:focus{border-color:rgba(184,255,0,0.28);}
        textarea::placeholder{color:rgba(255,255,255,0.1);}
        .tp-foot{display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap;}
        .run-btn{padding:10px 22px;background:#b8ff00;color:#07080f;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .22s;display:inline-flex;align-items:center;gap:7px;flex-shrink:0;}
        .run-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 0 20px rgba(184,255,0,0.3);}
        .run-btn:disabled{opacity:.5;cursor:not-allowed;}
        .run-btn.t{background:#00f0c8;color:#07080f;}
        .run-btn.t:hover:not(:disabled){background:#00ffd8;box-shadow:0 0 20px rgba(0,240,200,0.3);}
        .cost-hint{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);}
        .spinner{width:13px;height:13px;border:2px solid rgba(7,8,15,.3);border-top-color:#07080f;border-radius:50%;animation:spin .65s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Queue / loading state */
        .queue-bar{background:rgba(184,255,0,0.05);border:1px solid rgba(184,255,0,0.12);border-radius:9px;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-top:12px;}
        .queue-bar.t{background:rgba(0,240,200,0.05);border-color:rgba(0,240,200,0.12);}
        .q-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;animation:blink 1.2s infinite;flex-shrink:0;}
        .q-dot.t{background:#00f0c8;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
        .q-text{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);flex:1;}
        .q-elapsed{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.2);}

        /* Error */
        .error-box{background:rgba(255,79,114,0.06);border:1px solid rgba(255,79,114,0.18);border-radius:8px;padding:10px 14px;font-size:12px;color:#ff6b8a;margin-top:10px;display:flex;align-items:flex-start;gap:7px;line-height:1.55;}

        /* Result */
        .result-card{background:rgba(10,12,20,0.95);border:1px solid rgba(184,255,0,0.16);border-radius:12px;overflow:hidden;}
        .result-card.t{border-color:rgba(0,240,200,0.16);}
        .rc-head{padding:12px 18px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .rc-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:2px;text-transform:uppercase;flex:1;}
        .rc-meta{display:flex;gap:6px;align-items:center;}
        .rc-body{padding:18px 20px;max-height:480px;overflow-y:auto;}
        .rc-body pre{white-space:pre-wrap;word-break:break-word;font-family:'Inter',sans-serif;font-size:13px;color:#fff;line-height:1.8;}

        /* History */
        .hist-list{display:flex;flex-direction:column;gap:10px;}
        .hist-item{background:rgba(12,14,26,0.65);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;cursor:pointer;transition:all .18s;}
        .hist-item:hover{border-color:var(--bd2);background:rgba(12,14,26,0.9);}
        .hi-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .hi-name{font-family:'Syne',sans-serif;font-size:12.5px;font-weight:700;color:#fff;}
        .hi-time{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.2);margin-left:auto;}
        .hi-msg{font-size:11.5px;color:rgba(255,255,255,0.4);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .hi-meta{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}

        /* Provider indicator */
        .provider-dot{display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.8px;}
        .pd-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

        .empty-state{text-align:center;padding:48px 24px;}
        .es-icon{font-size:32px;margin-bottom:12px;}
        .es-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;}
        .es-sub{font-size:12px;color:var(--t3);line-height:1.55;}
      `}</style>

      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sb-top">
            <a href="/" className="sb-logo">
              <div className="sb-mark"><img src="/logo.svg" alt="R" /></div>
              <span className="sb-name">REIOGN</span>
            </a>
          </div>
          <div className="sb-section">AI Tools</div>
          <div className="sb-tools">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                className={`sb-tool ${activeTool?.id === tool.id ? 'active' : ''} ${tool.color === 'teal' ? 't' : ''}`}
                onClick={() => selectTool(tool)}
              >
                <span className="sb-icon">{tool.icon}</span>
                <div className="sb-info">
                  <div className="sb-tname">{tool.name}</div>
                  <div className="sb-tcost">{tool.cost} tokens · {tool.tier}</div>
                </div>
                <div className="sb-tier" style={{ background: TIER_COLORS[tool.tier] }} />
              </button>
            ))}
          </div>
          <div className="sb-foot">
            {user && (
              <div className="sb-user">
                <div className="sb-av">{(user.name?.slice(0,2) ?? 'RE').toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="sb-uname">{user.name}</div>
                  <div className="sb-uemail">{user.email}</div>
                </div>
              </div>
            )}
            <button className="logout-btn" onClick={logout}>↩ Sign out</button>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <button className="tb-toggle" onClick={() => setSidebarOpen(o => !o)}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <span className="tb-title">
              {activeTool ? `${activeTool.icon} ${activeTool.name}` : 'Dashboard'}
            </span>
            <div className="tb-spacer" />
            {result && (
              <div className="provider-dot" style={{ marginRight:8 }}>
                <div className="pd-dot" style={{ background: PROVIDER_LABELS[result.provider]?.color ?? '#fff' }} />
                <span style={{ color: PROVIDER_LABELS[result.provider]?.color ?? '#fff', opacity:.7 }}>
                  {PROVIDER_LABELS[result.provider]?.label ?? result.provider}
                </span>
              </div>
            )}
            {tokens && (
              <div className="token-chip">
                <span className="tok-n">{tokens.balance.toLocaleString()}</span>
                <span className="tok-l">tokens</span>
              </div>
            )}
          </div>

          <div className="content">
            {!activeTool ? (
              <>
                {/* Welcome */}
                <div className="welcome">
                  <div className="wlc-row">
                    <div>
                      <div className="wlc-greeting">
                        {user ? `Hey ${user.name?.split(' ')[0]} 👋` : 'Welcome back 👋'}
                      </div>
                      <div className="wlc-sub">
                        Pick an AI tool and start executing. Every tool is purpose-built — no fluff.
                      </div>
                    </div>
                    <div className="wlc-stats">
                      <div className="wlc-stat">
                        <div className="wlc-stat-n" style={{ color:'#b8ff00' }}>{tokens?.balance?.toLocaleString() ?? '—'}</div>
                        <div className="wlc-stat-l">Tokens Left</div>
                      </div>
                      <div className="wlc-stat">
                        <div className="wlc-stat-n">{tokens?.totalSpent?.toLocaleString() ?? '0'}</div>
                        <div className="wlc-stat-l">Tokens Used</div>
                      </div>
                      <div className="wlc-stat">
                        <div className="wlc-stat-n">{history.length}</div>
                        <div className="wlc-stat-l">Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tool grid */}
                <div className="tool-grid">
                  {TOOLS.map(tool => {
                    const isHot = ['COGNITIVE_CLONE','OPPORTUNITY_RADAR','DECISION_SIMULATOR'].includes(tool.id)
                    const isNew = ['WEALTH_MAPPER','MEMORY_INTELLIGENCE'].includes(tool.id)
                    return (
                      <button key={tool.id} className={`mini-card ${tool.color === 'teal' ? 't' : ''}`} onClick={() => selectTool(tool)}
                        style={{position:'relative'}}>
                        {isHot && <span className="pref-badge hot">🔥 Popular</span>}
                        {isNew && <span className="pref-badge new">✦ New</span>}
                        <span className="mc-icon">{tool.icon}</span>
                        <div className="mc-name">{tool.name}</div>
                        <div style={{fontSize:'10px',color:tool.color==='lime'?'rgba(184,255,0,0.5)':'rgba(0,240,200,0.5)',fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{tool.cost} tokens · {tool.tier}</div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div className="tabs">
                    <button className={`tab ${activeTab === 'tool' ? 'active' : ''}`} onClick={() => setActiveTab('tool')}>
                      {activeTool.icon} Run Tool
                    </button>
                    <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                      📋 History ({history.filter(h => h.tool === activeTool.name).length})
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
                          rows={5}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runTool() }}
                        />
                        {error && <div className="error-box"><span>⚠</span><span>{error}</span></div>}
                        {aiLoading && (
                          <div className={`queue-bar ${activeTool.color === 'teal' ? 't' : ''}`}>
                            <div className={`q-dot ${activeTool.color === 'teal' ? 't' : ''}`} />
                            <span className="q-text">
                              {queuePos ? `Processing · queue position ${queuePos}` : `${activeTool.name} is thinking…`}
                            </span>
                            <span className="q-elapsed">{elapsed}s</span>
                          </div>
                        )}
                        <div className="tp-foot">
                          <button
                            className={`run-btn ${activeTool.color === 'teal' ? 't' : ''}`}
                            onClick={runTool}
                            disabled={aiLoading || !message.trim()}
                          >
                            {aiLoading ? <><div className="spinner" />Running…</> : `Run ${activeTool.name} →`}
                          </button>
                          <span className="cost-hint">⌘+Enter to run · {activeTool.cost} tokens · auto-refunded on error</span>
                        </div>
                      </div>
                    </div>

                    {result && (
                      <div ref={resultRef} className={`result-card ${activeTool.color === 'teal' ? 't' : ''}`}>
                        <div className="rc-head">
                          <span className="rc-title">Result · {result.tool.replace(/_/g,' ')}</span>
                          <div className="rc-meta">
                            <div className="provider-dot">
                              <div className="pd-dot" style={{ background: PROVIDER_LABELS[result.provider]?.color ?? '#fff' }} />
                              <span style={{ color: PROVIDER_LABELS[result.provider]?.color ?? '#fff' }}>
                                {PROVIDER_LABELS[result.provider]?.label ?? result.provider}
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
                    {history.filter(h => h.tool === activeTool.name).length === 0 ? (
                      <div className="empty-state">
                        <div className="es-icon">📋</div>
                        <div className="es-title">No history yet</div>
                        <div className="es-sub">Run {activeTool.name} and your sessions will appear here.</div>
                      </div>
                    ) : history.filter(h => h.tool === activeTool.name).map(item => (
                      <div key={item.id} className="hist-item" onClick={() => {
                        setResult({ tool: item.tool, result: item.result, tokensUsed: item.tokensUsed,
                          tokensRemaining: tokens?.balance ?? 0, model: item.model, provider: item.provider, durationMs: item.durationMs })
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
                            <div className="pd-dot" style={{ background: PROVIDER_LABELS[item.provider]?.color ?? '#fff' }} />
                            <span style={{ color: PROVIDER_LABELS[item.provider]?.color ?? '#fff' }}>
                              {PROVIDER_LABELS[item.provider]?.label ?? item.provider}
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
