'use client'
import { useEffect, useRef, useState } from 'react'

const TOOLS = [
  { id:'deep-work-engine',    name:'Deep Work Engine',    icon:'⚡', desc:'Structured cognitive session planner',      color:'lime', cost:15, tier:'MEDIUM' },
  { id:'cognitive-clone',     name:'Cognitive Clone',     icon:'🧠', desc:'Simulate your high-performance self',       color:'teal', cost:30, tier:'HEAVY'  },
  { id:'research-builder',    name:'Research Builder',    icon:'🔬', desc:'Counter-intuitive research strategist',     color:'lime', cost:15, tier:'MEDIUM' },
  { id:'skill-roi-analyzer',  name:'Skill ROI Analyzer',  icon:'📊', desc:'ROI projections across 3/12/36 months',    color:'teal', cost:5,  tier:'LIGHT'  },
  { id:'memory-intelligence', name:'Memory Intelligence', icon:'💡', desc:'Spaced repetition + memory maps',           color:'lime', cost:15, tier:'MEDIUM' },
  { id:'execution-optimizer', name:'Execution Optimizer', icon:'🚀', desc:'Critical path & micro-action plans',        color:'teal', cost:15, tier:'MEDIUM' },
  { id:'opportunity-radar',   name:'Opportunity Radar',   icon:'📡', desc:'Surface high-leverage opportunities',       color:'lime', cost:30, tier:'HEAVY'  },
  { id:'decision-simulator',  name:'Decision Simulator',  icon:'⚖️', desc:'Multi-scenario decision framework',        color:'teal', cost:30, tier:'HEAVY'  },
  { id:'focus-shield',        name:'Focus Shield',        icon:'🛡️', desc:'Distraction pattern analysis + protocol',  color:'lime', cost:5,  tier:'LIGHT'  },
  { id:'wealth-mapper',       name:'Wealth Mapper',       icon:'💰', desc:'Comprehensive wealth-building roadmap',     color:'teal', cost:30, tier:'HEAVY'  },
]

const REVIEWS = [
  { name:'Arjun Mehta',  role:'Startup Founder, Bangalore', avatar:'AM', color:'#b8ff00', rating:5, text:'REIOGN changed how I plan my week entirely. The Deep Work Engine alone is worth 10x the subscription. My output tripled in 3 weeks.' },
  { name:'Priya Sharma', role:'Product Manager, Mumbai',    avatar:'PS', color:'#00f0c8', rating:5, text:'The Cognitive Clone blew my mind. It thinks like my best self but faster. Closed 2 major deals using insights from a single session.' },
  { name:'Rahul Verma',  role:'Software Engineer, Hyderabad',avatar:'RV',color:'#b8ff00', rating:5, text:'Skill ROI Analyzer saved me from 6 months on the wrong tech stack. Massive ROI from one 5-token session.' },
  { name:'Sneha Iyer',   role:'Content Creator, Pune',      avatar:'SI', color:'#00f0c8', rating:5, text:'Opportunity Radar finds angles I never thought of. Like having a brilliant strategist available 24/7 for nothing.' },
  { name:'Karan Patel',  role:'Freelancer, Delhi',          avatar:'KP', color:'#b8ff00', rating:5, text:'Wealth Mapper built a complete 36-month roadmap in minutes. My advisor charges 10x and gives 10x less value.' },
  { name:'Ananya Roy',   role:'UX Designer, Chennai',       avatar:'AR', color:'#00f0c8', rating:5, text:'Focus Shield is scary accurate. Identified my exact distraction patterns. Now I get 4 deep work hours daily.' },
]

const PLANS = [
  { name:'Trial',   price:'Free',   tokens:'500',    period:'one-time',  color:'rgba(255,255,255,0.4)', features:['500 tokens total','All 10 AI tools','3-day access'], cta:'Start Free' },
  { name:'Starter', price:'₹499',   tokens:'2,000',  period:'per month', color:'#b8ff00',               features:['2,000 tokens/mo','All 10 AI tools','History export'], cta:'Get Starter' },
  { name:'Pro',     price:'₹999',   tokens:'6,000',  period:'per month', color:'#00f0c8',               features:['6,000 tokens/mo','All 10 AI tools','API access','Team sharing'], cta:'Go Pro', popular:true },
  { name:'Elite',   price:'₹2,499', tokens:'20,000', period:'per month', color:'#ff9500',               features:['20,000 tokens/mo','All 10 tools','Dedicated SLA','White-label'], cta:'Go Elite' },
]

const COMPETITORS = [
  { name:'REIOGN',    color:'#b8ff00', scores:{ quality:95, speed:88, specificity:98, cost:90, cognitive:97, actionability:99 }, highlight:true },
  { name:'ChatGPT',   color:'#10a37f', scores:{ quality:82, speed:85, specificity:55, cost:60, cognitive:50, actionability:48 } },
  { name:'Gemini',    color:'#4285f4', scores:{ quality:79, speed:80, specificity:52, cost:65, cognitive:45, actionability:44 } },
  { name:'Claude.ai', color:'#cc785c', scores:{ quality:88, speed:78, specificity:60, cost:55, cognitive:60, actionability:52 } },
  { name:'Perplexity',color:'#20b2aa', scores:{ quality:72, speed:90, specificity:65, cost:70, cognitive:38, actionability:40 } },
]
const COMP_DIMS = ['Output Quality','Speed','Specificity','Cost Efficiency','Cognitive Focus','Actionability']
const COMP_KEYS: (keyof typeof COMPETITORS[0]['scores'])[] = ['quality','speed','specificity','cost','cognitive','actionability']

const FAQS = [
  { q:'What are tokens?', a:'Tokens are the currency inside REIOGN. Light tools cost 5, Medium cost 15, Heavy cost 30 per run. Tokens are refunded automatically if any AI run fails.' },
  { q:'Which AI models power REIOGN?', a:'Heavy tools use Claude by Anthropic. Medium tools use Google Gemini. Light tools run on Groq for near-instant speed. Auto-routing picks the best model every time.' },
  { q:'Do I need a credit card for the trial?', a:'No. Sign up with Google, GitHub, or Discord — no card required. You get 500 tokens instantly to try all 10 tools.' },
  { q:'Can I upgrade or downgrade anytime?', a:'Yes. Plans are month-to-month. Upgrade for more tokens, downgrade or cancel anytime. No lock-in.' },
  { q:'What happens if I run out of tokens?', a:'Upgrade your plan or wait for your next monthly reset. You will never be auto-charged for overuse.' },
  { q:'Is my data private?', a:'Yes. Inputs are processed and returned to you only. We do not train on your data or share it with third parties.' },
]

