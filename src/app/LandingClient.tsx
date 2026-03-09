"use client";
import { useEffect, useState } from "react";

const Icons: Record<string, JSX.Element> = {
  deepwork: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3.5-2 6-4 7.5V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5C7 15 5 12.5 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/><path d="M12 7v5l3 2"/></svg>,
  clone:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  research: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>,
  skill:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  memory:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
  exec:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  radar:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>,
  decision: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  wealth:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  shield:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
  // 2 NEW ULTRA TOOLS
  neural:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/><line x1="12" y1="6" x2="12" y2="10"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="10" y1="18" x2="9" y2="14"/><line x1="14" y1="18" x2="15" y2="14"/><circle cx="12" cy="12" r="2"/></svg>,
  timewarp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
};

const TOOLS = [
  { key:"deepwork", badge:"b-medium", badgeText:"Medium", title:"Deep Work Engine",    desc:"Maps your cognitive cycles, schedules deep focus blocks, eliminates decision fatigue. Not a to-do list — a precision session planner.", accent:"#4F7FFF" },
  { key:"clone",    badge:"b-heavy",  badgeText:"Heavy",  title:"Cognitive Clone",     desc:"Simulate your best self — decision patterns, communication style, blind spots. Used to prepare high-stakes presentations and negotiations.", accent:"#FF8A65" },
  { key:"research", badge:"b-medium", badgeText:"Medium", title:"Research Builder",    desc:"Synthesizes 3+ sources per query with relevance scoring. Surfaces the contrarian signal buried in the noise. Zero padding.", accent:"#10B981" },
  { key:"skill",    badge:"b-light",  badgeText:"Light",  title:"Skill ROI Analyzer",  desc:"3, 12, and 36-month ROI projections for any skill investment. Prioritized rankings. Where to spend your next 100 hours.", accent:"#F59E0B" },
  { key:"memory",   badge:"b-medium", badgeText:"Medium", title:"Memory Intelligence", desc:"Builds spaced repetition architectures around any material. You will retain 80% of what you study — long-term.", accent:"#4F7FFF" },
  { key:"exec",     badge:"b-medium", badgeText:"Medium", title:"Execution Optimizer", desc:"Breaks any goal into numbered micro-actions with real timelines. 7-day sprint frameworks. The gap between planning and doing — closed.", accent:"#EF4444" },
  { key:"radar",    badge:"b-heavy",  badgeText:"Heavy",  title:"Opportunity Radar",   desc:"Scans your context for high-leverage opportunities you are systematically missing. Probability-ranked. Action-oriented.", accent:"#A78BFA" },
  { key:"decision", badge:"b-heavy",  badgeText:"Heavy",  title:"Decision Simulator",  desc:"Input any major decision. Get 3 to 5 simulated futures with probability-weighted outcomes and second-order effects. Think 10 moves ahead.", accent:"#EC4899" },
  { key:"wealth",   badge:"b-heavy",  badgeText:"Heavy",  title:"Wealth Mapper",       desc:"Personal wealth architecture — income streams, leverage points, risk-adjusted path-to-goal modelling. Your financial operating system.", accent:"#F59E0B" },
  { key:"shield",   badge:"b-light",  badgeText:"Light",  title:"Focus Shield",        desc:"Distraction elimination protocol. Identifies your top 3 cognitive leaks. Delivers a zero-fluff defense system in under 3 seconds.", accent:"#10B981" },
  { key:"neural",   badge:"b-heavy",  badgeText:"Ultra",  title:"Neural Pattern Engine", desc:"Detects invisible cognitive patterns across your sessions — identifies peak performance windows, decision traps, and mental fatigue triggers before they hit.", accent:"#7C3AED" },
  { key:"timewarp", badge:"b-heavy",  badgeText:"Ultra",  title:"Time Architect",      desc:"Reconstructs your relationship with time itself. Maps energy curves, identifies your highest-ROI hours, and builds a personal chronotype optimization system.", accent:"#0EA5E9" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@300;400;500&display=swap');
.theme-dark{--bg:#080B12;--bg2:#0C1018;--bg3:#101520;--surface:#141922;--surface2:#1a2130;--border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.12);--text:#E8EAF0;--text2:#8892A4;--text3:#5A6478;--accent:#4F7FFF;--accent2:#6B93FF;--green:#10B981;--amber:#F59E0B;--shadow:rgba(0,0,0,.5)}
.theme-light{--bg:#F8F9FC;--bg2:#F0F2F8;--bg3:#E8EBF4;--surface:#FFFFFF;--surface2:#F4F5FA;--border:rgba(0,0,0,.08);--border2:rgba(0,0,0,.14);--text:#0D1117;--text2:#4B5563;--text3:#9CA3AF;--accent:#3B6EE8;--accent2:#5580F0;--green:#059669;--amber:#D97706;--shadow:rgba(0,0,0,.1)}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{background:var(--bg);color:var(--text);font-family:'Geist',system-ui,sans-serif;-webkit-font-smoothing:antialiased;scroll-behavior:smooth;overflow-x:hidden}
body{overflow-x:hidden}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;outline:none}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes heroPreview{to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes introExit{to{clip-path:inset(0 0 100% 0);visibility:hidden}}

.container{max-width:1200px;margin:0 auto;padding:0 24px}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}
.reveal.on{opacity:1;transform:none}
.reveal-d1{transition-delay:.1s}.reveal-d2{transition-delay:.2s}.reveal-d3{transition-delay:.3s}
.section{padding:120px 0}.section-sm{padding:80px 0}
.tag{display:inline-flex;align-items:center;gap:6px;font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.04em;color:var(--accent);background:rgba(79,127,255,.08);border:1px solid rgba(79,127,255,.2);padding:5px 12px;border-radius:100px}
.tag::before{content:'';width:6px;height:6px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite}

/* INTRO */
#intro{position:fixed;inset:0;z-index:9900;background:#050709;display:flex;align-items:center;justify-content:center;flex-direction:column}
#intro canvas{position:absolute;inset:0;width:100%;height:100%}
.intro-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px}
.intro-logo{font-size:clamp(32px,8vw,48px);font-weight:900;letter-spacing:.18em;color:#E8EAF0;opacity:0;transform:translateY(10px);transition:opacity .8s,transform .8s}
.intro-logo span{color:#4F7FFF}
.intro-tagline{font-family:'Geist Mono',monospace;font-size:clamp(10px,2vw,12px);letter-spacing:.3em;text-transform:uppercase;color:#5A6478;opacity:0;transition:opacity .6s .4s}
.intro-progress{width:160px;height:1px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden}
.intro-bar{height:100%;width:0;background:#4F7FFF;transition:width 2.2s cubic-bezier(.23,1,.32,1)}
#intro.exit{animation:introExit .7s .1s forwards}

/* NAV */
#nav{position:fixed;top:0;left:0;right:0;z-index:800;height:60px;display:flex;align-items:center;padding:0 24px;transition:background .3s,border-color .3s;border-bottom:1px solid transparent;opacity:0}
#nav.on{opacity:1}
#nav.scrolled{background:rgba(8,11,18,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom-color:var(--border)}
.theme-light #nav.scrolled{background:rgba(248,249,252,.95)}
.nav-inner{display:flex;align-items:center;width:100%;gap:0}
.nav-logo{display:flex;align-items:center;gap:8px;flex-shrink:0}
.nav-logo-mark{width:26px;height:26px;background:var(--accent);clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);transition:transform .4s cubic-bezier(.34,1.56,.64,1);flex-shrink:0}
.nav-logo:hover .nav-logo-mark{transform:rotate(90deg) scale(1.1)}
.nav-logo-text{font-size:17px;font-weight:800;letter-spacing:.12em;color:var(--text)}
.nav-links{display:flex;align-items:center;gap:2px;margin-left:32px}
.nav-links a{font-size:13.5px;color:var(--text2);padding:6px 10px;border-radius:7px;transition:color .18s,background .18s;white-space:nowrap}
.nav-links a:hover{color:var(--text);background:rgba(127,127,127,.08)}
.nav-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0}
.theme-toggle{width:44px;height:24px;border-radius:100px;border:1px solid var(--border2);background:var(--surface2);position:relative;cursor:pointer;transition:background .25s;display:flex;align-items:center;padding:0 4px;flex-shrink:0}
.theme-toggle-knob{width:16px;height:16px;border-radius:50%;background:var(--accent);transition:transform .25s cubic-bezier(.34,1.56,.64,1);flex-shrink:0}
.theme-light .theme-toggle-knob{transform:translateX(20px)}
.btn-ghost-sm{font-size:13px;font-weight:500;color:var(--text2);padding:7px 14px;border-radius:8px;background:transparent;transition:color .18s,background .18s;white-space:nowrap}
.btn-ghost-sm:hover{color:var(--text);background:rgba(127,127,127,.08)}
.btn-primary-sm{font-size:13px;font-weight:600;color:#fff;padding:7px 16px;border-radius:8px;background:var(--accent);transition:background .18s,transform .15s;white-space:nowrap}
.btn-primary-sm:hover{background:var(--accent2);transform:translateY(-1px)}
#burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;margin-left:8px;flex-shrink:0}
#burger span{width:20px;height:1.5px;background:var(--text);border-radius:2px;transition:transform .3s,opacity .3s;display:block}
#mmenu{position:fixed;inset:60px 0 0;background:var(--bg);z-index:799;flex-direction:column;align-items:center;justify-content:center;gap:32px;display:none;padding:20px}
#mmenu.on{display:flex}
#mmenu a{font-size:20px;font-weight:600;color:var(--text2);transition:color .18s}
#mmenu a:hover{color:var(--text)}

@media(max-width:960px){.nav-links{display:none}#burger{display:flex}}
@media(max-width:600px){.nav-right .btn-ghost-sm{display:none}}

/* HERO */
#hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;padding:100px 20px 60px;background:var(--bg)}
.hero-mesh{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(79,127,255,.15) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 60%,rgba(79,127,255,.06) 0%,transparent 60%)}
.theme-light .hero-mesh{background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(59,110,232,.1) 0%,transparent 70%)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 80%)}
.hero-content{position:relative;z-index:2;max-width:860px;display:flex;flex-direction:column;align-items:center;gap:24px;opacity:0;animation:fadeUp 1s .2s cubic-bezier(.16,1,.3,1) forwards;width:100%}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(79,127,255,.08);border:1px solid rgba(79,127,255,.22);padding:6px 14px 6px 8px;border-radius:100px;font-size:12px;color:var(--text2);flex-wrap:wrap;justify-content:center}
.badge-pill{font-family:'Geist Mono',monospace;font-size:10px;font-weight:600;color:#fff;background:var(--accent);padding:2px 8px;border-radius:100px;flex-shrink:0}
.badge-dot{width:5px;height:5px;background:var(--green);border-radius:50%;animation:pulse 1.8s infinite;flex-shrink:0}
.hero-h1{font-size:clamp(36px,7vw,86px);font-weight:800;line-height:1.04;letter-spacing:-.03em;color:var(--text);text-wrap:balance}
.accent-text{background:linear-gradient(135deg,#4F7FFF 0%,#7BA3FF 50%,#A5C0FF 100%);background-size:200% 200%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 4s ease infinite}
.hero-sub{font-size:clamp(15px,2vw,19px);color:var(--text2);max-width:520px;line-height:1.65;text-wrap:balance}
.hero-ctas{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;width:100%}
.btn-primary{display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#fff;background:var(--accent);padding:13px 26px;border-radius:10px;cursor:pointer;transition:background .18s,transform .15s,box-shadow .2s;box-shadow:0 4px 24px rgba(79,127,255,.25)}
.btn-primary:hover{background:var(--accent2);transform:translateY(-2px);box-shadow:0 8px 36px rgba(79,127,255,.35)}
.btn-secondary{display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:500;color:var(--text2);background:rgba(127,127,127,.06);padding:13px 24px;border-radius:10px;border:1px solid var(--border);cursor:pointer;transition:color .18s,background .18s,border-color .18s,transform .15s}
.btn-secondary:hover{color:var(--text);background:rgba(127,127,127,.1);border-color:var(--border2);transform:translateY(-1px)}
.hero-meta{font-family:'Geist Mono',monospace;font-size:11px;color:var(--text3);display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center}
.hero-meta-item{display:flex;align-items:center;gap:6px}
.hero-meta-item::before{content:'✓';color:var(--green);font-size:11px}

/* HERO PREVIEW */
.hero-preview{position:relative;z-index:2;width:100%;max-width:1060px;margin-top:50px;opacity:0;transform:translateY(32px) scale(.97);animation:heroPreview 1s .7s cubic-bezier(.16,1,.3,1) forwards}
.preview-browser{background:var(--surface);border:1px solid var(--border2);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px var(--shadow)}
.browser-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border)}
.browser-dot{width:10px;height:10px;border-radius:50%}
.bd-red{background:#FF5F57}.bd-yellow{background:#FFBD2E}.bd-green{background:#28CA41}
.browser-url{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(127,127,127,.04);border:1px solid var(--border);padding:4px 14px;border-radius:6px;max-width:360px;margin:0 auto}
.browser-url span{font-family:'Geist Mono',monospace;font-size:11px;color:var(--text3)}
.url-dot{width:5px;height:5px;border-radius:50%;background:var(--green)}
.dash-ui{display:flex;height:420px;background:var(--bg2);overflow:hidden}
.dash-sidebar{width:200px;flex-shrink:0;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:16px 0}
.ds-header{display:flex;align-items:center;gap:10px;padding:0 16px 16px;border-bottom:1px solid var(--border);margin-bottom:12px}
.ds-logo-mark{width:22px;height:22px;background:var(--accent);clip-path:polygon(50%0%,100%50%,50%100%,0%50%);flex-shrink:0}
.ds-title{font-size:13px;font-weight:700;letter-spacing:.1em;color:var(--text)}
.ds-section{font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);padding:0 16px 8px}
.ds-nav-item{display:flex;align-items:center;gap:8px;padding:7px 16px;font-size:12px;color:var(--text3);cursor:default;transition:color .15s,background .15s}
.ds-nav-item.active{color:var(--accent);border-right:2px solid var(--accent);background:rgba(79,127,255,.06)}
.ds-icon-wrap{width:16px;height:16px;flex-shrink:0;color:inherit}
.ds-icon-wrap svg{width:14px;height:14px}
.dash-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.dash-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border);gap:8px}
.dash-greeting{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-greeting span{color:var(--text3);font-weight:400}
.dash-actions{display:flex;gap:6px;flex-shrink:0}
.da-btn{display:flex;align-items:center;gap:5px;background:var(--accent);color:#fff;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:default;white-space:nowrap}
.da-btn-ghost{display:flex;align-items:center;gap:5px;background:rgba(127,127,127,.05);border:1px solid var(--border);color:var(--text2);font-size:11px;padding:6px 12px;border-radius:6px;cursor:default;white-space:nowrap}
.dash-body{flex:1;overflow:hidden;display:flex}
.dash-content{flex:1;padding:16px 20px;overflow:hidden;display:flex;flex-direction:column;gap:12px;min-width:0}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px;min-width:0}
.stat-label{font-family:'Geist Mono',monospace;font-size:9px;text-transform:uppercase;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat-value{font-size:18px;font-weight:700;color:var(--text);line-height:1}
.stat-change{font-family:'Geist Mono',monospace;font-size:9px;color:var(--green)}
.tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;flex:1}
.tool-chip{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:8px;cursor:default;min-width:0}
.tool-chip.active{border-color:rgba(79,127,255,.4);background:rgba(79,127,255,.06)}
.tc-icon-small{width:24px;height:24px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--accent)}
.tc-icon-small svg{width:13px;height:13px}
.tc-info{display:flex;flex-direction:column;gap:2px;overflow:hidden;min-width:0}
.tc-name{font-size:11px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tc-status{font-family:'Geist Mono',monospace;font-size:9px;color:var(--text3)}
.tc-status.running{color:var(--green)}
.dash-right-panel{width:200px;border-left:1px solid var(--border);padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;flex-shrink:0}
.panel-title{font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}
.activity-item{display:flex;align-items:flex-start;gap:8px;font-size:11px}
.ai-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:3px}
.ai-text{color:var(--text2);line-height:1.4;font-size:11px}
.ai-time{color:var(--text3);font-family:'Geist Mono',monospace;font-size:9px;margin-top:1px}
.perf-bars{display:flex;flex-direction:column;gap:6px}
.pb{display:flex;flex-direction:column;gap:3px}
.pb-header{display:flex;justify-content:space-between;font-family:'Geist Mono',monospace;font-size:9px;color:var(--text3)}
.pb-track{height:3px;background:rgba(127,127,127,.1);border-radius:2px;overflow:hidden}
.pb-fill{height:100%;border-radius:2px;background:var(--accent)}
.pb-fill.g{background:var(--green)}.pb-fill.a{background:var(--amber)}

/* TRUST */
#trust{padding:40px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2)}
.trust-label{text-align:center;font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:24px}
.trust-row{display:flex;align-items:center;justify-content:center;gap:32px;flex-wrap:wrap;padding:0 20px}
.trust-logo{font-size:14px;font-weight:700;color:var(--text3);letter-spacing:.08em;cursor:default;transition:color .2s}
.trust-logo:hover{color:var(--text2)}
.trust-divider{width:1px;height:20px;background:var(--border);flex-shrink:0}
.trust-stats{display:flex;align-items:center;justify-content:center;gap:40px;margin-top:32px;flex-wrap:wrap;padding:0 20px}
.trust-stat-v{font-size:28px;font-weight:800;color:var(--text);text-align:center;line-height:1}
.trust-stat-l{font-size:12px;color:var(--text3);text-align:center;margin-top:4px}

/* SECTION HEADINGS */
.section-heading{display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px;max-width:640px;margin:0 auto}
.section-heading h2{font-size:clamp(28px,4.5vw,54px);font-weight:800;letter-spacing:-.03em;color:var(--text);line-height:1.08;text-wrap:balance}
.section-heading h2 span{color:var(--accent)}
.section-heading p{font-size:16px;color:var(--text2);line-height:1.65;text-wrap:balance}

/* OVERVIEW */
#overview{padding:100px 0;background:var(--bg);position:relative;overflow:hidden}
.overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-top:60px}
.overview-text{display:flex;flex-direction:column;gap:20px}
.overview-text h3{font-size:clamp(26px,3vw,36px);font-weight:800;letter-spacing:-.02em;color:var(--text);line-height:1.15}
.overview-text p{font-size:15px;color:var(--text2);line-height:1.7}
.overview-points{display:flex;flex-direction:column;gap:12px}
.ov-point{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--text2)}
.ov-check{width:20px;height:20px;border-radius:50%;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:var(--green)}
.overview-visual{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px var(--shadow)}
.mockup-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border)}
.mockup-h-title{font-size:12px;font-weight:600;color:var(--text)}
.mockup-h-actions{display:flex;gap:6px}
.mh-btn{font-size:11px;padding:4px 10px;border-radius:5px;border:1px solid var(--border);background:rgba(127,127,127,.04);color:var(--text2);cursor:default}
.mh-btn.blue{background:rgba(79,127,255,.1);border-color:rgba(79,127,255,.25);color:var(--accent2)}
.mockup-body{padding:18px;display:flex;flex-direction:column;gap:10px}
.mk-line{height:9px;background:rgba(127,127,127,.07);border-radius:3px}
.mk-line.w100{width:100%}.mk-line.w80{width:80%}.mk-line.w60{width:60%}.mk-line.accent{background:rgba(79,127,255,.15);width:65%}
.mk-row{display:flex;gap:8px}
.mk-block{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;flex:1}
.mk-block-title{font-size:10px;font-weight:600;color:var(--text2);margin-bottom:6px}
.mk-block-value{font-size:20px;font-weight:800;color:var(--text)}
.mk-block-sub{font-family:'Geist Mono',monospace;font-size:9px;color:var(--green);margin-top:2px}

