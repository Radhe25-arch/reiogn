'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current; if (!canvas) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const c = canvas.getContext('2d')!; let animId: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    const particles: {x:number;y:number;vx:number;vy:number;size:number;alpha:number;color:string}[] = []
    for(let i=0;i<90;i++) particles.push({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      size:Math.random()*1.8+.3, alpha:Math.random()*.45+.08,
      color:Math.random()>.5?'#b8ff00':'#00f0c8',
    })
    function draw(){
      canvas!.width=window.innerWidth; canvas!.height=window.innerHeight
      c.clearRect(0,0,canvas!.width,canvas!.height)
      const bg=c.createRadialGradient(canvas!.width*.5,canvas!.height*.4,0,canvas!.width*.5,canvas!.height*.4,canvas!.width*.8)
      bg.addColorStop(0,'#0a0c18'); bg.addColorStop(1,'#07080f')
      c.fillStyle=bg; c.fillRect(0,0,canvas!.width,canvas!.height)
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0)p.x=canvas!.width; if(p.x>canvas!.width)p.x=0
        if(p.y<0)p.y=canvas!.height; if(p.y>canvas!.height)p.y=0
        c.beginPath(); c.arc(p.x,p.y,p.size,0,Math.PI*2)
        c.fillStyle=p.color+(Math.floor(p.alpha*255).toString(16).padStart(2,'0')); c.fill()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{cancelAnimationFrame(animId);window.removeEventListener('resize',resize)}
  },[mounted])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
      const data = await res.json().catch(()=>({error:'Unexpected server response'}))
      if(!res.ok){setError(data.error||'Sign in failed.');setLoading(false);return}
      router.push('/dashboard')
    } catch {
      setError(navigator.onLine?'Unable to reach the server.':'You appear to be offline.')
      setLoading(false)
    }
  }

  function oauthURL(provider:'google'|'github'|'discord'){
    const base=typeof window!=='undefined'?window.location.origin:''
    const redirect=`${base}/api/auth/oauth/${provider}`
    if(provider==='google')return`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({client_id:process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID??'',redirect_uri:redirect,response_type:'code',scope:'openid email profile'})}`
    if(provider==='github')return`https://github.com/login/oauth/authorize?${new URLSearchParams({client_id:process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID??'',redirect_uri:redirect,scope:'read:user user:email'})}`
    return`https://discord.com/api/oauth2/authorize?${new URLSearchParams({client_id:process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID??'',redirect_uri:redirect,response_type:'code',scope:'identify email'})}`
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--bg:#07080f;--s2:#111320;--lime:#b8ff00;--rose:#ff4f72;--bd:rgba(255,255,255,0.06);--bd2:rgba(255,255,255,0.11);--t1:#eef0ff;--t2:rgba(238,240,255,0.55);--t3:rgba(238,240,255,0.28);--t4:rgba(238,240,255,0.10);}
        html,body{min-height:100vh;background:var(--bg);color:var(--t1);font-family:'Inter',sans-serif;}
        .bg{position:fixed;inset:0;z-index:0;pointer-events:none;}
        .page{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px 20px;}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;display:flex;align-items:center;padding:0 36px;justify-content:space-between;border-bottom:1px solid var(--bd);background:rgba(7,8,15,0.85);backdrop-filter:blur(20px);}
        .nlogo{display:flex;align-items:center;gap:9px;text-decoration:none;}
        .nmark{width:32px;height:32px;border-radius:8px;overflow:hidden;}
        .nmark img{width:32px;height:32px;}
        .nname{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--t1);}
        .card{background:rgba(12,14,26,0.9);backdrop-filter:blur(24px);border:1px solid var(--bd2);border-radius:16px;padding:38px 40px;width:100%;max-width:400px;box-shadow:0 32px 80px rgba(0,0,0,0.7);}
        @media(max-width:460px){.card{padding:26px 20px;}}
        .badge{display:inline-flex;align-items:center;gap:7px;background:rgba(184,255,0,0.07);border:1px solid rgba(184,255,0,0.18);padding:4px 11px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--lime);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px;}
        .badge-dot{width:5px;height:5px;border-radius:50%;background:var(--lime);animation:blink 1.8s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
        h1{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-1.2px;line-height:1.1;margin-bottom:6px;}
        .sub{font-size:13.5px;color:var(--t2);margin-bottom:26px;font-weight:300;}
        .oauth-btns{display:flex;flex-direction:column;gap:9px;margin-bottom:22px;}
        .oauth-btn{display:flex;align-items:center;justify-content:center;gap:9px;padding:11px 16px;border-radius:8px;border:1px solid var(--bd2);background:rgba(255,255,255,0.02);color:var(--t1);font-size:13px;font-weight:500;cursor:pointer;transition:border-color .15s,background .15s;text-decoration:none;width:100%;}
        .oauth-btn:hover{border-color:rgba(184,255,0,0.28);background:rgba(255,255,255,0.04);}
        .divider{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
        .div-line{flex:1;height:1px;background:var(--bd);}
        .div-txt{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--t4);letter-spacing:1.5px;text-transform:uppercase;}
        .field{margin-bottom:14px;}
        label{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--t3);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;}
        .inp-wrap{position:relative;}
        input{width:100%;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:11px 14px;color:var(--t1);font-size:13.5px;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s;}
        input:focus{border-color:rgba(184,255,0,0.35);}
        input::placeholder{color:var(--t4);}
        .pass-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--t3);font-size:12px;padding:4px;font-family:'JetBrains Mono',monospace;}
        .pass-toggle:hover{color:var(--t2);}
        .error-box{background:rgba(255,79,114,0.08);border:1px solid rgba(255,79,114,0.2);border-radius:7px;padding:10px 13px;font-size:12.5px;color:var(--rose);margin-bottom:14px;}
        .submit-btn{width:100%;padding:13px;background:var(--lime);color:var(--bg);border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s,box-shadow .15s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;}
        .submit-btn:hover:not(:disabled){background:#cbff1a;box-shadow:0 0 24px rgba(184,255,0,0.3);}
        .submit-btn:disabled{opacity:.6;cursor:not-allowed;}
        .spinner{width:15px;height:15px;border:2px solid rgba(7,8,15,0.3);border-top-color:var(--bg);border-radius:50%;animation:spin .7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .footer-txt{text-align:center;margin-top:20px;font-size:12.5px;color:var(--t3);}
        .footer-txt a{color:var(--lime);text-decoration:none;}
      `}</style>

      {mounted && <canvas ref={canvasRef} className="bg" />}

      <nav>
        <a href="/" className="nlogo">
          <div className="nmark"><img src="/logo.svg" alt="REIOGN" /></div>
          <span className="nname">REIOGN</span>
        </a>
        <a href="/signup" style={{fontSize:'13px',color:'var(--lime)',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:700}}>Start Free →</a>
      </nav>

      <div className="page">
        <div className="card">
          <div className="badge"><div className="badge-dot" />Welcome Back</div>
          <h1>Sign in to <span style={{color:'var(--lime)'}}>REIOGN</span></h1>
          <p className="sub">Access your AI performance toolkit.</p>

          <div className="oauth-btns">
            <a href={mounted ? oauthURL('google') : '#'} className="oauth-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </a>
            <a href={mounted ? oauthURL('github') : '#'} className="oauth-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              Continue with GitHub
            </a>
            <a href={mounted ? oauthURL('discord') : '#'} className="oauth-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
              Continue with Discord
            </a>
          </div>

          <div className="divider"><div className="div-line"/><span className="div-txt">or email</span><div className="div-line"/></div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="inp-wrap">
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required autoComplete="current-password" style={{paddingRight:'48px'}}/>
                <button type="button" className="pass-toggle" onClick={()=>setShowPass(v=>!v)}>{showPass?'hide':'show'}</button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><div className="spinner"/>Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <p className="footer-txt">No account? <a href="/signup">Start free trial</a></p>
        </div>
      </div>
    </>
  )
}