function DeepWorkUI() {
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(184,255,0,0.4)',marginBottom:8,letterSpacing:1}}>TODAY'S SESSION PLAN</div>
      <div style={{position:'relative',height:20,background:'rgba(255,255,255,0.04)',borderRadius:4,overflow:'hidden',marginBottom:8,display:'flex'}}>
        {[{label:'Deep Focus',w:38,c:'#b8ff00'},{label:'Break',w:8,c:'rgba(255,255,255,0.15)'},{label:'Flow State',w:32,c:'#b8ff00'},{label:'Review',w:14,c:'rgba(0,240,200,0.5)'}].map((b,i)=>(
          <div key={i} style={{width:`${b.w}%`,height:'100%',background:b.c,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:7,fontFamily:"'JetBrains Mono',monospace",color:b.c==='#b8ff00'?'#07080f':'rgba(255,255,255,0.5)',whiteSpace:'nowrap',padding:'0 3px',overflow:'hidden'}}>{b.label}</span>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
        {[{l:'Focus',v:'4h 20m',c:'#b8ff00'},{l:'Breaks',v:'40m',c:'rgba(255,255,255,0.35)'},{l:'Score',v:'94/100',c:'#00f0c8'}].map((s,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.03)',borderRadius:4,padding:'5px 6px',border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:10,fontWeight:700,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
            <div style={{fontSize:7,color:'rgba(255,255,255,0.25)',fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CognitiveCloneUI() {
  const [tick, setTick] = useState(false)
  useEffect(() => { const iv = setInterval(() => setTick(t=>!t), 1400); return () => clearInterval(iv) }, [])
  return (
    <div style={{paddingTop:8,display:'flex',flexDirection:'column',gap:5}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:tick?'#00f0c8':'rgba(0,240,200,0.4)',marginBottom:2,letterSpacing:1,transition:'color 0.4s',display:'flex',alignItems:'center',gap:6}}>
        <div style={{width:5,height:5,borderRadius:'50%',background:tick?'#00f0c8':'rgba(0,240,200,0.3)',transition:'background 0.4s'}}/>CLONE ACTIVE
      </div>
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <div style={{maxWidth:'85%',padding:'6px 9px',borderRadius:'8px 8px 2px 8px',background:'rgba(184,255,0,0.1)',border:'1px solid rgba(184,255,0,0.18)',fontSize:9,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>How would I close this deal?</div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-start'}}>
        <div style={{maxWidth:'90%',padding:'6px 9px',borderRadius:'8px 8px 8px 2px',background:'rgba(0,240,200,0.07)',border:'1px solid rgba(0,240,200,0.14)',fontSize:9,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>Lead with ROI, not features. Ask about their Q4 target first — then position as the gap-closer.</div>
      </div>
    </div>
  )
}

function ResearchBuilderUI() {
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(184,255,0,0.4)',marginBottom:8,letterSpacing:1}}>3 SOURCES SYNTHESIZED</div>
      {[{tag:'arxiv.org',title:'Cognitive Load & Performance',rel:94},{tag:'hbr.org',title:'Deep Work in Modern Orgs',rel:87},{tag:'nature.com',title:'Neural Patterns in Flow',rel:91}].map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,padding:'4px 8px',background:'rgba(255,255,255,0.02)',borderRadius:4,border:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:8,color:'#b8ff00',fontFamily:"'JetBrains Mono',monospace",marginBottom:1}}>{s.tag}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.6)'}}>{s.title}</div>
          </div>
          <div style={{fontSize:10,fontWeight:700,color:'#00f0c8',fontFamily:"'Syne',sans-serif",flexShrink:0}}>{s.rel}%</div>
        </div>
      ))}
    </div>
  )
}

function SkillROIUI() {
  const bars = [{label:'3mo',roi:180,c:'#b8ff00'},{label:'12mo',roi:420,c:'#00f0c8'},{label:'36mo',roi:890,c:'#ff9500'}]
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(184,255,0,0.4)',marginBottom:10,letterSpacing:1}}>ROI PROJECTION · PYTHON</div>
      <div style={{display:'flex',alignItems:'flex-end',gap:10,height:56}}>
        {bars.map((b,i)=>(
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <div style={{fontSize:9,fontWeight:700,color:b.c,fontFamily:"'Syne',sans-serif"}}>{b.roi}%</div>
            <div style={{width:'100%',height:`${(b.roi/890)*40}px`,background:b.c,borderRadius:'3px 3px 0 0',opacity:0.8,minHeight:4}}/>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',fontFamily:"'JetBrains Mono',monospace"}}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MemoryUI() {
  const grid = Array.from({length:7},(_,w)=>Array.from({length:5},(_,d)=>{const v=(w*5+d)*0.13%1;return v>.65?3:v>.4?2:v>.2?1:0}))
  const colors = ['rgba(255,255,255,0.04)','rgba(184,255,0,0.25)','rgba(184,255,0,0.6)','#b8ff00']
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(184,255,0,0.4)',marginBottom:8,letterSpacing:1}}>RETENTION HEATMAP · 35 CONCEPTS</div>
      <div style={{display:'flex',gap:3}}>
        {grid.map((week,w)=>(
          <div key={w} style={{display:'flex',flexDirection:'column',gap:3}}>
            {week.map((s,d)=><div key={d} style={{width:12,height:12,borderRadius:2,background:colors[s]}}/>)}
          </div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:5,marginTop:7}}>
        {colors.map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:1,background:c}}/>)}
        <span style={{fontSize:7,color:'rgba(255,255,255,0.25)',fontFamily:"'JetBrains Mono',monospace",marginLeft:3}}>Low → Mastered</span>
      </div>
    </div>
  )
}

function ExecutionUI() {
  const steps = [{done:true,text:'Define north-star metric'},{done:true,text:'Identify critical blockers'},{done:false,text:'Build 7-day sprint plan'},{done:false,text:'Set accountability triggers'}]
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(0,240,200,0.4)',marginBottom:8,letterSpacing:1}}>EXECUTION PLAN · LAUNCH</div>
      {steps.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5,opacity:s.done?0.45:1}}>
          <div style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${s.done?'#00f0c8':'rgba(255,255,255,0.18)'}`,background:s.done?'rgba(0,240,200,0.12)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {s.done&&<span style={{fontSize:7,color:'#00f0c8'}}>✓</span>}
          </div>
          <span style={{fontSize:9,color:s.done?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.8)',textDecoration:s.done?'line-through':'none'}}>{s.text}</span>
        </div>
      ))}
      <div style={{marginTop:4,background:'rgba(255,255,255,0.04)',borderRadius:3,overflow:'hidden',height:3}}>
        <div style={{width:'50%',height:'100%',background:'linear-gradient(90deg,#b8ff00,#00f0c8)'}}/>
      </div>
    </div>
  )
}

function OpportunityUI() {
  const pts = [82,71,90,65,88]
  const cx=50,cy=50,r=36,N=pts.length
  const angle=(i:number)=>(i*2*Math.PI/N)-Math.PI/2
  const coord=(val:number,i:number)=>({x:cx+(val/100)*r*Math.cos(angle(i)),y:cy+(val/100)*r*Math.sin(angle(i))})
  const path=pts.map((v,i)=>{const c=coord(v,i);return`${i===0?'M':'L'}${c.x},${c.y}`}).join(' ')+'Z'
  return (
    <div style={{paddingTop:8,display:'flex',alignItems:'center',gap:14}}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {[0.33,0.66,1].map(f=>{
          const outerPts=pts.map((_,i)=>coord(100*f,i))
          return <polygon key={f} points={outerPts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        })}
        {pts.map((_,i)=>{const c=coord(100,i);return<line key={i} x1={cx} y1={cy} x2={c.x} y2={c.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>})}
        <path d={path} fill="rgba(184,255,0,0.14)" stroke="#b8ff00" strokeWidth="1.5"/>
        {pts.map((v,i)=>{const c=coord(v,i);return<circle key={i} cx={c.x} cy={c.y} r={2.5} fill="#b8ff00"/>})}
      </svg>
      <div style={{flex:1}}>
        {['Timing','Market','Network','Capital','Skill'].map((l,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.35)',width:38,fontFamily:"'JetBrains Mono',monospace"}}>{l}</div>
            <div style={{flex:1,height:4,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}>
              <div style={{width:`${pts[i]}%`,height:'100%',background:'#b8ff00',opacity:0.7,borderRadius:2}}/>
            </div>
            <div style={{fontSize:8,color:'#b8ff00',width:20,textAlign:'right',fontFamily:"'Syne',sans-serif"}}>{pts[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DecisionUI() {
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(0,240,200,0.4)',marginBottom:8,letterSpacing:1}}>SCENARIO SIMULATION · 3 PATHS</div>
      {[{label:'Accept offer now',prob:72,c:'#b8ff00'},{label:'Negotiate 30 days',prob:18,c:'#ff9500'},{label:'Decline & search',prob:10,c:'rgba(255,80,80,0.8)'}].map((s,i)=>(
        <div key={i} style={{marginBottom:6}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
            <span style={{fontSize:9,color:'rgba(255,255,255,0.65)'}}>{s.label}</span>
            <span style={{fontSize:9,color:s.c,fontFamily:"'Syne',sans-serif",fontWeight:700}}>{s.prob}%</span>
          </div>
          <div style={{height:4,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}>
            <div style={{width:`${s.prob}%`,height:'100%',background:s.c,borderRadius:2,opacity:0.8}}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function FocusUI() {
  const types=[0,0,1,2,1,0,0,2,1,0,1,2]
  const tc=['#b8ff00','rgba(255,180,0,0.7)','rgba(255,60,60,0.6)']
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(184,255,0,0.4)',marginBottom:8,letterSpacing:1}}>YOUR DISTRACTION PATTERN</div>
      <div style={{display:'flex',gap:2,alignItems:'flex-end',height:38}}>
        {types.map((t,i)=><div key={i} style={{flex:1,height:t===0?36:t===1?22:12,background:tc[t],borderRadius:'2px 2px 0 0',opacity:0.85}}/>)}
      </div>
      <div style={{display:'flex',gap:2,marginTop:2}}>
        {['8','9','10','11','12','1','2','3','4','5','6','7'].map((h,i)=>(
          <div key={i} style={{flex:1,textAlign:'center',fontSize:7,color:'rgba(255,255,255,0.18)',fontFamily:"'JetBrains Mono',monospace"}}>{h}</div>
        ))}
      </div>
    </div>
  )
}

function WealthUI() {
  const pts=[0,12,28,45,60,82,100,125,162,200,248,310]
  const w=180,h=44,maxV=310
  const svgPts=pts.map((v,i)=>`${(i/(pts.length-1))*w},${h-(v/maxV)*h}`).join(' ')
  return (
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'rgba(0,240,200,0.4)',marginBottom:5,letterSpacing:1}}>36-MONTH WEALTH TRAJECTORY</div>
      <svg width="100%" height={h+6} viewBox={`0 0 ${w} ${h+6}`} preserveAspectRatio="none">
        <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f0c8" stopOpacity="0.22"/><stop offset="100%" stopColor="#00f0c8" stopOpacity="0"/></linearGradient></defs>
        <polygon points={`0,${h} ${svgPts} ${w},${h}`} fill="url(#wg)"/>
        <polyline points={svgPts} fill="none" stroke="#00f0c8" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx={w} cy={h-(310/maxV)*h} r={3} fill="#00f0c8"/>
      </svg>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
        <span style={{fontSize:8,color:'rgba(255,255,255,0.2)',fontFamily:"'JetBrains Mono',monospace"}}>NOW</span>
        <span style={{fontSize:9,fontWeight:700,color:'#00f0c8',fontFamily:"'Syne',sans-serif"}}>3.1x NET WORTH</span>
        <span style={{fontSize:8,color:'rgba(255,255,255,0.2)',fontFamily:"'JetBrains Mono',monospace"}}>36MO</span>
      </div>
    </div>
  )
}

const TOOL_UIS=[DeepWorkUI,CognitiveCloneUI,ResearchBuilderUI,SkillROIUI,MemoryUI,ExecutionUI,OpportunityUI,DecisionUI,FocusUI,WealthUI]

function RadarChart({data}:{data:typeof COMPETITORS}) {
  const cx=160,cy=160,r=110,N=COMP_DIMS.length
  const angle=(i:number)=>(i*2*Math.PI/N)-Math.PI/2
  const pt=(val:number,i:number)=>({x:cx+(val/100)*r*Math.cos(angle(i)),y:cy+(val/100)*r*Math.sin(angle(i))})
  return (
    <svg width="100%" viewBox="0 0 320 320" style={{maxWidth:320}}>
      {[0.2,0.4,0.6,0.8,1].map(f=>{
        const ps=Array.from({length:N},(_,i)=>pt(100*f,i))
        return<polygon key={f} points={ps.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      })}
      {Array.from({length:N},(_,i)=>{const p=pt(100,i);return<line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>})}
      {data.map((d,di)=>{
        const vals=COMP_KEYS.map(k=>d.scores[k])
        const ps=vals.map((v,i)=>pt(v,i))
        const pathD=ps.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')+'Z'
        return<path key={di} d={pathD} fill={d.highlight?`${d.color}20`:'transparent'} stroke={d.color} strokeWidth={d.highlight?2:1} opacity={d.highlight?1:0.45}/>
      })}
      {Array.from({length:N},(_,i)=>{
        const p=pt(120,i)
        return<text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" style={{fontSize:8,fill:'rgba(255,255,255,0.28)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:0.5}}>{COMP_DIMS[i].toUpperCase()}</text>
      })}
    </svg>
  )
}

export default function LandingClient() {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const visionRef=useRef<HTMLCanvasElement>(null)
  const [visible,setVisible]=useState(false)
  const [heroText,setHeroText]=useState(0)
  const [reviewIdx,setReviewIdx]=useState(0)
  const [reviewAnim,setReviewAnim]=useState(true)
  const [openFaq,setOpenFaq]=useState<number|null>(null)
  const [count,setCount]=useState({users:0,sessions:0})
  const [activeComp,setActiveComp]=useState(0)

  useEffect(()=>{const t=setTimeout(()=>setVisible(true),60);return()=>clearTimeout(t)},[])
  useEffect(()=>{const iv=setInterval(()=>setHeroText(h=>(h+1)%3),2800);return()=>clearInterval(iv)},[])
  useEffect(()=>{
    const iv=setInterval(()=>{setReviewAnim(false);setTimeout(()=>{setReviewIdx(i=>(i+1)%REVIEWS.length);setReviewAnim(true)},200)},3800)
    return()=>clearInterval(iv)
  },[])
  useEffect(()=>{
    const targets={users:12400,sessions:89300},start=Date.now(),dur=1800
    const iv=setInterval(()=>{const p=Math.min((Date.now()-start)/dur,1),e=1-Math.pow(1-p,3);setCount({users:Math.round(targets.users*e),sessions:Math.round(targets.sessions*e)});if(p>=1)clearInterval(iv)},16)
    return()=>clearInterval(iv)
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current
    if(!canvas)return
    // Capture as non-null so TypeScript is happy inside nested draw() closure
    const c:HTMLCanvasElement=canvas
    const ctx=c.getContext('2d')!;let animId:number,t=0
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight}
    resize();window.addEventListener('resize',resize)
    const pts=Array.from({length:130},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,size:Math.random()*1.4+.3,alpha:Math.random()*.4+.07,color:Math.random()>.55?'#b8ff00':'#00f0c8',pulse:Math.random()*Math.PI*2}))
    const orbs=[{x:.12,y:.28,r:340,color:'rgba(184,255,0,',base:.04},{x:.88,y:.18,r:290,color:'rgba(0,240,200,',base:.036},{x:.5,y:.88,r:360,color:'rgba(184,255,0,',base:.026}]
    function draw(){
      c.width=window.innerWidth;c.height=window.innerHeight
      ctx.clearRect(0,0,c.width,c.height);t+=.005
      const bg=ctx.createRadialGradient(c.width*.5,c.height*.4,0,c.width*.5,c.height*.4,c.width*.9)
      bg.addColorStop(0,'#0a0c18');bg.addColorStop(1,'#07080f')
      ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)
      orbs.forEach((o,i)=>{
        const wx=Math.sin(t*.35+i*1.2)*.013,wy=Math.cos(t*.28+i)*.01
        const g=ctx.createRadialGradient(c.width*(o.x+wx),c.height*(o.y+wy),0,c.width*(o.x+wx),c.height*(o.y+wy),o.r)
        const a=o.base+Math.sin(t*.5+i)*.012
        g.addColorStop(0,`${o.color}${a})`);g.addColorStop(1,`${o.color}0)`)
        ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height)
      })
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.pulse+=.022
        if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0
        if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0
        const a=p.alpha*(.7+Math.sin(p.pulse)*.3)
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fillStyle=p.color+Math.floor(a*255).toString(16).padStart(2,'0');ctx.fill()
      })
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<88){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(184,255,0,${.055*(1-d/88)})`;ctx.lineWidth=.3;ctx.stroke()}
      }
      animId=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(animId);window.removeEventListener('resize',resize)}
  },[])

  useEffect(()=>{
    const canvas=visionRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d')!;let animId:number,t=0
    canvas.width=420;canvas.height=420
    const v4:[number,number,number,number][]=[]
    for(let i=0;i<16;i++)v4.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1])
    const edges:[number,number][]=[]
    for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){const d=i^j;if(d&&(d&(d-1))===0)edges.push([i,j])}
    const rot4=(v:[number,number,number,number],angle:number,plane:number):[number,number,number,number]=>{
      const[a,b,cc,d]=v,cos=Math.cos(angle),sin=Math.sin(angle)
      if(plane===0)return[a*cos-b*sin,a*sin+b*cos,cc,d]
      if(plane===1)return[a,b,cc*cos-d*sin,cc*sin+d*cos]
      return[a*cos-d*sin,b,cc,a*sin+d*cos]
    }
    const p4to3=(v:[number,number,number,number]):[number,number,number]=>{const w=2.5-v[3];return[v[0]/w,v[1]/w,v[2]/w]}
    const p3to2=(v:[number,number,number]):[number,number]=>{const d=3.5-v[2];return[v[0]/d,v[1]/d]}
    function draw(){
      ctx.clearRect(0,0,420,420);t+=.008
      const cx=210,cy=210,sc=155
      const proj=v4.map(v=>{let r=rot4(v,t*.7,0);r=rot4(r,t*.5,1);r=rot4(r,t*.3,2);const v3=p4to3(r),v2=p3to2(v3);return{x:v2[0],y:v2[1],z:v3[2]}})
      edges.forEach(([a,b])=>{
        const pa=proj[a],pb=proj[b],depth=(pa.z+pb.z)/2,br=0.15+((depth+1.5)/3)*.75,inner=(a&8)===(b&8)
        const g=ctx.createLinearGradient(cx+pa.x*sc,cy+pa.y*sc,cx+pb.x*sc,cy+pb.y*sc)
        if(inner){g.addColorStop(0,`rgba(184,255,0,${br*.9})`);g.addColorStop(1,`rgba(0,240,200,${br*.9})`)}
        else{g.addColorStop(0,`rgba(0,240,200,${br*.5})`);g.addColorStop(1,`rgba(184,255,0,${br*.5})`)}
        ctx.beginPath();ctx.moveTo(cx+pa.x*sc,cy+pa.y*sc);ctx.lineTo(cx+pb.x*sc,cy+pb.y*sc)
        ctx.strokeStyle=g;ctx.lineWidth=inner?1.5:.75;ctx.stroke()
      })
      proj.forEach(p=>{
        const depth=(p.z+1.5)/3,glow=ctx.createRadialGradient(cx+p.x*sc,cy+p.y*sc,0,cx+p.x*sc,cy+p.y*sc,5)
        glow.addColorStop(0,`rgba(184,255,0,${.6+depth*.4})`);glow.addColorStop(1,'rgba(184,255,0,0)')
        ctx.beginPath();ctx.arc(cx+p.x*sc,cy+p.y*sc,3,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return()=>cancelAnimationFrame(animId)
  },[])

  const review=REVIEWS[reviewIdx]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--bg:#07080f;--lime:#b8ff00;--teal:#00f0c8;--bd:rgba(255,255,255,0.06);--bd2:rgba(255,255,255,0.12);}
        html,body{min-height:100vh;background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;scroll-behavior:smooth;}
        canvas.bg{position:fixed;inset:0;z-index:0;pointer-events:none;}

        nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;padding:0 40px;justify-content:space-between;border-bottom:1px solid var(--bd);background:rgba(7,8,15,0.9);backdrop-filter:blur(28px);}
        .nlogo{display:flex;align-items:center;gap:10px;text-decoration:none;}
        .nmark{width:34px;height:34px;border-radius:9px;background:rgba(184,255,0,0.1);border:1px solid rgba(184,255,0,0.22);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#b8ff00;}
        .nname{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;letter-spacing:-.3px;}
        .nav-links{display:flex;align-items:center;gap:5px;}
        .nav-link{color:rgba(255,255,255,0.42);text-decoration:none;font-size:13px;padding:7px 14px;border-radius:7px;transition:color .1s cubic-bezier(.4,0,.2,1),background .1s cubic-bezier(.4,0,.2,1);font-weight:500;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.05);}
        .nav-cta{background:#b8ff00;color:#07080f;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;text-decoration:none;transition:background .1s cubic-bezier(.4,0,.2,1),box-shadow .1s;}
        .nav-cta:hover{background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.4);}

        .hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 60px;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.22);padding:6px 14px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#b8ff00;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px;opacity:0;transform:translateY(12px);transition:opacity .32s cubic-bezier(.4,0,.2,1),transform .32s cubic-bezier(.4,0,.2,1);}
        .hero-badge.in{opacity:1;transform:translateY(0);}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;animation:blink 1.8s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        .hero-h1{font-family:'Syne',sans-serif;font-size:clamp(52px,8vw,96px);font-weight:800;line-height:.95;letter-spacing:-3px;color:#fff;opacity:0;transform:translateY(18px);transition:opacity .35s cubic-bezier(.4,0,.2,1) .1s,transform .35s cubic-bezier(.4,0,.2,1) .1s;}
        .hero-h1.in{opacity:1;transform:translateY(0);}
        .hero-word{display:block;background:linear-gradient(135deg,#b8ff00 30%,#00f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;min-height:1.1em;}
        .hero-sub{font-size:clamp(15px,2.2vw,18px);color:rgba(255,255,255,0.68);max-width:540px;line-height:1.65;font-weight:300;margin:22px auto 36px;opacity:0;transform:translateY(14px);transition:opacity .35s cubic-bezier(.4,0,.2,1) .2s,transform .35s cubic-bezier(.4,0,.2,1) .2s;}
        .hero-sub.in{opacity:1;transform:translateY(0);}
        .hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;opacity:0;transform:translateY(12px);transition:opacity .35s cubic-bezier(.4,0,.2,1) .28s,transform .35s cubic-bezier(.4,0,.2,1) .28s;}
        .hero-btns.in{opacity:1;transform:translateY(0);}
        .btn-primary{background:#b8ff00;color:#07080f;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;transition:background .1s cubic-bezier(.4,0,.2,1),box-shadow .1s,transform .1s;display:inline-flex;align-items:center;gap:8px;}
        .btn-primary:hover{background:#cbff1a;box-shadow:0 0 32px rgba(184,255,0,0.45);transform:translateY(-2px);}
        .btn-secondary{background:transparent;color:#fff;font-size:14px;font-weight:500;padding:13px 26px;border-radius:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.16);transition:border-color .1s cubic-bezier(.4,0,.2,1),transform .1s;display:inline-flex;align-items:center;gap:8px;}
        .btn-secondary:hover{border-color:rgba(184,255,0,0.32);transform:translateY(-2px);}
        .hero-stats{display:flex;align-items:center;gap:44px;margin-top:52px;opacity:0;transform:translateY(10px);transition:opacity .35s cubic-bezier(.4,0,.2,1) .36s,transform .35s cubic-bezier(.4,0,.2,1) .36s;flex-wrap:wrap;justify-content:center;}
        .hero-stats.in{opacity:1;transform:translateY(0);}
        .stat-n{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;}
        .stat-l{font-size:10px;color:rgba(255,255,255,0.3);font-family:'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-top:3px;text-align:center;}
        .stat-div{width:1px;height:36px;background:var(--bd2);}

        .tickers{position:relative;z-index:1;overflow:hidden;background:rgba(7,8,15,0.6);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);}
        .ticker-row{display:flex;overflow:hidden;padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.03);}
        .ticker-row:last-child{border-bottom:none;}
        .ticker-track{display:flex;white-space:nowrap;animation:tfwd 26s linear infinite;}
        .ticker-track.rev{animation:trev 30s linear infinite;}
        @keyframes tfwd{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes trev{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        .ticker-item{display:inline-flex;align-items:center;gap:12px;padding:0 26px;font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.18);white-space:nowrap;}
        .ticker-item.lime{color:rgba(184,255,0,0.42);}
        .ticker-item.teal{color:rgba(0,240,200,0.32);}
        .tdot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.1);flex-shrink:0;}
        .tdot.lime{background:rgba(184,255,0,0.28);}
        .tdot.teal{background:rgba(0,240,200,0.22);}

        .stats-bar{position:relative;z-index:1;display:grid;grid-template-columns:repeat(6,1fr);background:var(--bg);border-bottom:1px solid var(--bd);}
        @media(max-width:768px){.stats-bar{grid-template-columns:repeat(3,1fr);}}
        .stats-bar-cell{padding:24px 28px;border-right:1px solid var(--bd);transition:background .1s;}
        .stats-bar-cell:last-child{border-right:none;}
        .stats-bar-cell:hover{background:rgba(12,14,26,0.8);}
        .sbc-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;margin-bottom:3px;}
        .sbc-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:1.5px;text-transform:uppercase;}

        section{position:relative;z-index:1;padding:80px 24px;}
        .section-inner{max-width:1180px;margin:0 auto;}
        .section-label{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#00f0c8;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;}
        .section-label::before{content:'';display:block;width:18px;height:1px;background:#00f0c8;}
        .section-h2{font-family:'Syne',sans-serif;font-size:clamp(30px,5vw,52px);font-weight:800;letter-spacing:-2px;line-height:1.05;color:#fff;margin-bottom:12px;}
        .section-sub{font-size:15px;color:rgba(255,255,255,0.5);max-width:500px;line-height:1.65;font-weight:300;}

        .vision-wrap{position:relative;z-index:1;padding:30px 24px 80px;max-width:1100px;margin:0 auto;}
        .vision-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
        @media(max-width:900px){.vision-grid{grid-template-columns:1fr;}}
        .vision-cv-wrap{display:flex;justify-content:center;align-items:center;position:relative;}
        .vision-cv-wrap::before{content:'';position:absolute;inset:-20px;background:radial-gradient(ellipse,rgba(184,255,0,0.06),transparent 70%);border-radius:50%;pointer-events:none;animation:vglow 4s ease-in-out infinite;}
        @keyframes vglow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
        .vision-cv{border:1px solid rgba(184,255,0,0.12);border-radius:14px;background:rgba(7,8,15,0.6);}
        .vtag-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px;}
        .vtag{font-family:'JetBrains Mono',monospace;font-size:9px;padding:3px 10px;border-radius:3px;color:#b8ff00;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.15);letter-spacing:1px;text-transform:uppercase;}

        .tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;margin-top:44px;}
        .tool-card{background:rgba(9,11,20,0.85);border:1px solid rgba(255,255,255,0.07);border-radius:13px;padding:18px;cursor:pointer;text-decoration:none;transition:border-color .12s cubic-bezier(.4,0,.2,1),transform .12s cubic-bezier(.4,0,.2,1),box-shadow .12s cubic-bezier(.4,0,.2,1);display:block;position:relative;overflow:hidden;will-change:transform;}
        .tool-card::before{content:'';position:absolute;inset:0;border-radius:13px;opacity:0;background:radial-gradient(circle at 40% 50%,rgba(184,255,0,0.055),transparent 70%);transition:opacity .12s cubic-bezier(.4,0,.2,1);}
        .tool-card.teal::before{background:radial-gradient(circle at 40% 50%,rgba(0,240,200,0.055),transparent 70%);}
        .tool-card:hover{border-color:rgba(184,255,0,0.24);transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,0.5);}
        .tool-card.teal:hover{border-color:rgba(0,240,200,0.24);}
        .tool-card:hover::before{opacity:1;}
        .tc-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;gap:8px;}
        .tc-left{display:flex;align-items:flex-start;gap:8px;flex:1;}
        .tc-icon{font-size:19px;flex-shrink:0;margin-top:1px;transition:transform .12s cubic-bezier(.4,0,.2,1);}
        .tool-card:hover .tc-icon{transform:scale(1.2) rotate(-5deg);}
        .tc-name{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#fff;margin-bottom:2px;}
        .tc-desc{font-size:11px;color:rgba(255,255,255,0.38);line-height:1.4;}
        .tc-tier{font-family:'JetBrains Mono',monospace;font-size:8px;padding:2px 7px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;flex-shrink:0;}
        .tc-ui-preview{border-top:1px solid rgba(255,255,255,0.05);margin-top:10px;min-height:76px;}
        .tc-foot{display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,0.04);}
        .tc-cost{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.22);}
        .tc-arrow{font-size:13px;color:rgba(255,255,255,0.14);transition:color .1s cubic-bezier(.4,0,.2,1),transform .1s;}
        .tool-card:hover .tc-arrow{color:#b8ff00;transform:translateX(3px);}
        .tool-card.teal:hover .tc-arrow{color:#00f0c8;}

        .reviews-outer{position:relative;z-index:1;padding:80px 24px 36px;}
        .reviews-inner{max-width:800px;margin:0 auto;}
        .review-stage{margin-top:38px;}
        .review-card{background:rgba(9,11,20,0.92);border:1px solid rgba(255,255,255,0.08);border-radius:15px;padding:34px 38px;position:relative;transition:opacity .16s cubic-bezier(.4,0,.2,1),transform .16s cubic-bezier(.4,0,.2,1);}
        .review-card.in{opacity:1;transform:translateY(0);}
        .review-card.out{opacity:0;transform:translateY(8px);}
        .review-stars{display:flex;gap:3px;margin-bottom:14px;}
        .star{color:#b8ff00;font-size:13px;}
        .review-text{font-size:15px;color:rgba(255,255,255,0.78);line-height:1.75;font-weight:300;font-style:italic;margin-bottom:20px;}
        .review-author{display:flex;align-items:center;gap:12px;}
        .review-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:#07080f;flex-shrink:0;}
        .review-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;}
        .review-role{font-size:11px;color:rgba(255,255,255,0.32);margin-top:1px;}
        .review-dots{display:flex;gap:6px;justify-content:center;margin-top:18px;}
        .rdot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.1);cursor:pointer;transition:background .12s cubic-bezier(.4,0,.2,1),transform .12s;}
        .rdot.active{background:#b8ff00;transform:scale(1.4);}
        .review-quote{position:absolute;top:14px;right:20px;font-size:60px;color:rgba(184,255,0,0.05);font-family:serif;line-height:1;pointer-events:none;user-select:none;}
        .review-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:10px;margin-top:28px;}
        .rg-card{background:rgba(9,11,20,0.72);border:1px solid rgba(255,255,255,0.05);border-radius:11px;padding:18px;transition:border-color .12s;}
        .rg-card:hover{border-color:rgba(184,255,0,0.13);}
        .rg-text{font-size:12px;color:rgba(255,255,255,0.58);line-height:1.7;font-style:italic;margin:8px 0 12px;}
        .rg-author{display:flex;align-items:center;gap:8px;}
        .rg-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:9px;font-weight:700;color:#07080f;flex-shrink:0;}
        .rg-name{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:#fff;}
        .rg-role{font-size:9px;color:rgba(255,255,255,0.28);margin-top:1px;}

        .comp-grid{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start;margin-top:44px;}
        @media(max-width:900px){.comp-grid{grid-template-columns:1fr;}}
        .comp-legend{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;}
        .comp-legend-item{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.45);}
        .comp-legend-dot{width:9px;height:9px;border-radius:50%;}
        .comp-tabs{display:flex;gap:5px;margin-bottom:20px;flex-wrap:wrap;}
        .comp-tab{padding:5px 13px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.38);transition:all .1s cubic-bezier(.4,0,.2,1);}
        .comp-bars{display:flex;flex-direction:column;gap:9px;}
        .comp-bar-row{display:grid;align-items:center;gap:9px;grid-template-columns:88px 1fr 32px;}
        .comp-bar-label{font-size:10px;color:rgba(255,255,255,0.4);text-align:right;font-family:'JetBrains Mono',monospace;}
        .comp-bar-track{height:7px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
        .comp-bar-fill{height:100%;border-radius:3px;transition:width .35s cubic-bezier(.4,0,.2,1);}
        .comp-bar-score{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;}
        .comp-feat-table{width:100%;border-collapse:collapse;margin-top:40px;}
        .comp-feat-table th{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.22);padding:8px 10px;text-align:center;border-bottom:1px solid var(--bd);}
        .comp-feat-table th:first-child{text-align:left;}
        .comp-feat-table td{padding:9px 10px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px;color:rgba(255,255,255,0.55);text-align:center;}
        .comp-feat-table td:first-child{text-align:left;}
        .comp-feat-table tr:hover td{background:rgba(255,255,255,0.02);}
        .cy{color:#b8ff00;font-size:13px;}
        .cn{color:rgba(255,255,255,0.12);font-size:13px;}
        .cp{color:#ff9500;font-size:11px;}

        .feature-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:44px;border:1px solid var(--bd);border-radius:13px;overflow:hidden;}
        @media(max-width:720px){.feature-strip{grid-template-columns:1fr;}}
        .feature-cell{background:rgba(9,11,20,0.55);padding:30px 26px;transition:background .1s;}
        .feature-cell:hover{background:rgba(9,11,20,0.95);}
        .feature-cell+.feature-cell{border-left:1px solid var(--bd);}
        @media(max-width:720px){.feature-cell+.feature-cell{border-left:none;border-top:1px solid var(--bd);}}
        .fc-num{font-family:'JetBrains Mono',monospace;font-size:10px;color:#b8ff00;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
        .fc-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;}
        .fc-body{font-size:13px;color:rgba(255,255,255,0.5);line-height:1.65;}

        .providers-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-top:36px;}
        .provider-card{background:rgba(9,11,20,0.7);border:1px solid var(--bd);border-radius:11px;padding:20px;transition:transform .1s,border-color .1s;}
        .provider-card:hover{transform:translateY(-3px);}
        .prov-icon{font-size:24px;margin-bottom:9px;}
        .prov-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:3px;}
        .prov-role{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px;}
        .prov-desc{font-size:11.5px;color:rgba(255,255,255,0.42);line-height:1.6;}

        .plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:10px;margin-top:44px;}
        .plan-card{background:rgba(9,11,20,0.72);border:1px solid var(--bd);border-radius:13px;padding:24px 20px;position:relative;overflow:hidden;transition:transform .12s cubic-bezier(.4,0,.2,1),box-shadow .12s;}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.4);}
        .plan-card.popular-plan{border-color:rgba(0,240,200,0.26);background:rgba(0,240,200,0.022);}
        .plan-popular-badge{position:absolute;top:0;left:50%;transform:translateX(-50%);font-family:'JetBrains Mono',monospace;font-size:8px;padding:3px 12px;border-radius:0 0 5px 5px;background:#00f0c8;color:#07080f;letter-spacing:1px;text-transform:uppercase;font-weight:700;}
        .plan-bar{position:absolute;top:0;left:0;right:0;height:2px;}
        .plan-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:8px;margin-bottom:5px;}
        .plan-price{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;color:#fff;margin-bottom:1px;}
        .plan-period{font-size:10px;color:rgba(255,255,255,0.22);margin-bottom:7px;font-family:'JetBrains Mono',monospace;}
        .plan-tokens{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;padding:4px 10px;border-radius:3px;display:inline-block;}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:18px;}
        .plan-features li{font-size:12px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:7px;}
        .plan-btn{width:100%;padding:10px;border-radius:8px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:transform .1s;border:none;text-decoration:none;display:block;text-align:center;}
        .plan-btn:hover{transform:scale(1.02);}

        .faq-list{display:flex;flex-direction:column;gap:6px;}
        .faq-item{background:rgba(9,11,20,0.7);border:1px solid var(--bd);border-radius:9px;overflow:hidden;transition:border-color .1s;}
        .faq-item.open{border-color:rgba(184,255,0,0.17);}
        .faq-q{padding:15px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-family:'Syne',sans-serif;font-size:13.5px;font-weight:600;color:#fff;gap:12px;}
        .faq-icon{font-size:15px;color:rgba(184,255,0,0.38);flex-shrink:0;transition:transform .12s cubic-bezier(.4,0,.2,1);}
        .faq-item.open .faq-icon{transform:rotate(45deg);}
        .faq-a{padding:0 18px 15px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;}

        .cta-section{position:relative;z-index:1;padding:80px 24px;}
        .cta-banner{background:linear-gradient(135deg,rgba(184,255,0,0.07),rgba(0,240,200,0.04));border:1px solid rgba(184,255,0,0.15);border-radius:16px;padding:64px 40px;text-align:center;position:relative;overflow:hidden;}
        .cta-banner::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(184,255,0,0.06),transparent 70%);pointer-events:none;}
        .cta-h2{font-family:'Syne',sans-serif;font-size:clamp(38px,6vw,68px);font-weight:800;letter-spacing:-2.5px;line-height:1;color:#fff;margin-bottom:16px;}
        .cta-sub{font-size:16px;color:rgba(255,255,255,0.58);font-weight:300;margin-bottom:34px;line-height:1.6;}
        .cta-inner{max-width:640px;margin:0 auto;position:relative;}
        .cta-note{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.16);letter-spacing:1px;margin-top:14px;}

        footer{position:relative;z-index:1;border-top:1px solid var(--bd);padding:44px 40px 26px;}
        .footer-top{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:36px;margin-bottom:32px;}
        @media(max-width:768px){.footer-top{grid-template-columns:1fr 1fr;}}
        .footer-logo-wrap{display:flex;align-items:center;gap:9px;margin-bottom:9px;}
        .footer-logo-mark{width:28px;height:28px;border-radius:7px;background:rgba(184,255,0,0.1);border:1px solid rgba(184,255,0,0.2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:800;color:#b8ff00;}
        .footer-logo-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#fff;}
        .footer-tagline{font-size:11.5px;color:rgba(255,255,255,0.28);line-height:1.6;max-width:195px;}
        .footer-col-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.18);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
        .footer-links-list{display:flex;flex-direction:column;gap:6px;}
        .footer-links-list a{font-size:12px;color:rgba(255,255,255,0.38);text-decoration:none;transition:color .1s;}
        .footer-links-list a:hover{color:#fff;}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--bd);padding-top:18px;flex-wrap:wrap;gap:8px;}
        .footer-copy{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.16);letter-spacing:1px;}

        .fade-up{opacity:0;transform:translateY(18px);will-change:opacity,transform;transition:opacity .42s cubic-bezier(.4,0,.2,1),transform .42s cubic-bezier(.4,0,.2,1);}
        .fade-up.visible{opacity:1;transform:translateY(0);}

        @media(max-width:640px){nav{padding:0 18px;}.hero-btns{flex-direction:column;}.hero-stats{gap:18px;}.review-card{padding:22px 20px;}.comp-grid{grid-template-columns:1fr;}.stats-bar{grid-template-columns:repeat(3,1fr);}.footer-top{grid-template-columns:1fr;}}
      `}</style>

      <canvas ref={canvasRef} className="bg"/>

      <nav>
        <a href="/" className="nlogo">
          <div className="nmark">R</div>
          <span className="nname">REIOGN</span>
        </a>
        <div className="nav-links">
          <a href="#tools"   className="nav-link">Tools</a>
          <a href="#compare" className="nav-link">Compare</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="/login"   className="nav-link">Sign in</a>
          <a href="/signup"  className="nav-cta">Start Free →</a>
        </div>
      </nav>

      <section className="hero">
        <div className={`hero-badge ${visible?'in':''}`}><div className="badge-dot"/> AI Intelligence Platform</div>
        <h1 className={`hero-h1 ${visible?'in':''}`}>
          10 AI Tools To<br/>
          <span className="hero-word">{['Outperform.','Outlast.','Outthink.'][heroText]}</span>
        </h1>
        <p className={`hero-sub ${visible?'in':''}`}>REIOGN gives you a full arsenal of cognitive performance tools powered by Claude AI — from deep work planning to wealth mapping. Built for builders who refuse to coast.</p>
        <div className={`hero-btns ${visible?'in':''}`}>
          <a href="/signup" className="btn-primary">Start Free Trial →</a>
          <a href="#tools"  className="btn-secondary">Explore Tools</a>
        </div>
        <div className={`hero-stats ${visible?'in':''}`}>
          <div><div className="stat-n">{count.users.toLocaleString()}+</div><div className="stat-l">Users</div></div>
          <div className="stat-div"/>
          <div><div className="stat-n">{count.sessions.toLocaleString()}+</div><div className="stat-l">Sessions Run</div></div>
          <div className="stat-div"/>
          <div><div className="stat-n">10</div><div className="stat-l">AI Tools</div></div>
          <div className="stat-div"/>
          <div><div className="stat-n">3</div><div className="stat-l">Day Trial</div></div>
          <div className="stat-div"/>
          <div><div className="stat-n">∞</div><div className="stat-l">Leverage</div></div>
        </div>
      </section>

      <div className="tickers">
        <div className="ticker-row">
          <div className="ticker-track">
            {[...Array(3)].flatMap((_,r)=>TOOLS.map((t,i)=>(
              <span key={`a${r}${i}`} className={`ticker-item ${t.color}`}><span className={`tdot ${t.color}`}/>{t.icon} {t.name.toUpperCase()}</span>
            )))}
          </div>
        </div>
        <div className="ticker-row">
          <div className="ticker-track rev">
            {[...Array(3)].flatMap((_,r)=>['CLAUDE AI','GEMINI PRO','GROQ LLAMA','AUTO-ROUTING','TOKEN REFUNDS','STRUCTURED OUTPUT','DEEP COGNITION','EXECUTION-READY','MULTI-MODEL','ZERO HALLUCINATION'].map((t,i)=>(
              <span key={`b${r}${i}`} className="ticker-item teal"><span className="tdot teal"/>◆ {t}</span>
            )))}
          </div>
        </div>
      </div>

      <div className="stats-bar fade-up">
        {[{val:'99.2%',label:'Uptime SLA',c:'#b8ff00'},{val:'< 8s',label:'Avg Response',c:'#00f0c8'},{val:'4.9★',label:'User Rating',c:'#b8ff00'},{val:'∞',label:'Token Refund Rate',c:'#00f0c8'},{val:'3',label:'AI Models',c:'#b8ff00'},{val:'0',label:'Hidden Costs',c:'#00f0c8'}].map((s,i)=>(
          <div key={i} className="stats-bar-cell">
            <div className="sbc-val" style={{color:s.c}}>{s.val}</div>
            <div className="sbc-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="vision-wrap fade-up">
        <div className="vision-grid">
          <div className="vision-cv-wrap">
            <canvas ref={visionRef} className="vision-cv" width={420} height={420} style={{width:350,height:350}}/>
          </div>
          <div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(0,240,200,0.5)',letterSpacing:'2.5px',textTransform:'uppercase',display:'block',marginBottom:8}}>4D Intelligence Engine</span>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(26px,4vw,42px)',fontWeight:800,letterSpacing:'-1.5px',lineHeight:1.1,color:'#fff',marginBottom:12}}>
              Think in <span style={{color:'#b8ff00'}}>Higher</span> Dimensions
            </div>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.52)',lineHeight:1.7,fontWeight:300,maxWidth:410,marginBottom:18}}>
              Every query routes through a multi-dimensional intelligence stack — Claude for deep cognition, Gemini for research, Groq for speed. The right model for the right task, always.
            </p>
            <div className="vtag-row">
              {['Claude AI','Gemini Pro','Groq LLaMA','Auto-routing','Fallback chain','Token refunds'].map(t=><span key={t} className="vtag">{t}</span>)}
            </div>
          </div>
        </div>
      </div>

      <section id="tools">
        <div className="section-inner">
          <div className="fade-up">
            <div className="section-label">Your Arsenal</div>
            <h2 className="section-h2">10 Tools.<br/>Zero Compromises.</h2>
            <p className="section-sub">Each tool has its own unique AI interface, output format, and model routing — precision-built for one specific cognitive task.</p>
          </div>
          <div className="tools-grid fade-up">
            {TOOLS.map((tool,idx)=>{
              const UIComp=TOOL_UIS[idx]
              const tc=tool.tier==='HEAVY'?'#ff9500':tool.tier==='MEDIUM'?'#b8ff00':'#00f0c8'
              const tb=tool.tier==='HEAVY'?'rgba(255,149,0,0.1)':tool.tier==='MEDIUM'?'rgba(184,255,0,0.08)':'rgba(0,240,200,0.08)'
              return (
                <a key={tool.id} href="/signup" className={`tool-card ${tool.color==='teal'?'teal':''}`}>
                  <div className="tc-header">
                    <div className="tc-left">
                      <span className="tc-icon">{tool.icon}</span>
                      <div><div className="tc-name">{tool.name}</div><div className="tc-desc">{tool.desc}</div></div>
                    </div>
                    <span className="tc-tier" style={{color:tc,background:tb,border:`1px solid ${tc}26`}}>{tool.tier}</span>
                  </div>
                  <div className="tc-ui-preview"><UIComp/></div>
                  <div className="tc-foot">
                    <span className="tc-cost">{tool.cost} tokens / run</span>
                    <span className="tc-arrow">→</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <div className="reviews-outer fade-up">
        <div className="reviews-inner">
          <div style={{textAlign:'center'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Social Proof</div>
            <h2 className="section-h2" style={{textAlign:'center'}}>Real People.<br/>Real Results.</h2>
          </div>
          <div className="review-stage">
            <div className={`review-card ${reviewAnim?'in':'out'}`}>
              <div className="review-quote">"</div>
              <div className="review-stars">{[...Array(review.rating)].map((_,i)=><span key={i} className="star">★</span>)}</div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <div className="review-avatar" style={{background:review.color}}>{review.avatar}</div>
                <div><div className="review-name">{review.name}</div><div className="review-role">{review.role}</div></div>
              </div>
            </div>
          </div>
          <div className="review-dots">
            {REVIEWS.map((_,i)=><div key={i} className={`rdot ${i===reviewIdx?'active':''}`} onClick={()=>{setReviewAnim(false);setTimeout(()=>{setReviewIdx(i);setReviewAnim(true)},200)}}/>)}
          </div>
        </div>
      </div>
      <section style={{paddingTop:0}}>
        <div className="section-inner fade-up">
          <div className="review-grid">
            {REVIEWS.map((r,i)=>(
              <div key={i} className="rg-card">
                <div className="review-stars">{[...Array(r.rating)].map((_,j)=><span key={j} className="star" style={{fontSize:11}}>★</span>)}</div>
                <p className="rg-text">"{r.text}"</p>
                <div className="rg-author">
                  <div className="rg-av" style={{background:r.color}}>{r.avatar}</div>
                  <div><div className="rg-name">{r.name}</div><div className="rg-role">{r.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="section-inner">
          <div className="fade-up">
            <div className="section-label">Head-to-Head</div>
            <h2 className="section-h2">REIOGN vs Everyone Else.</h2>
            <p className="section-sub">ChatGPT, Gemini, Claude, Perplexity — great general tools. None built for cognitive performance like REIOGN.</p>
          </div>
          <div className="comp-grid fade-up">
            <div>
              <div className="comp-legend">
                {COMPETITORS.map((c,i)=><div key={i} className="comp-legend-item"><div className="comp-legend-dot" style={{background:c.color,opacity:c.highlight?1:0.55}}/>{c.name}</div>)}
              </div>
              <RadarChart data={COMPETITORS}/>
            </div>
            <div>
              <div className="comp-tabs">
                {COMPETITORS.map((c,i)=>(
                  <div key={i} className={`comp-tab ${activeComp===i?'active':''}`} onClick={()=>setActiveComp(i)} style={activeComp===i?{borderColor:`${c.color}50`,color:c.color,background:`${c.color}10`}:{}}>{c.name}</div>
                ))}
              </div>
              <div className="comp-bars">
                {COMP_DIMS.map((dim,di)=>{
                  const val=COMPETITORS[activeComp].scores[COMP_KEYS[di]],color=COMPETITORS[activeComp].color
                  return (
                    <div key={di} className="comp-bar-row">
                      <div className="comp-bar-label">{dim}</div>
                      <div className="comp-bar-track"><div className="comp-bar-fill" style={{width:`${val}%`,background:color,opacity:0.8}}/></div>
                      <div className="comp-bar-score" style={{color}}>{val}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="fade-up" style={{marginTop:36,overflowX:'auto'}}>
            <table className="comp-feat-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {COMPETITORS.map((c,i)=><th key={i} style={{color:c.color}}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  {feat:'Purpose-built tools',     vals:[true,false,false,false,false]},
                  {feat:'Structured output format', vals:[true,false,false,false,false]},
                  {feat:'Token atomic billing',     vals:[true,false,false,false,false]},
                  {feat:'Auto refund on failure',   vals:[true,false,false,false,false]},
                  {feat:'Multi-model routing',      vals:[true,false,false,false,false]},
                  {feat:'Cognitive perf focus',     vals:[true,false,false,false,false]},
                  {feat:'Session history',          vals:[true,true,true,true,true]},
                  {feat:'Free trial no card',       vals:[true,false,false,false,true]},
                  {feat:'Indian pricing (₹)',       vals:[true,false,false,false,false]},
                  {feat:'Token refunds',            vals:[true,false,false,false,false]},
                ].map((row,i)=>(
                  <tr key={i}>
                    <td>{row.feat}</td>
                    {row.vals.map((v,j)=>(
                      <td key={j}>{v===true?<span className="cy">✓</span>:v===false?<span className="cn">✗</span>:<span className="cp">~</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{paddingTop:0}}>
        <div className="section-inner">
          <div className="fade-up"><div className="section-label">Why REIOGN</div><h2 className="section-h2">Built Different.</h2></div>
          <div className="feature-strip fade-up">
            <div className="feature-cell"><div className="fc-num">01 — DEPTH</div><div className="fc-title">Not a chatbot.<br/>A system.</div><div className="fc-body">Every tool has a defined purpose and output format. Claude for deep cognition. Groq for rapid analysis. Right model for the right job.</div></div>
            <div className="feature-cell"><div className="fc-num">02 — PRECISION</div><div className="fc-title">Token-based.<br/>Atomic billing.</div><div className="fc-body">Pay only for what you use. Tokens deducted atomically — refunded on any AI failure. Full session history. Zero hidden costs.</div></div>
            <div className="feature-cell"><div className="fc-num">03 — SPEED</div><div className="fc-title">Instant output.<br/>Structured results.</div><div className="fc-body">Every response structured for action. Numbered frameworks, specific numbers, real timelines. Execute immediately.</div></div>
          </div>
        </div>
      </section>

      <section style={{paddingTop:0}}>
        <div className="section-inner">
          <div className="fade-up"><div className="section-label">Intelligence Stack</div><h2 className="section-h2">Powered by the Best.</h2></div>
          <div className="providers-grid fade-up">
            {[
              {icon:'🤖',name:'Claude AI',role:'Heavy tier',color:'#b8ff00',desc:"Anthropic's most capable model powers Heavy tools — Cognitive Clone, Opportunity Radar, Decision Simulator, Wealth Mapper."},
              {icon:'♊',name:'Gemini Pro',role:'Medium tier',color:'#00f0c8',desc:"Google's multimodal intelligence handles Medium tools — Research Builder, Deep Work Engine, Memory Intelligence, Execution Optimizer."},
              {icon:'⚡',name:'Groq LLaMA',role:'Light tier',color:'#ff9500',desc:'Ultra-fast Groq inference powers Light tools — Focus Shield, Skill ROI Analyzer. Results in under 3 seconds.'},
              {icon:'🔄',name:'Auto-routing',role:'Always on',color:'rgba(255,255,255,0.45)',desc:'If any model fails, REIOGN auto-falls back through the chain and refunds your tokens. Zero lost runs.'},
            ].map((p,i)=>(
              <div key={i} className="provider-card" style={{borderColor:`${p.color}22`}}>
                <div className="prov-icon">{p.icon}</div>
                <div className="prov-name" style={{color:p.color}}>{p.name}</div>
                <div className="prov-role" style={{color:`${p.color}80`}}>{p.role}</div>
                <div className="prov-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="section-inner">
          <div className="fade-up" style={{textAlign:'center'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Pricing</div>
            <h2 className="section-h2" style={{textAlign:'center'}}>Simple. Transparent.<br/>No Surprises.</h2>
          </div>
          <div className="plans-grid fade-up">
            {PLANS.map((plan,i)=>(
              <div key={i} className={`plan-card ${plan.popular?'popular-plan':''}`}>
                {plan.popular&&<div className="plan-popular-badge">Most Popular</div>}
                <div className="plan-bar" style={{background:`linear-gradient(90deg,${plan.color},transparent)`}}/>
                <div className="plan-name" style={{color:plan.color}}>{plan.name}</div>
                <div className="plan-price">{plan.price}</div>
                <div className="plan-period">{plan.period}</div>
                <div className="plan-tokens" style={{color:plan.color,background:`${plan.color}12`,border:`1px solid ${plan.color}28`}}>{plan.tokens} TOKENS</div>
                <ul className="plan-features">{plan.features.map((f,j)=><li key={j}><span style={{color:plan.color}}>✓</span>{f}</li>)}</ul>
                <a href="/signup" className="plan-btn" style={plan.popular?{background:plan.color,color:'#07080f'}:{background:'transparent',color:plan.color,border:`1px solid ${plan.color}30`}}>{plan.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{paddingTop:0}}>
        <div className="section-inner">
          <div className="fade-up" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:44,alignItems:'start'}}>
            <div>
              <div className="section-label">FAQ</div>
              <h2 className="section-h2">Questions<br/>Answered.</h2>
              <p className="section-sub">Everything about REIOGN, tokens, AI models, and billing.</p>
            </div>
            <div className="faq-list">
              {FAQS.map((faq,i)=>(
                <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
                  <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>{faq.q}<span className="faq-icon">{openFaq===i?'−':'+'}</span></div>
                  {openFaq===i&&<div className="faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-banner fade-up">
          <div className="cta-inner">
            <h2 className="cta-h2">Stop Thinking.<br/>Start Executing.</h2>
            <p className="cta-sub">3-day free trial. 500 tokens on signup. No card required.<br/>All 10 tools. Live in 30 seconds.</p>
            <a href="/signup" className="btn-primary" style={{fontSize:'16px',padding:'15px 40px',display:'inline-flex'}}>Create Free Account →</a>
            <div className="cta-note">NO CREDIT CARD · CANCEL ANYTIME · ALL 10 TOOLS INCLUDED</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo-wrap"><div className="footer-logo-mark">R</div><div className="footer-logo-name">REIOGN</div></div>
            <div className="footer-tagline">AI-powered cognitive performance tools for builders who refuse to coast.</div>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <div className="footer-links-list"><a href="#tools">Tools</a><a href="#pricing">Pricing</a><a href="#compare">Compare</a><a href="/signup">Start free</a></div>
          </div>
          <div>
            <div className="footer-col-title">Account</div>
            <div className="footer-links-list"><a href="/login">Sign in</a><a href="/signup">Sign up</a><a href="/dashboard">Dashboard</a></div>
          </div>
          <div>
            <div className="footer-col-title">Tools</div>
            <div className="footer-links-list">{TOOLS.slice(0,5).map(t=><a key={t.id} href="/signup">{t.name}</a>)}</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 REIOGN · ALL RIGHTS RESERVED</div>
          <div style={{display:'flex',gap:16}}>{['Sign in','Sign up'].map(l=><a key={l} href={l==='Sign in'?'/login':'/signup'} style={{fontSize:12,color:'rgba(255,255,255,0.18)',textDecoration:'none'}}>{l}</a>)}</div>
        </div>
      </footer>

      <ScrollReveal/>
    </>
  )
}

function ScrollReveal() {
  useEffect(()=>{
    const els=document.querySelectorAll('.fade-up')
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){(e.target as HTMLElement).classList.add('visible');obs.unobserve(e.target)}})},{threshold:0.05})
    els.forEach(el=>obs.observe(el))
    return()=>obs.disconnect()
  },[])
  return null
}
