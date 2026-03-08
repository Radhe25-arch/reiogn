'use client'
import { useEffect, useRef, useState } from 'react'

const TOOLS = [
  { id: 'deep-work-engine',    name: 'Deep Work Engine',    icon: '⚡', desc: 'Structured cognitive session planner',       color: 'lime' },
  { id: 'cognitive-clone',     name: 'Cognitive Clone',     icon: '🧠', desc: 'Simulate your high-performance self',        color: 'teal' },
  { id: 'research-builder',    name: 'Research Builder',    icon: '🔬', desc: 'Counter-intuitive research strategist',      color: 'lime' },
  { id: 'skill-roi-analyzer',  name: 'Skill ROI Analyzer',  icon: '📊', desc: 'ROI projections across 3/12/36 months',     color: 'teal' },
  { id: 'memory-intelligence', name: 'Memory Intelligence', icon: '💡', desc: 'Spaced repetition + memory maps',            color: 'lime' },
  { id: 'execution-optimizer', name: 'Execution Optimizer', icon: '🚀', desc: 'Critical path & micro-action plans',         color: 'teal' },
  { id: 'opportunity-radar',   name: 'Opportunity Radar',   icon: '📡', desc: 'Surface high-leverage hidden opportunities', color: 'lime' },
  { id: 'decision-simulator',  name: 'Decision Simulator',  icon: '⚖️', desc: 'Multi-scenario decision framework',         color: 'teal' },
  { id: 'focus-shield',        name: 'Focus Shield',        icon: '🛡️', desc: 'Distraction pattern analysis + protocol',   color: 'lime' },
  { id: 'wealth-mapper',       name: 'Wealth Mapper',       icon: '💰', desc: 'Comprehensive wealth-building roadmap',      color: 'teal' },
]

const REVIEWS = [
  { name: 'Arjun Mehta', role: 'Startup Founder, Bangalore', avatar: 'AM', color: '#b8ff00', rating: 5, text: 'REIOGN changed how I plan my week entirely. The Deep Work Engine alone is worth 10x the subscription. My output tripled in 3 weeks.' },
  { name: 'Priya Sharma', role: 'Product Manager, Mumbai', avatar: 'PS', color: '#00f0c8', rating: 5, text: 'The Cognitive Clone blew my mind. It thinks like my best self but faster. Closed 2 major deals using insights from it.' },
  { name: 'Rahul Verma', role: 'Software Engineer, Hyderabad', avatar: 'RV', color: '#b8ff00', rating: 5, text: 'Skill ROI Analyzer saved me from 6 months on the wrong tech stack. Huge ROI from a single session.' },
  { name: 'Sneha Iyer', role: 'Content Creator, Pune', avatar: 'SI', color: '#00f0c8', rating: 5, text: 'Opportunity Radar finds angles I never thought of. Like having a brilliant strategist available 24/7 for nothing.' },
  { name: 'Karan Patel', role: 'Freelancer, Delhi', avatar: 'KP', color: '#b8ff00', rating: 5, text: 'Wealth Mapper built me a complete 36-month roadmap in minutes. My financial advisor charges 10x and gives 10x less value.' },
  { name: 'Ananya Roy', role: 'UX Designer, Chennai', avatar: 'AR', color: '#00f0c8', rating: 5, text: 'Focus Shield is scary accurate. Identified my exact distraction patterns. Now I get 4 deep work hours daily consistently.' },
]

