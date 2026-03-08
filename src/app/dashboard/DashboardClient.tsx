'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User        { id: string; name: string; email: string; plan: string }
interface TokenInfo   { balance: number; totalSpent: number }
interface AIResult    { tool: string; result: string; tokensUsed: number; tokensRemaining: number; model: string; provider: string; durationMs: number }
interface HistoryItem { id: string; tool: string; result: string; tokensUsed: number; model: string; provider: string; durationMs: number; timestamp: number; message: string }
interface Notif       { id: string; icon: string; title: string; body: string; time: string; read: boolean; color: string }

const TOOLS = [
  { id:'DEEP_WORK_ENGINE',    slug:'deep-work-engine',    name:'Deep Work Engine',    icon:'⚡', cost:15, tier:'MEDIUM', color:'lime', desc:'Structure your next deep work session for maximum output and zero distraction.',      placeholder:'e.g. I need to write 5000 words of my thesis today. My focus peaks at 9am...' },
  { id:'COGNITIVE_CLONE',     slug:'cognitive-clone',     name:'Cognitive Clone',     icon:'🧠', cost:30, tier:'HEAVY',  color:'teal', desc:'Simulate your high-performance self and get decisions your best version would make.', placeholder:'e.g. I am deciding whether to quit my job and start a SaaS. Current MRR is $0...' },
  { id:'RESEARCH_BUILDER',    slug:'research-builder',    name:'Research Builder',    icon:'🔬', cost:15, tier:'MEDIUM', color:'lime', desc:'Build a counter-intuitive research strategy from first principles.',                   placeholder:'e.g. I want to understand the Indian EV market from first principles...' },
  { id:'SKILL_ROI_ANALYZER',  slug:'skill-roi-analyzer',  name:'Skill ROI Analyzer',  icon:'📊', cost:5,  tier:'LIGHT',  color:'teal', desc:'Get precise ROI projections across 3, 12 and 36-month horizons for any skill.',      placeholder:'e.g. Should I learn Rust or TypeScript as a backend developer in 2025?' },
  { id:'MEMORY_INTELLIGENCE', slug:'memory-intelligence', name:'Memory Intelligence', icon:'💡', cost:15, tier:'MEDIUM', color:'lime', desc:'Build spaced-repetition memory maps that make knowledge stick permanently.',           placeholder:'e.g. I need to memorize the entire OSI model and how each layer interacts...' },
  { id:'EXECUTION_OPTIMIZER', slug:'execution-optimizer', name:'Execution Optimizer', icon:'🚀', cost:15, tier:'MEDIUM', color:'teal', desc:'Get your critical path and a laser-focused 7-day action plan.',                       placeholder:'e.g. Launch my SaaS MVP in 30 days. I have evenings and weekends free...' },
  { id:'OPPORTUNITY_RADAR',   slug:'opportunity-radar',   name:'Opportunity Radar',   icon:'📡', cost:30, tier:'HEAVY',  color:'lime', desc:'Surface high-leverage hidden opportunities most people completely overlook.',         placeholder:'e.g. I am a 24-year-old developer in Mumbai with ₹2L savings and 2 years experience...' },
  { id:'DECISION_SIMULATOR',  slug:'decision-simulator',  name:'Decision Simulator',  icon:'⚖️', cost:30, tier:'HEAVY',  color:'teal', desc:'Run a multi-scenario decision simulation with probability-weighted outcomes.',       placeholder:'e.g. I got two offers: ₹18L at startup vs ₹24L at MNC. I value learning over salary...' },
  { id:'FOCUS_SHIELD',        slug:'focus-shield',        name:'Focus Shield',        icon:'🛡️', cost:5,  tier:'LIGHT',  color:'lime', desc:'Get your personalized distraction protocol and reclaim stolen attention.',           placeholder:'e.g. I get distracted by Instagram every 20 mins, I work from home...' },
  { id:'WEALTH_MAPPER',       slug:'wealth-mapper',       name:'Wealth Mapper',       icon:'💰', cost:30, tier:'HEAVY',  color:'teal', desc:'Build your complete 36-month wealth roadmap with concrete milestones.',              placeholder:'e.g. 26yo, ₹60K/month salary, ₹5L savings, no investments yet, want ₹1Cr by 30...' },
]

const PLANS = [
  {
    id:'TRIAL',   name:'Trial',   icon:'🎁',
    monthlyPrice:'Free',     yearlyPrice:'Free',
    monthlyRaw:0,            yearlyRaw:0,
    tokens:500,
    color:'rgba(200,200,220,0.8)',
    border:'rgba(255,255,255,0.08)',
    glow:'rgba(255,255,255,0.0)',
    accent:'rgba(200,200,220,0.12)',
    features:['500 tokens total','All 10 AI tools','3-day access','Community support'],
    yearlySave:'',
    popular: false,
  },
  {
    id:'STARTER', name:'Starter', icon:'⚡',
    monthlyPrice:'₹399',     yearlyPrice:'₹299',
    monthlyRaw:399,          yearlyRaw:299,
    tokens:2000,
    color:'#b8ff00',
    border:'rgba(184,255,0,0.25)',
    glow:'rgba(184,255,0,0.05)',
    accent:'rgba(184,255,0,0.08)',
    features:['2,000 tokens/month','All 10 AI tools','Priority support','Session history export','Email support'],
    yearlySave:'Save ₹1,200',
    popular: false,
  },
  {
    id:'PRO',     name:'Pro',     icon:'🚀',
    monthlyPrice:'₹849',     yearlyPrice:'₹599',
    monthlyRaw:849,          yearlyRaw:599,
    tokens:6000,
    color:'#00f0c8',
    border:'rgba(0,240,200,0.35)',
    glow:'rgba(0,240,200,0.06)',
    accent:'rgba(0,240,200,0.08)',
    features:['6,000 tokens/month','All 10 AI tools','24/7 priority support','Full API access','Advanced session history','Custom system prompts'],
    yearlySave:'Save ₹3,000',
    popular: true,
  },
  {
    id:'ELITE',   name:'Elite',   icon:'👑',
    monthlyPrice:'₹1,999',   yearlyPrice:'₹1,399',
    monthlyRaw:1999,         yearlyRaw:1399,
    tokens:20000,
    color:'#ff9500',
    border:'rgba(255,149,0,0.3)',
    glow:'rgba(255,149,0,0.05)',
    accent:'rgba(255,149,0,0.08)',
    features:['20,000 tokens/month','All 10 AI tools','Dedicated account manager','Full API access','White-label option','Custom tools built for you','SLA guarantee'],
    yearlySave:'Save ₹7,200',
    popular: false,
  },
]

const TIER_COLORS: Record<string,string> = { LIGHT:'#00f0c8', MEDIUM:'#b8ff00', HEAVY:'#ff9500' }
const PROVIDER_LABELS: Record<string,{label:string;color:string}> = {
  anthropic:{label:'Claude',  color:'#b8ff00'},
  gemini:   {label:'Gemini',  color:'#00f0c8'},
  groq:     {label:'Groq',    color:'#ff9500'},
  openai:   {label:'GPT-4',   color:'#74b9ff'},
}
const SEED_NOTIFS: Notif[] = [
  {id:'1',icon:'⚡',title:'Welcome to REIOGN',body:'Your trial is active. 500 tokens to explore all 10 precision AI tools.',time:'Just now',read:false,color:'#b8ff00'},
  {id:'2',icon:'🧠',title:'Try Cognitive Clone',body:'Our highest-rated tool. Users report 3x better decisions in 2 weeks.',time:'2m ago',read:false,color:'#00f0c8'},
  {id:'3',icon:'💰',title:'30% off yearly plans',body:'Switch to yearly billing and save up to ₹7,200 annually.',time:'10m ago',read:true,color:'#ff9500'},
]

// ── Ring Chart ─────────────────────────────────────────────────
function RingChart({pct,color,size=148}:{pct:number;color:string;size?:number}) {
  const r=(size/2)-13, circ=2*Math.PI*r, dash=(pct/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={11}/>
      <circle cx={size/2} cy={size/2} r={r-14} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={3}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={11}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)',filter:`drop-shadow(0 0 12px ${color}aa)`}}/>
    </svg>
  )
}

// ── Sparkline ──────────────────────────────────────────────────
function Sparkline({data,color,h=60}:{data:number[];color:string;h?:number}) {
  if(!data.length||data.every(d=>d===0)) return (
    <div style={{height:h,display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(255,255,255,0.08)',letterSpacing:3}}>
      RUN A TOOL TO SEE DATA
    </div>
  )
  const w=400, pts=data.map((v,i)=>`${(i/(Math.max(data.length-1,1)))*w},${h-(v/Math.max(...data,1))*h}`).join(' ')
  const area=`0,${h} ${pts} ${w},${h}`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.length>0&&(
        <circle cx={(data.length-1)/(Math.max(data.length-1,1))*w}
          cy={h-(data[data.length-1]/Math.max(...data,1))*h}
          r="4" fill={color} style={{filter:`drop-shadow(0 0 6px ${color})`}}/>
      )}
    </svg>
  )
}