/* TOOLS */
#tools{padding:100px 0;background:var(--bg2)}
.tools-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:52px}
.tool-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:12px;cursor:default;position:relative;overflow:hidden;transition:border-color .25s,transform .25s,box-shadow .25s}
.tool-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(circle at var(--mx,50%) var(--my,0%),rgba(79,127,255,.07) 0%,transparent 60%)}
.tool-card:hover::before{opacity:1}
.tool-card:hover{border-color:rgba(79,127,255,.25);transform:translateY(-3px);box-shadow:0 12px 40px var(--shadow)}
.tc-header{display:flex;align-items:flex-start;justify-content:space-between}
.tc-icon-wrap{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid}
.tc-icon-wrap svg{width:20px;height:20px}
.tc-badge{font-family:'Geist Mono',monospace;font-size:10px;padding:3px 9px;border-radius:100px;border:1px solid}
.b-heavy{color:#FF8A65;border-color:rgba(255,138,101,.25);background:rgba(255,138,101,.08)}
.b-medium{color:var(--accent2);border-color:rgba(79,127,255,.25);background:rgba(79,127,255,.08)}
.b-light{color:var(--green);border-color:rgba(16,185,129,.25);background:rgba(16,185,129,.08)}
.tc-title{font-size:15px;font-weight:700;color:var(--text)}
.tc-desc{font-size:13px;color:var(--text2);line-height:1.6;flex:1}
.tc-footer{padding-top:12px;border-top:1px solid var(--border);margin-top:auto}
.tc-tokens{font-family:'Geist Mono',monospace;font-size:10px;color:var(--text3)}

/* HOW */
#how{padding:100px 0;background:var(--bg)}
.steps-row{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:60px}
.step{display:flex;flex-direction:column;gap:14px}
.step-num{width:36px;height:36px;border-radius:50%;background:rgba(79,127,255,.1);border:1px solid rgba(79,127,255,.25);display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:13px;font-weight:700;color:var(--accent);flex-shrink:0}
.step-h{font-size:18px;font-weight:700;color:var(--text)}
.step-p{font-size:13.5px;color:var(--text2);line-height:1.65}
.step-ui{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;margin-top:4px}
.step-ui-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2)}
.sui-bar{flex:1;height:5px;background:rgba(127,127,127,.1);border-radius:3px;overflow:hidden}
.sui-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent2))}

