'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User        { id: string; name: string; email: string; plan: string }
interface TokenInfo   { balance: number; totalSpent: number }
interface AIResult    { tool: string; result: string; tokensUsed: number; tokensRemaining: number; model: string; provider: string; durationMs: number }
interface HistoryItem { id: string; tool: string; result: string; tokensUsed: number; model: string; provider: string; durationMs: number; timestamp: number; message: string }
interface Notif       { id: string; icon: string; title: string; body: string; time: string; read: boolean; color: string }

const TOOLS = [
  { id:'DEEP_WORK_ENGINE',    slug:'deep-work-engine',    name:'Deep Work Engine',    icon:'⚡', cost:15, tier:'MEDIUM', color:'lime', desc:'Structure a deep work session for maximum focus and zero distraction.',                 placeholder:'e.g. I need to write 5000 words of my thesis today. My focus peaks at 9am...' },
  { id:'COGNITIVE_CLONE',     slug:'cognitive-clone',     name:'Cognitive Clone',     icon:'🧠', cost:30, tier:'HEAVY',  color:'teal', desc:'Simulate your high-performance self and get decisions your best version would make.',   placeholder:'e.g. I am deciding whether to quit my job and start a SaaS. Current MRR is $0...' },
  { id:'RESEARCH_BUILDER',    slug:'research-builder',    name:'Research Builder',    icon:'🔬', cost:15, tier:'MEDIUM', color:'lime', desc:'Build a counter-intuitive research strategy from first principles.',                     placeholder:'e.g. I want to understand the Indian EV market from first principles...' },
  { id:'SKILL_ROI_ANALYZER',  slug:'skill-roi-analyzer',  name:'Skill ROI Analyzer',  icon:'📊', cost:5,  tier:'LIGHT',  color:'teal', desc:'Get precise ROI projections across 3, 12, and 36-month horizons for any skill.',       placeholder:'e.g. Should I learn Rust or TypeScript as a backend developer in 2025?' },
  { id:'MEMORY_INTELLIGENCE', slug:'memory-intelligence', name:'Memory Intelligence', icon:'💡', cost:15, tier:'MEDIUM', color:'lime', desc:'Build spaced-repetition memory maps that make knowledge stick permanently.',             placeholder:'e.g. I need to memorize the entire OSI model and how each layer interacts...' },
  { id:'EXECUTION_OPTIMIZER', slug:'execution-optimizer', name:'Execution Optimizer', icon:'🚀', cost:15, tier:'MEDIUM', color:'teal', desc:'Get your critical path and a laser-focused 7-day action plan.',                         placeholder:'e.g. Launch my SaaS MVP in 30 days. I have evenings and weekends free...' },
  { id:'OPPORTUNITY_RADAR',   slug:'opportunity-radar',   name:'Opportunity Radar',   icon:'📡', cost:30, tier:'HEAVY',  color:'lime', desc:'Surface high-leverage opportunities most people completely overlook.',                   placeholder:'e.g. I am a 24-year-old developer in Mumbai with ₹2L savings and 2 years experience...' },
  { id:'DECISION_SIMULATOR',  slug:'decision-simulator',  name:'Decision Simulator',  icon:'⚖️', cost:30, tier:'HEAVY',  color:'teal', desc:'Run multi-scenario decision simulations with probability-weighted outcomes.',            placeholder:'e.g. I got two offers: ₹18L at startup vs ₹24L at MNC. I value learning over salary...' },
  { id:'FOCUS_SHIELD',        slug:'focus-shield',        name:'Focus Shield',        icon:'🛡️', cost:5,  tier:'LIGHT',  color:'lime', desc:'Get a personalized distraction protocol and reclaim stolen attention.',                  placeholder:'e.g. I get distracted by Instagram every 20 mins, I work from home...' },
  { id:'WEALTH_MAPPER',       slug:'wealth-mapper',       name:'Wealth Mapper',       icon:'💰', cost:30, tier:'HEAVY',  color:'teal', desc:'Build your complete 36-month wealth roadmap with concrete milestones.',                  placeholder:'e.g. 26yo, ₹60K/month salary, ₹5L savings, no investments yet, want ₹1Cr by 30...' },
]

const PLANS = [
  {
    id:'TRIAL', name:'Trial', badge:'',
    monthlyPrice:'Free', yearlyPrice:'Free', monthlyRaw:0, yearlyRaw:0, tokens:500,
    color:'#9ca3af', border:'rgba(255,255,255,0.07)', bg:'rgba(255,255,255,0.02)',
    cta:'#374151', ctaText:'rgba(255,255,255,0.25)',
    features:['500 tokens (one-time)','Access to all 10 tools','Community support'],
    yearlySave:'', popular:false,
  },
  {
    id:'STARTER', name:'Starter', badge:'',
    monthlyPrice:'₹399', yearlyPrice:'₹299', monthlyRaw:399, yearlyRaw:299, tokens:2000,
    color:'#b8ff00', border:'rgba(184,255,0,0.2)', bg:'rgba(184,255,0,0.03)',
    cta:'#b8ff00', ctaText:'#07080f',
    features:['2,000 tokens per month','All 10 AI tools unlocked','Priority email support','Session history & export'],
    yearlySave:'Save ₹1,200', popular:false,
  },
  {
    id:'PRO', name:'Pro', badge:'Most Popular',
    monthlyPrice:'₹849', yearlyPrice:'₹599', monthlyRaw:849, yearlyRaw:599, tokens:6000,
    color:'#00f0c8', border:'rgba(0,240,200,0.3)', bg:'rgba(0,240,200,0.03)',
    cta:'#00f0c8', ctaText:'#07080f',
    features:['6,000 tokens per month','All 10 AI tools unlocked','24/7 priority support','Full API access','Advanced session history','Custom system prompts'],
    yearlySave:'Save ₹3,000', popular:true,
  },
  {
    id:'ELITE', name:'Elite', badge:'Best Value',
    monthlyPrice:'₹1,999', yearlyPrice:'₹1,399', monthlyRaw:1999, yearlyRaw:1399, tokens:20000,
    color:'#f59e0b', border:'rgba(245,158,11,0.25)', bg:'rgba(245,158,11,0.03)',
    cta:'#f59e0b', ctaText:'#07080f',
    features:['20,000 tokens per month','All 10 AI tools unlocked','Dedicated account manager','Full API access','White-label option','Custom tools built for you','SLA guarantee'],
    yearlySave:'Save ₹7,200', popular:false,
  },
]

const TIER_COLORS: Record<string,string> = { LIGHT:'#00f0c8', MEDIUM:'#b8ff00', HEAVY:'#f59e0b' }
const PROVIDER: Record<string,{label:string;color:string}> = {
  anthropic:{label:'Claude',color:'#b8ff00'},
  gemini:   {label:'Gemini',color:'#00f0c8'},
  groq:     {label:'Groq',  color:'#f59e0b'},
  openai:   {label:'GPT-4', color:'#60a5fa'},
}
const SEED_NOTIFS: Notif[] = [
  {id:'1',icon:'👋',title:'Welcome to REIOGN',body:'Your trial is active. You have 500 tokens to explore all 10 tools.',time:'Just now',read:false,color:'#b8ff00'},
  {id:'2',icon:'🧠',title:'Try Cognitive Clone',body:'Our most-used tool. Users report 3× better decisions within 2 weeks.',time:'2m ago',read:false,color:'#00f0c8'},
  {id:'3',icon:'💡',title:'Save 30% with yearly',body:'Switch to annual billing and save up to ₹7,200 per year.',time:'10m ago',read:true,color:'#f59e0b'},
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Donut Chart ──────────────────────────────────────────────
function Donut({pct,color,size=120}:{pct:number;color:string;size?:number}) {
  const r = (size/2)-10, circ = 2*Math.PI*r
  const dash = (pct/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={9}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:'stroke-dasharray 1.2s ease',filter:`drop-shadow(0 0 8px ${color}88)`}}/>
    </svg>
  )
}