// ── Tool Usage Bars ────────────────────────────────────────────
function ToolBars({history}:{history:HistoryItem[]}) {
  const counts:Record<string,number>={}
  history.forEach(h=>{counts[h.tool]=(counts[h.tool]||0)+h.tokensUsed})
  const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6)
  const max=entries[0]?.[1]||1
  if(!entries.length) return (
    <div style={{textAlign:'center',padding:'36px 0',color:'rgba(255,255,255,0.08)',
      fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:3}}>
      NO DATA YET — RUN YOUR FIRST TOOL
    </div>
  )
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {entries.map(([name,val],i)=>{
        const tool=TOOLS.find(t=>t.name===name)
        const color=tool?.color==='teal'?'#00f0c8':'#b8ff00'
        return (
          <div key={i} style={{display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontSize:20,width:28,textAlign:'center',flexShrink:0}}>{tool?.icon??'🤖'}</span>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:12.5,fontWeight:600,color:'rgba(255,255,255,0.7)'}}>{name}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.25)'}}>{val} tokens</span>
              </div>
              <div style={{height:6,background:'rgba(255,255,255,0.04)',borderRadius:6,overflow:'hidden'}}>
                <div style={{width:`${(val/max)*100}%`,height:'100%',
                  background:`linear-gradient(90deg,${color},${color}80)`,borderRadius:6,
                  transition:'width 1.4s cubic-bezier(.4,0,.2,1)',
                  boxShadow:`0 0 10px ${color}44`}}/>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

type MainView = 'home'|'billing'|'settings'

export default function DashboardClient() {
  const router=useRouter()
  const [user,setUser]=useState<User|null>(null)
  const [tokens,setTokens]=useState<TokenInfo|null>(null)
  const [loading,setLoading]=useState(true)
  const [activeTool,setActiveTool]=useState<typeof TOOLS[0]|null>(null)
  const [message,setMessage]=useState('')
  const [aiLoading,setAiLoading]=useState(false)
  const [result,setResult]=useState<AIResult|null>(null)
  const [error,setError]=useState('')
  const [sidebarOpen,setSidebarOpen]=useState(true)
  const [history,setHistory]=useState<HistoryItem[]>([])
  const [activeTab,setActiveTab]=useState<'tool'|'history'>('tool')
  const [queuePos,setQueuePos]=useState<number|null>(null)
  const [elapsed,setElapsed]=useState(0)
  const [mainView,setMainView]=useState<MainView>('home')
  const [billingCycle,setBillingCycle]=useState<'monthly'|'yearly'>('monthly')
  const [liveTime,setLiveTime]=useState(new Date())
  const [notifs,setNotifs]=useState<Notif[]>(SEED_NOTIFS)
  const [notifOpen,setNotifOpen]=useState(false)
  const resultRef=useRef<HTMLDivElement>(null)
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const notifRef=useRef<HTMLDivElement>(null)

  const fetchUser=useCallback(async()=>{
    try{
      const [meRes,tokRes]=await Promise.all([fetch('/api/auth/me'),fetch('/api/tokens/balance')])
      if(meRes.status===401){router.push('/login');return}
      const [me,tok]=await Promise.all([meRes.json(),tokRes.json()])
      if(me.success)setUser(me.data)
      if(tok.success)setTokens(tok.data)
    }catch{/**/}finally{setLoading(false)}
  },[router])

  useEffect(()=>{fetchUser()},[fetchUser])
  useEffect(()=>{const iv=setInterval(()=>setLiveTime(new Date()),1000);return()=>clearInterval(iv)},[])
  useEffect(()=>{
    const iv=setInterval(async()=>{
      try{const r=await fetch('/api/tokens/balance');const d=await r.json();if(d.success)setTokens(d.data)}catch{/**/}
    },30000)
    return()=>clearInterval(iv)
  },[])
  useEffect(()=>{
    try{const s=sessionStorage.getItem('reiogn_hist');if(s)setHistory(JSON.parse(s))}catch{/**/}
  },[])
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(notifRef.current&&!notifRef.current.contains(e.target as Node))setNotifOpen(false)}
    document.addEventListener('mousedown',h)
    return()=>document.removeEventListener('mousedown',h)
  },[])

  function saveHistory(items:HistoryItem[]){
    setHistory(items)
    try{sessionStorage.setItem('reiogn_hist',JSON.stringify(items.slice(0,30)))}catch{/**/}
  }

  async function runTool(){
    if(!activeTool||!message.trim())return
    setAiLoading(true);setError('');setResult(null);setQueuePos(null);setElapsed(0)
    const start=Date.now()
    timerRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),500)
    setQueuePos(Math.floor(Math.random()*3)+1)
    setTimeout(()=>setQueuePos(null),1800)
    try{
      const res=await fetch(`/api/tools/${activeTool.slug}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message})})
      const data=await res.json()
      if(!res.ok){
        if(res.status===403)setError('Active subscription required. Upgrade your plan to continue.')
        else if(res.status===402)setError(`Not enough tokens. You need ${activeTool.cost} tokens for this tool.`)
        else setError(data.error||'Something went wrong. Your tokens were not charged.')
        return
      }
      setResult(data.data)
      setTokens(t=>t?{...t,balance:data.data.tokensRemaining,totalSpent:t.totalSpent+data.data.tokensUsed}:null)
      const item:HistoryItem={id:Date.now().toString(),tool:activeTool.name,result:data.data.result,tokensUsed:data.data.tokensUsed,model:data.data.model,provider:data.data.provider??'anthropic',durationMs:data.data.durationMs,timestamp:Date.now(),message}
      saveHistory([item,...history])
      setNotifs(n=>[{id:Date.now().toString(),icon:'✅',title:`${activeTool.name} complete`,body:`Used ${data.data.tokensUsed} tokens · ${(data.data.durationMs/1000).toFixed(1)}s`,time:'Just now',read:false,color:'#b8ff00'},...n.slice(0,9)])
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100)
    }catch{setError('Network error. Tokens were not charged.')}
    finally{setAiLoading(false);setQueuePos(null);if(timerRef.current)clearInterval(timerRef.current)}
  }

  async function logout(){
    await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{})
    router.push('/login')
  }

  function selectTool(tool:typeof TOOLS[0]){setActiveTool(tool);setResult(null);setError('');setMessage('');setActiveTab('tool');setMainView('home')}
  function goHome(){setActiveTool(null);setMainView('home');setResult(null);setError('')}

  const currentPlan=PLANS.find(p=>p.id===user?.plan)??PLANS[0]
  const tokenPct=Math.min(100,Math.round(((tokens?.balance??0)/currentPlan.tokens)*100))
  const sparkData=history.slice(0,14).map(h=>h.tokensUsed).reverse()
  const unread=notifs.filter(n=>!n.read).length
  const firstName=user?.name?.split(' ')[0]??'there'

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#07080f',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:20}}>
      <div style={{width:52,height:52,borderRadius:14,background:'rgba(184,255,0,0.08)',border:'1px solid rgba(184,255,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:'#b8ff00',animation:'p 2s ease-in-out infinite'}}>R</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'rgba(255,255,255,0.15)',letterSpacing:4,textTransform:'uppercase'}}>Loading workspace</div>
      <style>{`@keyframes p{0%,100%{box-shadow:0 0 0 0 rgba(184,255,0,0.35)}60%{box-shadow:0 0 0 18px rgba(184,255,0,0)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{min-height:100vh;background:#07080f;color:#fff;font-family:'Inter',sans-serif;overflow:hidden;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12);}

        /* ── Layout ──────────── */
        .layout{display:flex;height:100vh;overflow:hidden;}

        /* ══ SIDEBAR ══ */
        .sidebar{
          width:${sidebarOpen?'272px':'0'};
          min-width:${sidebarOpen?'272px':'0'};
          height:100vh;display:flex;flex-direction:column;
          background:rgba(8,9,14,0.97);
          border-right:1px solid rgba(255,255,255,0.05);
          overflow:hidden;transition:min-width .28s cubic-bezier(.4,0,.2,1),width .28s cubic-bezier(.4,0,.2,1);
          flex-shrink:0;position:relative;
        }
        .sb-glow{position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(180deg,rgba(184,255,0,0.18),transparent 40%,transparent 60%,rgba(0,240,200,0.1));pointer-events:none;}

        /* Brand */
        .sb-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.04);flex-shrink:0;display:flex;align-items:center;gap:13px;}
        .sb-mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,rgba(184,255,0,0.18),rgba(184,255,0,0.04));border:1px solid rgba(184,255,0,0.22);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#b8ff00;flex-shrink:0;box-shadow:0 0 24px rgba(184,255,0,0.1);}
        .sb-brand-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;letter-spacing:-.5px;white-space:nowrap;}
        .sb-brand-tag{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.18);letter-spacing:2.5px;text-transform:uppercase;margin-top:2px;}

        /* Scroll area */
        .sb-scroll{flex:1;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;min-height:0;}

        /* Section label */
        .sb-label{padding:16px 20px 5px;font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.14);letter-spacing:3px;text-transform:uppercase;white-space:nowrap;flex-shrink:0;}

        /* Nav item */
        .sb-item{display:flex;align-items:center;gap:11px;margin:1px 10px;padding:9px 12px;border-radius:10px;cursor:pointer;transition:all .16s cubic-bezier(.4,0,.2,1);border:1px solid transparent;background:none;width:calc(100% - 20px);text-align:left;white-space:nowrap;position:relative;}
        .sb-item:hover{background:rgba(255,255,255,0.03);}
        .sb-item.ai{background:rgba(184,255,0,0.07);border-color:rgba(184,255,0,0.16);}
        .sb-item.at{background:rgba(0,240,200,0.07);border-color:rgba(0,240,200,0.16);}
        .sb-item.bi{background:linear-gradient(135deg,rgba(184,255,0,0.07),rgba(0,240,200,0.04));border-color:rgba(184,255,0,0.2);}
        .sb-item.si{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.2);}
        .sb-item.ho{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.07);}
        .sb-icon{font-size:16px;width:22px;text-align:center;flex-shrink:0;}
        .sb-name{font-size:12.5px;font-weight:500;color:rgba(255,255,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
        .sb-item.ai .sb-name,.sb-item.bi .sb-name{color:#b8ff00;}
        .sb-item.at .sb-name{color:#00f0c8;}
        .sb-item.si .sb-name{color:#a78bfa;}
        .sb-item.ho .sb-name{color:#fff;}
        .sb-meta{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.18);margin-top:1px;display:block;}
        .sb-item.ai .sb-meta{color:rgba(184,255,0,0.4);}
        .sb-item.at .sb-meta{color:rgba(0,240,200,0.4);}
        .sb-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

        /* Token bar in sidebar */
        .sb-tok{margin:10px 12px 4px;padding:12px 14px;background:rgba(184,255,0,0.04);border:1px solid rgba(184,255,0,0.09);border-radius:10px;}
        .sb-tok-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .sb-tok-label{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.18);letter-spacing:2px;text-transform:uppercase;}
        .sb-tok-n{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#b8ff00;}
        .sb-prog{height:3px;background:rgba(255,255,255,0.04);border-radius:3px;overflow:hidden;}
        .sb-prog-f{height:100%;background:linear-gradient(90deg,#b8ff00,#00f0c8);border-radius:3px;transition:width .9s cubic-bezier(.4,0,.2,1);}

        /* Divider */
        .sb-div{height:1px;background:rgba(255,255,255,0.04);margin:10px 16px;flex-shrink:0;}

        /* Footer */
        .sb-foot{padding:12px;border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0;}
        .sb-ucard{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,0.022);border:1px solid rgba(255,255,255,0.05);margin-bottom:8px;}
        .sb-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#b8ff00,#00f0c8);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:800;color:#07080f;flex-shrink:0;}
        .sb-uname{font-size:12.5px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
        .sb-uemail{font-size:9.5px;color:rgba(255,255,255,0.25);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin-top:1px;}
        .sb-chip{font-family:'JetBrains Mono',monospace;font-size:7px;padding:2px 8px;border-radius:3px;letter-spacing:.8px;text-transform:uppercase;flex-shrink:0;}
        .sb-logout{width:100%;padding:8px;background:transparent;border:1px solid rgba(255,79,114,0.1);border-radius:8px;color:rgba(255,79,114,0.4);font-size:11px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:6px;}
        .sb-logout:hover{background:rgba(255,79,114,0.06);color:#ff6b8a;border-color:rgba(255,79,114,0.25);}

        /* ══ TOPBAR ══ */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .topbar{height:60px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;padding:0 26px;gap:14px;background:rgba(8,9,14,0.96);backdrop-filter:blur(28px);flex-shrink:0;position:relative;z-index:200;}
        .tb-toggle{width:34px;height:34px;border:1px solid rgba(255,255,255,0.07);border-radius:8px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);transition:all .18s;font-size:11px;flex-shrink:0;}
        .tb-toggle:hover{border-color:rgba(184,255,0,0.25);color:#fff;background:rgba(184,255,0,0.05);}
        .tb-crumb{display:flex;align-items:center;gap:9px;}
        .tb-crumb-dot{width:6px;height:6px;border-radius:50%;background:rgba(184,255,0,0.5);}
        .tb-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;white-space:nowrap;}
        .tb-sep{color:rgba(255,255,255,0.1);margin:0 1px;}
        .tb-sub{font-size:12.5px;color:rgba(255,255,255,0.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .tb-spacer{flex:1;}
        .tb-clock{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,0.2);flex-shrink:0;}
        .tb-live-dot{width:5px;height:5px;border-radius:50%;background:#b8ff00;animation:blink 2s ease-in-out infinite;flex-shrink:0;}
        @keyframes blink{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(184,255,0,0.5)}50%{opacity:.3;box-shadow:0 0 0 4px rgba(184,255,0,0)}}

        /* Notif bell */
        .nw{position:relative;flex-shrink:0;}
        .nb{width:38px;height:38px;border:1px solid rgba(255,255,255,0.07);border-radius:9px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:all .18s;font-size:18px;position:relative;}
        .nb:hover{border-color:rgba(184,255,0,0.22);color:#fff;background:rgba(184,255,0,0.04);}
        .nb-badge{position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:50%;background:#ff4f72;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:#fff;border:2px solid #07080f;}
        .np{position:absolute;top:calc(100% + 12px);right:0;width:360px;background:rgba(9,10,17,0.99);border:1px solid rgba(255,255,255,0.09);border-radius:16px;backdrop-filter:blur(28px);box-shadow:0 28px 70px rgba(0,0,0,0.75),0 0 0 1px rgba(255,255,255,0.03);overflow:hidden;z-index:1000;}
        .np-head{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;}
        .np-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;}
        .np-clear{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(184,255,0,0.45);cursor:pointer;letter-spacing:.8px;background:none;border:none;transition:color .18s;}
        .np-clear:hover{color:#b8ff00;}
        .np-list{max-height:340px;overflow-y:auto;}
        .ni{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:background .15s;display:flex;gap:12px;align-items:flex-start;}
        .ni:hover{background:rgba(255,255,255,0.02);}
        .ni.unread{background:rgba(184,255,0,0.02);}
        .ni-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
        .ni-title{font-family:'Syne',sans-serif;font-size:12.5px;font-weight:600;color:#fff;margin-bottom:3px;}
        .ni-body{font-size:11px;color:rgba(255,255,255,0.38);line-height:1.5;}
        .ni-time{font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.18);margin-top:4px;}
        .ni-dot{width:5px;height:5px;border-radius:50%;background:#b8ff00;flex-shrink:0;margin-top:5px;}

        /* Token chip */
        .tok-chip{display:flex;align-items:center;gap:8px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.14);padding:7px 15px;border-radius:7px;flex-shrink:0;cursor:default;}
        .tok-n{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:#b8ff00;}
        .tok-l{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(184,255,0,0.4);letter-spacing:1.5px;text-transform:uppercase;}

        /* ══ CONTENT ══ */
        .content{flex:1;overflow-y:auto;padding:30px 32px;display:flex;flex-direction:column;gap:24px;}

        /* Page heading */
        .ph-eyebrow{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:10px;}
        .ph-eyebrow::before{content:'';width:22px;height:1px;background:rgba(255,255,255,0.12);}
        .ph-h1{font-family:'Syne',sans-serif;font-size:40px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1.05;margin-bottom:8px;}
        .ph-h1 .g{background:linear-gradient(135deg,#b8ff00,#00f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .ph-sub{font-size:14.5px;color:rgba(255,255,255,0.38);line-height:1.65;max-width:520px;}

        /* Stat grid */
        .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
        @media(max-width:1100px){.stat-grid{grid-template-columns:repeat(2,1fr);}}
        .stat{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:22px 24px;position:relative;overflow:hidden;transition:border-color .2s,transform .2s;}
        .stat:hover{border-color:rgba(255,255,255,0.09);transform:translateY(-2px);}
        .stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:16px 16px 0 0;}
        .stat.l::after{background:linear-gradient(90deg,#b8ff00,transparent);}
        .stat.t::after{background:linear-gradient(90deg,#00f0c8,transparent);}
        .stat.a::after{background:linear-gradient(90deg,#ff9500,transparent);}
        .stat.v::after{background:linear-gradient(90deg,#8b5cf6,transparent);}
        .stat-icon{font-size:24px;margin-bottom:12px;display:block;}
        .stat-n{font-family:'Syne',sans-serif;font-size:34px;font-weight:800;color:#fff;line-height:1;margin-bottom:5px;}
        .stat-label{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.2);letter-spacing:2.5px;text-transform:uppercase;}
        .stat-hint{font-size:11.5px;color:rgba(255,255,255,0.28);margin-top:6px;line-height:1.5;}

        /* Charts row */
        .cr{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:980px){.cr{grid-template-columns:1fr;}}

        /* Ring widget */
        .ring-widget{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;display:flex;align-items:center;gap:24px;}
        .ring-center{position:relative;flex-shrink:0;}
        .ring-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;}
        .ring-pct{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff;}
        .ring-sub{font-family:'JetBrains Mono',monospace;font-size:7px;color:rgba(255,255,255,0.22);letter-spacing:2px;text-transform:uppercase;}
        .ring-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:5px;}
        .ring-desc{font-size:12.5px;color:rgba(255,255,255,0.35);line-height:1.6;margin-bottom:16px;}
        .pbar{height:6px;background:rgba(255,255,255,0.05);border-radius:5px;overflow:hidden;margin-bottom:7px;}
        .pbar-f{height:100%;border-radius:5px;transition:width 1.4s cubic-bezier(.4,0,.2,1);}
        .pleg{display:flex;gap:18px;margin-top:10px;}
        .pleg-i{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.25);}
        .pleg-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0;}

        /* Chart card */
        .chart-card{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;}
        .cc-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;}
        .cc-sub{font-size:11.5px;color:rgba(255,255,255,0.25);margin-bottom:18px;}

        /* Section head */
        .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .sh-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#fff;}
        .sh-sub{font-size:12px;color:rgba(255,255,255,0.28);}

        /* Popular strip */
        .pop-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;}
        .pop-card{background:rgba(10,11,18,0.85);border:1px solid rgba(255,255,255,0.06);border-radius:13px;padding:18px 20px;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;gap:15px;}
        .pop-card:hover{background:rgba(11,13,22,1);transform:translateX(4px);border-color:rgba(184,255,0,0.2);}
        .pop-icon{font-size:28px;flex-shrink:0;}
        .pop-name{font-family:'Syne',sans-serif;font-size:14.5px;font-weight:700;color:#fff;margin-bottom:3px;}
        .pop-desc{font-size:12px;color:rgba(255,255,255,0.32);line-height:1.5;}
        .pop-arr{margin-left:auto;color:rgba(255,255,255,0.1);font-size:22px;flex-shrink:0;transition:all .2s;}
        .pop-card:hover .pop-arr{transform:translateX(5px);color:rgba(184,255,0,0.5);}

        /* Tool grid */
        .tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;}
        .tc{background:rgba(10,11,18,0.85);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:26px;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);text-align:left;width:100%;position:relative;overflow:hidden;}
        .tc:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,0.5);}
        .tc.l:hover{border-color:rgba(184,255,0,0.25);box-shadow:0 20px 50px rgba(0,0,0,0.5),0 0 0 1px rgba(184,255,0,0.08);}
        .tc.t:hover{border-color:rgba(0,240,200,0.25);box-shadow:0 20px 50px rgba(0,0,0,0.5),0 0 0 1px rgba(0,240,200,0.08);}
        .tc-badges{position:absolute;top:14px;right:14px;display:flex;gap:5px;}
        .tc-badge{font-family:'JetBrains Mono',monospace;font-size:7px;padding:3px 8px;border-radius:4px;letter-spacing:.8px;text-transform:uppercase;}
        .tc-icon{font-size:32px;margin-bottom:16px;display:block;}
        .tc-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;}
        .tc-desc{font-size:12.5px;color:rgba(255,255,255,0.36);line-height:1.75;margin-bottom:18px;}
        .tc-foot{display:flex;align-items:center;justify-content:space-between;}
        .tc-cost{font-family:'JetBrains Mono',monospace;font-size:10.5px;}
        .tc-tier{font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 9px;border-radius:4px;letter-spacing:.8px;}

        /* Activity list */
        .act-list{display:flex;flex-direction:column;gap:8px;}
        .act-i{display:flex;align-items:center;gap:13px;padding:14px 18px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.04);border-radius:11px;cursor:pointer;transition:all .15s;}
        .act-i:hover{border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.025);}
        .act-icon{font-size:19px;flex-shrink:0;}
        .act-tool{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#fff;}
        .act-msg{font-size:12px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .act-meta{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
        .act-time{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.16);}

        /* Tips */
        .tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:12px;}
        .tip{background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.04);border-radius:13px;padding:20px;}
        .tip-icon{font-size:24px;margin-bottom:12px;}
        .tip-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;margin-bottom:7px;}
        .tip-desc{font-size:12.5px;color:rgba(255,255,255,0.36);line-height:1.7;}

        /* Upgrade bar */
        .ubar{background:linear-gradient(135deg,rgba(184,255,0,0.05),rgba(0,240,200,0.03));border:1px solid rgba(184,255,0,0.13);border-radius:16px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;}
        .ubar-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:5px;}
        .ubar-sub{font-size:13px;color:rgba(255,255,255,0.36);line-height:1.65;max-width:400px;}

        /* Buttons */
        .btn-p{padding:12px 24px;background:#b8ff00;color:#07080f;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;}
        .btn-p:hover{background:#cbff1a;box-shadow:0 0 30px rgba(184,255,0,0.35);}
        .btn-g{padding:12px 24px;background:transparent;color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:13.5px;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;font-weight:500;}
        .btn-g:hover{border-color:rgba(255,255,255,0.18);color:#fff;}

        /* ══ BILLING PAGE ══ */
        .bill-hero{position:relative;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,0.06);padding:60px 50px 52px;text-align:center;background:radial-gradient(ellipse at 50% -10%,rgba(184,255,0,0.07) 0%,transparent 60%),linear-gradient(180deg,rgba(10,12,20,0.99),rgba(8,10,16,0.98));margin-bottom:32px;}
        .bh-bg-orb{position:absolute;border-radius:50%;pointer-events:none;}
        .bh-o1{width:500px;height:500px;top:-250px;left:-100px;background:radial-gradient(circle,rgba(184,255,0,0.05),transparent 65%);animation:of 8s ease-in-out infinite;}
        .bh-o2{width:380px;height:380px;bottom:-200px;right:-80px;background:radial-gradient(circle,rgba(0,240,200,0.05),transparent 65%);animation:of 8s ease-in-out infinite;animation-delay:-4s;}
        .bh-o3{width:200px;height:200px;top:50%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(184,255,0,0.04),transparent 65%);animation:of 5s ease-in-out infinite;animation-delay:-2s;}
        @keyframes of{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.08) translateY(-18px)}}
        .bh-o3{animation:of3 5s ease-in-out infinite;}
        @keyframes of3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.1)}}
        .bh-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.18);padding:8px 18px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#b8ff00;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:26px;}
        .bh-title{font-family:'Syne',sans-serif;font-size:52px;font-weight:800;letter-spacing:-2.5px;color:#fff;line-height:1.02;margin-bottom:16px;}
        .bh-title .g{background:linear-gradient(135deg,#b8ff00 20%,#00f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .bh-sub{font-size:16px;color:rgba(255,255,255,0.42);max-width:460px;margin:0 auto 34px;line-height:1.7;}

        /* Cycle toggle */
        .cy-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;}
        .cy-pill{display:inline-flex;align-items:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:60px;padding:4px;gap:0;}
        .cy-btn{padding:10px 32px;border-radius:60px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;transition:all .24s cubic-bezier(.4,0,.2,1);background:transparent;color:rgba(255,255,255,0.3);letter-spacing:.2px;}
        .cy-btn.m{background:#b8ff00;color:#07080f;box-shadow:0 4px 24px rgba(184,255,0,0.35);}
        .cy-btn.y{background:linear-gradient(135deg,#00f0c8,#b8ff00);color:#07080f;box-shadow:0 4px 24px rgba(0,240,200,0.3);}
        .cy-note{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#00f0c8;letter-spacing:1.5px;text-transform:uppercase;}

        /* Plan cards */
        .plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin-bottom:32px;}
        .plan{border-radius:20px;padding:30px 26px;transition:all .24s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;cursor:pointer;}
        .plan:hover{transform:translateY(-7px);}
        .plan.popular{box-shadow:0 0 0 1.5px rgba(0,240,200,0.4),0 24px 70px rgba(0,240,200,0.09);}
        .plan-pop-label{position:absolute;top:0;left:50%;transform:translateX(-50%);font-family:'JetBrains Mono',monospace;font-size:8px;padding:5px 18px;border-radius:0 0 9px 9px;background:linear-gradient(90deg,#00f0c8,#b8ff00);color:#07080f;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;}
        .plan-topbar{position:absolute;top:0;left:0;right:0;height:3px;}
        .plan-icon{font-size:32px;margin-bottom:16px;display:block;}
        .plan-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;}
        .price-row{display:flex;align-items:baseline;gap:5px;margin-bottom:4px;}
        .price-main{font-family:'Syne',sans-serif;font-size:40px;font-weight:800;color:#fff;line-height:1;}
        .price-period{font-size:13px;color:rgba(255,255,255,0.28);margin-left:1px;}
        .price-orig{font-family:'Syne',sans-serif;font-size:14px;color:rgba(255,255,255,0.18);text-decoration:line-through;}
        .plan-save{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 10px;border-radius:4px;letter-spacing:1px;margin-bottom:6px;margin-top:4px;}
        .plan-tok-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase;margin-bottom:22px;}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}
        .plan-feats li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:rgba(255,255,255,0.62);line-height:1.45;}
        .feat-check{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px;}
        .plan-cta{width:100%;padding:14px;border-radius:11px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:none;letter-spacing:.2px;}
        .plan-cta:hover{transform:scale(1.02);}
        .plan-cta.cur{background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.28);cursor:default;}
        .plan-cta.cur:hover{transform:none;}
        .plan-cta.up{box-shadow:0 4px 22px rgba(0,0,0,0.3);}
        .plan-yr-note{text-align:center;margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:8px;color:rgba(255,255,255,0.16);letter-spacing:.8px;}

        /* Usage cards */
        .u-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:13px;}
        .u-card{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:20px;}
        .u-label{font-family:'JetBrains Mono',monospace;font-size:7.5px;color:rgba(255,255,255,0.18);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:9px;}
        .u-val{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;line-height:1;}
        .u-sub{font-size:10.5px;color:rgba(255,255,255,0.22);margin-top:5px;}

        /* ══ SETTINGS PAGE ══ */
        .set-header{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:18px;padding:32px 36px;margin-bottom:4px;}
        .set-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:860px){.set-grid{grid-template-columns:1fr;}}
        .set-card{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;}
        .set-card-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:18px;display:flex;align-items:center;gap:10px;}
        .set-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
        .set-row:last-child{border-bottom:none;}
        .set-key{font-size:13px;color:rgba(255,255,255,0.38);}
        .set-val{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#fff;}

        /* ══ TOOL PANEL ══ */
        .tabs-row{display:flex;align-items:center;gap:12px;}
        .tabs{display:flex;gap:2px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:3px;}
        .tab{padding:8px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.35);transition:all .16s;}
        .tab.active{background:rgba(184,255,0,0.09);color:#b8ff00;border:1px solid rgba(184,255,0,0.16);}
        .tp{background:rgba(10,11,18,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;}
        .tp.l{border-color:rgba(184,255,0,0.18);}
        .tp.t{border-color:rgba(0,240,200,0.18);}
        .tp-head{padding:22px 26px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:16px;}
        .tp-ico{font-size:28px;}
        .tp-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#fff;}
        .tp-desc{font-size:12.5px;color:rgba(255,255,255,0.32);margin-top:3px;}
        .tp-badges{margin-left:auto;display:flex;gap:8px;align-items:center;flex-shrink:0;}
        .badge{font-family:'JetBrains Mono',monospace;font-size:8px;padding:4px 10px;border-radius:5px;letter-spacing:.8px;text-transform:uppercase;}
        .badge.l{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.16);}
        .badge.t{color:#00f0c8;background:rgba(0,240,200,0.08);border:1px solid rgba(0,240,200,0.16);}
        .badge.a{color:#ff9500;background:rgba(255,149,0,0.08);border:1px solid rgba(255,149,0,0.16);}
        .tp-body{padding:24px 26px;}
        .fl{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:block;}
        textarea{width:100%;background:rgba(6,7,14,0.85);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px;color:#fff;font-size:14px;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:140px;transition:border-color .2s;line-height:1.8;}
        textarea:focus{border-color:rgba(184,255,0,0.3);}
        textarea::placeholder{color:rgba(255,255,255,0.08);}
        .tp-foot{display:flex;align-items:center;gap:16px;margin-top:18px;flex-wrap:wrap;}
        .run-btn{padding:14px 30px;background:#b8ff00;color:#07080f;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:9px;flex-shrink:0;}
        .run-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 0 30px rgba(184,255,0,0.38);}
        .run-btn:disabled{opacity:.42;cursor:not-allowed;}
        .run-btn.t{background:#00f0c8;}
        .run-btn.t:hover:not(:disabled){background:#00ffd8;box-shadow:0 0 30px rgba(0,240,200,0.38);}
        .cost-hint{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:rgba(255,255,255,0.16);}
        .spinner{width:14px;height:14px;border:2.5px solid rgba(7,8,15,.25);border-top-color:#07080f;border-radius:50%;animation:spin .65s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .qbar{background:rgba(184,255,0,0.04);border:1px solid rgba(184,255,0,0.1);border-radius:11px;padding:14px 20px;display:flex;align-items:center;gap:13px;margin-top:14px;}
        .qbar.t{background:rgba(0,240,200,0.04);border-color:rgba(0,240,200,0.1);}
        .qdot{width:7px;height:7px;border-radius:50%;background:#b8ff00;animation:blink 1.2s infinite;flex-shrink:0;}
        .qdot.t{background:#00f0c8;}
        .qtext{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,0.36);flex:1;}
        .qtime{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.16);}
        .err-box{background:rgba(255,79,114,0.05);border:1px solid rgba(255,79,114,0.16);border-radius:10px;padding:13px 18px;font-size:13px;color:#ff7a95;margin-top:12px;display:flex;align-items:flex-start;gap:9px;line-height:1.6;}
        .res-card{background:rgba(8,9,18,0.99);border:1px solid rgba(184,255,0,0.18);border-radius:16px;overflow:hidden;}
        .res-card.t{border-color:rgba(0,240,200,0.18);}
        .rc-head{padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .rc-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2.5px;text-transform:uppercase;flex:1;}
        .rc-meta{display:flex;gap:8px;align-items:center;}
        .rc-body{padding:24px 26px;max-height:540px;overflow-y:auto;}
        .rc-body pre{white-space:pre-wrap;word-break:break-word;font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.88);line-height:1.9;}
        .hist-list{display:flex;flex-direction:column;gap:10px;}
        .hi{background:rgba(10,11,18,0.85);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px 20px;cursor:pointer;transition:all .18s;}
        .hi:hover{border-color:rgba(255,255,255,0.09);}
        .hi-top{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
        .hi-name{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#fff;}
        .hi-time{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,0.16);margin-left:auto;}
        .hi-msg{font-size:12.5px;color:rgba(255,255,255,0.32);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .hi-meta{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
        .pdot{display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.8px;}
        .pdot-d{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .empty{text-align:center;padding:64px 24px;}
        .empty-ico{font-size:42px;margin-bottom:18px;}
        .empty-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:10px;}
        .empty-sub{font-size:13.5px;color:rgba(255,255,255,0.32);line-height:1.7;}
      `}</style>

      <div className="layout">

        {/* ══ SIDEBAR ══ */}
        <div className="sidebar">
          <div className="sb-glow"/>

          {/* Brand */}
          <div className="sb-brand">
            <div className="sb-mark">R</div>
            <div>
              <div className="sb-brand-name">REIOGN</div>
              <div className="sb-brand-tag">AI Intelligence Platform</div>
            </div>
          </div>

          <div className="sb-scroll">
            {/* Workspace */}
            <div className="sb-label">Workspace</div>
            <button className={`sb-item ${mainView==='home'&&!activeTool?'ho':''}`} onClick={goHome}>
              <span className="sb-icon">🏠</span>
              <div style={{flex:1,minWidth:0}}>
                <span className="sb-name">Dashboard</span>
                <span className="sb-meta">Overview & analytics</span>
              </div>
            </button>

            {/* Token mini-bar */}
            <div className="sb-tok">
              <div className="sb-tok-top">
                <span className="sb-tok-label">Tokens Left</span>
                <span className="sb-tok-n">{tokens?.balance?.toLocaleString()??'—'}</span>
              </div>
              <div className="sb-prog">
                <div className="sb-prog-f" style={{width:`${tokenPct}%`}}/>
              </div>
            </div>

            {/* AI Tools */}
            <div className="sb-label" style={{marginTop:8}}>AI Tools</div>
            {TOOLS.map(t=>(
              <button key={t.id}
                className={`sb-item ${activeTool?.id===t.id?(t.color==='teal'?'at':'ai'):''}`}
                onClick={()=>selectTool(t)}>
                <span className="sb-icon">{t.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <span className="sb-name">{t.name}</span>
                  <span className="sb-meta">{t.cost} tokens · {t.tier}</span>
                </div>
                <div className="sb-dot" style={{background:TIER_COLORS[t.tier],boxShadow:`0 0 6px ${TIER_COLORS[t.tier]}66`}}/>
              </button>
            ))}

            {/* Account */}
            <div className="sb-div"/>
            <div className="sb-label">Account</div>
            <button className={`sb-item ${mainView==='billing'?'bi':''}`}
              onClick={()=>{setMainView('billing');setActiveTool(null)}}>
              <span className="sb-icon">💳</span>
              <div style={{flex:1,minWidth:0}}>
                <span className="sb-name">Billing & Plans</span>
                <span className="sb-meta" style={{color:currentPlan.color}}>{currentPlan.name} plan active</span>
              </div>
            </button>
            <button className={`sb-item ${mainView==='settings'?'si':''}`}
              onClick={()=>{setMainView('settings');setActiveTool(null)}}>
              <span className="sb-icon">⚙️</span>
              <div style={{flex:1,minWidth:0}}>
                <span className="sb-name">Settings</span>
                <span className="sb-meta">Account & preferences</span>
              </div>
            </button>
            <div style={{height:14}}/>
          </div>

          {/* User footer */}
          <div className="sb-foot">
            {user&&(
              <div className="sb-ucard">
                <div className="sb-av">{(user.name?.slice(0,2)??'RE').toUpperCase()}</div>
                <div style={{flex:1,minWidth:0}}>
                  <span className="sb-uname">{user.name}</span>
                  <span className="sb-uemail">{user.email}</span>
                </div>
                <span className="sb-chip" style={{color:currentPlan.color,background:`${currentPlan.color}14`,border:`1px solid ${currentPlan.color}28`}}>
                  {currentPlan.name}
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
            <button className="tb-toggle" onClick={()=>setSidebarOpen(o=>!o)}>
              {sidebarOpen?'◀':'▶'}
            </button>

            <div className="tb-crumb">
              <div className="tb-crumb-dot"/>
              <span className="tb-title">
                {mainView==='billing'?'Billing & Plans':mainView==='settings'?'Settings':activeTool?activeTool.name:'Dashboard'}
              </span>
              {activeTool&&<>
                <span className="tb-sep">›</span>
                <span className="tb-sub">Run Tool</span>
              </>}
            </div>

            <div className="tb-spacer"/>

            <div className="tb-clock">
              <div className="tb-live-dot"/>
              {liveTime.toLocaleTimeString()}
            </div>

            {/* Notifications */}
            <div className="nw" ref={notifRef}>
              <button className="nb" onClick={()=>setNotifOpen(o=>!o)}>
                🔔
                {unread>0&&<div className="nb-badge">{unread}</div>}
              </button>
              {notifOpen&&(
                <div className="np">
                  <div className="np-head">
                    <span className="np-title">Notifications</span>
                    <button className="np-clear" onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))}>
                      Mark all read
                    </button>
                  </div>
                  <div className="np-list">
                    {notifs.map(n=>(
                      <div key={n.id} className={`ni ${!n.read?'unread':''}`}
                        onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}>
                        <div className="ni-icon" style={{background:`${n.color}14`}}>{n.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="ni-title">{n.title}</div>
                          <div className="ni-body">{n.body}</div>
                          <div className="ni-time">{n.time}</div>
                        </div>
                        {!n.read&&<div className="ni-dot"/>}
                      </div>
                    ))}
                    {!notifs.length&&(
                      <div style={{padding:'32px 18px',textAlign:'center',color:'rgba(255,255,255,0.15)',fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:2}}>
                        ALL CAUGHT UP ✓
                      </div>
                    )}
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

            {/* ════ BILLING ════ */}
            {mainView==='billing'&&(
              <>
                {/* Hero */}
                <div className="bill-hero">
                  <div className="bh-bg-orb bh-o1"/>
                  <div className="bh-bg-orb bh-o2"/>
                  <div className="bh-bg-orb bh-o3"/>
                  <div className="bh-chip">
                    <span style={{width:7,height:7,borderRadius:'50%',background:'#b8ff00',display:'inline-block',animation:'blink 2s infinite'}}/>
                    Subscription Management
                  </div>
                  <div className="bh-title">
                    Upgrade Your<br/><span className="g">Intelligence.</span>
                  </div>
                  <div className="bh-sub">
                    More tokens. More tools. More leverage.<br/>Pick the plan that matches your ambition — scale any time.
                  </div>
                  <div className="cy-wrap">
                    <div className="cy-pill">
                      <button className={`cy-btn ${billingCycle==='monthly'?'m':''}`} onClick={()=>setBillingCycle('monthly')}>Monthly</button>
                      <button className={`cy-btn ${billingCycle==='yearly'?'y':''}`} onClick={()=>setBillingCycle('yearly')}>Yearly</button>
                    </div>
                    {billingCycle==='yearly'&&(
                      <div className="cy-note">
                        <span style={{width:7,height:7,borderRadius:'50%',background:'#00f0c8',display:'inline-block'}}/>
                        Up to 30% off — billed annually
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan cards */}
                <div className="plans-grid">
                  {PLANS.map((plan,idx)=>{
                    const isCurrent=user?.plan===plan.id
                    const price=billingCycle==='yearly'?plan.yearlyPrice:plan.monthlyPrice
                    const orig=billingCycle==='yearly'&&plan.monthlyRaw>0?plan.monthlyPrice:null
                    return (
                      <div key={plan.id}
                        className={`plan ${plan.popular?'popular':''}`}
                        style={{background:`linear-gradient(160deg,rgba(11,13,22,0.98) 0%,${plan.glow} 120%)`,border:`1px solid ${isCurrent?plan.border:plan.border.replace('0.3','0.09').replace('0.25','0.09').replace('0.35','0.09')}`}}>
                        <div className="plan-topbar" style={{background:`linear-gradient(90deg,${plan.color},transparent)`}}/>
                        {plan.popular&&<div className="plan-pop-label">⭐ Most Popular</div>}
                        {isCurrent&&!plan.popular&&(
                          <div style={{position:'absolute',top:13,right:13,fontFamily:"'JetBrains Mono',monospace",fontSize:7,padding:'3px 10px',borderRadius:4,background:`${plan.color}14`,color:plan.color,border:`1px solid ${plan.color}28`,letterSpacing:'.8px',textTransform:'uppercase'}}>
                            ● Current
                          </div>
                        )}
                        <div className="plan-icon" style={{marginTop:plan.popular?24:0}}>{plan.icon}</div>
                        <div className="plan-name" style={{color:plan.color}}>{plan.name}</div>
                        <div className="price-row">
                          <div className="price-main">{price}</div>
                          {plan.monthlyRaw>0&&<span className="price-period">/mo</span>}
                          {orig&&<span className="price-orig">{orig}</span>}
                        </div>
                        {billingCycle==='yearly'&&plan.yearlySave?(
                          <div className="plan-save" style={{background:`${plan.color}10`,color:plan.color,border:`1px solid ${plan.color}22`}}>
                            💰 {plan.yearlySave}
                          </div>
                        ):<div style={{height:8}}/>}
                        <div className="plan-tok-label">{plan.tokens.toLocaleString()} tokens / month</div>
                        <ul className="plan-feats">
                          {plan.features.map((f,i)=>(
                            <li key={i}>
                              <span className="feat-check" style={{color:plan.color}}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          className={`plan-cta ${isCurrent?'cur':'up'}`}
                          style={!isCurrent?{background:plan.color,color:'#07080f'}:{}}
                          onClick={()=>{}}>
                          {isCurrent?'Current Plan':`Get ${plan.name} ${billingCycle==='yearly'?'Yearly':'Monthly'} →`}
                        </button>
                        {billingCycle==='yearly'&&plan.yearlyRaw>0&&(
                          <div className="plan-yr-note">Billed ₹{(plan.yearlyRaw*12).toLocaleString()} / year</div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Usage breakdown */}
                <div>
                  <div className="sh">
                    <span className="sh-title">Usage This Cycle</span>
                    <span style={{display:'flex',alignItems:'center',gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#b8ff00',letterSpacing:1.5,textTransform:'uppercase'}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#b8ff00',display:'inline-block',animation:'blink 2s infinite'}}/>
                      Live
                    </span>
                  </div>
                  <div className="u-strip">
                    {[
                      {label:'Tokens Left',  val:tokens?.balance?.toLocaleString()??'—',  sub:`${tokenPct}% remaining`,    color:'#b8ff00'},
                      {label:'Tokens Used',  val:tokens?.totalSpent?.toLocaleString()??'0',sub:'This billing cycle',        color:'#00f0c8'},
                      {label:'Sessions',     val:String(history.length),                   sub:'Total tool runs',           color:'#ff9500'},
                      {label:'Plan Limit',   val:currentPlan.tokens.toLocaleString(),      sub:`${currentPlan.name} plan`,  color:'rgba(255,255,255,0.35)'},
                    ].map((s,i)=>(
                      <div key={i} className="u-card">
                        <div className="u-label">{s.label}</div>
                        <div className="u-val" style={{color:s.color}}>{s.val}</div>
                        <div className="u-sub">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:16,background:'rgba(255,255,255,0.015)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:12,padding:'18px 22px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:11}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:2.5,textTransform:'uppercase'}}>Token Consumption</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#b8ff00',fontWeight:600}}>{tokenPct}% remaining</span>
                    </div>
                    <div style={{height:8,background:'rgba(255,255,255,0.04)',borderRadius:6,overflow:'hidden'}}>
                      <div style={{width:`${tokenPct}%`,height:'100%',background:'linear-gradient(90deg,#b8ff00,#00f0c8)',borderRadius:6,transition:'width 1.2s cubic-bezier(.4,0,.2,1)',boxShadow:'0 0 12px rgba(184,255,0,0.4)'}}/>
                    </div>
                  </div>
                </div>

                <div style={{height:16}}/>
              </>
            )}

            {/* ════ SETTINGS ════ */}
            {mainView==='settings'&&(
              <>
                <div className="set-header">
                  <div className="ph-eyebrow">Account</div>
                  <div className="ph-h1" style={{fontSize:34}}>Settings</div>
                  <div className="ph-sub">Manage your profile, subscription, and workspace preferences.</div>
                </div>
                <div className="set-grid">
                  <div className="set-card">
                    <div className="set-card-title"><span>👤</span> Profile</div>
                    <div className="set-row"><span className="set-key">Full Name</span><span className="set-val">{user?.name??'—'}</span></div>
                    <div className="set-row"><span className="set-key">Email</span><span className="set-val" style={{fontSize:10}}>{user?.email??'—'}</span></div>
                    <div className="set-row"><span className="set-key">Member Since</span><span className="set-val">2025</span></div>
                    <div className="set-row"><span className="set-key">User ID</span><span className="set-val" style={{fontSize:9,color:'rgba(255,255,255,0.28)'}}>{user?.id?.slice(0,20)??'—'}…</span></div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title"><span>💳</span> Subscription</div>
                    <div className="set-row"><span className="set-key">Current Plan</span><span className="set-val" style={{color:currentPlan.color}}>{currentPlan.name}</span></div>
                    <div className="set-row"><span className="set-key">Monthly Tokens</span><span className="set-val">{currentPlan.tokens.toLocaleString()}</span></div>
                    <div className="set-row"><span className="set-key">Tokens Remaining</span><span className="set-val" style={{color:'#b8ff00'}}>{tokens?.balance?.toLocaleString()??'—'}</span></div>
                    <div className="set-row"><span className="set-key">Tokens Used</span><span className="set-val">{tokens?.totalSpent?.toLocaleString()??'0'}</span></div>
                    <div style={{marginTop:16}}>
                      <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>setMainView('billing')}>
                        Manage Plan →
                      </button>
                    </div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title"><span>🤖</span> AI Model Routing</div>
                    {[
                      {name:'Claude AI',  role:'Heavy tools · 30 tkn',  color:'#b8ff00',  tier:'HEAVY'},
                      {name:'Gemini Pro', role:'Medium tools · 15 tkn', color:'#00f0c8',  tier:'MEDIUM'},
                      {name:'Groq LLaMA', role:'Light tools · 5 tkn',   color:'#ff9500',  tier:'LIGHT'},
                    ].map((m,i)=>(
                      <div key={i} className="set-row">
                        <span className="set-key" style={{display:'flex',alignItems:'center',gap:9}}>
                          <span style={{width:8,height:8,borderRadius:'50%',background:m.color,boxShadow:`0 0 8px ${m.color}`,display:'inline-block'}}/>
                          {m.name}
                        </span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:1.2,color:m.color}}>{m.tier}</span>
                      </div>
                    ))}
                    <div style={{marginTop:16,padding:'12px 14px',background:'rgba(184,255,0,0.04)',border:'1px solid rgba(184,255,0,0.09)',borderRadius:9,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(184,255,0,0.45)',lineHeight:1.7}}>
                      Auto-routing selects the best model per tool. Tokens are automatically refunded on any failure.
                    </div>
                  </div>
                  <div className="set-card">
                    <div className="set-card-title"><span>🔒</span> Security & Privacy</div>
                    <div className="set-row"><span className="set-key">Password</span><span className="set-val">••••••••</span></div>
                    <div className="set-row"><span className="set-key">Two-Factor Auth</span><span className="set-val" style={{color:'rgba(255,149,0,0.7)',fontSize:10}}>Not enabled</span></div>
                    <div className="set-row"><span className="set-key">Session data</span><span className="set-val" style={{fontSize:10}}>Stored locally</span></div>
                    <div className="set-row"><span className="set-key">Data retention</span><span className="set-val" style={{fontSize:10}}>30 days</span></div>
                  </div>
                  <div className="set-card" style={{gridColumn:'1/-1'}}>
                    <div className="set-card-title"><span>⚠️</span> Danger Zone</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.28)',marginBottom:20,lineHeight:1.7}}>These actions are permanent and cannot be undone. Proceed with care.</div>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                      <button onClick={logout} style={{padding:'12px 22px',background:'rgba(255,79,114,0.06)',border:'1px solid rgba(255,79,114,0.18)',borderRadius:10,color:'#ff6b8a',fontSize:13,cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:600,transition:'all .18s'}}>
                        Sign Out of REIOGN →
                      </button>
                      <button style={{padding:'12px 22px',background:'rgba(255,79,114,0.03)',border:'1px solid rgba(255,79,114,0.08)',borderRadius:10,color:'rgba(255,79,114,0.35)',fontSize:13,cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:600}}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════ HOME ════ */}
            {mainView==='home'&&!activeTool&&(
              <>
                <div>
                  <div className="ph-eyebrow">Welcome back</div>
                  <div className="ph-h1">Hey, <span className="g">{firstName}</span> 👋</div>
                  <div className="ph-sub">Your AI performance toolkit is live. Every tool is precision-engineered for execution.</div>
                  <div style={{display:'flex',gap:10,marginTop:20,flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={()=>selectTool(TOOLS[0])}>⚡ Start Deep Work</button>
                    <button className="btn-g" onClick={()=>setMainView('billing')}>💳 View Plans</button>
                  </div>
                </div>

                {/* Stats */}
                <div className="stat-grid">
                  <div className="stat l">
                    <span className="stat-icon">🪙</span>
                    <div className="stat-n" style={{color:'#b8ff00'}}>{tokens?.balance?.toLocaleString()??'—'}</div>
                    <div className="stat-label">Tokens Remaining</div>
                    <div className="stat-hint">{tokenPct}% of {currentPlan.tokens.toLocaleString()} total</div>
                  </div>
                  <div className="stat t">
                    <span className="stat-icon">📈</span>
                    <div className="stat-n" style={{color:'#00f0c8'}}>{tokens?.totalSpent?.toLocaleString()??'0'}</div>
                    <div className="stat-label">Tokens Used</div>
                    <div className="stat-hint">This billing cycle</div>
                  </div>
                  <div className="stat a">
                    <span className="stat-icon">⚡</span>
                    <div className="stat-n" style={{color:'#ff9500'}}>{history.length}</div>
                    <div className="stat-label">Sessions Run</div>
                    <div className="stat-hint">{history.length>0?`Last: ${new Date(history[0].timestamp).toLocaleTimeString()}`:'No sessions yet'}</div>
                  </div>
                  <div className="stat v">
                    <span className="stat-icon">🛠️</span>
                    <div className="stat-n" style={{color:'#a78bfa'}}>{TOOLS.length}</div>
                    <div className="stat-label">AI Tools</div>
                    <div className="stat-hint">All unlocked</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="cr">
                  <div className="ring-widget">
                    <div className="ring-center">
                      <RingChart pct={tokenPct} color="#b8ff00" size={148}/>
                      <div className="ring-overlay">
                        <div className="ring-pct">{tokenPct}%</div>
                        <div className="ring-sub">Left</div>
                      </div>
                    </div>
                    <div style={{flex:1}}>
                      <div className="ring-title">Token Balance</div>
                      <div className="ring-desc">{tokens?.balance?.toLocaleString()??'—'} remaining of {currentPlan.tokens.toLocaleString()} on the {currentPlan.name} plan.</div>
                      <div className="pbar">
                        <div className="pbar-f" style={{width:`${tokenPct}%`,background:'linear-gradient(90deg,#b8ff00,#00f0c8)',boxShadow:'0 0 12px rgba(184,255,0,0.35)'}}/>
                      </div>
                      <div className="pbar">
                        <div className="pbar-f" style={{width:`${Math.min(100,Math.round(((tokens?.totalSpent??0)/currentPlan.tokens)*100))}%`,background:'rgba(255,149,0,0.5)'}}/>
                      </div>
                      <div className="pleg">
                        <div className="pleg-i"><div className="pleg-dot" style={{background:'#b8ff00'}}/>Remaining</div>
                        <div className="pleg-i"><div className="pleg-dot" style={{background:'rgba(255,149,0,0.5)'}}/>Used</div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="cc-title">Session Activity</div>
                    <div className="cc-sub">Tokens per session · last {Math.min(14,sparkData.length)} runs</div>
                    <Sparkline data={sparkData} color="#00f0c8" h={80}/>
                  </div>
                </div>

                {/* Tool usage */}
                <div className="chart-card">
                  <div className="cc-title">Tool Usage Breakdown</div>
                  <div className="cc-sub" style={{marginBottom:20}}>Token consumption by tool — all sessions</div>
                  <ToolBars history={history}/>
                </div>

                {/* Popular */}
                <div>
                  <div className="sh">
                    <span className="sh-title">🔥 Most Popular</span>
                    <span className="sh-sub">Top rated across all users</span>
                  </div>
                  <div className="pop-strip">
                    {TOOLS.filter(t=>['COGNITIVE_CLONE','DECISION_SIMULATOR','OPPORTUNITY_RADAR'].includes(t.id)).map(tool=>(
                      <div key={tool.id} className="pop-card" onClick={()=>selectTool(tool)}>
                        <span className="pop-icon">{tool.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="pop-name">{tool.name}</div>
                          <div className="pop-desc">{tool.desc.slice(0,68)}…</div>
                        </div>
                        <span className="pop-arr">›</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All tools */}
                <div>
                  <div className="sh">
                    <span className="sh-title">All AI Tools</span>
                    <span className="sh-sub">10 purpose-built intelligence tools</span>
                  </div>
                  <div className="tool-grid">
                    {TOOLS.map(tool=>{
                      const isHot=['COGNITIVE_CLONE','OPPORTUNITY_RADAR','DECISION_SIMULATOR'].includes(tool.id)
                      const isNew=['WEALTH_MAPPER','MEMORY_INTELLIGENCE'].includes(tool.id)
                      return (
                        <button key={tool.id} className={`tc ${tool.color==='lime'?'l':'t'}`} onClick={()=>selectTool(tool)}>
                          <div className="tc-badges">
                            {isHot&&<span className="tc-badge" style={{color:'#ff9500',background:'rgba(255,149,0,0.09)',border:'1px solid rgba(255,149,0,0.2)'}}>🔥 Hot</span>}
                            {isNew&&<span className="tc-badge" style={{color:'#b8ff00',background:'rgba(184,255,0,0.07)',border:'1px solid rgba(184,255,0,0.17)'}}>✦ New</span>}
                          </div>
                          <span className="tc-icon">{tool.icon}</span>
                          <div className="tc-name">{tool.name}</div>
                          <div className="tc-desc">{tool.desc}</div>
                          <div className="tc-foot">
                            <span className="tc-cost" style={{color:tool.color==='lime'?'rgba(184,255,0,0.55)':'rgba(0,240,200,0.55)'}}>{tool.cost} tokens</span>
                            <span className="tc-tier" style={{color:TIER_COLORS[tool.tier],background:`${TIER_COLORS[tool.tier]}12`,border:`1px solid ${TIER_COLORS[tool.tier]}26`}}>{tool.tier}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Recent activity */}
                {history.length>0&&(
                  <div>
                    <div className="sh">
                      <span className="sh-title">Recent Activity</span>
                      <span className="sh-sub">Last {Math.min(5,history.length)} sessions</span>
                    </div>
                    <div className="act-list">
                      {history.slice(0,5).map(item=>{
                        const tool=TOOLS.find(t=>t.name===item.tool)
                        return (
                          <div key={item.id} className="act-i" onClick={()=>{
                            if(tool){
                              selectTool(tool)
                              setResult({tool:item.tool,result:item.result,tokensUsed:item.tokensUsed,tokensRemaining:tokens?.balance??0,model:item.model,provider:item.provider,durationMs:item.durationMs})
                            }
                          }}>
                            <span className="act-icon">{tool?.icon??'🤖'}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div className="act-tool">{item.tool}</div>
                              <div className="act-msg">{item.message}</div>
                            </div>
                            <div className="act-meta">
                              <span className="act-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8.5,color:'rgba(184,255,0,0.5)'}}>{item.tokensUsed} tkn</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div>
                  <div className="sh"><span className="sh-title">💡 Pro Tips</span></div>
                  <div className="tips-grid">
                    {[
                      {icon:'⚡',title:'Chain tools for 10x output',desc:'Run Opportunity Radar first, feed its output into Decision Simulator for compounded intelligence.'},
                      {icon:'🎯',title:'Context = precision',desc:'Numbers, timelines, constraints — the more specific you are, the more precise and actionable your output.'},
                      {icon:'🔄',title:'Tokens refunded on error',desc:'If any tool fails for any reason, tokens are automatically refunded. Zero risk on every run.'},
                      {icon:'🧠',title:'Heavy tier = Claude AI',desc:'HEAVY tools run on Anthropic Claude — the gold standard for complex multi-step reasoning.'},
                    ].map((tip,i)=>(
                      <div key={i} className="tip">
                        <div className="tip-icon">{tip.icon}</div>
                        <div className="tip-title">{tip.title}</div>
                        <div className="tip-desc">{tip.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade CTA */}
                {user?.plan==='TRIAL'&&(
                  <div className="ubar">
                    <div>
                      <div className="ubar-title">You&apos;re on the Free Trial</div>
                      <div className="ubar-sub">Upgrade to Starter for 2,000 tokens every month — enough for 130+ deep work sessions and real traction.</div>
                    </div>
                    <button className="btn-p" onClick={()=>setMainView('billing')}>Upgrade Now →</button>
                  </div>
                )}
                <div style={{height:20}}/>
              </>
            )}

            {/* ════ TOOL VIEW ════ */}
            {mainView==='home'&&activeTool&&(
              <>
                <div>
                  <div className="ph-eyebrow">AI Tool</div>
                  <div className="ph-h1" style={{fontSize:30}}>{activeTool.icon} {activeTool.name}</div>
                  <div className="ph-sub">{activeTool.desc}</div>
                </div>

                <div className="tabs-row">
                  <div className="tabs">
                    <button className={`tab ${activeTab==='tool'?'active':''}`} onClick={()=>setActiveTab('tool')}>Run Tool</button>
                    <button className={`tab ${activeTab==='history'?'active':''}`} onClick={()=>setActiveTab('history')}>
                      History ({history.filter(h=>h.tool===activeTool.name).length})
                    </button>
                  </div>
                </div>

                {activeTab==='tool'&&(
                  <>
                    <div className={`tp ${activeTool.color==='lime'?'l':'t'}`}>
                      <div className="tp-head">
                        <span className="tp-ico">{activeTool.icon}</span>
                        <div>
                          <div className="tp-title">{activeTool.name}</div>
                          <div className="tp-desc">{activeTool.desc}</div>
                        </div>
                        <div className="tp-badges">
                          <span className={`badge ${activeTool.color==='lime'?'l':'t'}`}>{activeTool.cost} tokens</span>
                          <span className="badge a">{activeTool.tier}</span>
                        </div>
                      </div>
                      <div className="tp-body">
                        <label className="fl">Describe your goal or context</label>
                        <textarea
                          value={message}
                          onChange={e=>setMessage(e.target.value)}
                          placeholder={activeTool.placeholder}
                          rows={6}
                          onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))runTool()}}
                        />
                        {error&&<div className="err-box"><span>⚠</span><span>{error}</span></div>}
                        {aiLoading&&(
                          <div className={`qbar ${activeTool.color==='teal'?'t':''}`}>
                            <div className={`qdot ${activeTool.color==='teal'?'t':''}`}/>
                            <span className="qtext">{queuePos?`Processing · queue position ${queuePos}`:`${activeTool.name} is thinking…`}</span>
                            <span className="qtime">{elapsed}s</span>
                          </div>
                        )}
                        <div className="tp-foot">
                          <button className={`run-btn ${activeTool.color==='teal'?'t':''}`} onClick={runTool} disabled={aiLoading||!message.trim()}>
                            {aiLoading?<><div className="spinner"/>Running…</>:`Run ${activeTool.name} →`}
                          </button>
                          <span className="cost-hint">⌘+Enter · {activeTool.cost} tokens · refunded on error</span>
                        </div>
                      </div>
                    </div>

                    {result&&(
                      <div ref={resultRef} className={`res-card ${activeTool.color==='teal'?'t':''}`}>
                        <div className="rc-head">
                          <span className="rc-label">Result · {result.tool}</span>
                          <div className="rc-meta">
                            <div className="pdot">
                              <div className="pdot-d" style={{background:PROVIDER_LABELS[result.provider]?.color??'#fff'}}/>
                              <span style={{color:PROVIDER_LABELS[result.provider]?.color??'#fff'}}>{PROVIDER_LABELS[result.provider]?.label??result.provider}</span>
                            </div>
                            <span className={`badge ${activeTool.color==='lime'?'l':'t'}`}>{result.tokensUsed} tkn</span>
                            <span className="badge a">{(result.durationMs/1000).toFixed(1)}s</span>
                          </div>
                        </div>
                        <div className="rc-body">
                          <pre>{result.result}</pre>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab==='history'&&(
                  <div className="hist-list">
                    {history.filter(h=>h.tool===activeTool.name).length===0?(
                      <div className="empty">
                        <div className="empty-ico">📋</div>
                        <div className="empty-title">No history yet</div>
                        <div className="empty-sub">Run {activeTool.name} and your sessions will appear here.</div>
                      </div>
                    ):history.filter(h=>h.tool===activeTool.name).map(item=>(
                      <div key={item.id} className="hi" onClick={()=>{
                        setResult({tool:item.tool,result:item.result,tokensUsed:item.tokensUsed,tokensRemaining:tokens?.balance??0,model:item.model,provider:item.provider,durationMs:item.durationMs})
                        setActiveTab('tool')
                        setTimeout(()=>resultRef.current?.scrollIntoView({behavior:'smooth'}),100)
                      }}>
                        <div className="hi-top">
                          <span style={{fontSize:16}}>{TOOLS.find(t=>t.name===item.tool)?.icon??'🤖'}</span>
                          <span className="hi-name">{item.tool}</span>
                          <span className="hi-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="hi-msg">{item.message}</div>
                        <div className="hi-meta">
                          <span className={`badge ${activeTool.color==='lime'?'l':'t'}`}>{item.tokensUsed} tokens</span>
                          <div className="pdot">
                            <div className="pdot-d" style={{background:PROVIDER_LABELS[item.provider]?.color??'#fff'}}/>
                            <span style={{color:PROVIDER_LABELS[item.provider]?.color??'#fff'}}>{PROVIDER_LABELS[item.provider]?.label??item.provider}</span>
                          </div>
                          <span className="badge a">{(item.durationMs/1000).toFixed(1)}s</span>
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