/* WHY */
#why{padding:100px 0;background:var(--bg2)}
.why-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:52px}
.why-col{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.why-col.featured{border-color:rgba(79,127,255,.3)}
.why-col-header{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.wch-title{font-size:14px;font-weight:700;color:var(--text)}
.wch-badge{margin-left:auto;font-family:'Geist Mono',monospace;font-size:10px;padding:3px 10px;border-radius:100px;white-space:nowrap}
.wch-badge.bad{background:rgba(239,68,68,.06);color:#EF4444;border:1px solid rgba(239,68,68,.15)}
.wch-badge.good{background:rgba(79,127,255,.08);color:var(--accent2);border:1px solid rgba(79,127,255,.2)}
.why-items{padding:18px 22px;display:flex;flex-direction:column;gap:12px}
.why-item{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--text2)}
.wi-cross{color:#EF4444;flex-shrink:0;width:18px;text-align:center}
.wi-check{color:var(--green);flex-shrink:0;width:18px;text-align:center}

/* FEATURES */
#features{padding:100px 0;background:var(--bg)}
.features-stack{display:flex;flex-direction:column;gap:100px;margin-top:70px}
.feature-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.feature-row.flip{direction:rtl}
.feature-row.flip>*{direction:ltr}
.feature-text{display:flex;flex-direction:column;gap:18px}
.feat-tag{font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);display:flex;align-items:center;gap:8px}
.feat-tag::before{content:'';width:18px;height:1px;background:var(--accent)}
.feat-h{font-size:clamp(22px,3vw,32px);font-weight:800;letter-spacing:-.02em;color:var(--text);line-height:1.2}
.feat-p{font-size:14px;color:var(--text2);line-height:1.7}
.feat-list{display:flex;flex-direction:column;gap:10px}
.fl-item{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--text2)}
.fl-item::before{content:'→';color:var(--accent);font-size:13px;flex-shrink:0}
.feature-visual{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:0 16px 48px var(--shadow);min-height:280px;display:flex;flex-direction:column;gap:12px}
.fv-top{display:flex;align-items:center;justify-content:space-between}
.fv-title{font-size:13px;font-weight:600;color:var(--text)}
.fv-status{font-family:'Geist Mono',monospace;font-size:10px;color:var(--green);display:flex;align-items:center;gap:5px}
.fv-status::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
.fv-lines{display:flex;flex-direction:column;gap:8px}
.fv-line{height:9px;background:rgba(127,127,127,.07);border-radius:3px}
.fv-line.w90{width:90%}.fv-line.w70{width:70%}.fv-line.w50{width:50%}.fv-line.w80{width:80%}.fv-line.accent{background:rgba(79,127,255,.15)}
.fv-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.fv-metric{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:4px}
.fvm-v{font-size:20px;font-weight:800;color:var(--text)}
.fvm-l{font-family:'Geist Mono',monospace;font-size:10px;color:var(--text3)}

/* PRICING */
#pricing{padding:100px 0;background:var(--bg2)}
.billing-toggle{display:flex;align-items:center;gap:12px;justify-content:center;margin:24px 0 44px;flex-wrap:wrap}
.toggle-label{font-size:13px;color:var(--text3);transition:color .2s}
.toggle-label.on{color:var(--text)}
.tog-sw{width:44px;height:24px;background:rgba(127,127,127,.1);border:1px solid var(--border);border-radius:100px;position:relative;cursor:pointer;transition:background .2s;display:flex;align-items:center;padding:0 4px;flex-shrink:0}
.tog-sw.on{background:rgba(79,127,255,.2);border-color:rgba(79,127,255,.35)}
.tog-knob{width:16px;height:16px;background:var(--text3);border-radius:50%;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s;flex-shrink:0}
.tog-sw.on .tog-knob{transform:translateX(20px);background:var(--accent)}
.save-badge{font-family:'Geist Mono',monospace;font-size:11px;color:var(--green);background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);padding:3px 10px;border-radius:100px}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:960px;margin:0 auto}
.price-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:26px;display:flex;flex-direction:column;gap:18px;position:relative;overflow:hidden;transition:transform .25s,box-shadow .25s}
.price-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px var(--shadow)}
.price-card.featured{border-color:rgba(79,127,255,.3)}
.featured-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(79,127,255,.08) 0%,transparent 70%);pointer-events:none}
.plan-badge{position:absolute;top:18px;right:18px;font-family:'Geist Mono',monospace;font-size:10px;font-weight:600;color:var(--accent);background:rgba(79,127,255,.08);border:1px solid rgba(79,127,255,.2);padding:3px 9px;border-radius:100px}
.plan-name{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2)}
.plan-price{display:flex;align-items:flex-end;gap:3px;line-height:1}
.plan-price-num{font-size:44px;font-weight:800;color:var(--text);letter-spacing:-.02em}
.plan-price-sym{font-size:20px;font-weight:600;color:var(--text2);margin-bottom:6px}
.plan-price-period{font-size:13px;color:var(--text3);margin-bottom:6px}
.plan-desc{font-size:13px;color:var(--text2);line-height:1.6}
.plan-sep{height:1px;background:var(--border)}
.plan-features{display:flex;flex-direction:column;gap:10px;flex:1}
.pf-item{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--text2)}
.pf-check{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.pf-check.on{background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.25)}
.pf-check.off{background:rgba(127,127,127,.05);color:var(--text3);border:1px solid var(--border)}
.pf-item.dim{color:var(--text3)}
.plan-btn{padding:12px;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;transition:background .18s,transform .15s;width:100%;border:none}
.plan-btn.primary{background:var(--accent);color:#fff}
.plan-btn.primary:hover{background:var(--accent2);transform:translateY(-2px)}
.plan-btn.ghost{background:rgba(127,127,127,.06);color:var(--text2);border:1px solid var(--border)}
.plan-btn.ghost:hover{background:rgba(127,127,127,.1);color:var(--text)}
.pricing-footnote{text-align:center;font-family:'Geist Mono',monospace;font-size:11px;color:var(--text3);margin-top:28px;line-height:1.8;padding:0 20px}

/* TESTIMONIALS */
#testimonials{padding:100px 0;background:var(--bg)}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
.testi-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:14px;transition:border-color .25s,transform .25s}
.testi-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.testi-stars{display:flex;gap:3px}
.ts{color:var(--amber);font-size:13px}
.testi-q{font-size:14px;color:var(--text2);line-height:1.68;flex:1}
.testi-q em{font-style:italic;color:var(--text)}
.testi-author{display:flex;align-items:center;gap:10px;border-top:1px solid var(--border);padding-top:14px}
.ta-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;border:1px solid var(--border2)}
.ta-name{font-size:13px;font-weight:600;color:var(--text)}
.ta-role{font-size:11px;color:var(--text3)}
.ta-badge{margin-left:auto;font-family:'Geist Mono',monospace;font-size:10px;color:var(--green);background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);padding:2px 7px;border-radius:100px;white-space:nowrap}