export default function LandingClient() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const visionRef  = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible]       = useState(false)
  const [heroText, setHeroText]     = useState(0)
  const [reviewIdx, setReviewIdx]   = useState(0)
  const [reviewAnim, setReviewAnim] = useState(true)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])
  useEffect(() => { const iv = setInterval(() => setHeroText(h => (h + 1) % 3), 2800); return () => clearInterval(iv) }, [])
  useEffect(() => {
    const iv = setInterval(() => {
      setReviewAnim(false)
      setTimeout(() => { setReviewIdx(i => (i + 1) % REVIEWS.length); setReviewAnim(true) }, 240)
    }, 3800)
    return () => clearInterval(iv)
  }, [])

  // Background particle canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let animId: number, t = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const pts = Array.from({ length: 120 }, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx: (Math.random()-.5)*.22, vy: (Math.random()-.5)*.22,
      size: Math.random()*1.5+.3, alpha: Math.random()*.4+.07,
      color: Math.random()>.55 ? '#b8ff00' : '#00f0c8', pulse: Math.random()*Math.PI*2,
    }))
    const orbs = [
      { x:.12, y:.28, r:340, color:'rgba(184,255,0,', base:.042 },
      { x:.88, y:.18, r:290, color:'rgba(0,240,200,', base:.038 },
      { x:.5,  y:.88, r:360, color:'rgba(184,255,0,', base:.028 },
    ]
    function draw() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight
      ctx.clearRect(0,0,canvas.width,canvas.height); t += .005
      const bg = ctx.createRadialGradient(canvas.width*.5,canvas.height*.4,0,canvas.width*.5,canvas.height*.4,canvas.width*.9)
      bg.addColorStop(0,'#0a0c18'); bg.addColorStop(1,'#07080f')
      ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height)
      orbs.forEach((o,i)=>{
        const wx=Math.sin(t*.35+i*1.2)*.013, wy=Math.cos(t*.28+i)*.01
        const g=ctx.createRadialGradient(canvas.width*(o.x+wx),canvas.height*(o.y+wy),0,canvas.width*(o.x+wx),canvas.height*(o.y+wy),o.r)
        const a=o.base+Math.sin(t*.5+i)*.013
        g.addColorStop(0,`${o.color}${a})`); g.addColorStop(1,`${o.color}0)`)
        ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height)
      })
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.pulse+=.022
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0
        const a=p.alpha*(.7+Math.sin(p.pulse)*.3)
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fillStyle=p.color+Math.floor(a*255).toString(16).padStart(2,'0'); ctx.fill()
      })
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy)
        if(d<95){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(184,255,0,${.065*(1-d/95)})`;ctx.lineWidth=.35;ctx.stroke()}
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  // 4D Tesseract canvas
  useEffect(() => {
    const canvas = visionRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let animId: number, t = 0
    canvas.width = 420; canvas.height = 420
    const v4: [number,number,number,number][] = []
    for(let i=0;i<16;i++) v4.push([i&1?1:-1, i&2?1:-1, i&4?1:-1, i&8?1:-1])
    const edges: [number,number][] = []
    for(let i=0;i<16;i++) for(let j=i+1;j<16;j++){const d=i^j;if(d&&(d&(d-1))===0)edges.push([i,j])}
    function rot4(v:[number,number,number,number],angle:number,plane:number):[number,number,number,number]{
      const [a,b,c,d]=v, cos=Math.cos(angle), sin=Math.sin(angle)
      if(plane===0)return[a*cos-b*sin,a*sin+b*cos,c,d]
      if(plane===1)return[a,b,c*cos-d*sin,c*sin+d*cos]
      return[a*cos-d*sin,b,c,a*sin+d*cos]
    }
    function p4to3(v:[number,number,number,number]):[number,number,number]{const w=2.5-v[3];return[v[0]/w,v[1]/w,v[2]/w]}
    function p3to2(v:[number,number,number]):[number,number]{const d=3.5-v[2];return[v[0]/d,v[1]/d]}
    function draw(){
      ctx.clearRect(0,0,420,420); t+=.008
      const cx=210, cy=210, sc=155
      const proj=v4.map(v=>{
        let r=rot4(v,t*.7,0); r=rot4(r,t*.5,1); r=rot4(r,t*.3,2)
        const v3=p4to3(r), v2=p3to2(v3)
        return{x:v2[0],y:v2[1],z:v3[2]}
      })
      edges.forEach(([a,b])=>{
        const pa=proj[a], pb=proj[b]
        const depth=(pa.z+pb.z)/2
        const br=0.15+((depth+1.5)/3)*.75
        const inner=(a&8)===(b&8)
        const g=ctx.createLinearGradient(cx+pa.x*sc,cy+pa.y*sc,cx+pb.x*sc,cy+pb.y*sc)
        if(inner){g.addColorStop(0,`rgba(184,255,0,${br*.9})`);g.addColorStop(1,`rgba(0,240,200,${br*.9})`)}
        else{g.addColorStop(0,`rgba(0,240,200,${br*.5})`);g.addColorStop(1,`rgba(184,255,0,${br*.5})`)}
        ctx.beginPath();ctx.moveTo(cx+pa.x*sc,cy+pa.y*sc);ctx.lineTo(cx+pb.x*sc,cy+pb.y*sc)
        ctx.strokeStyle=g;ctx.lineWidth=inner?1.5:.75;ctx.stroke()
      })
      proj.forEach(p=>{
        const depth=(p.z+1.5)/3
        const glow=ctx.createRadialGradient(cx+p.x*sc,cy+p.y*sc,0,cx+p.x*sc,cy+p.y*sc,5)
        glow.addColorStop(0,`rgba(184,255,0,${.6+depth*.4})`);glow.addColorStop(1,'rgba(184,255,0,0)')
        ctx.beginPath();ctx.arc(cx+p.x*sc,cy+p.y*sc,3,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill()
      })
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,80)
      cg.addColorStop(0,`rgba(0,240,200,${.05+Math.sin(t)*.02})`);cg.addColorStop(1,'rgba(0,240,200,0)')
      ctx.fillStyle=cg;ctx.fillRect(0,0,420,420)
      animId=requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  const review = REVIEWS[reviewIdx]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--bg:#07080f;--lime:#b8ff00;--teal:#00f0c8;--bd:rgba(255,255,255,0.06);--bd2:rgba(255,255,255,0.12);--t1:#fff;--t2:rgba(255,255,255,0.72);--t3:rgba(255,255,255,0.42);--t4:rgba(255,255,255,0.18);}
        html,body{min-height:100vh;background:var(--bg);color:var(--t1);font-family:'Inter',sans-serif;overflow-x:hidden;scroll-behavior:smooth;}
        canvas.bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
        nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;padding:0 40px;justify-content:space-between;border-bottom:1px solid var(--bd);background:rgba(7,8,15,0.85);backdrop-filter:blur(28px);}
        .nlogo{display:flex;align-items:center;gap:10px;text-decoration:none;}
        .nmark{width:34px;height:34px;border-radius:9px;overflow:hidden;background:rgba(184,255,0,0.1);display:flex;align-items:center;justify-content:center;}
        .nmark img{width:34px;height:34px;display:block;}
        .nname{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;letter-spacing:-.3px;}
        .nav-links{display:flex;align-items:center;gap:6px;}
        .nav-link{color:var(--t3);text-decoration:none;font-size:13px;padding:7px 14px;border-radius:7px;transition:color .15s,background .15s;font-weight:500;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.05);}
        .nav-cta{background:var(--lime);color:#07080f;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;text-decoration:none;transition:background .15s,box-shadow .15s;}
        .nav-cta:hover{background:#cbff1a;box-shadow:0 0 22px rgba(184,255,0,0.38);}
        .hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.22);padding:6px 14px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#b8ff00;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px;opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease;}
        .hero-badge.in{opacity:1;transform:translateY(0);}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:#b8ff00;animation:blink 1.8s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.12}}
        .hero-h1{font-family:'Syne',sans-serif;font-size:clamp(52px,8vw,96px);font-weight:800;line-height:.95;letter-spacing:-3px;color:#fff;opacity:0;transform:translateY(18px);transition:opacity .45s ease .12s,transform .45s ease .12s;}
        .hero-h1.in{opacity:1;transform:translateY(0);}
        .hero-word{display:block;background:linear-gradient(135deg,#b8ff00 30%,#00f0c8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;min-height:1.1em;transition:opacity .3s ease;}
        .hero-sub{font-size:clamp(15px,2.2vw,19px);color:#ffffffb8;max-width:580px;line-height:1.65;font-weight:300;margin:24px auto 40px;opacity:0;transform:translateY(14px);transition:opacity .45s ease .24s,transform .45s ease .24s;}
        .hero-sub.in{opacity:1;transform:translateY(0);}
        .hero-btns{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;opacity:0;transform:translateY(12px);transition:opacity .45s ease .34s,transform .45s ease .34s;}
        .hero-btns.in{opacity:1;transform:translateY(0);}
        .btn-primary{background:var(--lime);color:#07080f;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;transition:background .15s,box-shadow .15s,transform .15s;display:inline-flex;align-items:center;gap:8px;}
        .btn-primary:hover{background:#cbff1a;box-shadow:0 0 30px rgba(184,255,0,0.42);transform:translateY(-2px);}
        .btn-secondary{background:transparent;color:#fff;font-size:14px;font-weight:500;padding:13px 26px;border-radius:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.16);transition:border-color .15s,transform .15s;display:inline-flex;align-items:center;gap:8px;}
        .btn-secondary:hover{border-color:rgba(184,255,0,0.32);transform:translateY(-2px);}
        .hero-stats{display:flex;align-items:center;gap:40px;margin-top:60px;opacity:0;transform:translateY(10px);transition:opacity .45s ease .44s,transform .45s ease .44s;}
        .hero-stats.in{opacity:1;transform:translateY(0);}
        .stat-n{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;}
        .stat-l{font-size:11px;color:rgba(255,255,255,0.4);font-family:'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-top:2px;text-align:center;}
        .stat-div{width:1px;height:36px;background:var(--bd2);}
        section{position:relative;z-index:1;padding:100px 24px;}
        .section-inner{max-width:1180px;margin:0 auto;}
        .section-label{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--teal);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;}
        .section-label::before{content:'';display:block;width:20px;height:1px;background:var(--teal);}
        .section-h2{font-family:'Syne',sans-serif;font-size:clamp(34px,5vw,56px);font-weight:800;letter-spacing:-2px;line-height:1.05;color:#fff;margin-bottom:16px;}
        .section-sub{font-size:16px;color:rgba(255,255,255,0.65);max-width:500px;line-height:1.65;font-weight:300;}
        /* 4D Vision */
        .vision-wrap{position:relative;z-index:1;padding:60px 24px;max-width:1100px;margin:0 auto;}
        .vision-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
        @media(max-width:900px){.vision-grid{grid-template-columns:1fr;}}
        .vision-cv-wrap{display:flex;justify-content:center;align-items:center;position:relative;}
        .vision-cv-wrap::before{content:'';position:absolute;inset:-20px;background:radial-gradient(ellipse,rgba(184,255,0,0.06),transparent 70%);border-radius:50%;pointer-events:none;animation:vglow 4s ease-in-out infinite;}
        @keyframes vglow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        .vision-cv{border:1px solid rgba(184,255,0,0.12);border-radius:16px;background:rgba(7,8,15,0.6);backdrop-filter:blur(8px);}
        .vtag-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
        .vtag{font-family:'JetBrains Mono',monospace;font-size:9px;padding:4px 10px;border-radius:3px;color:#b8ff00;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.15);letter-spacing:1px;text-transform:uppercase;}
        /* Tools */
        .tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin-top:56px;}
        .tool-card{background:rgba(12,14,26,0.75);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:26px;cursor:pointer;text-decoration:none;transition:border-color .2s,transform .2s,box-shadow .2s;display:block;position:relative;overflow:hidden;}
        .tool-card::before{content:'';position:absolute;inset:0;border-radius:14px;opacity:0;background:radial-gradient(circle at 40% 50%,rgba(184,255,0,0.07),transparent 70%);transition:opacity .2s;}
        .tool-card.teal::before{background:radial-gradient(circle at 40% 50%,rgba(0,240,200,0.07),transparent 70%);}
        .tool-card:hover{border-color:rgba(184,255,0,0.28);transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,0.5);}
        .tool-card.teal:hover{border-color:rgba(0,240,200,0.28);}
        .tool-card:hover::before{opacity:1;}
        .tc-icon{font-size:26px;margin-bottom:14px;display:block;transition:transform .2s;}
        .tool-card:hover .tc-icon{transform:scale(1.15) rotate(-4deg);}
        .tc-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;}
        .tc-desc{font-size:12.5px;color:rgba(255,255,255,0.45);line-height:1.55;}
        .tc-tag{display:inline-flex;align-items:center;margin-top:16px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;padding:4px 9px;border-radius:3px;}
        .tc-tag.lime{color:#b8ff00;background:rgba(184,255,0,0.08);border:1px solid rgba(184,255,0,0.15);}
        .tc-tag.teal{color:#00f0c8;background:rgba(0,240,200,0.08);border:1px solid rgba(0,240,200,0.15);}
        .tc-arrow{position:absolute;right:20px;bottom:20px;font-size:16px;color:rgba(255,255,255,0.15);transition:color .2s,transform .2s;transform:translateX(-4px);}
        .tool-card:hover .tc-arrow{color:#b8ff00;transform:translateX(0);}
        .tool-card.teal:hover .tc-arrow{color:#00f0c8;}
        /* Reviews */
        .reviews-outer{position:relative;z-index:1;padding:80px 24px;}
        .reviews-inner{max-width:860px;margin:0 auto;}
        .review-stage{position:relative;display:flex;align-items:stretch;justify-content:center;margin-top:48px;}
        .review-card{background:rgba(12,14,26,0.88);border:1px solid rgba(255,255,255,0.09);border-radius:18px;padding:40px 44px;width:100%;position:relative;transition:opacity .24s ease,transform .24s ease;}
        .review-card.in{opacity:1;transform:translateY(0);}
        .review-card.out{opacity:0;transform:translateY(12px);}
        .review-stars{display:flex;gap:4px;margin-bottom:20px;}
        .star{color:#b8ff00;font-size:14px;}
        .review-text{font-size:16px;color:rgba(255,255,255,0.82);line-height:1.75;font-weight:300;font-style:italic;margin-bottom:24px;}
        .review-author{display:flex;align-items:center;gap:14px;}
        .review-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#07080f;flex-shrink:0;}
        .review-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;}
        .review-role{font-size:11.5px;color:rgba(255,255,255,0.4);margin-top:2px;}
        .review-dots{display:flex;gap:8px;justify-content:center;margin-top:28px;}
        .rdot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15);cursor:pointer;transition:background .2s,transform .2s;}
        .rdot.active{background:#b8ff00;transform:scale(1.3);}
        .review-quote{position:absolute;top:18px;right:24px;font-size:72px;color:rgba(184,255,0,0.06);font-family:serif;line-height:1;pointer-events:none;user-select:none;}
        /* Features */
        .feature-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:56px;border:1px solid var(--bd);border-radius:16px;overflow:hidden;}
        @media(max-width:720px){.feature-strip{grid-template-columns:1fr;}}
        .feature-cell{background:rgba(12,14,26,0.5);padding:36px 32px;}
        .feature-cell+.feature-cell{border-left:1px solid var(--bd);}
        @media(max-width:720px){.feature-cell+.feature-cell{border-left:none;border-top:1px solid var(--bd);}}
        .fc-num{font-family:'JetBrains Mono',monospace;font-size:10px;color:#b8ff00;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;}
        .fc-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:700;color:#fff;margin-bottom:10px;}
        .fc-body{font-size:13.5px;color:rgba(255,255,255,0.6);line-height:1.65;}
        .cta-section{text-align:center;padding:120px 24px;position:relative;z-index:1;}
        .cta-h2{font-family:'Syne',sans-serif;font-size:clamp(40px,6vw,68px);font-weight:800;letter-spacing:-2.5px;line-height:1;color:#fff;margin-bottom:20px;}
        .cta-sub{font-size:17px;color:rgba(255,255,255,0.65);font-weight:300;margin-bottom:40px;line-height:1.6;}
        .cta-inner{max-width:700px;margin:0 auto;}
        footer{position:relative;z-index:1;border-top:1px solid var(--bd);padding:36px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
        .footer-logo{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:rgba(255,255,255,0.4);}
        .footer-copy{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;}
        .footer-links a{font-size:12px;color:rgba(255,255,255,0.35);text-decoration:none;margin-left:20px;transition:color .15s;}
        .footer-links a:hover{color:#fff;}
        .fade-up{opacity:0;transform:translateY(22px);transition:opacity .5s ease,transform .5s ease;}
        .fade-up.visible{opacity:1;transform:translateY(0);}
        @media(max-width:640px){nav{padding:0 20px;}.hero-btns{flex-direction:column;}.hero-stats{gap:20px;}.review-card{padding:28px 24px;}}
      `}</style>

      <canvas ref={canvasRef} className="bg" />

      <nav>
        <a href="/" className="nlogo">
          <div className="nmark"><img src="/logo.svg" alt="RE" /></div>
          <span className="nname">REIOGN</span>
        </a>
        <div className="nav-links">
          <a href="#tools"    className="nav-link">Tools</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="/login"    className="nav-link">Sign in</a>
          <a href="/signup"   className="nav-cta">Start Free →</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className={`hero-badge ${visible ? 'in' : ''}`}><div className="badge-dot" /> AI Intelligence Platform</div>
        <h1 className={`hero-h1 ${visible ? 'in' : ''}`}>
          10 AI Tools To<br />
          <span className="hero-word">{['Outperform.','Outlast.','Outthink.'][heroText]}</span>
        </h1>
        <p className={`hero-sub ${visible ? 'in' : ''}`}>
          REIOGN gives you a full arsenal of cognitive performance tools powered by Claude AI —
          from deep work planning to wealth mapping. Built for builders who refuse to coast.
        </p>
        <div className={`hero-btns ${visible ? 'in' : ''}`}>
          <a href="/signup" className="btn-primary">Start Free Trial →</a>
          <a href="/login"  className="btn-secondary">Sign in</a>
        </div>
        <div className={`hero-stats ${visible ? 'in' : ''}`}>
          <div><div className="stat-n">10</div><div className="stat-l">AI Tools</div></div>
          <div className="stat-div" />
          <div><div className="stat-n">3</div><div className="stat-l">Day Trial</div></div>
          <div className="stat-div" />
          <div><div className="stat-n">∞</div><div className="stat-l">Leverage</div></div>
        </div>
      </section>

      {/* 4D Vision */}
      <div className="vision-wrap fade-up">
        <div className="vision-grid">
          <div className="vision-cv-wrap">
            <canvas ref={visionRef} className="vision-cv" width={420} height={420} style={{width:380,height:380}} />
          </div>
          <div>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'rgba(0,240,200,0.5)',letterSpacing:'2.5px',textTransform:'uppercase',display:'block',marginBottom:8}}>4D Intelligence Engine</span>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1.5px',lineHeight:1.1,color:'#fff',marginBottom:14}}>
              Think in <span style={{color:'#b8ff00'}}>Higher</span> Dimensions
            </div>
            <p style={{fontSize:15,color:'rgba(255,255,255,0.6)',lineHeight:1.7,fontWeight:300,maxWidth:420}}>
              REIOGN routes every query through a multi-dimensional intelligence stack —
              Claude Opus for deep cognition, Gemini for research, Groq for speed.
              The right model for the right cognitive task, always.
            </p>
            <div className="vtag-row">
              {['Claude Opus','Gemini Pro','Groq LLaMA','Auto-routing','Fallback chain'].map(t=>(
                <span key={t} className="vtag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <section id="tools">
        <div className="section-inner">
          <div className="fade-up">
            <div className="section-label">Your Arsenal</div>
            <h2 className="section-h2">10 Tools.<br />Zero Compromises.</h2>
            <p className="section-sub">Each tool is precision-built for a specific cognitive task. Not generic. Not vague. Designed to produce results.</p>
          </div>
          <div className="tools-grid fade-up">
            {TOOLS.map(tool => (
              <a key={tool.id} href="/signup" className={`tool-card ${tool.color === 'teal' ? 'teal' : ''}`}>
                <span className="tc-icon">{tool.icon}</span>
                <div className="tc-name">{tool.name}</div>
                <div className="tc-desc">{tool.desc}</div>
                <div className={`tc-tag ${tool.color}`}>{tool.color === 'lime' ? '◆ Core' : '◇ Advanced'}</div>
                <div className="tc-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="reviews-outer fade-up">
        <div className="reviews-inner">
          <div style={{textAlign:'center'}}>
            <div className="section-label" style={{justifyContent:'center'}}>Social Proof</div>
            <h2 className="section-h2" style={{textAlign:'center'}}>Real People.<br />Real Results.</h2>
          </div>
          <div className="review-stage">
            <div className={`review-card ${reviewAnim ? 'in' : 'out'}`}>
              <div className="review-quote">"</div>
              <div className="review-stars">{[...Array(review.rating)].map((_,i)=><span key={i} className="star">★</span>)}</div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <div className="review-avatar" style={{background:review.color}}>{review.avatar}</div>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-role">{review.role}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="review-dots">
            {REVIEWS.map((_,i)=>(
              <div key={i} className={`rdot ${i===reviewIdx?'active':''}`} onClick={()=>{setReviewAnim(false);setTimeout(()=>{setReviewIdx(i);setReviewAnim(true)},220)}} />
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features">
        <div className="section-inner">
          <div className="fade-up">
            <div className="section-label">Why REIOGN</div>
            <h2 className="section-h2">Built Different.</h2>
          </div>
          <div className="feature-strip fade-up">
            <div className="feature-cell">
              <div className="fc-num">01 — DEPTH</div>
              <div className="fc-title">Not a chatbot.<br />A system.</div>
              <div className="fc-body">Every tool has a defined purpose and output format. Claude Opus for deep cognition. Haiku for rapid analysis. Right model for the right job.</div>
            </div>
            <div className="feature-cell">
              <div className="fc-num">02 — PRECISION</div>
              <div className="fc-title">Token-based.<br />Atomic billing.</div>
              <div className="fc-body">Pay only for what you use. Tokens deducted atomically — refunded on any AI failure. Full history. Zero hidden costs.</div>
            </div>
            <div className="feature-cell">
              <div className="fc-num">03 — SPEED</div>
              <div className="fc-title">Instant output.<br />Structured results.</div>
              <div className="fc-body">Every response is structured for action. Numbered frameworks, specific numbers, real timelines. Designed to execute from.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner fade-up">
          <h2 className="cta-h2">Stop Thinking.<br />Start Executing.</h2>
          <p className="cta-sub">3-day free trial. 500 tokens on signup. No card required. Start using all 10 tools today.</p>
          <a href="/signup" className="btn-primary" style={{fontSize:'16px',padding:'16px 40px'}}>Create Free Account →</a>
        </div>
      </section>

      <footer>
        <span className="footer-logo">REIOGN</span>
        <div className="footer-links"><a href="/login">Sign in</a><a href="/signup">Sign up</a></div>
        <span className="footer-copy">© 2025 REIOGN</span>
      </footer>
      <ScrollReveal />
    </>
  )
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){(e.target as HTMLElement).classList.add('visible');obs.unobserve(e.target)} })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return null
}