// ── Mini sparkline ───────────────────────────────────────────
function Spark({data,color,h=44}:{data:number[];color:string;h?:number}) {
  if(data.length<2) return (
    <div style={{height:h,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'rgba(255,255,255,0.15)'}}>
      No data yet
    </div>
  )
  const w=280, max=Math.max(...data,1)
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-(v/max)*(h-4)}`).join(' ')
  const area=`0,${h} ${pts} ${w},${h}`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={area} fill="url(#sk)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-(data[data.length-1]/max)*(h-4)} r="3.5" fill={color}/>
    </svg>
  )
}

// ── Usage bars ───────────────────────────────────────────────
function UsageBars({history}:{history:HistoryItem[]}) {
  const counts:Record<string,number> = {}
  history.forEach(h=>{counts[h.tool]=(counts[h.tool]||0)+h.tokensUsed})
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const max = entries[0]?.[1]||1
  if(!entries.length) return (
    <div style={{padding:'24px 0',textAlign:'center',fontSize:13,color:'rgba(255,255,255,0.2)'}}>
      Run a tool to see usage data here.
    </div>
  )
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {entries.map(([name,val],i)=>{
        const tool=TOOLS.find(t=>t.name===name)
        const clr=tool?.color==='teal'?'#00f0c8':'#b8ff00'
        return (
          <div key={i} style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{fontSize:17,width:24,textAlign:'center',flexShrink:0}}>{tool?.icon??'🤖'}</span>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.65)'}}>{name}</span>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>{val} tokens</span>
              </div>
              <div style={{height:5,background:'rgba(255,255,255,0.05)',borderRadius:99}}>
                <div style={{width:`${(val/max)*100}%`,height:'100%',background:clr,borderRadius:99,transition:'width 1s ease',opacity:.75}}/>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

type MainView = 'home'|'tools'|'billing'|'settings'

export default function DashboardClient() {
  const router = useRouter()
  const [user,    setUser]    = useState<User|null>(null)
  const [tokens,  setTokens]  = useState<TokenInfo|null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTool, setActiveTool] = useState<typeof TOOLS[0]|null>(null)
  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [result,  setResult]  = useState<AIResult|null>(null)
  const [error,   setError]   = useState('')
  const [sbOpen,  setSbOpen]  = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [histTab, setHistTab] = useState<'run'|'history'>('run')
  const [queuePos,setQueuePos]= useState<number|null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [mainView,setMainView]= useState<MainView>('home')
  const [cycle,   setCycle]   = useState<'monthly'|'yearly'>('monthly')
  const [clock,   setClock]   = useState(new Date())
  const [notifs,  setNotifs]  = useState<Notif[]>(SEED_NOTIFS)
  const [notifOpen,setNotifOpen] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null)
  const notifRef  = useRef<HTMLDivElement>(null)

  const fetchUser = useCallback(async () => {
    try {
      const [mr, tr] = await Promise.all([fetch('/api/auth/me'), fetch('/api/tokens/balance')])
      if(mr.status===401){router.push('/login');return}
      const [me, tok] = await Promise.all([mr.json(), tr.json()])
      if(me.success) setUser(me.data)
      if(tok.success) setTokens(tok.data)
    } catch{} finally { setLoading(false) }
  }, [router])

  useEffect(()=>{fetchUser()},[fetchUser])
  useEffect(()=>{const iv=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(iv)},[])
  useEffect(()=>{
    const iv=setInterval(async()=>{
      try{const r=await fetch('/api/tokens/balance');const d=await r.json();if(d.success)setTokens(d.data)}catch{}
    },30000);return()=>clearInterval(iv)
  },[])
  useEffect(()=>{
    try{const s=sessionStorage.getItem('rg_hist');if(s)setHistory(JSON.parse(s))}catch{}
  },[])
  useEffect(()=>{
    const fn=(e:MouseEvent)=>{if(notifRef.current&&!notifRef.current.contains(e.target as Node))setNotifOpen(false)}
    document.addEventListener('mousedown',fn);return()=>document.removeEventListener('mousedown',fn)
  },[])

  function saveHist(items:HistoryItem[]){
    setHistory(items)
    try{sessionStorage.setItem('rg_hist',JSON.stringify(items.slice(0,30)))}catch{}
  }

  async function runTool(){
    if(!activeTool||!message.trim()) return
    setAiLoading(true);setError('');setResult(null);setQueuePos(null);setElapsed(0)
    const start = Date.now()
    timerRef.current = setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),500)
    setQueuePos(Math.floor(Math.random()*3)+1)
    setTimeout(()=>setQueuePos(null),1800)
    try {
      const res = await fetch(`/api/tools/${activeTool.slug}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})})
      const data = await res.json()
      if(!res.ok){
        if(res.status===403) setError('Active subscription required. Please upgrade your plan.')
        else if(res.status===402) setError(`Not enough tokens. This tool needs ${activeTool.cost} tokens.`)
        else setError(data.error||'Something went wrong. Your tokens were not charged.')
        return
      }
      setResult(data.data)
      setTokens(t=>t?{...t,balance:data.data.tokensRemaining,totalSpent:t.totalSpent+data.data.tokensUsed}:null)
      const item:HistoryItem={id:Date.now().toString(),tool:activeTool.name,result:data.data.result,tokensUsed:data.data.tokensUsed,model:data.data.model,provider:data.data.provider??'anthropic',durationMs:data.data.durationMs,timestamp:Date.now(),message}
      saveHist([item,...history])
      setNotifs(n=>[{id:Date.now().toString(),icon:'✅',title:`${activeTool.name} done`,body:`Used ${data.data.tokensUsed} tokens in ${(data.data.durationMs/1000).toFixed(1)}s`,time:'Just now',read:false,color:'#b8ff00'},...n.slice(0,9)])
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100)
    } catch {setError('Network error. Your tokens were not charged.')}
    finally{setAiLoading(false);setQueuePos(null);if(timerRef.current)clearInterval(timerRef.current)}
  }

  async function logout(){
    await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{})
    router.push('/login')
  }

  function openTool(t:typeof TOOLS[0]){
    setActiveTool(t);setResult(null);setError('');setMessage('');setHistTab('run');setMainView('tools')
  }
  function goHome(){setActiveTool(null);setMainView('home')}

  const plan = PLANS.find(p=>p.id===user?.plan)??PLANS[0]
  const bal  = tokens?.balance??0
  const pct  = Math.min(100, Math.round((bal/plan.tokens)*100))
  const sparkData = history.slice(0,12).map(h=>h.tokensUsed).reverse()
  const unread = notifs.filter(n=>!n.read).length
  const greeting = getGreeting()
  const firstName = user?.name?.split(' ')[0]??'there'
  const timeStr = clock.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#09090b',display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
      <div style={{width:10,height:10,borderRadius:'50%',background:'#b8ff00',animation:'ld .8s ease-in-out infinite'}}/>
      <div style={{width:10,height:10,borderRadius:'50%',background:'#00f0c8',animation:'ld .8s ease-in-out infinite',animationDelay:'.15s'}}/>
      <div style={{width:10,height:10,borderRadius:'50%',background:'rgba(255,255,255,0.2)',animation:'ld .8s ease-in-out infinite',animationDelay:'.3s'}}/>
      <style>{`@keyframes ld{0%,100%{transform:scale(.5);opacity:.3}50%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;background:#09090b;color:#fff;font-family:'Plus Jakarta Sans',system-ui,sans-serif;overflow:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:4px;}
        button{font-family:inherit;}

        /* Layout */
        .shell{display:flex;height:100vh;}

        /* ══════════════════ SIDEBAR ══════════════════ */
        .sb{
          width:${sbOpen?'248px':'60px'};
          flex-shrink:0;
          height:100vh;
          display:flex;flex-direction:column;
          background:#0c0c0e;
          border-right:1px solid rgba(255,255,255,0.06);
          transition:width .25s cubic-bezier(.4,0,.2,1);
          overflow:hidden;
        }

        /* Brand */
        .sb-top{padding:${sbOpen?'18px 16px':'18px 12px'};border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;display:flex;align-items:center;gap:10px;min-width:0;}
        .sb-logo{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,rgba(184,255,0,0.2),rgba(184,255,0,0.06));border:1px solid rgba(184,255,0,0.18);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#b8ff00;flex-shrink:0;}
        .sb-brand-info{overflow:hidden;display:${sbOpen?'block':'none'};}
        .sb-brand-name{font-size:15px;font-weight:700;color:#fff;letter-spacing:-.3px;white-space:nowrap;}
        .sb-brand-sub{font-size:10px;color:rgba(255,255,255,0.25);margin-top:1px;white-space:nowrap;}

        /* Nav */
        .sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 8px;}
        .sb-section{font-size:10px;font-weight:600;color:rgba(255,255,255,0.2);letter-spacing:.5px;text-transform:uppercase;padding:10px 8px 6px;white-space:nowrap;display:${sbOpen?'block':'none'};}
        .sb-btn{display:flex;align-items:center;gap:9px;width:100%;padding:9px 10px;border-radius:8px;border:none;background:transparent;cursor:pointer;transition:background .14s;text-align:left;min-width:0;white-space:nowrap;margin-bottom:1px;}
        .sb-btn:hover{background:rgba(255,255,255,0.04);}
        .sb-btn.home-a{background:rgba(255,255,255,0.06);}
        .sb-btn.tools-a{background:rgba(184,255,0,0.08);}
        .sb-btn.billing-a{background:rgba(0,240,200,0.06);}
        .sb-btn.settings-a{background:rgba(139,92,246,0.07);}
        .sb-btn-ico{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;background:rgba(255,255,255,0.04);}
        .sb-btn.home-a   .sb-btn-ico{background:rgba(255,255,255,0.07);}
        .sb-btn.tools-a  .sb-btn-ico{background:rgba(184,255,0,0.1);}
        .sb-btn.billing-a .sb-btn-ico{background:rgba(0,240,200,0.08);}
        .sb-btn.settings-a .sb-btn-ico{background:rgba(139,92,246,0.1);}
        .sb-btn-txt{flex:1;overflow:hidden;display:${sbOpen?'block':'none'};}
        .sb-btn-name{font-size:13px;font-weight:500;color:rgba(255,255,255,0.6);display:block;}
        .sb-btn.home-a .sb-btn-name{color:#fff;}
        .sb-btn.tools-a .sb-btn-name{color:#b8ff00;}
        .sb-btn.billing-a .sb-btn-name{color:#00f0c8;}
        .sb-btn.settings-a .sb-btn-name{color:#a78bfa;}
        .sb-btn-meta{font-size:10.5px;color:rgba(255,255,255,0.22);margin-top:.5px;display:block;}
        .sb-badge{background:rgba(184,255,0,0.15);color:#b8ff00;border-radius:5px;font-size:10px;font-weight:600;padding:1px 7px;flex-shrink:0;display:${sbOpen?'flex':'none'};}
        .sb-div{height:1px;background:rgba(255,255,255,0.05);margin:8px 6px;}

        /* Sidebar token strip */
        .sb-tok-strip{margin:4px 10px 0;padding:11px 12px;background:rgba(184,255,0,0.04);border:1px solid rgba(184,255,0,0.09);border-radius:9px;display:${sbOpen?'block':'none'};}
        .sb-tok-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
        .sb-tok-label{font-size:10px;font-weight:500;color:rgba(255,255,255,0.3);}
        .sb-tok-val{font-size:15px;font-weight:700;color:#b8ff00;font-family:'DM Mono',monospace;}
        .sb-tok-bar{height:3px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;}
        .sb-tok-fill{height:100%;background:linear-gradient(90deg,#b8ff00,#00f0c8);border-radius:99px;transition:width .9s ease;}

        /* Footer */
        .sb-foot{padding:10px;border-top:1px solid rgba(255,255,255,0.05);flex-shrink:0;}
        .sb-user{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);margin-bottom:6px;overflow:hidden;}
        .sb-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#b8ff00,#00f0c8);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#09090b;flex-shrink:0;}
        .sb-user-info{overflow:hidden;display:${sbOpen?'block':'none'};}
        .sb-uname{font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
        .sb-uemail{font-size:10px;color:rgba(255,255,255,0.28);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
        .sb-plan-pill{font-size:9px;font-weight:600;padding:2px 7px;border-radius:99px;flex-shrink:0;display:${sbOpen?'flex':'none'};}
        .sb-logout{width:100%;padding:7px;background:transparent;border:1px solid rgba(255,79,114,0.1);border-radius:7px;color:rgba(255,79,114,0.45);font-size:12px;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:5px;}
        .sb-logout:hover{background:rgba(255,79,114,0.06);color:#ff7a95;border-color:rgba(255,79,114,0.22);}

        /* ══════════════════ TOPBAR ══════════════════ */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .topbar{height:54px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 22px;gap:10px;background:#09090b;flex-shrink:0;z-index:100;}
        .tb-tog{width:30px;height:30px;border:1px solid rgba(255,255,255,0.07);border-radius:7px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);transition:all .15s;font-size:10px;flex-shrink:0;}
        .tb-tog:hover{border-color:rgba(184,255,0,0.2);color:#fff;}
        .tb-path{display:flex;align-items:center;gap:8px;}
        .tb-dot{width:5px;height:5px;border-radius:50%;background:rgba(184,255,0,0.5);}
        .tb-page{font-size:14px;font-weight:600;color:#fff;}
        .tb-sep{font-size:12px;color:rgba(255,255,255,0.15);}
        .tb-sub{font-size:13px;color:rgba(255,255,255,0.35);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .tb-spacer{flex:1;}
        .tb-time{font-size:12px;font-family:'DM Mono',monospace;color:rgba(255,255,255,0.22);display:flex;align-items:center;gap:6px;flex-shrink:0;}
        .tb-live{width:5px;height:5px;border-radius:50%;background:#b8ff00;animation:pulse 2s ease-in-out infinite;flex-shrink:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}

        /* Notif */
        .notif-wrap{position:relative;flex-shrink:0;}
        .notif-btn{width:34px;height:34px;border:1px solid rgba(255,255,255,0.07);border-radius:8px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:all .15s;font-size:16px;position:relative;}
        .notif-btn:hover{border-color:rgba(255,255,255,0.15);color:#fff;}
        .notif-count{position:absolute;top:-3px;right:-3px;min-width:15px;height:15px;background:#ef4444;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;border:2px solid #09090b;padding:0 3px;}
        .notif-panel{position:absolute;top:calc(100%+10px);right:0;width:340px;background:#0f0f12;border:1px solid rgba(255,255,255,0.09);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,0.7);z-index:999;overflow:hidden;}
        .np-head{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;}
        .np-title{font-size:13px;font-weight:600;color:#fff;}
        .np-clear{font-size:11px;color:rgba(184,255,0,0.5);cursor:pointer;background:none;border:none;transition:color .15s;}
        .np-clear:hover{color:#b8ff00;}
        .np-list{max-height:320px;overflow-y:auto;}
        .ni{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background .12s;align-items:flex-start;}
        .ni:hover{background:rgba(255,255,255,0.02);}
        .ni.unread{background:rgba(184,255,0,0.02);}
        .ni-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
        .ni-title{font-size:12px;font-weight:600;color:#fff;margin-bottom:2px;}
        .ni-body{font-size:11px;color:rgba(255,255,255,0.35);line-height:1.5;}
        .ni-time{font-size:9.5px;color:rgba(255,255,255,0.18);margin-top:3px;font-family:'DM Mono',monospace;}
        .ni-dot{width:5px;height:5px;border-radius:50%;background:#b8ff00;flex-shrink:0;margin-top:4px;}

        /* Token chip */
        .tok-chip{display:flex;align-items:center;gap:7px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);padding:6px 13px;border-radius:7px;flex-shrink:0;}
        .tok-n{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:#b8ff00;}
        .tok-l{font-size:10px;color:rgba(184,255,0,0.4);font-weight:500;}

        /* ══════════════════ CONTENT ══════════════════ */
        .content{flex:1;overflow-y:auto;padding:28px 30px;display:flex;flex-direction:column;gap:20px;}

        /* Section title */
        .sec-title{font-size:16px;font-weight:600;color:#fff;margin-bottom:12px;}
        .sec-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .sec-sub{font-size:12px;color:rgba(255,255,255,0.3);}

        /* ── Stats row ── */
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        @media(max-width:1100px){.stats-row{grid-template-columns:repeat(2,1fr);}}
        .stat-card{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;position:relative;overflow:hidden;transition:border-color .2s;}
        .stat-card:hover{border-color:rgba(255,255,255,0.1);}
        .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
        .stat-card.sl::before{background:linear-gradient(90deg,#b8ff00,transparent);}
        .stat-card.st::before{background:linear-gradient(90deg,#00f0c8,transparent);}
        .stat-card.sa::before{background:linear-gradient(90deg,#f59e0b,transparent);}
        .stat-card.sv::before{background:linear-gradient(90deg,#8b5cf6,transparent);}
        .stat-ico{font-size:20px;margin-bottom:12px;}
        .stat-n{font-size:30px;font-weight:700;color:#fff;font-family:'DM Mono',monospace;line-height:1;margin-bottom:4px;}
        .stat-lbl{font-size:11px;font-weight:500;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.5px;}
        .stat-hint{font-size:11.5px;color:rgba(255,255,255,0.3);margin-top:5px;}

        /* ── Two-col row ── */
        .two-col{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;}
        @media(max-width:960px){.two-col{grid-template-columns:1fr;}}

        /* ── Panel card ── */
        .panel{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:22px;}
        .panel-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;}
        .panel-sub{font-size:12px;color:rgba(255,255,255,0.28);margin-bottom:18px;}

        /* Donut widget */
        .donut-widget{display:flex;align-items:center;gap:20px;}
        .donut-wrap{position:relative;flex-shrink:0;}
        .donut-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .donut-pct{font-size:22px;font-weight:700;color:#fff;font-family:'DM Mono',monospace;}
        .donut-sub{font-size:10px;color:rgba(255,255,255,0.28);margin-top:2px;font-weight:500;}
        .donut-info{flex:1;}
        .donut-title{font-size:15px;font-weight:600;color:#fff;margin-bottom:4px;}
        .donut-desc{font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;margin-bottom:14px;}
        .prog-bar{height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;margin-bottom:6px;}
        .prog-fill{height:100%;border-radius:99px;transition:width 1s ease;}
        .prog-legend{display:flex;gap:14px;}
        .pl-item{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,0.3);}
        .pl-dot{width:7px;height:7px;border-radius:2px;}

        /* ── Quick launch ── */
        .ql-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}
        .ql-card{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;cursor:pointer;transition:all .18s;text-align:left;width:100%;}
        .ql-card:hover{border-color:rgba(184,255,0,0.2);background:#111115;transform:translateY(-2px);}
        .ql-card.t:hover{border-color:rgba(0,240,200,0.2);}
        .ql-icon{font-size:22px;margin-bottom:10px;}
        .ql-name{font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;}
        .ql-desc{font-size:11.5px;color:rgba(255,255,255,0.3);line-height:1.5;}
        .ql-foot{display:flex;align-items:center;justify-content:space-between;margin-top:12px;}
        .ql-cost{font-family:'DM Mono',monospace;font-size:10.5px;}
        .ql-tier{font-size:9.5px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px;}

        /* ── All tools page ── */
        .tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;}
        .tool-card{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:13px;padding:22px;cursor:pointer;transition:all .18s;text-align:left;width:100%;position:relative;}
        .tool-card:hover{border-color:rgba(184,255,0,0.2);transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,0.4);}
        .tool-card.teal:hover{border-color:rgba(0,240,200,0.2);}
        .tool-card-icon{font-size:26px;margin-bottom:12px;}
        .tool-card-name{font-size:15px;font-weight:600;color:#fff;margin-bottom:6px;}
        .tool-card-desc{font-size:12px;color:rgba(255,255,255,0.35);line-height:1.65;margin-bottom:14px;}
        .tool-card-foot{display:flex;align-items:center;justify-content:space-between;}
        .badge{font-size:9.5px;font-weight:600;padding:2.5px 9px;border-radius:5px;text-transform:uppercase;letter-spacing:.4px;}
        .badge.lime{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.15);}
        .badge.teal{color:#00f0c8;background:rgba(0,240,200,0.08);border:1px solid rgba(0,240,200,0.15);}
        .badge.amber{color:#f59e0b;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);}

        /* ── Recent activity ── */
        .act-list{display:flex;flex-direction:column;gap:8px;}
        .act-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#0f0f12;border:1px solid rgba(255,255,255,0.05);border-radius:11px;cursor:pointer;transition:border-color .15s;}
        .act-item:hover{border-color:rgba(255,255,255,0.1);}
        .act-icon{font-size:18px;flex-shrink:0;}
        .act-tool{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;}
        .act-msg{font-size:11.5px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .act-right{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
        .act-time{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);}
        .act-tok{font-family:'DM Mono',monospace;font-size:10px;color:rgba(184,255,0,0.5);}

        /* ── Upgrade banner ── */
        .upgrade-banner{background:linear-gradient(135deg,rgba(184,255,0,0.06),rgba(0,240,200,0.03));border:1px solid rgba(184,255,0,0.12);border-radius:14px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;}
        .ub-title{font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;}
        .ub-sub{font-size:13px;color:rgba(255,255,255,0.38);max-width:380px;line-height:1.6;}

        /* ══════════════════ BILLING ══════════════════ */
        .billing-hero{background:linear-gradient(180deg,rgba(10,12,20,0.99),rgba(9,9,11,0.98));border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:48px 44px;text-align:center;position:relative;overflow:hidden;margin-bottom:24px;}
        .bh-glow1{position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:480px;height:480px;background:radial-gradient(circle,rgba(184,255,0,0.07),transparent 65%);pointer-events:none;}
        .bh-glow2{position:absolute;bottom:-180px;right:-80px;width:360px;height:360px;background:radial-gradient(circle,rgba(0,240,200,0.05),transparent 65%);pointer-events:none;}
        .bh-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);padding:7px 16px;border-radius:99px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.5);margin-bottom:22px;}
        .bh-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;}
        .bh-h1{font-size:42px;font-weight:800;color:#fff;letter-spacing:-1.5px;line-height:1.08;margin-bottom:12px;}
        .bh-h1 .g{background:linear-gradient(135deg,#b8ff00,#00f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .bh-sub{font-size:15px;color:rgba(255,255,255,0.4);max-width:420px;margin:0 auto 28px;line-height:1.65;}

        /* Cycle toggle */
        .cy-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;}
        .cy-row{display:inline-flex;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:99px;padding:3px;}
        .cy-btn{padding:8px 28px;border-radius:99px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all .2s;background:transparent;color:rgba(255,255,255,0.4);font-family:inherit;}
        .cy-btn.mo{background:#b8ff00;color:#09090b;box-shadow:0 2px 16px rgba(184,255,0,0.3);}
        .cy-btn.yr{background:linear-gradient(90deg,#00f0c8,#b8ff00);color:#09090b;box-shadow:0 2px 16px rgba(0,240,200,0.25);}
        .cy-note{font-size:11px;color:#00f0c8;display:flex;align-items:center;gap:6px;}
        .cy-note-dot{width:5px;height:5px;border-radius:50%;background:#00f0c8;}

        /* Plan cards */
        .plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(238px,1fr));gap:14px;margin-bottom:24px;}
        .plan-card{border-radius:16px;padding:26px 22px;position:relative;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;}
        .plan-card:hover{transform:translateY(-5px);}
        .plan-card.popular{box-shadow:0 0 0 1px rgba(0,240,200,0.3),0 20px 50px rgba(0,240,200,0.07);}
        .plan-topline{position:absolute;top:0;left:0;right:0;height:2px;}
        .plan-pop-badge{position:absolute;top:0;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#00f0c8,#b8ff00);color:#09090b;font-size:9px;font-weight:700;padding:4px 14px;border-radius:0 0 8px 8px;letter-spacing:.5px;text-transform:uppercase;}
        .plan-curr-badge{position:absolute;top:12px;right:12px;font-size:9px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px;}
        .plan-icon{font-size:28px;margin-bottom:14px;}
        .plan-name{font-size:18px;font-weight:700;margin-bottom:10px;}
        .plan-price-row{display:flex;align-items:baseline;gap:5px;margin-bottom:4px;}
        .plan-price{font-size:38px;font-weight:800;color:#fff;font-family:'DM Mono',monospace;line-height:1;}
        .plan-period{font-size:13px;color:rgba(255,255,255,0.3);}
        .plan-orig{font-size:14px;color:rgba(255,255,255,0.2);text-decoration:line-through;font-family:'DM Mono',monospace;}
        .plan-save{display:inline-block;font-size:10px;font-weight:600;padding:3px 10px;border-radius:5px;margin-bottom:4px;margin-top:4px;}
        .plan-tok{font-size:11px;font-weight:500;color:rgba(255,255,255,0.28);text-transform:uppercase;letter-spacing:.5px;margin-bottom:18px;}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:22px;}
        .plan-feats li{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.4;}
        .feat-ck{font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px;}
        .plan-btn{width:100%;padding:13px;border-radius:10px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all .18s;font-family:inherit;letter-spacing:.1px;}
        .plan-btn:hover{transform:scale(1.015);}
        .plan-btn.curr{background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.25);cursor:default;}
        .plan-btn.curr:hover{transform:none;}
        .plan-btn.up{box-shadow:0 4px 18px rgba(0,0,0,0.3);}
        .plan-yr-note{text-align:center;margin-top:9px;font-size:10.5px;color:rgba(255,255,255,0.18);font-family:'DM Mono',monospace;}

        /* Usage section */
        .usage-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        @media(max-width:1000px){.usage-row{grid-template-columns:repeat(2,1fr);}}
        .usage-card{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;}
        .usage-lbl{font-size:10px;font-weight:500;color:rgba(255,255,255,0.28);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;}
        .usage-val{font-size:26px;font-weight:700;font-family:'DM Mono',monospace;line-height:1;}
        .usage-sub{font-size:11px;color:rgba(255,255,255,0.25);margin-top:5px;}

        /* ══════════════════ SETTINGS ══════════════════ */
        .set-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:900px){.set-grid{grid-template-columns:1fr;}}
        .set-card{background:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:22px;}
        .set-card-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
        .set-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
        .set-row:last-child{border-bottom:none;padding-bottom:0;}
        .set-key{font-size:13px;color:rgba(255,255,255,0.4);}
        .set-val{font-family:'DM Mono',monospace;font-size:11.5px;color:#fff;}

        /* ══════════════════ TOOL PANEL ══════════════════ */
        .tool-panel{background:#0f0f12;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;}
        .tool-panel.lime-border{border-color:rgba(184,255,0,0.15);}
        .tool-panel.teal-border{border-color:rgba(0,240,200,0.15);}
        .tp-head{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:14px;}
        .tp-ico{font-size:26px;}
        .tp-info .tp-name{font-size:17px;font-weight:700;color:#fff;margin-bottom:3px;}
        .tp-info .tp-desc{font-size:12.5px;color:rgba(255,255,255,0.32);}
        .tp-badges{margin-left:auto;display:flex;gap:7px;flex-shrink:0;}
        .tp-body{padding:22px 24px;}
        .field-lbl{font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:9px;display:block;}
        textarea{width:100%;background:rgba(6,7,14,0.8);border:1px solid rgba(255,255,255,0.07);border-radius:11px;padding:16px 18px;color:#fff;font-size:14px;font-family:inherit;outline:none;resize:vertical;min-height:130px;transition:border-color .2s;line-height:1.75;}
        textarea:focus{border-color:rgba(184,255,0,0.25);}
        textarea::placeholder{color:rgba(255,255,255,0.1);}
        .tp-foot{display:flex;align-items:center;gap:14px;margin-top:16px;flex-wrap:wrap;}
        .run-btn{padding:12px 26px;background:#b8ff00;color:#09090b;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:8px;font-family:inherit;}
        .run-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 4px 24px rgba(184,255,0,0.35);}
        .run-btn:disabled{opacity:.4;cursor:not-allowed;}
        .run-btn.teal{background:#00f0c8;}
        .run-btn.teal:hover:not(:disabled){background:#00ffd5;box-shadow:0 4px 24px rgba(0,240,200,0.35);}
        .cost-note{font-size:11.5px;color:rgba(255,255,255,0.22);}
        .spinner{width:13px;height:13px;border:2px solid rgba(9,9,11,.3);border-top-color:#09090b;border-radius:50%;animation:spin .6s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .queue-row{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:13px 18px;display:flex;gap:11px;align-items:center;margin-top:12px;}
        .q-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:pulse 1.2s infinite;}
        .q-txt{font-size:12.5px;color:rgba(255,255,255,0.38);flex:1;}
        .q-time{font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,0.2);}
        .error-box{background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.18);border-radius:9px;padding:13px 16px;font-size:13px;color:#f87171;margin-top:12px;display:flex;gap:8px;line-height:1.55;}
        .result-wrap{background:#0c0c0e;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;}
        .result-wrap.lime{border-color:rgba(184,255,0,0.14);}
        .result-wrap.teal{border-color:rgba(0,240,200,0.14);}
        .rw-head{padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .rw-label{font-size:11px;font-weight:500;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:.5px;flex:1;}
        .rw-meta{display:flex;gap:7px;align-items:center;}
        .rw-body{padding:22px 24px;max-height:520px;overflow-y:auto;}
        .rw-body pre{white-space:pre-wrap;word-break:break-word;font-family:inherit;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.85;}
        .pvdr{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:500;}
        .pvdr-dot{width:5px;height:5px;border-radius:50%;}
        .hist-list{display:flex;flex-direction:column;gap:8px;}
        .hi{background:#0f0f12;border:1px solid rgba(255,255,255,0.05);border-radius:11px;padding:14px 18px;cursor:pointer;transition:border-color .15s;}
        .hi:hover{border-color:rgba(255,255,255,0.1);}
        .hi-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .hi-name{font-size:13px;font-weight:600;color:#fff;}
        .hi-time{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);margin-left:auto;}
        .hi-msg{font-size:12px;color:rgba(255,255,255,0.32);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.5;}
        .hi-meta{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap;align-items:center;}
        .tabs-bar{display:flex;gap:2px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:3px;width:fit-content;}
        .tab-btn{padding:7px 16px;border-radius:7px;font-size:12.5px;font-weight:500;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.35);transition:all .14s;font-family:inherit;}
        .tab-btn.on{background:rgba(184,255,0,0.09);color:#b8ff00;border:1px solid rgba(184,255,0,0.15);}
        .empty-state{text-align:center;padding:56px 20px;}
        .es-ico{font-size:36px;margin-bottom:14px;}
        .es-title{font-size:17px;font-weight:600;color:#fff;margin-bottom:8px;}
        .es-sub{font-size:13px;color:rgba(255,255,255,0.3);line-height:1.65;}
        .btn-primary{padding:11px 22px;background:#b8ff00;color:#09090b;border:none;border-radius:9px;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:7px;font-family:inherit;}
        .btn-primary:hover{background:#cbff1a;box-shadow:0 4px 24px rgba(184,255,0,0.35);}
        .btn-ghost{padding:11px 22px;background:transparent;color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.1);border-radius:9px;font-size:13.5px;cursor:pointer;transition:all .18s;font-family:inherit;font-weight:500;}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.2);color:#fff;}
      `}</style>

      <div className="shell">

        {/* ══ SIDEBAR ══ */}
        <div className="sb">
          {/* Brand */}
          <div className="sb-top">
            <div className="sb-logo">R</div>
            <div className="sb-brand-info">
              <div className="sb-brand-name">REIOGN</div>
              <div className="sb-brand-sub">AI Performance Platform</div>
            </div>
          </div>

          {/* Nav */}
          <div className="sb-nav">
            <div className="sb-section">Menu</div>

            <button className={`sb-btn ${mainView==='home'&&!activeTool?'home-a':''}`} onClick={goHome}>
              <div className="sb-btn-ico">🏠</div>
              <div className="sb-btn-txt">
                <span className="sb-btn-name">Dashboard</span>
                <span className="sb-btn-meta">Overview & analytics</span>
              </div>
            </button>

            <button className={`sb-btn ${mainView==='tools'||activeTool?'tools-a':''}`}
              onClick={()=>{setMainView('tools');setActiveTool(null);setResult(null);setError('')}}>
              <div className="sb-btn-ico">🛠️</div>
              <div className="sb-btn-txt">
                <span className="sb-btn-name">AI Tools</span>
                <span className="sb-btn-meta">10 tools available</span>
              </div>
              <span className="sb-badge">{TOOLS.length}</span>
            </button>

            {/* Sidebar token strip */}
            <div className="sb-tok-strip">
              <div className="sb-tok-row">
                <span className="sb-tok-label">Tokens left</span>
                <span className="sb-tok-val">{bal.toLocaleString()}</span>
              </div>
              <div className="sb-tok-bar">
                <div className="sb-tok-fill" style={{width:`${pct}%`}}/>
              </div>
            </div>

            <div className="sb-div"/>
            <div className="sb-section">Account</div>

            <button className={`sb-btn ${mainView==='billing'?'billing-a':''}`}
              onClick={()=>{setMainView('billing');setActiveTool(null)}}>
              <div className="sb-btn-ico">💳</div>
              <div className="sb-btn-txt">
                <span className="sb-btn-name">Billing & Plans</span>
                <span className="sb-btn-meta" style={{color:plan.color}}>{plan.name} plan active</span>
              </div>
            </button>

            <button className={`sb-btn ${mainView==='settings'?'settings-a':''}`}
              onClick={()=>{setMainView('settings');setActiveTool(null)}}>
              <div className="sb-btn-ico">⚙️</div>
              <div className="sb-btn-txt">
                <span className="sb-btn-name">Settings</span>
                <span className="sb-btn-meta">Profile & preferences</span>
              </div>
            </button>
          </div>

          {/* User footer */}
          <div className="sb-foot">
            {user&&(
              <div className="sb-user">
                <div className="sb-av">{(user.name?.slice(0,2)??'RA').toUpperCase()}</div>
                <div className="sb-user-info">
                  <span className="sb-uname">{user.name}</span>
                  <span className="sb-uemail">{user.email}</span>
                </div>
                <span className="sb-plan-pill" style={{color:plan.color,background:`${plan.color}16`,border:`1px solid ${plan.color}28`}}>
                  {plan.name}
                </span>
              </div>
            )}
            <button className="sb-logout" onClick={logout}>↩ Sign out</button>
          </div>
        </div>

        {/* ══ MAIN ══ */}
        <div className="main">

          {/* TOPBAR */}
          <div className="topbar">
            <button className="tb-tog" onClick={()=>setSbOpen(o=>!o)}>
              {sbOpen?'◀':'▶'}
            </button>
            <div className="tb-path">
              <div className="tb-dot"/>
              <span className="tb-page">
                {mainView==='billing'?'Billing & Plans':mainView==='settings'?'Settings':mainView==='tools'&&!activeTool?'AI Tools':activeTool?activeTool.name:'Dashboard'}
              </span>
              {activeTool&&<>
                <span className="tb-sep">›</span>
                <span className="tb-sub">{activeTool.tier} · {activeTool.cost} tokens</span>
              </>}
            </div>
            <div className="tb-spacer"/>
            <div className="tb-time">
              <div className="tb-live"/>
              {timeStr}
            </div>
            {/* Notif */}
            <div className="notif-wrap" ref={notifRef}>
              <button className="notif-btn" onClick={()=>setNotifOpen(o=>!o)}>
                🔔
                {unread>0&&<div className="notif-count">{unread}</div>}
              </button>
              {notifOpen&&(
                <div className="notif-panel">
                  <div className="np-head">
                    <span className="np-title">Notifications</span>
                    <button className="np-clear" onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))}>Mark all read</button>
                  </div>
                  <div className="np-list">
                    {notifs.map(n=>(
                      <div key={n.id} className={`ni ${!n.read?'unread':''}`} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}>
                        <div className="ni-ico" style={{background:`${n.color}14`}}>{n.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="ni-title">{n.title}</div>
                          <div className="ni-body">{n.body}</div>
                          <div className="ni-time">{n.time}</div>
                        </div>
                        {!n.read&&<div className="ni-dot"/>}
                      </div>
                    ))}
                    {!notifs.length&&<div style={{padding:'28px',textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.2)'}}>Nothing here yet</div>}
                  </div>
                </div>
              )}
            </div>
            {tokens&&(
              <div className="tok-chip">
                <span className="tok-n">{tokens.balance.toLocaleString()}</span>
                <span className="tok-l">tokens</span>
              </div>
            )}
          </div>

          {/* ══ CONTENT ══ */}
          <div className="content">

            {/* ══════ BILLING ══════ */}
            {mainView==='billing'&&(
              <>
                <div className="billing-hero">
                  <div className="bh-glow1"/><div className="bh-glow2"/>
                  <div className="bh-tag">
                    <div className="bh-dot" style={{animation:'pulse 2s infinite'}}/>
                    Subscription Management
                  </div>
                  <div className="bh-h1">Simple, transparent<br/><span className="g">pricing.</span></div>
                  <div className="bh-sub">Start free. Scale when you're ready. No surprises, no hidden fees.</div>
                  <div className="cy-wrap">
                    <div className="cy-row">
                      <button className={`cy-btn ${cycle==='monthly'?'mo':''}`} onClick={()=>setCycle('monthly')}>Monthly</button>
                      <button className={`cy-btn ${cycle==='yearly'?'yr':''}`} onClick={()=>setCycle('yearly')}>Yearly</button>
                    </div>
                    {cycle==='yearly'&&(
                      <div className="cy-note">
                        <div className="cy-note-dot"/>
                        Up to 30% off with annual billing
                      </div>
                    )}
                  </div>
                </div>

                <div className="plans-grid">
                  {PLANS.map((p,i)=>{
                    const isCurr = user?.plan===p.id
                    const price  = cycle==='yearly'?p.yearlyPrice:p.monthlyPrice
                    const orig   = cycle==='yearly'&&p.monthlyRaw>0?p.monthlyPrice:null
                    return (
                      <div key={p.id} className={`plan-card ${p.popular?'popular':''}`}
                        style={{background:`linear-gradient(160deg,rgba(11,13,22,0.97),${p.bg} 120%)`,border:`1px solid ${isCurr?p.border:p.border.replace('0.2','0.07').replace('0.3','0.07').replace('0.25','0.07')}`}}>
                        <div className="plan-topline" style={{background:`linear-gradient(90deg,${p.color},transparent)`}}/>
                        {p.popular&&<div className="plan-pop-badge">{p.badge}</div>}
                        {!p.popular&&isCurr&&(
                          <div className="plan-curr-badge" style={{color:p.color,background:`${p.color}14`,border:`1px solid ${p.color}24`}}>● Current</div>
                        )}
                        <div className="plan-icon" style={{marginTop:p.popular?20:0}}>{['🎁','⚡','🚀','👑'][i]}</div>
                        <div className="plan-name" style={{color:p.color}}>{p.name}</div>
                        <div className="plan-price-row">
                          <div className="plan-price">{price}</div>
                          {p.monthlyRaw>0&&<span className="plan-period">/mo</span>}
                          {orig&&<span className="plan-orig">{orig}</span>}
                        </div>
                        {cycle==='yearly'&&p.yearlySave?(
                          <div className="plan-save" style={{background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}22`}}>
                            {p.yearlySave}
                          </div>
                        ):<div style={{height:6}}/>}
                        <div className="plan-tok">{p.tokens.toLocaleString()} tokens / month</div>
                        <ul className="plan-feats">
                          {p.features.map((f,fi)=>(
                            <li key={fi}>
                              <span className="feat-ck" style={{color:p.color}}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`plan-btn ${isCurr?'curr':'up'}`}
                          style={!isCurr?{background:p.cta,color:p.ctaText}:{}}>
                          {isCurr?`Current Plan — ${p.name}`:`Get ${p.name} ${cycle==='yearly'?'Yearly':'Monthly'}`}
                        </button>
                        {cycle==='yearly'&&p.yearlyRaw>0&&(
                          <div className="plan-yr-note">₹{(p.yearlyRaw*12).toLocaleString()} billed annually</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Usage */}
                <div>
                  <div className="sec-row">
                    <span className="sec-title" style={{marginBottom:0}}>Usage this cycle</span>
                    <span style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'rgba(255,255,255,0.3)'}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#b8ff00',display:'inline-block',animation:'pulse 2s infinite'}}/>
                      Live
                    </span>
                  </div>
                  <div className="usage-row">
                    {[
                      {l:'Tokens left',    v:bal.toLocaleString(),                   s:`${pct}% remaining`,      c:'#b8ff00'},
                      {l:'Tokens used',    v:tokens?.totalSpent?.toLocaleString()||'0', s:'This billing cycle', c:'#00f0c8'},
                      {l:'Sessions',       v:String(history.length),                  s:'Total tool runs',       c:'#f59e0b'},
                      {l:'Plan limit',     v:plan.tokens.toLocaleString(),             s:`${plan.name} plan`,     c:'rgba(255,255,255,0.3)'},
                    ].map((s,i)=>(
                      <div key={i} className="usage-card">
                        <div className="usage-lbl">{s.l}</div>
                        <div className="usage-val" style={{color:s.c}}>{s.v}</div>
                        <div className="usage-sub">{s.s}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12,background:'rgba(255,255,255,0.015)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,padding:'16px 20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <span style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>Token consumption</span>
                      <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:'#b8ff00'}}>{pct}% remaining</span>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,0.05)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#b8ff00,#00f0c8)',borderRadius:99,transition:'width 1s ease'}}/>
                    </div>
                  </div>
                </div>
                <div style={{height:16}}/>
              </>
            )}

            {/* ══════ SETTINGS ══════ */}
            {mainView==='settings'&&(
              <>
                <div>
                  <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:5}}>Settings</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,0.35)'}}>Manage your account, subscription and security.</div>
                </div>
                <div className="set-grid">
                  <div className="set-card">
                    <div className="set-card-title">👤 Profile</div>
                    <div className="set-row"><span className="set-key">Full name</span><span className="set-val">{user?.name??'—'}</span></div>
                    <div className="set-row"><span className="set-key">Email</span><span className="set-val" style={{fontSize:10}}>{user?.email??'—'}</span></div>
                    <div className="set-row"><span className="set-key">Member since</span><span className="set-val">2025</span></div>
                    <div className="set-row"><span className="set-key">User ID</span><span className="set-val" style={{fontSize:9,color:'rgba(255,255,255,0.28)'}}>{user?.id?.slice(0,18)??'—'}…</span></div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title">💳 Subscription</div>
                    <div className="set-row"><span className="set-key">Current plan</span><span className="set-val" style={{color:plan.color}}>{plan.name}</span></div>
                    <div className="set-row"><span className="set-key">Monthly tokens</span><span className="set-val">{plan.tokens.toLocaleString()}</span></div>
                    <div className="set-row"><span className="set-key">Remaining</span><span className="set-val" style={{color:'#b8ff00'}}>{bal.toLocaleString()}</span></div>
                    <div className="set-row"><span className="set-key">Used</span><span className="set-val">{tokens?.totalSpent?.toLocaleString()??'0'}</span></div>
                    <div style={{marginTop:14}}>
                      <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>setMainView('billing')}>
                        Manage Plan →
                      </button>
                    </div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title">🤖 AI Model Routing</div>
                    {[
                      {n:'Claude AI',  d:'Heavy tools — 30 tokens',  c:'#b8ff00', t:'HEAVY'},
                      {n:'Gemini Pro', d:'Medium tools — 15 tokens', c:'#00f0c8', t:'MEDIUM'},
                      {n:'Groq LLaMA', d:'Light tools — 5 tokens',   c:'#f59e0b', t:'LIGHT'},
                    ].map((m,i)=>(
                      <div key={i} className="set-row">
                        <span className="set-key" style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{width:7,height:7,borderRadius:'50%',background:m.c,boxShadow:`0 0 6px ${m.c}66`,display:'inline-block'}}/>
                          {m.n}
                        </span>
                        <span style={{fontSize:10,fontWeight:600,color:m.c,textTransform:'uppercase',letterSpacing:'.4px'}}>{m.t}</span>
                      </div>
                    ))}
                    <div style={{marginTop:14,padding:'11px 13px',background:'rgba(184,255,0,0.04)',border:'1px solid rgba(184,255,0,0.09)',borderRadius:9,fontSize:11.5,color:'rgba(255,255,255,0.3)',lineHeight:1.65}}>
                      REIOGN auto-routes to the best model per tool. Tokens are refunded on any failure.
                    </div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title">🔒 Security</div>
                    <div className="set-row"><span className="set-key">Password</span><span className="set-val">••••••••</span></div>
                    <div className="set-row"><span className="set-key">Two-factor auth</span><span className="set-val" style={{color:'rgba(245,158,11,0.7)',fontSize:11}}>Not enabled</span></div>
                    <div className="set-row"><span className="set-key">Session data</span><span className="set-val" style={{fontSize:11}}>Stored locally</span></div>
                    <div className="set-row"><span className="set-key">Data retention</span><span className="set-val" style={{fontSize:11}}>30 days</span></div>
                  </div>
                  <div className="set-card" style={{gridColumn:'1/-1'}}>
                    <div className="set-card-title">⚠️ Danger zone</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:18,lineHeight:1.7}}>These actions are irreversible. Please be sure before proceeding.</div>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                      <button onClick={logout} style={{padding:'11px 20px',background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:9,color:'#f87171',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600,transition:'all .18s'}}>
                        Sign out →
                      </button>
                      <button style={{padding:'11px 20px',background:'rgba(239,68,68,0.03)',border:'1px solid rgba(239,68,68,0.09)',borderRadius:9,color:'rgba(248,113,113,0.4)',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                        Delete account
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══════ ALL TOOLS ══════ */}
            {mainView==='tools'&&!activeTool&&(
              <>
                <div>
                  <div style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:5}}>AI Tools</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,0.35)'}}>10 precision-engineered tools. Pick one and go.</div>
                </div>
                <div className="tools-grid">
                  {TOOLS.map(t=>(
                    <button key={t.id} className={`tool-card ${t.color==='teal'?'teal':''}`} onClick={()=>openTool(t)}>
                      <div className="tool-card-icon">{t.icon}</div>
                      <div className="tool-card-name">{t.name}</div>
                      <div className="tool-card-desc">{t.desc}</div>
                      <div className="tool-card-foot">
                        <span className={`badge ${t.color==='lime'?'lime':'teal'}`}>{t.cost} tokens</span>
                        <span className="badge amber">{t.tier}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{height:16}}/>
              </>
            )}

            {/* ══════ TOOL RUN VIEW ══════ */}
            {activeTool&&(
              <>
                <div style={{display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap'}}>
                  <button onClick={()=>{setMainView('tools');setActiveTool(null);setResult(null)}}
                    style={{padding:'8px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12.5,color:'rgba(255,255,255,0.45)',cursor:'pointer',fontFamily:'inherit',flexShrink:0,transition:'all .15s'}}>
                    ← Back to Tools
                  </button>
                  <div className="tabs-bar">
                    <button className={`tab-btn ${histTab==='run'?'on':''}`} onClick={()=>setHistTab('run')}>Run</button>
                    <button className={`tab-btn ${histTab==='history'?'on':''}`} onClick={()=>setHistTab('history')}>
                      History ({history.filter(h=>h.tool===activeTool.name).length})
                    </button>
                  </div>
                </div>

                {histTab==='run'&&(
                  <>
                    <div className={`tool-panel ${activeTool.color==='lime'?'lime-border':'teal-border'}`}>
                      <div className="tp-head">
                        <span className="tp-ico">{activeTool.icon}</span>
                        <div className="tp-info">
                          <div className="tp-name">{activeTool.name}</div>
                          <div className="tp-desc">{activeTool.desc}</div>
                        </div>
                        <div className="tp-badges">
                          <span className={`badge ${activeTool.color==='lime'?'lime':'teal'}`}>{activeTool.cost} tokens</span>
                          <span className="badge amber">{activeTool.tier}</span>
                        </div>
                      </div>
                      <div className="tp-body">
                        <span className="field-lbl">Describe your goal or situation</span>
                        <textarea
                          value={message}
                          onChange={e=>setMessage(e.target.value)}
                          placeholder={activeTool.placeholder}
                          rows={6}
                          onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))runTool()}}
                        />
                        {error&&<div className="error-box"><span>⚠</span><span>{error}</span></div>}
                        {aiLoading&&(
                          <div className="queue-row">
                            <div className="q-dot" style={{background:activeTool.color==='teal'?'#00f0c8':'#b8ff00'}}/>
                            <span className="q-txt">{queuePos?`Queue position ${queuePos} — processing…`:`${activeTool.name} is thinking…`}</span>
                            <span className="q-time">{elapsed}s</span>
                          </div>
                        )}
                        <div className="tp-foot">
                          <button className={`run-btn ${activeTool.color==='teal'?'teal':''}`} onClick={runTool} disabled={aiLoading||!message.trim()}>
                            {aiLoading?<><div className="spinner"/>Working…</>:`Run ${activeTool.name}`}
                          </button>
                          <span className="cost-note">⌘+Enter · {activeTool.cost} tokens · refunded on error</span>
                        </div>
                      </div>
                    </div>

                    {result&&(
                      <div ref={resultRef} className={`result-wrap ${activeTool.color==='teal'?'teal':'lime'}`}>
                        <div className="rw-head">
                          <span className="rw-label">Result — {result.tool}</span>
                          <div className="rw-meta">
                            <div className="pvdr">
                              <div className="pvdr-dot" style={{background:PROVIDER[result.provider]?.color??'#fff'}}/>
                              <span style={{fontSize:11,color:PROVIDER[result.provider]?.color??'#fff'}}>{PROVIDER[result.provider]?.label??result.provider}</span>
                            </div>
                            <span className={`badge ${activeTool.color==='lime'?'lime':'teal'}`}>{result.tokensUsed} tkn</span>
                            <span className="badge amber">{(result.durationMs/1000).toFixed(1)}s</span>
                          </div>
                        </div>
                        <div className="rw-body"><pre>{result.result}</pre></div>
                      </div>
                    )}
                  </>
                )}

                {histTab==='history'&&(
                  <div className="hist-list">
                    {history.filter(h=>h.tool===activeTool.name).length===0?(
                      <div className="empty-state">
                        <div className="es-ico">📋</div>
                        <div className="es-title">No history yet</div>
                        <div className="es-sub">Run {activeTool.name} and your sessions will appear here.</div>
                      </div>
                    ):history.filter(h=>h.tool===activeTool.name).map(item=>(
                      <div key={item.id} className="hi" onClick={()=>{
                        setResult({tool:item.tool,result:item.result,tokensUsed:item.tokensUsed,tokensRemaining:bal,model:item.model,provider:item.provider,durationMs:item.durationMs})
                        setHistTab('run')
                        setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth'}),100)
                      }}>
                        <div className="hi-top">
                          <span style={{fontSize:15}}>{TOOLS.find(t=>t.name===item.tool)?.icon??'🤖'}</span>
                          <span className="hi-name">{item.tool}</span>
                          <span className="hi-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="hi-msg">{item.message}</div>
                        <div className="hi-meta">
                          <span className={`badge ${activeTool.color==='lime'?'lime':'teal'}`}>{item.tokensUsed} tokens</span>
                          <div className="pvdr">
                            <div className="pvdr-dot" style={{background:PROVIDER[item.provider]?.color??'#fff'}}/>
                            <span style={{fontSize:11,color:PROVIDER[item.provider]?.color??'#fff'}}>{PROVIDER[item.provider]?.label??item.provider}</span>
                          </div>
                          <span className="badge amber">{(item.durationMs/1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══════ HOME ══════ */}
            {mainView==='home'&&!activeTool&&(
              <>
                {/* Greeting */}
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.28)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>
                    {greeting}
                  </div>
                  <div style={{fontSize:34,fontWeight:700,color:'#fff',letterSpacing:'-.8px',marginBottom:7}}>
                    {firstName}, welcome back.
                  </div>
                  <div style={{fontSize:14.5,color:'rgba(255,255,255,0.38)',lineHeight:1.65,maxWidth:480,marginBottom:20}}>
                    Your AI performance toolkit is live. Every tool is built to make you think, decide, and execute better.
                  </div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button className="btn-primary" onClick={()=>openTool(TOOLS[0])}>Run a tool →</button>
                    {user?.plan==='TRIAL'&&(
                      <button className="btn-ghost" onClick={()=>setMainView('billing')}>Upgrade plan</button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                  <div className="stat-card sl">
                    <div className="stat-ico">🪙</div>
                    <div className="stat-n" style={{color:'#b8ff00'}}>{bal.toLocaleString()}</div>
                    <div className="stat-lbl">Tokens left</div>
                    <div className="stat-hint">{pct}% of {plan.tokens.toLocaleString()}</div>
                  </div>
                  <div className="stat-card st">
                    <div className="stat-ico">📊</div>
                    <div className="stat-n" style={{color:'#00f0c8'}}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                    <div className="stat-lbl">Tokens used</div>
                    <div className="stat-hint">This billing cycle</div>
                  </div>
                  <div className="stat-card sa">
                    <div className="stat-ico">⚡</div>
                    <div className="stat-n" style={{color:'#f59e0b'}}>{history.length}</div>
                    <div className="stat-lbl">Sessions run</div>
                    <div className="stat-hint">{history.length?`Last at ${new Date(history[0].timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'No sessions yet'}</div>
                  </div>
                  <div className="stat-card sv">
                    <div className="stat-ico">🛠️</div>
                    <div className="stat-n" style={{color:'#a78bfa'}}>{TOOLS.length}</div>
                    <div className="stat-lbl">Tools available</div>
                    <div className="stat-hint">All unlocked</div>
                  </div>
                </div>

                {/* Charts row */}
                <div className="two-col">
                  {/* Donut + balance */}
                  <div className="panel">
                    <div className="panel-title">Token Balance</div>
                    <div className="panel-sub" style={{marginBottom:16}}>
                      {bal.toLocaleString()} remaining on {plan.name} plan
                    </div>
                    <div className="donut-widget">
                      <div className="donut-wrap">
                        <Donut pct={pct} color="#b8ff00" size={110}/>
                        <div className="donut-label">
                          <span className="donut-pct">{pct}%</span>
                          <span className="donut-sub">left</span>
                        </div>
                      </div>
                      <div className="donut-info">
                        <div className="prog-bar">
                          <div className="prog-fill" style={{width:`${pct}%`,background:'linear-gradient(90deg,#b8ff00,#00f0c8)'}}/>
                        </div>
                        <div className="prog-bar">
                          <div className="prog-fill" style={{width:`${Math.min(100,100-pct)}%`,background:'rgba(245,158,11,0.45)'}}/>
                        </div>
                        <div className="prog-legend">
                          <div className="pl-item"><div className="pl-dot" style={{background:'#b8ff00'}}/>Remaining</div>
                          <div className="pl-item"><div className="pl-dot" style={{background:'rgba(245,158,11,0.45)'}}/>Used</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="panel">
                    <div className="panel-title">Session Activity</div>
                    <div className="panel-sub">Tokens per session, last {Math.min(12,sparkData.length)} runs</div>
                    <Spark data={sparkData} color="#00f0c8" h={80}/>
                  </div>
                </div>

                {/* Usage bars */}
                <div className="panel">
                  <div className="panel-title" style={{marginBottom:4}}>Tool Usage</div>
                  <div className="panel-sub">Token spend by tool</div>
                  <UsageBars history={history}/>
                </div>

                {/* Quick launch */}
                <div>
                  <div className="sec-row">
                    <span className="sec-title" style={{marginBottom:0}}>Quick Launch</span>
                    <button onClick={()=>{setMainView('tools');setActiveTool(null)}} style={{fontSize:12.5,color:'rgba(255,255,255,0.35)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>
                      View all tools →
                    </button>
                  </div>
                  <div className="ql-grid">
                    {TOOLS.slice(0,4).map(t=>(
                      <button key={t.id} className={`ql-card ${t.color==='teal'?'t':''}`} onClick={()=>openTool(t)}>
                        <div className="ql-icon">{t.icon}</div>
                        <div className="ql-name">{t.name}</div>
                        <div className="ql-desc">{t.desc.slice(0,60)}…</div>
                        <div className="ql-foot">
                          <span className="ql-cost" style={{color:t.color==='lime'?'rgba(184,255,0,0.55)':'rgba(0,240,200,0.55)'}}>{t.cost} tokens</span>
                          <span className="ql-tier" style={{color:TIER_COLORS[t.tier],background:`${TIER_COLORS[t.tier]}12`,border:`1px solid ${TIER_COLORS[t.tier]}25`}}>{t.tier}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent sessions */}
                {history.length>0&&(
                  <div>
                    <div className="sec-row">
                      <span className="sec-title" style={{marginBottom:0}}>Recent Sessions</span>
                      <span className="sec-sub">{history.length} total</span>
                    </div>
                    <div className="act-list">
                      {history.slice(0,4).map(item=>{
                        const t = TOOLS.find(x=>x.name===item.tool)
                        return (
                          <div key={item.id} className="act-item" onClick={()=>{if(t){openTool(t);setResult({tool:item.tool,result:item.result,tokensUsed:item.tokensUsed,tokensRemaining:bal,model:item.model,provider:item.provider,durationMs:item.durationMs})}}}>
                            <span className="act-icon">{t?.icon??'🤖'}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div className="act-tool">{item.tool}</div>
                              <div className="act-msg">{item.message}</div>
                            </div>
                            <div className="act-right">
                              <span className="act-time">{new Date(item.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                              <span className="act-tok">{item.tokensUsed} tkn</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Upgrade banner */}
                {user?.plan==='TRIAL'&&(
                  <div className="upgrade-banner">
                    <div>
                      <div className="ub-title">You're on the free trial</div>
                      <div className="ub-sub">Upgrade to Starter for 2,000 tokens every month — enough for 130+ sessions.</div>
                    </div>
                    <button className="btn-primary" onClick={()=>setMainView('billing')}>See plans →</button>
                  </div>
                )}
                <div style={{height:20}}/>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