/* SECURITY */
#security{padding:70px 0;background:var(--bg2)}
.security-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:44px}
.sec-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:10px;transition:border-color .2s}
.sec-card:hover{border-color:var(--border2)}
.sec-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center}
.sec-icon svg{width:19px;height:19px;color:var(--accent)}
.sec-title{font-size:14px;font-weight:700;color:var(--text)}
.sec-desc{font-size:12.5px;color:var(--text2);line-height:1.6}

/* FAQ */
#faq{padding:100px 0;background:var(--bg)}
.faq-list{max-width:720px;margin:44px auto 0;display:flex;flex-direction:column}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;align-items:center;justify-content:space-between;padding:18px 0;font-size:15px;font-weight:600;color:var(--text2);cursor:pointer;transition:color .18s;user-select:none;gap:12px}
.faq-q:hover{color:var(--text)}
.faq-icon{width:22px;height:22px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--text3);flex-shrink:0;transition:transform .3s,border-color .2s,color .2s,background .2s}
.faq-item.open .faq-q{color:var(--text)}
.faq-item.open .faq-icon{transform:rotate(45deg);border-color:rgba(79,127,255,.3);color:var(--accent);background:rgba(79,127,255,.08)}
.faq-a{font-size:14px;color:var(--text2);line-height:1.7;max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.16,1,.3,1),padding .3s}
.faq-item.open .faq-a{max-height:300px;padding-bottom:18px}

/* CTA */
#cta-final{padding:140px 0;background:var(--bg2);position:relative;overflow:hidden;text-align:center}
#cta-final::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(79,127,255,.08) 0%,transparent 70%)}
.cta-grid-bg{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 60% 70% at 50% 50%,black 0%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 60% 70% at 50% 50%,black 0%,transparent 75%)}
.cta-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:22px;padding:0 20px}
.cta-h{font-size:clamp(36px,6vw,72px);font-weight:800;letter-spacing:-.03em;color:var(--text);line-height:1.05;text-wrap:balance}
.cta-h span{background:linear-gradient(135deg,#4F7FFF,#7BA3FF,#A5C0FF);background-size:200% 200%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 4s ease infinite}
.cta-p{font-size:17px;color:var(--text2);max-width:440px;line-height:1.65;text-wrap:balance}
.cta-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cta-footnote{font-family:'Geist Mono',monospace;font-size:11px;color:var(--text3)}

/* FOOTER */
#footer{background:var(--bg);border-top:1px solid var(--border);padding:56px 0 28px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:32px;margin-bottom:44px}
.footer-brand{display:flex;flex-direction:column;gap:14px}
.footer-logo{display:flex;align-items:center;gap:8px}
.fl-mark{width:20px;height:20px;background:var(--accent);clip-path:polygon(50%0%,100%50%,50%100%,0%50%);flex-shrink:0}
.fl-name{font-size:14px;font-weight:800;letter-spacing:.12em;color:var(--text)}
.footer-desc{font-size:13px;color:var(--text2);line-height:1.65;max-width:220px}
.footer-socials{display:flex;gap:8px}
.fsoc{width:30px;height:30px;border:1px solid var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;color:var(--text3);transition:border-color .2s,color .2s;cursor:pointer}
.fsoc:hover{border-color:var(--border2);color:var(--text)}
.footer-col-title{font-size:12px;font-weight:700;color:var(--text);margin-bottom:14px;letter-spacing:.02em}
.footer-links{display:flex;flex-direction:column;gap:9px}
.footer-links a{font-size:13px;color:var(--text2);transition:color .18s}
.footer-links a:hover{color:var(--text)}
.footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid var(--border);flex-wrap:wrap;gap:14px}
.footer-copy{font-size:12px;color:var(--text3)}
.footer-legal{display:flex;gap:18px}
.footer-legal a{font-size:12px;color:var(--text3);transition:color .18s}
.footer-legal a:hover{color:var(--text2)}
.footer-status{display:flex;align-items:center;gap:6px;font-family:'Geist Mono',monospace;font-size:11px;color:var(--green)}
.footer-status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}

/* ── MOBILE RESPONSIVE ── */
@media(max-width:1024px){
  .overview-grid{grid-template-columns:1fr;gap:40px}
  .feature-row{grid-template-columns:1fr;gap:36px}
  .feature-row.flip{direction:ltr}
  .footer-grid{grid-template-columns:1fr 1fr;gap:28px}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .tool-grid{grid-template-columns:repeat(2,1fr)}
  .dash-right-panel{display:none}
}
@media(max-width:768px){
  .section{padding:70px 0}
  .tools-grid{grid-template-columns:1fr 1fr}
  .steps-row{grid-template-columns:1fr;gap:28px}
  .why-grid{grid-template-columns:1fr}
  .pricing-grid{grid-template-columns:1fr;max-width:420px}
  .testi-grid{grid-template-columns:1fr}
  .security-grid{grid-template-columns:1fr 1fr}
  .footer-grid{grid-template-columns:1fr}
  .footer-bottom{flex-direction:column;align-items:flex-start}
  #cta-final{padding:90px 0}
  .dash-ui{height:360px}
  .dash-sidebar{display:none}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .tool-grid{grid-template-columns:1fr 1fr}
  .trust-row{gap:20px}
  .trust-stats{gap:24px}
  .hero-preview{margin-top:36px}
}
@media(max-width:480px){
  .tools-grid{grid-template-columns:1fr}
  .security-grid{grid-template-columns:1fr}
  .hero-ctas{flex-direction:column;align-items:stretch}
  .btn-primary,.btn-secondary{width:100%;justify-content:center}
  .pricing-grid{max-width:100%}
  .trust-divider{display:none}
  .dash-ui{height:300px}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .tool-grid{grid-template-columns:1fr}
  .container{padding:0 16px}
}
`;

export default function LandingClient() {
  const [light, setLight] = useState(false);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const cv = document.getElementById("intro-cv") as HTMLCanvasElement | null;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    if (!ctx) return;
    type Pt = { x:number;y:number;vx:number;vy:number;r:number;p:number;a:number };
    let W=0,H=0,pts:Pt[]=[];
    const N=100;
    function init(){W=cv!.width=window.innerWidth;H=cv!.height=window.innerHeight;pts=[];for(let i=0;i<N;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.3,p:Math.random()*Math.PI*2,a:Math.random()*.3+.08});}
    init();window.addEventListener("resize",init);
    let raf:number;
    function frame(){
      ctx.fillStyle="rgba(5,7,9,.16)";ctx.fillRect(0,0,W,H);
      for(let y=0;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.strokeStyle="rgba(79,127,255,.022)";ctx.lineWidth=1;ctx.stroke();}
      for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.strokeStyle="rgba(79,127,255,.022)";ctx.lineWidth=1;ctx.stroke();}
      for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<140){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(79,127,255,${.07*(1-d/140)})`;ctx.lineWidth=.5;ctx.stroke();}}
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;p.p+=.02;const g=.5+Math.sin(p.p)*.25;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1+Math.sin(p.p)*.15),0,Math.PI*2);ctx.fillStyle=`rgba(79,127,255,${p.a*g})`;ctx.fill();});
      const vg=ctx.createRadialGradient(W/2,H/2,H*.04,W/2,H/2,H*.72);vg.addColorStop(0,"rgba(5,7,9,0)");vg.addColorStop(1,"rgba(5,7,9,.7)");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
      raf=requestAnimationFrame(frame);
    }
    frame();
    const logo=document.getElementById("intro-logo"),tag=document.getElementById("intro-tag"),bar=document.getElementById("intro-bar") as HTMLElement|null;
    if(logo)setTimeout(()=>{logo.style.opacity="1";logo.style.transform="translateY(0)";},200);
    if(tag)setTimeout(()=>{tag.style.opacity="1";},600);
    if(bar)setTimeout(()=>{bar.style.width="100%";},400);
    setTimeout(()=>{const intro=document.getElementById("intro"),nav=document.getElementById("nav");intro?.classList.add("exit");nav?.classList.add("on");setTimeout(()=>{if(intro)intro.style.display="none";},800);},2600);
    setTimeout(()=>{
      const ro=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("on");});},{threshold:.12,rootMargin:"0px 0px -30px 0px"});
      document.querySelectorAll(".reveal").forEach(el=>ro.observe(el));
      const co=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const el=e.target as HTMLElement;const t=parseInt(el.dataset.count||"0");let s:number|null=null;const step=(ts:number)=>{if(!s)s=ts;const p=Math.min((ts-s)/2000,1),ease=1-Math.pow(1-p,4);el.textContent=Math.floor(ease*t).toLocaleString();if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);co.unobserve(el);}});},{threshold:.5});
      document.querySelectorAll("[data-count]").forEach(el=>co.observe(el));
      document.querySelectorAll<HTMLElement>(".tool-card").forEach(c=>{c.addEventListener("mousemove",(e:MouseEvent)=>{const r=c.getBoundingClientRect();c.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");c.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%");});});
    },400);
    const onScroll=()=>document.getElementById("nav")?.classList.toggle("scrolled",window.scrollY>40);
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",init);window.removeEventListener("scroll",onScroll);};
  },[]);

  const s=(sel:string)=>document.querySelector(sel)?.scrollIntoView({behavior:"smooth"});
  const toggleMM=()=>{const m=document.getElementById("mmenu");const open=m?.classList.toggle("on");const spans=document.querySelectorAll<HTMLElement>("#burger span");if(open){spans[0].style.transform="translateY(6.5px) rotate(45deg)";spans[1].style.opacity="0";spans[2].style.transform="translateY(-6.5px) rotate(-45deg)";}else spans.forEach(x=>{x.style.transform="";x.style.opacity="";});};
  const closeMM=()=>{document.getElementById("mmenu")?.classList.remove("on");document.querySelectorAll<HTMLElement>("#burger span").forEach(x=>{x.style.transform="";x.style.opacity="";});};
  const toggleFaq=(el:HTMLElement)=>{const item=el.parentElement!;const open=item.classList.contains("open");document.querySelectorAll(".faq-item").forEach(f=>f.classList.remove("open"));if(!open)item.classList.add("open");};

  return (
    <div className={light?"theme-light":"theme-dark"}>
      <style>{CSS}</style>

      {/* INTRO */}
      <div id="intro"><canvas id="intro-cv"></canvas>
        <div className="intro-content">
          <div className="intro-logo" id="intro-logo">REIO<span>G</span>N</div>
          <div className="intro-tagline" id="intro-tag">Cognitive Performance Platform</div>
          <div className="intro-progress"><div className="intro-bar" id="intro-bar"></div></div>
        </div>
      </div>

      {/* NAV */}
      <nav id="nav"><div className="nav-inner">
        <a href="/" className="nav-logo"><div className="nav-logo-mark"></div><span className="nav-logo-text">REIOGN</span></a>
        <div className="nav-links">
          <a href="#overview">Platform</a>
          <a href="#features">Features</a>
          <a href="#tools">AI Tools</a>
          <a href="#pricing">Pricing</a>
          <a href="#">Docs</a>
          <a href="#">Blog</a>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={()=>setLight(v=>!v)} title="Toggle theme">
            <div className="theme-toggle-knob"></div>
          </button>
          <a href="/login" className="btn-ghost-sm">Sign In</a>
          <a href="/signup" className="btn-primary-sm">Get Started →</a>
        </div>
        <div id="burger" onClick={toggleMM}><span></span><span></span><span></span></div>
      </div></nav>

      {/* MOBILE MENU */}
      <div id="mmenu">
        <a href="#overview" onClick={closeMM}>Platform</a>
        <a href="#features" onClick={closeMM}>Features</a>
        <a href="#tools" onClick={closeMM}>AI Tools</a>
        <a href="#pricing" onClick={closeMM}>Pricing</a>
        <a href="#" onClick={closeMM}>Docs</a>
        <a href="#" onClick={closeMM}>Blog</a>
        <a href="/login" onClick={closeMM} style={{color:"var(--text2)"}}>Sign In</a>
        <a href="/signup" onClick={closeMM} className="btn-primary-sm">Get Started →</a>
      </div>

      {/* HERO */}
      <section id="hero">
        <div className="hero-mesh"></div><div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pill">New</span>
            <span className="badge-dot"></span>
            Cognitive Clone — now live for all plans
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <h1 className="hero-h1">The AI workspace<br/>built for <span className="accent-text">peak performers.</span></h1>
          <p className="hero-sub">10 purpose-built AI tools. One unified workspace. Each with a defined output, the right model, and zero friction.</p>
          <div className="hero-ctas">
            <a href="/signup" className="btn-primary">
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button className="btn-secondary" onClick={()=>s("#overview")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
              Explore
            </button>
          </div>
          <div className="hero-meta">
            <span className="hero-meta-item">Free 3-day trial</span>
            <span className="hero-meta-item">No credit card</span>
            <span className="hero-meta-item">Cancel anytime</span>
            <span className="hero-meta-item">Auto-refund on failure</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-preview container"><div className="preview-browser">
          <div className="browser-bar">
            <div className="browser-dot bd-red"></div><div className="browser-dot bd-yellow"></div><div className="browser-dot bd-green"></div>
            <div className="browser-url"><div className="url-dot"></div><span>app.reiogn.com/workspace</span></div>
          </div>
          <div className="dash-ui">
            <div className="dash-sidebar">
              <div className="ds-header"><div className="ds-logo-mark"></div><span className="ds-title">REIOGN</span></div>
              <div className="ds-section">Workspace</div>
              {[{k:"deepwork",l:"Deep Work",a:true},{k:"research",l:"Research",a:false},{k:"exec",l:"Execution",a:false},{k:"decision",l:"Decisions",a:false}].map((i)=>(
                <div key={i.k} className={`ds-nav-item${i.a?" active":""}`}>
                  <div className="ds-icon-wrap">{Icons[i.k]}</div>{i.l}
                </div>
              ))}
              <div style={{marginTop:"auto",padding:"0 10px"}}><div style={{background:"rgba(79,127,255,.07)",border:"1px solid rgba(79,127,255,.15)",borderRadius:"7px",padding:"10px",marginTop:"12px"}}><div style={{fontSize:"10px",fontWeight:600,color:"var(--text2)",marginBottom:"3px"}}>Token Balance</div><div style={{fontSize:"20px",fontWeight:800,color:"var(--text)"}}>847</div><div style={{fontFamily:"'Geist Mono',monospace",fontSize:"9px",color:"var(--text3)",marginTop:"3px"}}>rolls over monthly</div></div></div>
            </div>
            <div className="dash-main">
              <div className="dash-topbar">
                <div className="dash-greeting">Good morning, <span>Arjun</span> 👋</div>
                <div className="dash-actions">
                  <div className="da-btn-ghost">Search</div>
                  <div className="da-btn">+ New Session</div>
                </div>
              </div>
              <div className="dash-body">
                <div className="dash-content">
                  <div className="stats-row">
                    <div className="stat-card"><div className="stat-label">Sessions today</div><div className="stat-value">12</div><div className="stat-change">↑ 3 from yesterday</div></div>
                    <div className="stat-card"><div className="stat-label">Focus time</div><div className="stat-value">4h 20m</div><div className="stat-change">↑ 38% this week</div></div>
                    <div className="stat-card"><div className="stat-label">Output score</div><div className="stat-value">94</div><div className="stat-change">↑ Personal best</div></div>
                    <div className="stat-card"><div className="stat-label">Tokens used</div><div className="stat-value">153</div><div className="stat-change" style={{color:"var(--text3)"}}>of 1,200/mo</div></div>
                  </div>
                  <div className="tool-grid">
                    {[{k:"deepwork",n:"Deep Work Engine",run:true},{k:"research",n:"Research Builder",run:false},{k:"clone",n:"Cognitive Clone",run:false},{k:"exec",n:"Exec. Optimizer",run:false},{k:"decision",n:"Decision Sim.",run:false},{k:"wealth",n:"Wealth Mapper",run:false}].map((t,i)=>(
                      <div key={i} className={`tool-chip${i===0?" active":""}`}>
                        <div className="tc-icon-small">{Icons[t.k]}</div>
                        <div className="tc-info"><div className="tc-name">{t.n}</div><div className={`tc-status${t.run?" running":""}`}>{t.run?"● Running":"Idle"}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-right-panel">
                  <div className="panel-title">Recent Activity</div>
                  <div className="activity-item"><div className="ai-dot" style={{background:"var(--green)"}}></div><div><div className="ai-text">Deep Work completed</div><div className="ai-time">2m ago</div></div></div>
                  <div className="activity-item"><div className="ai-dot" style={{background:"var(--accent)"}}></div><div><div className="ai-text">Research — 3 sources</div><div className="ai-time">41m ago</div></div></div>
                  <div className="activity-item"><div className="ai-dot" style={{background:"var(--amber)"}}></div><div><div className="ai-text">Decision Sim. done</div><div className="ai-time">3h ago</div></div></div>
                  <div style={{height:"1px",background:"var(--border)"}}></div>
                  <div className="panel-title">Performance</div>
                  <div className="perf-bars">
                    <div className="pb"><div className="pb-header"><span>Focus depth</span><span>94%</span></div><div className="pb-track"><div className="pb-fill" style={{width:"94%"}}></div></div></div>
                    <div className="pb"><div className="pb-header"><span>Output quality</span><span>88%</span></div><div className="pb-track"><div className="pb-fill g" style={{width:"88%"}}></div></div></div>
                    <div className="pb"><div className="pb-header"><span>Recovery</span><span>72%</span></div><div className="pb-track"><div className="pb-fill a" style={{width:"72%"}}></div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div></div>
      </section>

      {/* TRUST */}
      <section id="trust"><div className="container">
        <div className="trust-label">Trusted by high-performers at</div>
        <div className="trust-row">
          {["STRIPE","VERCEL","LINEAR","NOTION","FIGMA","GITHUB","ANTHROPIC"].map((n,i,a)=>(
            <span key={n} style={{display:"contents"}}>
              {i>0&&<span className="trust-divider"></span>}
              <span className="trust-logo">{n}</span>
            </span>
          ))}
        </div>
        <div className="trust-stats">
          <div><div className="trust-stat-v" data-count="12400">0</div><div className="trust-stat-l">Active users</div></div>
          <div><div className="trust-stat-v" data-count="89300">0</div><div className="trust-stat-l">Sessions completed</div></div>
          <div><div className="trust-stat-v">3.2×</div><div className="trust-stat-l">Avg. output increase</div></div>
          <div><div className="trust-stat-v">14d</div><div className="trust-stat-l">Median time to peak</div></div>
          <div><div className="trust-stat-v">97%</div><div className="trust-stat-l">Satisfaction rate</div></div>
        </div>
      </div></section>

      {/* OVERVIEW */}
      <section id="overview" className="section"><div className="container">
        <div className="section-heading reveal"><div className="tag">Platform</div><h2>One workspace.<br/><span>Every tool you need.</span></h2><p>Stop context-switching between 8 different AI tools. REIOGN brings them all under one roof — purpose-built, properly routed, optimized for how you actually work.</p></div>
        <div className="overview-grid">
          <div className="overview-text reveal reveal-d1">
            <h3>A unified AI workspace built for cognitive performance.</h3>
            <p>Every tool in REIOGN is purpose-built for a specific cognitive task. Not a chatbot wrapper — a structured execution system where each tool knows its input, its model, and its output format before you even start.</p>
            <div className="overview-points">
              {["Automatic model routing — right AI for every job","Token-based billing — pay only for what you run","Persistent session history with full export","Auto-refund on any AI failure — zero risk","Works with Claude, Gemini Pro, and Groq LLaMA"].map((p,i)=><div key={i} className="ov-point"><div className="ov-check">✓</div>{p}</div>)}
            </div>
            <a href="#tools" className="btn-primary" style={{width:"fit-content"}}>Explore all 12 tools →</a>
          </div>
          <div className="overview-visual reveal reveal-d2">
            <div className="mockup-header"><div className="mockup-h-title">Deep Work Engine — Active Session</div><div className="mockup-h-actions"><div className="mh-btn">Save</div><div className="mh-btn blue">Running ●</div></div></div>
            <div className="mockup-body">
              <div className="mk-line w100"></div><div className="mk-line accent"></div><div className="mk-line w80"></div>
              <div className="mk-row">
                <div className="mk-block"><div className="mk-block-title">Focus Block</div><div className="mk-block-value" style={{color:"var(--accent)"}}>4h 20m</div><div className="mk-block-sub">↑ Personal best</div></div>
                <div className="mk-block"><div className="mk-block-title">Flow Score</div><div className="mk-block-value">94</div><div className="mk-block-sub">↑ 12pts today</div></div>
                <div className="mk-block"><div className="mk-block-title">Tokens Used</div><div className="mk-block-value">15</div><div className="mk-block-sub" style={{color:"var(--text3)"}}>of 1,200</div></div>
              </div>
              <div className="mk-line w60"></div><div className="mk-line w80"></div>
            </div>
          </div>
        </div>
      </div></section>

      {/* TOOLS — 12 tools, no model labels */}
      <section id="tools" className="section" style={{background:"var(--bg2)"}}><div className="container">
        <div className="section-heading reveal"><div className="tag">12 Tools</div><h2>Every tool has<br/><span>one job.</span></h2><p>No tool tries to do everything. Each one is precision-built for a specific cognitive output, pre-routed to the best model, and designed to return results — not prompts.</p></div>
        <div className="tools-grid">
          {TOOLS.map((t,i)=>(
            <div key={i} className={`tool-card reveal${i%3===1?" reveal-d1":i%3===2?" reveal-d2":""}`}>
              <div className="tc-header">
                <div className="tc-icon-wrap" style={{background:`${t.accent}18`,borderColor:`${t.accent}30`,color:t.accent}}>{Icons[t.key]}</div>
                <div className={`tc-badge ${t.badge}`}>{t.badgeText}</div>
              </div>
              <div className="tc-title">{t.title}</div>
              <div className="tc-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div></section>

      {/* HOW */}
      <section id="how" className="section"><div className="container">
        <div className="section-heading reveal"><div className="tag">How it works</div><h2>From zero to<br/><span>peak output</span> in 3 steps.</h2><p>No prompt engineering. No config. No learning curve. Choose a tool, describe your goal, get a structured result.</p></div>
        <div className="steps-row">
          <div className="step reveal">
            <div className="step-num">01</div><div className="step-h">Choose your tool</div>
            <p className="step-p">Pick from 12 purpose-built AI tools — each pre-configured with the right model, the right prompt architecture, and the right output format for your task.</p>
            <div className="step-ui">
              <div className="step-ui-row"><div style={{width:14,height:14,flexShrink:0,color:"var(--accent)"}}>{Icons.deepwork}</div>Deep Work Engine<div className="sui-bar"><div className="sui-fill" style={{width:"100%"}}></div></div></div>
              <div className="step-ui-row"><div style={{width:14,height:14,flexShrink:0,color:"var(--text3)"}}>{Icons.research}</div>Research Builder<div className="sui-bar"><div className="sui-fill" style={{width:"70%",opacity:.4}}></div></div></div>
              <div className="step-ui-row"><div style={{width:14,height:14,flexShrink:0,color:"var(--text3)"}}>{Icons.neural}</div>Neural Pattern Engine<div className="sui-bar"><div className="sui-fill" style={{width:"50%",opacity:.3}}></div></div></div>
            </div>
          </div>
          <div className="step reveal reveal-d1">
            <div className="step-num">02</div><div className="step-h">Describe your goal</div>
            <p className="step-p">Type what you are trying to achieve in plain language. REIOGN handles routing, context, and model selection automatically.</p>
            <div className="step-ui">
              <div style={{background:"var(--bg3)",border:"1px solid rgba(79,127,255,.25)",borderRadius:"6px",padding:"10px 12px",fontSize:"12px",color:"var(--text2)",lineHeight:1.6}}><span style={{color:"var(--text3)",fontFamily:"'Geist Mono',monospace",fontSize:"10px"}}>Goal: </span>Build a SaaS in 90 days while keeping my day job.</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Geist Mono',monospace",fontSize:"10px",color:"var(--accent)"}}><div style={{width:"7px",height:"7px",borderRadius:"50%",background:"var(--accent)",animation:"pulse 1.5s infinite",flexShrink:0}}></div>Routing to best model...</div>
            </div>
          </div>
          <div className="step reveal reveal-d2">
            <div className="step-num">03</div><div className="step-h">Get structured results</div>
            <p className="step-p">Receive numbered, action-ready output. Not a wall of text — a structured plan, ranked list, or simulation you can act on immediately.</p>
            <div className="step-ui">
              <div style={{fontFamily:"'Geist Mono',monospace",fontSize:"10px",color:"var(--text3)"}}>OUTPUT — Critical Path</div>
              <div style={{fontSize:"12px",color:"var(--text2)",display:"flex",flexDirection:"column",gap:"6px"}}>
                <div style={{display:"flex",gap:"6px"}}><span style={{color:"var(--accent)"}}>1.</span>Day 1–7: Define north-star metric</div>
                <div style={{display:"flex",gap:"6px"}}><span style={{color:"var(--accent)"}}>2.</span>Day 8–14: Build MVP skeleton</div>
                <div style={{display:"flex",gap:"6px",color:"var(--text3)"}}><span>3.</span>Day 15–30: First paying user...</div>
              </div>
            </div>
          </div>
        </div>
      </div></section>

      {/* WHY */}
      <section id="why" className="section" style={{background:"var(--bg2)"}}><div className="container">
        <div className="section-heading reveal"><div className="tag">Why REIOGN</div><h2>One platform vs.<br/><span>scattered tools.</span></h2><p>The average knowledge worker uses 6+ AI tools and still feels unproductive. REIOGN replaces the chaos with one structured system.</p></div>
        <div className="why-grid">
          <div className="why-col reveal">
            <div className="why-col-header"><span style={{fontSize:"15px"}}>⚠️</span><span className="wch-title">The old way</span><span className="wch-badge bad">Fragmented</span></div>
            <div className="why-items">{["6+ tools, 6+ subscriptions","Manual prompt engineering every time","No session history or continuity","Wrong model for wrong task","Vague, unstructured outputs","Pay whether it works or not","No performance tracking"].map((t,i)=><div key={i} className="why-item"><span className="wi-cross">✕</span>{t}</div>)}</div>
          </div>
          <div className="why-col featured reveal reveal-d1">
            <div className="why-col-header"><div className="nav-logo-mark" style={{width:"16px",height:"16px",flexShrink:0}}></div><span className="wch-title">REIOGN</span><span className="wch-badge good">Optimized</span></div>
            <div className="why-items">{["12 tools in one workspace, one subscription","Pre-built prompts, zero engineering needed","Full history, export, and continuity","Auto-routing to the best model","Numbered, structured, action-ready outputs","Auto-refund on any AI failure","Performance analytics and trend tracking"].map((t,i)=><div key={i} className="why-item"><span className="wi-check">✓</span>{t}</div>)}</div>
          </div>
        </div>
      </div></section>

      {/* FEATURES */}
      <section id="features" className="section"><div className="container">
        <div className="section-heading reveal"><div className="tag">Features</div><h2>Built for how<br/><span>you actually work.</span></h2><p>Every feature was designed around one question: does this make output better? If no, it did not ship.</p></div>
        <div className="features-stack">
          <div className="feature-row">
            <div className="feature-text reveal">
              <div className="feat-tag">Intelligent Routing</div>
              <div className="feat-h">The right model for every job. Automatically.</div>
              <p className="feat-p">Heavy reasoning tasks route to Claude AI. Research and synthesis go to Gemini Pro. Speed-critical operations hit Groq LLaMA. You configure nothing.</p>
              <div className="feat-list"><div className="fl-item">Claude for complex reasoning and multi-step analysis</div><div className="fl-item">Gemini Pro for synthesis and research quality</div><div className="fl-item">Groq LLaMA for instant-speed lightweight tasks</div><div className="fl-item">Token cost optimized per route, automatically</div></div>
            </div>
            <div className="feature-visual reveal reveal-d1">
              <div className="fv-top"><div className="fv-title">Model Router</div><div className="fv-status">Active</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {[{label:"Decision Simulator",color:"#FF8A65",border:"rgba(255,138,101,.2)",route:"→ Claude AI"},{label:"Research Builder",color:"var(--accent2)",border:"rgba(79,127,255,.25)",route:"→ Gemini Pro"},{label:"Focus Shield",color:"var(--green)",border:"rgba(16,185,129,.2)",route:"→ Groq LLaMA"},{label:"Neural Pattern Engine",color:"#7C3AED",border:"rgba(124,58,237,.2)",route:"→ Claude AI"}].map((r,i)=>(
                  <div key={i} style={{background:"var(--bg3)",border:`1px solid ${r.border}`,borderRadius:"7px",padding:"12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:"12px",color:"var(--text2)"}}>{r.label}</div>
                    <div style={{fontFamily:"'Geist Mono',monospace",fontSize:"10px",color:r.color,border:`1px solid ${r.border}`,padding:"2px 8px",borderRadius:"100px"}}>{r.route}</div>
                  </div>
                ))}
              </div>
              <div className="fv-metrics"><div className="fv-metric"><div className="fvm-v">99.8%</div><div className="fvm-l">Uptime</div></div><div className="fv-metric"><div className="fvm-v">1.2s</div><div className="fvm-l">Avg. response</div></div><div className="fv-metric"><div className="fvm-v">3x</div><div className="fvm-l">Token efficiency</div></div></div>
            </div>
          </div>
          <div className="feature-row flip">
            <div className="feature-text reveal">
              <div className="feat-tag">Session Intelligence</div>
              <div className="feat-h">Your entire cognitive history. Searchable, exportable, useful.</div>
              <p className="feat-p">Every session is logged, structured, and searchable. Build on previous work. Track performance trends. Export to any format.</p>
              <div className="feat-list"><div className="fl-item">Full session history with structured search</div><div className="fl-item">Performance trends — focus, output quality, velocity</div><div className="fl-item">Export to Markdown, PDF, Notion, or JSON</div><div className="fl-item">Team sharing and collaborative workspaces</div></div>
            </div>
            <div className="feature-visual reveal reveal-d1">
              <div className="fv-top"><div className="fv-title">Session History</div><div className="fv-status">Live</div></div>
              <div className="fv-lines"><div className="fv-line w100"></div><div className="fv-line accent"></div><div className="fv-line w80"></div></div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px",marginTop:"4px"}}>
                {[{title:"Deep Work — Strategy deck",sub:"Today · 4h 20m · Score: 94",dim:false},{title:"Research — Remote leadership",sub:"Yesterday · 3 sources · 94% relevance",dim:false},{title:"Decision Sim — Startup pivot",sub:"2 days ago · 5 scenarios",dim:true}].map((x,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"7px",padding:"9px 11px",opacity:x.dim?.5:1}}>
                    <div><div style={{fontSize:"11px",fontWeight:600,color:"var(--text)"}}>{x.title}</div><div style={{fontFamily:"'Geist Mono',monospace",fontSize:"9px",color:"var(--text3)",marginTop:"2px"}}>{x.sub}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-text reveal">
              <div className="feat-tag">Token Economy</div>
              <div className="feat-h">Pay for what you use. Never for what you do not.</div>
              <p className="feat-p">Tokens are REIOGN billing units. Each tool has a fixed cost. They roll over monthly. They never expire. Any failed AI run is automatically refunded.</p>
              <div className="feat-list"><div className="fl-item">Light tools: 5 tokens (Focus Shield, Skill ROI)</div><div className="fl-item">Medium tools: 15 tokens (Deep Work, Research)</div><div className="fl-item">Heavy tools: 30–50 tokens (Claude-powered)</div><div className="fl-item">100% auto-refund on any failure</div></div>
            </div>
            <div className="feature-visual reveal reveal-d1">
              <div className="fv-top"><div className="fv-title">Token Dashboard</div><div className="fv-status">1,047 remaining</div></div>
              <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"7px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:"12px",color:"var(--text2)"}}>Monthly allocation</div><div style={{fontSize:"20px",fontWeight:800,color:"var(--text)"}}>1,200</div></div>
                <div style={{height:"5px",background:"rgba(127,127,127,.1)",borderRadius:"3px",overflow:"hidden"}}><div style={{width:"13%",height:"100%",background:"var(--accent)",borderRadius:"3px"}}></div></div>
                <div style={{fontFamily:"'Geist Mono',monospace",fontSize:"9px",color:"var(--text3)"}}>153 used · 1,047 remaining · resets in 18d</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"7px",padding:"11px"}}><div style={{fontSize:"17px",fontWeight:700,color:"var(--text)"}}>0</div><div style={{fontFamily:"'Geist Mono',monospace",fontSize:"9px",color:"var(--green)",marginTop:"2px"}}>Auto-refunded</div></div>
                <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"7px",padding:"11px"}}><div style={{fontSize:"17px",fontWeight:700,color:"var(--text)"}}>Never</div><div style={{fontFamily:"'Geist Mono',monospace",fontSize:"9px",color:"var(--text3)",marginTop:"2px"}}>Tokens expire</div></div>
              </div>
            </div>
          </div>
        </div>
      </div></section>

      {/* PRICING */}
      <section id="pricing" className="section" style={{background:"var(--bg2)"}}><div className="container">
        <div className="section-heading reveal"><div className="tag">Pricing</div><h2>Start free.<br/><span>Scale when ready.</span></h2><p>Token-based billing. No seat fees. No hidden costs. Pay only for the AI runs you actually make.</p></div>
        <div className="billing-toggle">
          <span className={`toggle-label${!annual?" on":""}`}>Monthly</span>
          <div className={`tog-sw${annual?" on":""}`} onClick={()=>setAnnual(v=>!v)}><div className="tog-knob"></div></div>
          <span className={`toggle-label${annual?" on":""}`}>Annual</span>
          {annual&&<span className="save-badge">Save 20%</span>}
        </div>
        <div className="pricing-grid">
          {[
            {name:"Starter",mo:0,yr:0,desc:"3-day full access. No card needed.",feats:["All 12 AI tools","100 starter tokens","Full session history"],no:["Token rollover","Priority routing","API access","Team seats"],btn:"ghost",btnTxt:"Start Free Trial →",featured:false},
            {name:"Dominate",mo:29,yr:23,desc:"For individuals serious about peak performance.",feats:["All 12 AI tools — unlimited runs","1,200 tokens/mo with rollover","Priority Claude + Gemini routing","Full history + export","Auto-refund on any failure"],no:["API access","Team seats"],btn:"primary",btnTxt:"Start Free, Upgrade Later →",featured:true},
            {name:"Reign",mo:79,yr:63,desc:"For teams and builders. API access, 5 seats.",feats:["Everything in Dominate","5,000 tokens/mo with rollover","REST API + webhooks","5 team seats included","Analytics dashboard","Priority support + SLA","Custom model configs"],no:[],btn:"ghost",btnTxt:"Get Reign →",featured:false},
          ].map((p,i)=>(
            <div key={i} className={`price-card reveal${i===1?" reveal-d1":i===2?" reveal-d2":""}${p.featured?" featured":""}`}>
              {p.featured&&<><div className="featured-glow"></div><div className="plan-badge">Most Popular</div></>}
              <div>
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><span className="plan-price-sym">$</span><span className="plan-price-num">{annual?p.yr:p.mo}</span><span className="plan-price-period">/mo</span></div>
                <div className="plan-desc">{p.desc}</div>
              </div>
              <div className="plan-sep"></div>
              <div className="plan-features">
                {p.feats.map((f,j)=><div key={j} className="pf-item"><div className="pf-check on">✓</div>{f}</div>)}
                {p.no.map((f,j)=><div key={j} className="pf-item dim"><div className="pf-check off">—</div>{f}</div>)}
              </div>
              <a href="/signup" className={`plan-btn ${p.btn}`}>{p.btnTxt}</a>
            </div>
          ))}
        </div>
        <div className="pricing-footnote">Tokens never expire · Roll over monthly · Auto-refund on failure · Cancel in under 8 seconds</div>
      </div></section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="section"><div className="container">
        <div className="section-heading reveal"><div className="tag">Testimonials</div><h2>Real people.<br/><span>Real results.</span></h2><p>Not average users. High-performers who needed more than ChatGPT could give them.</p></div>
        <div className="testi-grid">
          {[
            {q:"Used Cognitive Clone to prep for a board presentation. It knew my blind spots before I did.",rest:"Closed a $2.4M round the same week.",av:"AM",c:"var(--accent)",bg:"rgba(79,127,255,.1)",name:"Arjun Mehta",role:"Founder & CEO · Series A SaaS",badge:"↑ $2.4M"},
            {q:"Deep Work Engine restructured everything I was doing wrong.",rest:"5 hours of scattered effort became 3 hours of pure output.",av:"PS",c:"var(--green)",bg:"rgba(16,185,129,.1)",name:"Priya Sharma",role:"Head of Growth · Fintech",badge:"↑ 3.2× Output"},
            {q:"Opportunity Radar found a channel I had been blind to for two years.",rest:"First outreach call landed a 6-figure consulting contract.",av:"KR",c:"var(--amber)",bg:"rgba(245,158,11,.1)",name:"Kyle Ramos",role:"Principal · B2B Strategy",badge:"↑ $120K"}
          ].map((t,i)=>(
            <div key={i} className={`testi-card reveal${i===1?" reveal-d1":i===2?" reveal-d2":""}`}>
              <div className="testi-stars">{"★★★★★".split("").map((x,j)=><span key={j} className="ts">{x}</span>)}</div>
              <p className="testi-q"><em>&ldquo;{t.q}&rdquo;</em> {t.rest}</p>
              <div className="testi-author"><div className="ta-av" style={{background:t.bg,color:t.c}}>{t.av}</div><div><div className="ta-name">{t.name}</div><div className="ta-role">{t.role}</div></div><div className="ta-badge">{t.badge}</div></div>
            </div>
          ))}
        </div>
      </div></section>

      {/* SECURITY */}
      <section id="security" className="section-sm" style={{background:"var(--bg2)"}}><div className="container">
        <div className="section-heading reveal" style={{maxWidth:"540px"}}><div className="tag">Trust &amp; Security</div><h2>Built to be<br/><span>trusted.</span></h2></div>
        <div className="security-grid">
          {[
            {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,bg:"rgba(79,127,255,.08)",title:"End-to-end encryption",desc:"AES-256 + TLS 1.3. Your ideas never leave your control."},
            {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,bg:"rgba(16,185,129,.08)",title:"Zero data training",desc:"We never use your sessions to train any model. Private by default."},
            {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,bg:"rgba(245,158,11,.08)",title:"99.9% uptime SLA",desc:"Enterprise-grade infrastructure. Incidents resolved before you notice."},
            {icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,bg:"rgba(239,68,68,.08)",title:"Auto-refund guarantee",desc:"If any AI run fails, tokens are automatically returned. Zero risk."},
          ].map((x,i)=>(
            <div key={i} className={`sec-card reveal${i===1?" reveal-d1":i===2?" reveal-d2":i===3?" reveal-d3":""}`}>
              <div className="sec-icon" style={{background:x.bg}}>{x.icon}</div>
              <div className="sec-title">{x.title}</div>
              <div className="sec-desc">{x.desc}</div>
            </div>
          ))}
        </div>
      </div></section>

      {/* FAQ */}
      <section id="faq" className="section"><div className="container">
        <div className="section-heading reveal"><div className="tag">FAQ</div><h2>Questions,<br/><span>answered.</span></h2></div>
        <div className="faq-list">
          {[
            {q:"What exactly is a token, and how does billing work?",a:"Tokens are REIOGN billing units. Each AI tool has a fixed token cost — ranging from 5 tokens for instant light tools to 50 for heavy Claude-powered tools. Tokens are deducted on successful completion. If any run fails, tokens are automatically refunded. They roll over monthly and never expire."},
            {q:"Which AI models does REIOGN use?",a:"REIOGN uses three models, auto-routed based on task requirements: Claude AI for heavy reasoning and multi-step analysis, Gemini Pro for research and synthesis, and Groq LLaMA for instant-speed lightweight operations. You never configure routing — it happens automatically."},
            {q:"How is REIOGN different from ChatGPT or Claude directly?",a:"ChatGPT and Claude are general-purpose assistants. REIOGN is a structured execution system. Every tool has a defined input format, pre-built prompt architecture, and structured output schema. No prompt engineering. Just structured results."},
            {q:"Is there really a free trial with no credit card?",a:"Yes. 3-day free trial with all 12 tools unlocked and 100 starter tokens. No credit card required. If you do not see clear value within 72 hours, you owe nothing."},
            {q:"Can I cancel at any time?",a:"Yes. Cancel in under 8 seconds from account settings. No fees. Unused tokens are held for 12 months after cancellation."},
            {q:"Do tokens expire?",a:"No. Unused tokens roll over to the following month and never expire for active accounts."},
          ].map((f,i)=>(
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={e=>toggleFaq(e.currentTarget as HTMLElement)}>{f.q}<span className="faq-icon">+</span></div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div></section>

      {/* CTA */}
      <section id="cta-final">
        <div className="cta-grid-bg"></div>
        <div className="cta-content container">
          <div className="tag reveal">Get started</div>
          <h2 className="cta-h reveal">Start your free trial.<br/><span>No card. No risk.</span></h2>
          <p className="cta-p reveal">3 days. All 12 tools. 100 starter tokens. If you do not see the value — you owe nothing.</p>
          <div className="cta-ctas reveal">
            <a href="/signup" className="btn-primary" style={{fontSize:"16px",padding:"15px 32px"}}>
              Create Free Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button className="btn-secondary" style={{fontSize:"16px"}}>Talk to Sales</button>
          </div>
          <div className="cta-footnote reveal">Free trial · No credit card · Cancel in 8 seconds · Auto-refund on failure</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer"><div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><div className="fl-mark"></div><span className="fl-name">REIOGN</span></div>
            <p className="footer-desc">12 purpose-built AI tools in one unified workspace. Built for people who execute.</p>
            <div className="footer-socials">
              <div className="fsoc" title="X"><svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor"><path d="M7.55 5.51 12.27 0h-1.13L7.04 4.78 3.82 0H0l4.96 7.22L0 13h1.13l4.33-5.04L8.82 13H12.64L7.55 5.51Z"/></svg></div>
              <div className="fsoc" title="LinkedIn"><svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor"><path d="M2.91 1.3a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0ZM.44 4.33H2.7V13H.44V4.33Zm3.64 0H6.3v1.18h.03c.26-.5.9-1.02 1.86-1.02C10.42 4.49 11 5.87 11 7.83V13H8.75V8.28c0-.84-.02-1.93-1.18-1.93-1.18 0-1.36.92-1.36 1.87V13H4V4.33Z"/></svg></div>
              <div className="fsoc" title="GitHub"><svg width="13" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></div>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <div className="footer-links"><a href="#tools">AI Tools</a><a href="#overview">Platform</a><a href="#pricing">Pricing</a><a href="#">Changelog</a><a href="#">Roadmap</a><a href="#">Status</a></div>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <div className="footer-links"><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Press</a><a href="#">Contact</a></div>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <div className="footer-links"><a href="#">Documentation</a><a href="#">API Reference</a><a href="#">Community</a><a href="#">Guides</a><a href="#">Support</a></div>
          </div>
          <div>
            <div className="footer-col-title">Legal</div>
            <div className="footer-links"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Cookie Policy</a><a href="#">Security</a><a href="#">GDPR</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 REIOGN. All rights reserved.</span>
          <div className="footer-legal"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
          <div className="footer-status">All systems operational</div>
        </div>
      </div></footer>
    </div>
  );
}
