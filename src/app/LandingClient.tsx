<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>REIOGN — The AI Workspace for Peak Performers</title>
<meta name="description" content="10 purpose-built AI tools in one unified workspace. Deep Work Engine, Cognitive Clone, Research Builder. Built for people who execute.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>

/* ============================================================
   ROOT & RESET
============================================================ */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

:root {
  --bg:         #080B12;
  --bg2:        #0C1018;
  --bg3:        #101520;
  --surface:    #141922;
  --surface2:   #1a2130;
  --border:     rgba(255,255,255,.07);
  --border2:    rgba(255,255,255,.12);
  --text:       #E8EAF0;
  --text2:      #8892A4;
  --text3:      #5A6478;
  --accent:     #4F7FFF;
  --accent2:    #6B93FF;
  --accent-glow:rgba(79,127,255,.18);
  --green:      #10B981;
  --amber:      #F59E0B;
  --red:        #E5190A;
  --radius:     10px;
  --radius-lg:  16px;
  --font:       'Geist', system-ui, sans-serif;
  --mono:       'Geist Mono', monospace;
}

html {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body { overflow-x: hidden; }

a { text-decoration: none; color: inherit; }
button { font-family: var(--font); cursor: pointer; border: none; outline: none; }
input { font-family: var(--font); }
img { display: block; }

/* ============================================================
   UTILITY
============================================================ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .04em;
  color: var(--accent);
  background: rgba(79,127,255,.08);
  border: 1px solid rgba(79,127,255,.2);
  padding: 5px 12px;
  border-radius: 100px;
}
.tag::before { content:''; width:6px; height:6px; background:var(--accent); border-radius:50%; animation: pulse 2s infinite; }

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideRight { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
@keyframes borderGlow { 0%,100%{border-color:rgba(79,127,255,.2)} 50%{border-color:rgba(79,127,255,.5)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1);
}
.reveal.on { opacity:1; transform:none; }
.reveal-d1 { transition-delay:.1s }
.reveal-d2 { transition-delay:.2s }
.reveal-d3 { transition-delay:.3s }
.reveal-d4 { transition-delay:.4s }

/* ============================================================
   NOISE GRAIN
============================================================ */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  opacity: .025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* ============================================================
   OPENING CINEMATIC
============================================================ */
#intro {
  position: fixed;
  inset: 0;
  z-index: 9900;
  background: #050709;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 32px;
}
#intro canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.intro-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.intro-logo {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: .18em;
  color: var(--text);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity .8s, transform .8s;
}
.intro-logo span { color: var(--accent); }
.intro-tagline {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: .3em;
  text-transform: uppercase;
  color: var(--text3);
  opacity: 0;
  transition: opacity .6s .4s;
}
.intro-progress {
  width: 160px;
  height: 1px;
  background: rgba(255,255,255,.06);
  border-radius: 1px;
  overflow: hidden;
}
.intro-bar {
  height: 100%;
  width: 0;
  background: var(--accent);
  transition: width 2.2s cubic-bezier(.23,1,.32,1);
}
#intro.exit {
  animation: introExit .7s .1s forwards;
}
@keyframes introExit {
  to { clip-path: inset(0 0 100% 0); visibility: hidden; }
}

/* ============================================================
   NAVBAR
============================================================ */
#nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 800;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  transition: background .3s, border-color .3s, box-shadow .3s;
  border-bottom: 1px solid transparent;
  opacity: 0;
}
#nav.on {
  opacity: 1;
}
#nav.scrolled {
  background: rgba(8,11,18,.88);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px);
  border-bottom-color: var(--border);
  box-shadow: 0 1px 0 rgba(255,255,255,.04);
}

.nav-inner {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.nav-logo-mark {
  width: 26px;
  height: 26px;
  background: var(--accent);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  transition: transform .4s cubic-bezier(.34,1.56,.64,1);
}
.nav-logo:hover .nav-logo-mark { transform: rotate(90deg) scale(1.1); }
.nav-logo-text {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: .12em;
  color: var(--text);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 40px;
}
.nav-links a {
  font-size: 13.5px;
  font-weight: 450;
  color: var(--text2);
  padding: 6px 12px;
  border-radius: 7px;
  transition: color .18s, background .18s;
}
.nav-links a:hover { color: var(--text); background: rgba(255,255,255,.05); }

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-ghost-sm {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text2);
  padding: 7px 16px;
  border-radius: 8px;
  background: transparent;
  border: none;
  transition: color .18s, background .18s;
}
.btn-ghost-sm:hover { color: var(--text); background: rgba(255,255,255,.05); }
.btn-primary-sm {
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  padding: 7px 18px;
  border-radius: 8px;
  background: var(--accent);
  border: none;
  transition: background .18s, transform .15s, box-shadow .2s;
}
.btn-primary-sm:hover {
  background: var(--accent2);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(79,127,255,.35);
}

/* Mobile burger */
#burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  padding: 8px;
  margin-left: auto;
}
#burger span {
  width: 20px;
  height: 1.5px;
  background: var(--text);
  border-radius: 2px;
  transition: transform .3s, opacity .3s;
}
#mmenu {
  position: fixed;
  inset: 60px 0 0;
  background: rgba(8,11,18,.97);
  backdrop-filter: blur(24px);
  z-index: 799;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  display: none;
}
#mmenu.on { display: flex; }
#mmenu a {
  font-size: 20px;
  font-weight: 600;
  color: var(--text2);
  transition: color .18s;
}
#mmenu a:hover { color: var(--text); }

@media(max-width: 900px) {
  .nav-links { display: none; }
  .nav-right .btn-ghost-sm { display: none; }
  #burger { display: flex; }
}

/* ============================================================
   HERO
============================================================ */
#hero {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: 120px 24px 80px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Mesh gradient bg */
.hero-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,127,255,.15) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 60%, rgba(79,127,255,.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 20% 70%, rgba(16,185,129,.04) 0%, transparent 60%);
}

/* Grid lines */
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 860px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  opacity: 0;
  animation: fadeUp 1s .2s cubic-bezier(.16,1,.3,1) forwards;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(79,127,255,.08);
  border: 1px solid rgba(79,127,255,.22);
  padding: 6px 14px 6px 8px;
  border-radius: 100px;
  font-size: 12.5px;
  color: var(--text2);
  transition: border-color .3s;
}
.hero-badge:hover { border-color: rgba(79,127,255,.4); }
.hero-badge .badge-pill {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  padding: 2px 8px;
  border-radius: 100px;
}
.hero-badge .badge-dot {
  width: 5px;
  height: 5px;
  background: var(--green);
  border-radius: 50%;
  animation: pulse 1.8s infinite;
  flex-shrink: 0;
}

.hero-h1 {
  font-size: clamp(44px, 7vw, 86px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -.03em;
  color: var(--text);
  text-wrap: balance;
}
.hero-h1 .accent-text {
  background: linear-gradient(135deg, #4F7FFF 0%, #7BA3FF 50%, #A5C0FF 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradShift 4s ease infinite;
}

.hero-sub {
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 400;
  color: var(--text2);
  max-width: 520px;
  line-height: 1.65;
  text-wrap: balance;
}

.hero-ctas {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  padding: 13px 26px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background .18s, transform .15s, box-shadow .2s;
  box-shadow: 0 0 0 1px rgba(79,127,255,.3), 0 4px 24px rgba(79,127,255,.25);
}
.btn-primary:hover {
  background: var(--accent2);
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px rgba(79,127,255,.4), 0 8px 36px rgba(79,127,255,.35);
}
.btn-primary svg { transition: transform .2s; }
.btn-primary:hover svg { transform: translateX(3px); }
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text2);
  background: rgba(255,255,255,.05);
  padding: 13px 24px;
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: color .18s, background .18s, border-color .18s, transform .15s;
}
.btn-secondary:hover {
  color: var(--text);
  background: rgba(255,255,255,.08);
  border-color: var(--border2);
  transform: translateY(-1px);
}

.hero-meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-meta-item::before {
  content: '✓';
  color: var(--green);
  font-size: 11px;
}

/* Dashboard preview */
.hero-preview {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1060px;
  margin-top: 60px;
  opacity: 0;
  transform: translateY(32px) scale(.97);
  animation: heroPreview 1s .7s cubic-bezier(.16,1,.3,1) forwards;
}
@keyframes heroPreview {
  to { opacity:1; transform:translateY(0) scale(1); }
}

.preview-browser {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(79,127,255,.1),
    0 24px 80px rgba(0,0,0,.6),
    0 4px 16px rgba(0,0,0,.4),
    0 0 120px rgba(79,127,255,.06);
}
.browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,.02);
}
.browser-dot { width:10px;height:10px;border-radius:50%; }
.bd-red{background:#FF5F57}.bd-yellow{background:#FFBD2E}.bd-green{background:#28CA41}
.browser-url {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  padding: 4px 14px;
  border-radius: 6px;
  max-width: 360px;
  margin: 0 auto;
}
.browser-url span {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
}
.url-dot { width:5px;height:5px;border-radius:50%;background:var(--green); }

/* Dashboard UI */
.dash-ui {
  display: flex;
  height: 460px;
  background: var(--bg2);
}

/* Sidebar */
.dash-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  background: rgba(255,255,255,.01);
}
.ds-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}
.ds-logo-mark {
  width: 24px;
  height: 24px;
  background: var(--accent);
  clip-path: polygon(50%0%,100%50%,50%100%,0%50%);
}
.ds-title { font-size: 14px; font-weight: 700; letter-spacing: .1em; }
.ds-section { font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);padding:0 18px 8px; }
.ds-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 450;
  color: var(--text3);
  cursor: default;
  transition: color .15s, background .15s;
  border-radius: 0;
}
.ds-nav-item:hover,.ds-nav-item.active {
  color: var(--text);
  background: rgba(79,127,255,.08);
}
.ds-nav-item.active { color: var(--accent); border-right: 2px solid var(--accent); }
.ds-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  opacity: .6;
}
.ds-nav-item.active .ds-icon { opacity: 1; }

/* Main area */
.dash-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
}
.dash-greeting { font-size: 14px; font-weight: 600; color: var(--text); }
.dash-greeting span { color: var(--text3); font-weight: 400; }
.dash-actions { display: flex; gap: 8px; }
.da-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 7px;
  border: none;
  cursor: default;
}
.da-btn-ghost {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,.05);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 7px;
  cursor: default;
}

.dash-body { flex: 1; overflow: hidden; display: flex; }
.dash-content { flex: 1; padding: 20px 24px; overflow: hidden; display: flex; flex-direction: column; gap: 16px; }

/* Stats row */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color .2s;
}
.stat-card:hover { border-color: var(--border2); }
.stat-label { font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--text3); }
.stat-value { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; }
.stat-change {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tool grid */
.tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1; }
.tool-chip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: default;
  transition: border-color .2s, background .2s;
}
.tool-chip:hover { border-color: var(--border2); background: var(--surface2); }
.tool-chip.active { border-color: rgba(79,127,255,.4); background: rgba(79,127,255,.06); }
.tc-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.tc-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.tc-name { font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tc-status { font-family: var(--mono); font-size: 10px; color: var(--text3); }
.tc-status.running { color: var(--green); }

/* Right panel */
.dash-right-panel {
  width: 240px;
  border-left: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}
.panel-title { font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3); }
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
}
.ai-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.ai-text { color: var(--text2); line-height: 1.4; }
.ai-time { color: var(--text3); font-family:var(--mono);font-size:10px;margin-top:2px; }
.perf-bars { display: flex; flex-direction: column; gap: 8px; }
.pb { display: flex; flex-direction: column; gap: 4px; }
.pb-header { display: flex; justify-content: space-between; font-family:var(--mono);font-size:10px;color:var(--text3); }
.pb-track { height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
.pb-fill { height: 100%; border-radius: 2px; background: var(--accent); }
.pb-fill.g { background: var(--green); }
.pb-fill.a { background: var(--amber); }

/* ============================================================
   TRUST SIGNALS
============================================================ */
#trust {
  padding: 48px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  overflow: hidden;
}
.trust-label {
  text-align: center;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 28px;
}
.trust-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}
.trust-logo {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,.2);
  letter-spacing: .08em;
  transition: color .25s;
  cursor: default;
}
.trust-logo:hover { color: rgba(255,255,255,.4); }
.trust-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  flex-shrink: 0;
}
.trust-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-top: 36px;
  flex-wrap: wrap;
}
.trust-stat-v {
  font-size: 30px;
  font-weight: 800;
  color: var(--text);
  text-align: center;
  line-height: 1;
}
.trust-stat-l {
  font-size: 12.5px;
  color: var(--text3);
  text-align: center;
  margin-top: 4px;
}

/* ============================================================
   SECTION HEADINGS
============================================================ */
.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}
.section-heading h2 {
  font-size: clamp(32px, 4.5vw, 54px);
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--text);
  line-height: 1.08;
  text-wrap: balance;
}
.section-heading h2 span { color: var(--accent); }
.section-heading p {
  font-size: 17px;
  color: var(--text2);
  line-height: 1.65;
  text-wrap: balance;
}

/* Section padding */
.section {
  padding: 120px 0;
}
.section-sm { padding: 80px 0; }

/* ============================================================
   PLATFORM OVERVIEW
============================================================ */
#overview {
  padding: 120px 0;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}
#overview::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 100%, rgba(79,127,255,.05) 0%, transparent 70%);
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-top: 72px;
}
.overview-text { display: flex; flex-direction: column; gap: 24px; }
.overview-text h3 {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--text);
  line-height: 1.15;
}
.overview-text p {
  font-size: 16px;
  color: var(--text2);
  line-height: 1.7;
}
.overview-points { display: flex; flex-direction: column; gap: 14px; }
.ov-point {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14.5px;
  color: var(--text2);
}
.ov-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(16,185,129,.1);
  border: 1px solid rgba(16,185,129,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--green);
}
.overview-visual {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,.4), 0 0 0 1px rgba(79,127,255,.08);
}

/* Stacked UI mockup */
.mockup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,.02);
}
.mockup-h-title { font-size: 13px; font-weight: 600; color: var(--text); }
.mockup-h-actions { display: flex; gap: 6px; }
.mh-btn {
  font-size: 11px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.04);
  color: var(--text2);
  cursor: default;
}
.mh-btn.blue { background: rgba(79,127,255,.15); border-color: rgba(79,127,255,.25); color: var(--accent2); }
.mockup-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.mk-line {
  height: 10px;
  background: rgba(255,255,255,.04);
  border-radius: 3px;
}
.mk-line.w100{width:100%}.mk-line.w80{width:80%}.mk-line.w60{width:60%}.mk-line.w40{width:40%}.mk-line.accent{background:rgba(79,127,255,.2);width:65%}
.mk-row { display: flex; gap: 10px; }
.mk-block {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  flex: 1;
}
.mk-block-title { font-size: 11px; font-weight: 600; color: var(--text2); margin-bottom: 8px; }
.mk-block-value { font-size: 24px; font-weight: 800; color: var(--text); }
.mk-block-sub { font-family:var(--mono);font-size:10px;color:var(--green);margin-top:3px; }

/* ============================================================
   AI TOOLS SHOWCASE
============================================================ */
#tools {
  padding: 120px 0;
  background: var(--bg2);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 60px;
}

.tool-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: default;
  position: relative;
  overflow: hidden;
  transition: border-color .25s, transform .25s, box-shadow .25s, background .25s;
}
.tool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .3s;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 0%), rgba(79,127,255,.08) 0%, transparent 60%);
}
.tool-card:hover::before { opacity: 1; }
.tool-card:hover {
  border-color: rgba(79,127,255,.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,.3), 0 0 0 1px rgba(79,127,255,.1);
}

.tc-header { display: flex; align-items: flex-start; justify-content: space-between; }
.tc-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.tc-badge {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  border: 1px solid;
}
.b-heavy { color: #FF8A65; border-color: rgba(255,138,101,.25); background: rgba(255,138,101,.08); }
.b-medium { color: var(--accent2); border-color: rgba(79,127,255,.25); background: rgba(79,127,255,.08); }
.b-light { color: var(--green); border-color: rgba(16,185,129,.25); background: rgba(16,185,129,.08); }

.tc-title { font-size: 16px; font-weight: 700; color: var(--text); }
.tc-desc { font-size: 13.5px; color: var(--text2); line-height: 1.6; }
.tc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}
.tc-model {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 5px;
}
.tc-model::before { content:''; width:6px;height:6px;border-radius:50%;background:var(--green); }
.tc-tokens {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
}

/* ============================================================
   HOW IT WORKS
============================================================ */
#how {
  padding: 120px 0;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}
#how::before {
  content: '';
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(79,127,255,.2) 30%, rgba(79,127,255,.2) 70%, transparent);
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-top: 72px;
  position: relative;
}
.step {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}
.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(79,127,255,.1);
  border: 1px solid rgba(79,127,255,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}
.step-h {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.01em;
}
.step-p {
  font-size: 14.5px;
  color: var(--text2);
  line-height: 1.65;
}
.step-ui {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  width: 100%;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step-ui-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text2);
}
.sui-ico { font-size: 14px; }
.sui-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,.06);
  border-radius: 3px;
  overflow: hidden;
}
.sui-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
}

/* ============================================================
   WHY SECTION (comparison)
============================================================ */
#why {
  padding: 120px 0;
  background: var(--bg2);
}

.why-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 60px;
}

.why-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.why-col.featured {
  border-color: rgba(79,127,255,.3);
  box-shadow: 0 0 0 1px rgba(79,127,255,.1), 0 16px 48px rgba(79,127,255,.08);
  background: rgba(79,127,255,.04);
}
.why-col-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}
.wch-title { font-size: 15px; font-weight: 700; color: var(--text); }
.wch-badge {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 100px;
}
.wch-badge.bad { background: rgba(255,90,90,.06); color: #FF6B6B; border: 1px solid rgba(255,90,90,.15); }
.wch-badge.good { background: rgba(79,127,255,.1); color: var(--accent2); border: 1px solid rgba(79,127,255,.25); }
.why-items { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.why-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text2);
}
.wi-ico { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
.wi-cross { color: #FF6B6B; }
.wi-check { color: var(--green); }

/* ============================================================
   FEATURE DEEP DIVE
============================================================ */
#features {
  padding: 120px 0;
  background: var(--bg);
}
.features-stack { display: flex; flex-direction: column; gap: 120px; margin-top: 80px; }
.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.feature-row.flip { direction: rtl; }
.feature-row.flip > * { direction: ltr; }
.feature-text { display: flex; flex-direction: column; gap: 20px; }
.feat-tag {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}
.feat-tag::before { content:''; width:18px;height:1px;background:var(--accent); }
.feat-h { font-size: clamp(24px, 3vw, 34px); font-weight: 800; letter-spacing: -.02em; color: var(--text); line-height: 1.2; }
.feat-p { font-size: 15px; color: var(--text2); line-height: 1.7; }
.feat-list { display: flex; flex-direction: column; gap: 10px; }
.fl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text2);
}
.fl-item::before { content:'→'; color:var(--accent);font-size:13px;flex-shrink:0; }
.feature-visual {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 16px 48px rgba(0,0,0,.3), 0 0 0 1px rgba(79,127,255,.06);
  min-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fv-top { display: flex; align-items: center; justify-content: space-between; }
.fv-title { font-size: 13px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }
.fv-status { font-family:var(--mono);font-size:10px;color:var(--green);display:flex;align-items:center;gap:5px; }
.fv-status::before { content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite; }
.fv-lines { display: flex; flex-direction: column; gap: 8px; }
.fv-line { height: 10px; background: rgba(255,255,255,.04); border-radius: 3px; }
.fv-line.w90{width:90%}.fv-line.w70{width:70%}.fv-line.w50{width:50%}.fv-line.w80{width:80%}.fv-line.accent{background:rgba(79,127,255,.18)}
.fv-code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  line-height: 1.8;
}
.fv-code .kw { color: var(--accent2); }
.fv-code .str { color: var(--green); }
.fv-code .cm { color: var(--text3); opacity: .6; }
.fv-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.fv-metric {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fvm-v { font-size: 22px; font-weight: 800; color: var(--text); }
.fvm-l { font-family:var(--mono);font-size:10px;color:var(--text3); }
.fvm-ch { font-family:var(--mono);font-size:10px;color:var(--green); }

/* ============================================================
   PRICING
============================================================ */
#pricing {
  padding: 120px 0;
  background: var(--bg2);
}

.billing-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin: 28px 0 52px;
}
.toggle-label {
  font-size: 13.5px;
  color: var(--text2);
  transition: color .2s;
}
.toggle-label.on { color: var(--text); }
.toggle-switch {
  width: 44px;
  height: 24px;
  background: rgba(255,255,255,.08);
  border: 1px solid var(--border);
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  transition: background .2s;
}
.toggle-switch.on { background: rgba(79,127,255,.25); border-color: rgba(79,127,255,.35); }
.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: var(--text2);
  border-radius: 50%;
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), background .2s;
}
.toggle-switch.on .toggle-knob { transform: translateX(20px); background: var(--accent); }
.save-badge {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--green);
  background: rgba(16,185,129,.08);
  border: 1px solid rgba(16,185,129,.2);
  padding: 3px 10px;
  border-radius: 100px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}

.price-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: transform .25s, box-shadow .25s;
}
.price-card:hover { transform: translateY(-4px); }
.price-card.featured {
  border-color: rgba(79,127,255,.35);
  background: rgba(79,127,255,.04);
  box-shadow: 0 0 0 1px rgba(79,127,255,.15), 0 20px 60px rgba(79,127,255,.1);
}
.featured-glow {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(79,127,255,.12) 0%, transparent 70%);
  pointer-events: none;
}
.plan-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  background: rgba(79,127,255,.1);
  border: 1px solid rgba(79,127,255,.25);
  padding: 4px 10px;
  border-radius: 100px;
}
.plan-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text2);
}
.plan-price {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  line-height: 1;
}
.plan-price-num {
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -.02em;
}
.plan-price-sym { font-size: 22px; font-weight: 600; color: var(--text2); margin-bottom: 8px; }
.plan-price-period { font-size: 14px; color: var(--text3); margin-bottom: 8px; }
.plan-desc { font-size: 13.5px; color: var(--text2); line-height: 1.6; }
.plan-sep { height: 1px; background: var(--border); }
.plan-features { display: flex; flex-direction: column; gap: 11px; flex: 1; }
.pf-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: var(--text2);
}
.pf-check {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
}
.pf-check.on { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.25); }
.pf-check.off { background: rgba(255,255,255,.03); color: var(--text3); border: 1px solid var(--border); }
.pf-item.dim { color: var(--text3); }
.plan-btn {
  padding: 13px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s, transform .15s, box-shadow .2s;
  width: 100%;
  border: none;
}
.plan-btn.primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 20px rgba(79,127,255,.25);
}
.plan-btn.primary:hover { background: var(--accent2); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,127,255,.35); }
.plan-btn.ghost {
  background: rgba(255,255,255,.05);
  color: var(--text2);
  border: 1px solid var(--border);
}
.plan-btn.ghost:hover { background: rgba(255,255,255,.09); color: var(--text); }
.pricing-footnote {
  text-align: center;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text3);
  margin-top: 32px;
  line-height: 1.8;
}

/* ============================================================
   TESTIMONIALS
============================================================ */
#testimonials {
  padding: 120px 0;
  background: var(--bg);
  overflow: hidden;
}

.testi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 60px;
}
.testi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color .25s, transform .25s;
}
.testi-card:hover { border-color: var(--border2); transform: translateY(-2px); }
.testi-stars { display: flex; gap: 3px; }
.ts { color: var(--amber); font-size: 13px; }
.testi-q {
  font-size: 14.5px;
  color: var(--text2);
  line-height: 1.68;
  flex: 1;
}
.testi-q em {
  font-style: italic;
  color: var(--text);
}
.testi-author { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border); padding-top: 16px; }
.ta-av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid var(--border2);
}
.ta-name { font-size: 13.5px; font-weight: 600; color: var(--text); }
.ta-role { font-size: 12px; color: var(--text3); }
.ta-badge {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--green);
  background: rgba(16,185,129,.06);
  border: 1px solid rgba(16,185,129,.2);
  padding: 3px 8px;
  border-radius: 100px;
}

/* ============================================================
   SECURITY
============================================================ */
#security {
  padding: 80px 0;
  background: var(--bg2);
}
.security-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 52px;
}
.sec-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color .2s;
}
.sec-card:hover { border-color: var(--border2); }
.sec-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.sec-title { font-size: 15px; font-weight: 700; color: var(--text); }
.sec-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

/* ============================================================
   FAQ
============================================================ */
#faq {
  padding: 120px 0;
  background: var(--bg);
}
.faq-list {
  max-width: 720px;
  margin: 52px auto 0;
  display: flex;
  flex-direction: column;
}
.faq-item {
  border-bottom: 1px solid var(--border);
}
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text2);
  cursor: pointer;
  transition: color .18s;
  user-select: none;
}
.faq-q:hover { color: var(--text); }
.faq-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text3);
  flex-shrink: 0;
  transition: transform .3s cubic-bezier(.16,1,.3,1), border-color .2s, color .2s, background .2s;
}
.faq-item.open .faq-q { color: var(--text); }
.faq-item.open .faq-icon {
  transform: rotate(45deg);
  border-color: rgba(79,127,255,.3);
  color: var(--accent);
  background: rgba(79,127,255,.08);
}
.faq-a {
  font-size: 14.5px;
  color: var(--text2);
  line-height: 1.7;
  max-height: 0;
  overflow: hidden;
  transition: max-height .4s cubic-bezier(.16,1,.3,1), padding .3s;
}
.faq-item.open .faq-a { max-height: 300px; padding-bottom: 20px; }

/* ============================================================
   FINAL CTA
============================================================ */
#cta-final {
  padding: 160px 0;
  background: var(--bg2);
  position: relative;
  overflow: hidden;
  text-align: center;
}
#cta-final::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79,127,255,.1) 0%, transparent 70%);
}
.cta-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 60% 70% at 50% 50%, black 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 60% 70% at 50% 50%, black 0%, transparent 75%);
}
.cta-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.cta-h {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--text);
  line-height: 1.05;
  text-wrap: balance;
}
.cta-h span {
  background: linear-gradient(135deg, #4F7FFF, #7BA3FF, #A5C0FF);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradShift 4s ease infinite;
}
.cta-p {
  font-size: 18px;
  color: var(--text2);
  max-width: 460px;
  line-height: 1.65;
  text-wrap: balance;
}
.cta-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.cta-footnote { font-family:var(--mono);font-size:12px;color:var(--text3);margin-top:4px; }

/* ============================================================
   FOOTER
============================================================ */
#footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 64px 0 32px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 52px;
}
.footer-brand { display: flex; flex-direction: column; gap: 16px; }
.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fl-mark {
  width: 22px;
  height: 22px;
  background: var(--accent);
  clip-path: polygon(50%0%,100%50%,50%100%,0%50%);
}
.fl-name { font-size: 15px; font-weight: 800; letter-spacing: .12em; }
.footer-desc { font-size: 13.5px; color: var(--text2); line-height: 1.65; max-width: 240px; }
.footer-socials { display: flex; gap: 10px; }
.fsoc {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  transition: border-color .2s, color .2s, background .2s;
  cursor: pointer;
}
.fsoc:hover { border-color: var(--border2); color: var(--text); background: rgba(255,255,255,.04); }
.footer-col-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  letter-spacing: .02em;
}
.footer-links { display: flex; flex-direction: column; gap: 10px; }
.footer-links a {
  font-size: 13.5px;
  color: var(--text2);
  transition: color .18s;
}
.footer-links a:hover { color: var(--text); }
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 28px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 16px;
}
.footer-copy { font-size: 13px; color: var(--text3); }
.footer-legal { display: flex; gap: 20px; }
.footer-legal a { font-size: 13px; color: var(--text3); transition: color .18s; }
.footer-legal a:hover { color: var(--text2); }
.footer-status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--green);
}
.footer-status::before { content:''; width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite; }

/* ============================================================
   RESPONSIVE
============================================================ */
@media(max-width:1024px) {
  .overview-grid { grid-template-columns: 1fr; gap: 48px; }
  .feature-row { grid-template-columns: 1fr; gap: 40px; }
  .feature-row.flip { direction: ltr; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
}
@media(max-width: 768px) {
  .tools-grid { grid-template-columns: 1fr 1fr; }
  .steps-row { grid-template-columns: 1fr; gap: 36px; }
  .why-grid { grid-template-columns: 1fr; }
  .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
  .testi-grid { grid-template-columns: 1fr; }
  .security-grid { grid-template-columns: 1fr 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .section { padding: 80px 0; }
  .dash-sidebar { display: none; }
  .dash-right-panel { display: none; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .tool-grid { grid-template-columns: repeat(2, 1fr); }
  #cta-final { padding: 100px 0; }
}
@media(max-width: 480px) {
  .tools-grid { grid-template-columns: 1fr; }
  .security-grid { grid-template-columns: 1fr; }
  .hero-ctas { flex-direction: column; width: 100%; }
  .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
}
</style>
</head>
<body>

<!-- ═══════════════════ INTRO ═══════════════════ -->
<div id="intro">
  <canvas id="intro-cv"></canvas>
  <div class="intro-content">
    <div class="intro-logo" id="intro-logo">REIO<span>G</span>N</div>
    <div class="intro-tagline" id="intro-tag">Cognitive Performance Platform</div>
    <div class="intro-progress">
      <div class="intro-bar" id="intro-bar"></div>
    </div>
  </div>
</div>

<!-- ═══════════════════ NAVBAR ═══════════════════ -->
<nav id="nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">
      <div class="nav-logo-mark"></div>
      <span class="nav-logo-text">REIOGN</span>
    </a>
    <div class="nav-links">
      <a href="#overview">Platform</a>
      <a href="#features">Features</a>
      <a href="#tools">AI Tools</a>
      <a href="#pricing">Pricing</a>
      <a href="#">Docs</a>
      <a href="#">Blog</a>
    </div>
    <div class="nav-right">
      <button class="btn-ghost-sm">Sign In</button>
      <button class="btn-primary-sm" onclick="scrollTo('#cta-final')">Get Started →</button>
    </div>
    <div id="burger" onclick="toggleMM()">
      <span></span><span></span><span></span>
    </div>
  </div>
</nav>

<!-- Mobile Menu -->
<div id="mmenu">
  <a href="#overview" onclick="closeMM()">Platform</a>
  <a href="#features" onclick="closeMM()">Features</a>
  <a href="#tools" onclick="closeMM()">AI Tools</a>
  <a href="#pricing" onclick="closeMM()">Pricing</a>
  <a href="#" onclick="closeMM()">Docs</a>
  <button class="btn-primary-sm" onclick="closeMM()">Get Started →</button>
</div>

<!-- ═══════════════════ HERO ═══════════════════ -->
<section id="hero">
  <div class="hero-bg">
    <div class="hero-mesh"></div>
    <div class="hero-grid"></div>
  </div>

  <div class="hero-content">
    <div class="hero-badge">
      <span class="badge-pill">New</span>
      <span class="badge-dot"></span>
      Cognitive Clone — now live for all plans
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </div>

    <h1 class="hero-h1">
      The AI workspace<br>built for <span class="accent-text">peak performers.</span>
    </h1>

    <p class="hero-sub">
      10 purpose-built AI tools. One unified workspace. Each with a defined output, the right model, and zero friction. Built for people who execute.
    </p>

    <div class="hero-ctas">
      <button class="btn-primary" onclick="scrollTo('#pricing')">
        Start Free Trial
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
      <button class="btn-secondary" onclick="scrollTo('#overview')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
        Watch Demo
      </button>
    </div>

    <div class="hero-meta">
      <span class="hero-meta-item">Free 3-day trial</span>
      <span class="hero-meta-item">No credit card</span>
      <span class="hero-meta-item">Cancel anytime</span>
      <span class="hero-meta-item">Auto-refund on failure</span>
    </div>
  </div>

  <!-- Dashboard Preview -->
  <div class="hero-preview container">
    <div class="preview-browser">
      <div class="browser-bar">
        <div class="browser-dot bd-red"></div>
        <div class="browser-dot bd-yellow"></div>
        <div class="browser-dot bd-green"></div>
        <div class="browser-url">
          <div class="url-dot"></div>
          <span>app.reiogn.com/workspace</span>
        </div>
      </div>
      <div class="dash-ui">
        <!-- Sidebar -->
        <div class="dash-sidebar">
          <div class="ds-header">
            <div class="ds-logo-mark"></div>
            <span class="ds-title">REIOGN</span>
          </div>
          <div class="ds-section">Workspace</div>
          <div class="ds-nav-item active">
            <div class="ds-icon" style="background:rgba(79,127,255,.2)">🧠</div>
            Deep Work
          </div>
          <div class="ds-nav-item">
            <div class="ds-icon" style="background:rgba(16,185,129,.15)">🔬</div>
            Research
          </div>
          <div class="ds-nav-item">
            <div class="ds-icon" style="background:rgba(245,158,11,.15)">⚡</div>
            Execution
          </div>
          <div class="ds-nav-item">
            <div class="ds-icon" style="background:rgba(255,138,101,.15)">🎯</div>
            Decisions
          </div>
          <div style="margin-top:auto;padding:0 12px;">
            <div style="background:rgba(79,127,255,.07);border:1px solid rgba(79,127,255,.15);border-radius:8px;padding:12px;margin-top:16px;">
              <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px;">Token Balance</div>
              <div style="font-size:22px;font-weight:800;color:var(--text)">847</div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:4px;">rolls over monthly</div>
            </div>
          </div>
        </div>

        <!-- Main -->
        <div class="dash-main">
          <div class="dash-topbar">
            <div class="dash-greeting">Good morning, <span>Arjun</span> 👋</div>
            <div class="dash-actions">
              <div class="da-btn-ghost">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search
              </div>
              <div class="da-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                New Session
              </div>
            </div>
          </div>
          <div class="dash-body">
            <div class="dash-content">
              <div class="stats-row">
                <div class="stat-card">
                  <div class="stat-label">Sessions today</div>
                  <div class="stat-value">12</div>
                  <div class="stat-change">↑ 3 from yesterday</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Focus time</div>
                  <div class="stat-value">4h 20m</div>
                  <div class="stat-change">↑ 38% this week</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Output score</div>
                  <div class="stat-value">94</div>
                  <div class="stat-change">↑ Personal best</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Tokens used</div>
                  <div class="stat-value">153</div>
                  <div class="stat-change" style="color:var(--text3)">of 1,200/mo</div>
                </div>
              </div>
              <div class="tool-grid">
                <div class="tool-chip active">
                  <div class="tc-icon">🧠</div>
                  <div class="tc-info">
                    <div class="tc-name">Deep Work Engine</div>
                    <div class="tc-status running">● Running</div>
                  </div>
                </div>
                <div class="tool-chip">
                  <div class="tc-icon">🔬</div>
                  <div class="tc-info"><div class="tc-name">Research Builder</div><div class="tc-status">Idle · 15 tokens</div></div>
                </div>
                <div class="tool-chip">
                  <div class="tc-icon">🤖</div>
                  <div class="tc-info"><div class="tc-name">Cognitive Clone</div><div class="tc-status">Idle · 50 tokens</div></div>
                </div>
                <div class="tool-chip">
                  <div class="tc-icon">⚡</div>
                  <div class="tc-info"><div class="tc-name">Exec. Optimizer</div><div class="tc-status">Idle · 15 tokens</div></div>
                </div>
                <div class="tool-chip">
                  <div class="tc-icon">🎯</div>
                  <div class="tc-info"><div class="tc-name">Decision Sim.</div><div class="tc-status">Idle · 30 tokens</div></div>
                </div>
                <div class="tool-chip">
                  <div class="tc-icon">💰</div>
                  <div class="tc-info"><div class="tc-name">Wealth Mapper</div><div class="tc-status">Idle · 40 tokens</div></div>
                </div>
              </div>
            </div>

            <!-- Right Panel -->
            <div class="dash-right-panel">
              <div class="panel-title">Recent Activity</div>
              <div class="activity-item">
                <div class="ai-dot" style="background:var(--green)"></div>
                <div>
                  <div class="ai-text">Deep Work session completed — 140 min block</div>
                  <div class="ai-time">2m ago</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="ai-dot" style="background:var(--accent)"></div>
                <div>
                  <div class="ai-text">Research Builder — 3 sources synthesized</div>
                  <div class="ai-time">41m ago</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="ai-dot" style="background:var(--amber)"></div>
                <div>
                  <div class="ai-text">Decision Sim. — Startup pivot analysed</div>
                  <div class="ai-time">3h ago</div>
                </div>
              </div>
              <div style="height:1px;background:var(--border);"></div>
              <div class="panel-title">Performance</div>
              <div class="perf-bars">
                <div class="pb">
                  <div class="pb-header"><span>Focus depth</span><span>94%</span></div>
                  <div class="pb-track"><div class="pb-fill" style="width:94%"></div></div>
                </div>
                <div class="pb">
                  <div class="pb-header"><span>Output quality</span><span>88%</span></div>
                  <div class="pb-track"><div class="pb-fill g" style="width:88%"></div></div>
                </div>
                <div class="pb">
                  <div class="pb-header"><span>Recovery</span><span>72%</span></div>
                  <div class="pb-track"><div class="pb-fill a" style="width:72%"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ TRUST ═══════════════════ -->
<section id="trust">
  <div class="container">
    <div class="trust-label">Trusted by high-performers at</div>
    <div class="trust-row">
      <span class="trust-logo">STRIPE</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">VERCEL</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">LINEAR</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">NOTION</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">FIGMA</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">GITHUB</span>
      <div class="trust-divider"></div>
      <span class="trust-logo">ANTHROPIC</span>
    </div>
    <div class="trust-stats">
      <div>
        <div class="trust-stat-v" data-count="12400">0</div>
        <div class="trust-stat-l">Active users</div>
      </div>
      <div>
        <div class="trust-stat-v" data-count="89300">0</div>
        <div class="trust-stat-l">Sessions completed</div>
      </div>
      <div>
        <div class="trust-stat-v">3.2×</div>
        <div class="trust-stat-l">Avg. output increase</div>
      </div>
      <div>
        <div class="trust-stat-v">14d</div>
        <div class="trust-stat-l">Median time to peak</div>
      </div>
      <div>
        <div class="trust-stat-v">97%</div>
        <div class="trust-stat-l">Satisfaction rate</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ PLATFORM OVERVIEW ═══════════════════ -->
<section id="overview" class="section">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">Platform</div>
      <h2>One workspace.<br><span>Every tool you need.</span></h2>
      <p>Stop context-switching between 8 different AI tools. REIOGN brings them all under one roof — purpose-built, properly routed, and optimized for how you actually work.</p>
    </div>

    <div class="overview-grid">
      <div class="overview-text reveal reveal-d1">
        <h3>A unified AI workspace built for cognitive performance.</h3>
        <p>Every tool in REIOGN is purpose-built for a specific cognitive task. Not a chatbot wrapper — a structured execution system where each tool knows its input, its model, and its output format before you even start.</p>
        <div class="overview-points">
          <div class="ov-point"><div class="ov-check">✓</div>Automatic model routing — right AI for every job</div>
          <div class="ov-point"><div class="ov-check">✓</div>Token-based billing — pay only for what you run</div>
          <div class="ov-point"><div class="ov-check">✓</div>Persistent session history with full export</div>
          <div class="ov-point"><div class="ov-check">✓</div>Auto-refund on any AI failure — zero risk</div>
          <div class="ov-point"><div class="ov-check">✓</div>Works with Claude, Gemini Pro, and Groq LLaMA</div>
        </div>
        <button class="btn-primary" style="width:fit-content" onclick="scrollTo('#tools')">
          Explore all 10 tools →
        </button>
      </div>
      <div class="overview-visual reveal reveal-d2">
        <div class="mockup-header">
          <div class="mockup-h-title">Deep Work Engine — Active Session</div>
          <div class="mockup-h-actions">
            <div class="mh-btn">Save</div>
            <div class="mh-btn blue">Running ●</div>
          </div>
        </div>
        <div class="mockup-body">
          <div class="mk-line w100"></div>
          <div class="mk-line accent"></div>
          <div class="mk-line w80"></div>
          <div class="mk-row">
            <div class="mk-block">
              <div class="mk-block-title">Focus Block</div>
              <div class="mk-block-value" style="color:var(--accent)">4h 20m</div>
              <div class="mk-block-sub">↑ Personal best</div>
            </div>
            <div class="mk-block">
              <div class="mk-block-title">Flow Score</div>
              <div class="mk-block-value">94</div>
              <div class="mk-block-sub">↑ 12pts today</div>
            </div>
            <div class="mk-block">
              <div class="mk-block-title">Tokens Used</div>
              <div class="mk-block-value">15</div>
              <div class="mk-block-sub" style="color:var(--text3)">of 1,200</div>
            </div>
          </div>
          <div class="mk-line w60"></div>
          <div class="mk-line w80"></div>
          <div class="mk-line w40"></div>
          <div style="background:rgba(79,127,255,.06);border:1px solid rgba(79,127,255,.15);border-radius:8px;padding:14px;margin-top:4px;">
            <div style="font-family:var(--mono);font-size:10px;color:var(--accent);margin-bottom:8px;letter-spacing:.06em;">GEMINI PRO — Routing Active</div>
            <div class="mk-line w100" style="background:rgba(79,127,255,.12)"></div>
            <div class="mk-line w70" style="background:rgba(79,127,255,.08);margin-top:6px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ TOOLS ═══════════════════ -->
<section id="tools" class="section" style="background:var(--bg2)">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">10 Tools</div>
      <h2>Every tool has<br><span>one job.</span></h2>
      <p>No tool tries to do everything. Each one is precision-built for a specific cognitive output, pre-routed to the best model, and designed to return results — not prompts.</p>
    </div>

    <div class="tools-grid">
      <!-- 10 tool cards -->
      <div class="tool-card reveal">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(79,127,255,.12)">🧠</div>
          <div class="tc-badge b-medium">Medium</div>
        </div>
        <div class="tc-title">Deep Work Engine</div>
        <div class="tc-desc">Maps your cognitive cycles, schedules deep focus blocks, eliminates decision fatigue. Not a to-do list — a precision session planner.</div>
        <div class="tc-footer">
          <div class="tc-model">Gemini Pro</div>
          <div class="tc-tokens">15 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d1">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(255,138,101,.1)">🤖</div>
          <div class="tc-badge b-heavy">Heavy</div>
        </div>
        <div class="tc-title">Cognitive Clone</div>
        <div class="tc-desc">Simulate your best self — decision patterns, communication style, blind spots. Used to prepare high-stakes presentations and negotiations.</div>
        <div class="tc-footer">
          <div class="tc-model">Claude AI</div>
          <div class="tc-tokens">50 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d2">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(16,185,129,.1)">🔬</div>
          <div class="tc-badge b-medium">Medium</div>
        </div>
        <div class="tc-title">Research Builder</div>
        <div class="tc-desc">Synthesizes 3+ sources per query with relevance scoring. Surfaces the contrarian signal buried in the noise. Zero padding.</div>
        <div class="tc-footer">
          <div class="tc-model">Gemini Pro</div>
          <div class="tc-tokens">15 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d1">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(245,158,11,.1)">📊</div>
          <div class="tc-badge b-light">Light</div>
        </div>
        <div class="tc-title">Skill ROI Analyzer</div>
        <div class="tc-desc">3, 12, and 36-month ROI projections for any skill investment. Prioritized rankings. Where to spend your next 100 hours.</div>
        <div class="tc-footer">
          <div class="tc-model">Groq LLaMA</div>
          <div class="tc-tokens">5 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d2">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(79,127,255,.1)">🧩</div>
          <div class="tc-badge b-medium">Medium</div>
        </div>
        <div class="tc-title">Memory Intelligence</div>
        <div class="tc-desc">Builds spaced repetition architectures around any material. You'll retain 80% of what you study — long-term.</div>
        <div class="tc-footer">
          <div class="tc-model">Gemini Pro</div>
          <div class="tc-tokens">15 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(255,90,90,.1)">⚡</div>
          <div class="tc-badge b-medium">Medium</div>
        </div>
        <div class="tc-title">Execution Optimizer</div>
        <div class="tc-desc">Breaks any goal into numbered micro-actions with real timelines. 7-day sprint frameworks. The gap between planning and doing — closed.</div>
        <div class="tc-footer">
          <div class="tc-model">Gemini Pro</div>
          <div class="tc-tokens">15 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d1">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(167,139,250,.1)">🎯</div>
          <div class="tc-badge b-heavy">Heavy</div>
        </div>
        <div class="tc-title">Opportunity Radar</div>
        <div class="tc-desc">Scans your context for high-leverage opportunities you're systematically missing. Probability-ranked. Action-oriented.</div>
        <div class="tc-footer">
          <div class="tc-model">Claude AI</div>
          <div class="tc-tokens">30 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d2">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(236,72,153,.1)">🔮</div>
          <div class="tc-badge b-heavy">Heavy</div>
        </div>
        <div class="tc-title">Decision Simulator</div>
        <div class="tc-desc">Input any major decision. Get 3–5 simulated futures with probability-weighted outcomes and second-order effects. Think 10 moves ahead.</div>
        <div class="tc-footer">
          <div class="tc-model">Claude AI</div>
          <div class="tc-tokens">30 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d1">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(245,158,11,.12)">💰</div>
          <div class="tc-badge b-heavy">Heavy</div>
        </div>
        <div class="tc-title">Wealth Mapper</div>
        <div class="tc-desc">Personal wealth architecture — income streams, leverage points, risk-adjusted path-to-goal modelling. Your financial operating system.</div>
        <div class="tc-footer">
          <div class="tc-model">Claude AI</div>
          <div class="tc-tokens">40 tokens/run</div>
        </div>
      </div>
      <div class="tool-card reveal reveal-d2">
        <div class="tc-header">
          <div class="tc-icon-wrap" style="background:rgba(16,185,129,.1)">🛡️</div>
          <div class="tc-badge b-light">Light</div>
        </div>
        <div class="tc-title">Focus Shield</div>
        <div class="tc-desc">Distraction elimination protocol. Identifies your top 3 cognitive leaks. Delivers a zero-fluff defense system in under 3 seconds.</div>
        <div class="tc-footer">
          <div class="tc-model">Groq LLaMA</div>
          <div class="tc-tokens">5 tokens/run</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ HOW IT WORKS ═══════════════════ -->
<section id="how" class="section">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">How it works</div>
      <h2>From zero to<br><span>peak output</span> in 3 steps.</h2>
      <p>No prompt engineering. No config. No learning curve. Choose a tool, describe your goal, get a structured result.</p>
    </div>
    <div class="steps-row">
      <div class="step reveal">
        <div class="step-num">01</div>
        <div class="step-h">Choose your tool</div>
        <p class="step-p">Pick from 10 purpose-built AI tools — each pre-configured with the right model, the right prompt architecture, and the right output format for your task.</p>
        <div class="step-ui">
          <div class="step-ui-row"><span class="sui-ico">🧠</span> Deep Work Engine<div class="sui-bar"><div class="sui-fill" style="width:100%"></div></div></div>
          <div class="step-ui-row"><span class="sui-ico">🔬</span> Research Builder<div class="sui-bar"><div class="sui-fill" style="width:70%;opacity:.4"></div></div></div>
          <div class="step-ui-row"><span class="sui-ico">⚡</span> Exec. Optimizer<div class="sui-bar"><div class="sui-fill" style="width:50%;opacity:.3"></div></div></div>
        </div>
      </div>
      <div class="step reveal reveal-d1">
        <div class="step-num">02</div>
        <div class="step-h">Describe your goal</div>
        <p class="step-p">Type what you're trying to achieve in plain language. REIOGN handles routing, context, and model selection. You just describe the outcome you want.</p>
        <div class="step-ui">
          <div style="background:var(--bg);border:1px solid rgba(79,127,255,.25);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--text2);line-height:1.6;">
            <span style="color:var(--text3);font-family:var(--mono);font-size:10px">Goal: </span>"I need to build a SaaS in 90 days while keeping my day job. Map the critical path."
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;color:var(--accent);">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:pulse 1.5s infinite;flex-shrink:0;"></div>
            Routing to Gemini Pro...
          </div>
        </div>
      </div>
      <div class="step reveal reveal-d2">
        <div class="step-num">03</div>
        <div class="step-h">Get structured results</div>
        <p class="step-p">Receive numbered, action-ready output. Not a wall of text — a structured plan, ranked list, or simulation you can act on immediately.</p>
        <div class="step-ui">
          <div style="font-family:var(--mono);font-size:10px;color:var(--text3)">OUTPUT — Critical Path</div>
          <div style="font-size:12px;color:var(--text2);display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;gap:6px;"><span style="color:var(--accent)">1.</span> Day 1–7: Define north-star metric</div>
            <div style="display:flex;gap:6px;"><span style="color:var(--accent)">2.</span> Day 8–14: Build MVP skeleton</div>
            <div style="display:flex;gap:6px;color:var(--text3)"><span>3.</span> Day 15–30: First paying user...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ WHY ═══════════════════ -->
<section id="why" class="section" style="background:var(--bg2)">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">Why REIOGN</div>
      <h2>One platform vs.<br><span>scattered tools.</span></h2>
      <p>The average knowledge worker uses 6+ AI tools and still feels unproductive. REIOGN replaces the chaos with one structured system.</p>
    </div>
    <div class="why-grid">
      <div class="why-col reveal">
        <div class="why-col-header">
          <span style="font-size:16px">⚠️</span>
          <span class="wch-title">The old way — scattered tools</span>
          <span class="wch-badge bad">Fragmented</span>
        </div>
        <div class="why-items">
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> 6+ tools, 6+ subscriptions, 6+ contexts</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> Manual prompt engineering every time</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> No session history or continuity</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> Wrong model for wrong task</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> Vague, unstructured outputs</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> Pay whether it works or not</div>
          <div class="why-item"><span class="wi-ico wi-cross">✕</span> No performance tracking</div>
        </div>
      </div>
      <div class="why-col featured reveal reveal-d1">
        <div class="why-col-header">
          <div class="nav-logo-mark" style="width:18px;height:18px;flex-shrink:0"></div>
          <span class="wch-title">REIOGN — unified workspace</span>
          <span class="wch-badge good">Optimized</span>
        </div>
        <div class="why-items">
          <div class="why-item"><span class="wi-ico wi-check">✓</span> 10 tools in one workspace, one subscription</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Pre-built prompts, zero engineering needed</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Full history, export, and continuity</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Auto-routing: Claude, Gemini, Groq</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Numbered, structured, action-ready outputs</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Auto-refund on any AI failure</div>
          <div class="why-item"><span class="wi-ico wi-check">✓</span> Performance analytics and trend tracking</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ FEATURES ═══════════════════ -->
<section id="features" class="section">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">Features</div>
      <h2>Built for how<br><span>you actually work.</span></h2>
      <p>Every feature in REIOGN was designed around one question: does this make the user's output better? If the answer was no, it didn't ship.</p>
    </div>

    <div class="features-stack">
      <!-- Feature 1 -->
      <div class="feature-row">
        <div class="feature-text reveal">
          <div class="feat-tag">Intelligent Routing</div>
          <div class="feat-h">The right model for every job. Automatically.</div>
          <p class="feat-p">Heavy reasoning tasks route to Claude AI. Research and synthesis tasks go to Gemini Pro. Speed-critical operations hit Groq LLaMA. You don't configure anything — the platform decides.</p>
          <div class="feat-list">
            <div class="fl-item">Claude for complex reasoning and multi-step analysis</div>
            <div class="fl-item">Gemini Pro for synthesis and research quality</div>
            <div class="fl-item">Groq LLaMA for instant-speed lightweight tasks</div>
            <div class="fl-item">Token cost optimized per route, automatically</div>
          </div>
        </div>
        <div class="feature-visual reveal reveal-d1">
          <div class="fv-top">
            <div class="fv-title">🔀 Model Router</div>
            <div class="fv-status">Active</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
              <div style="font-size:12px;color:var(--text2)">Decision Simulator</div>
              <div style="font-family:var(--mono);font-size:10px;color:#FF8A65;background:rgba(255,138,101,.08);border:1px solid rgba(255,138,101,.2);padding:3px 9px;border-radius:100px;">→ Claude AI</div>
            </div>
            <div style="background:var(--bg3);border:1px solid rgba(79,127,255,.2);border-radius:8px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
              <div style="font-size:12px;color:var(--text)">Research Builder</div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--accent2);background:rgba(79,127,255,.1);border:1px solid rgba(79,127,255,.25);padding:3px 9px;border-radius:100px;">→ Gemini Pro</div>
            </div>
            <div style="background:var(--bg3);border:1px solid rgba(16,185,129,.15);border-radius:8px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
              <div style="font-size:12px;color:var(--text2)">Focus Shield</div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--green);background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);padding:3px 9px;border-radius:100px;">→ Groq LLaMA</div>
            </div>
          </div>
          <div class="fv-metrics">
            <div class="fv-metric"><div class="fvm-v">99.8%</div><div class="fvm-l">Uptime</div></div>
            <div class="fv-metric"><div class="fvm-v">1.2s</div><div class="fvm-l">Avg. response</div></div>
            <div class="fv-metric"><div class="fvm-v">3×</div><div class="fvm-l">Token efficiency</div></div>
          </div>
        </div>
      </div>

      <!-- Feature 2 -->
      <div class="feature-row flip">
        <div class="feature-text reveal">
          <div class="feat-tag">Session Intelligence</div>
          <div class="feat-h">Your entire cognitive history. Searchable, exportable, useful.</div>
          <p class="feat-p">Every session is logged, structured, and searchable. Build on previous work. Track performance trends. Export to any format. Your work doesn't disappear when you close the tab.</p>
          <div class="feat-list">
            <div class="fl-item">Full session history with structured search</div>
            <div class="fl-item">Performance trends — focus, output quality, velocity</div>
            <div class="fl-item">Export to Markdown, PDF, Notion, or raw JSON</div>
            <div class="fl-item">Team sharing and collaborative workspaces</div>
          </div>
        </div>
        <div class="feature-visual reveal reveal-d1">
          <div class="fv-top">
            <div class="fv-title">📊 Session History</div>
            <div class="fv-status">Live</div>
          </div>
          <div class="fv-lines">
            <div class="fv-line w100"></div>
            <div class="fv-line accent"></div>
            <div class="fv-line w80"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 12px;">
              <div>
                <div style="font-size:12px;font-weight:600;color:var(--text)">Deep Work — Strategy deck</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:2px">Today · 4h 20m · Score: 94</div>
              </div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--green)">15 tokens</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 12px;">
              <div>
                <div style="font-size:12px;font-weight:600;color:var(--text)">Research — Remote leadership</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:2px">Yesterday · 3 sources · 94% relevance</div>
              </div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--green)">15 tokens</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 12px;opacity:.5">
              <div>
                <div style="font-size:12px;font-weight:600;color:var(--text)">Decision Sim — Startup pivot</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:2px">2 days ago · 5 scenarios · 78% confidence</div>
              </div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--text3)">30 tokens</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 3 -->
      <div class="feature-row">
        <div class="feature-text reveal">
          <div class="feat-tag">Token Economy</div>
          <div class="feat-h">Pay for what you use. Never for what you don't.</div>
          <p class="feat-p">Tokens are REIOGN's billing unit. Each tool has a fixed cost. They roll over monthly. They never expire. And if any AI run fails for any reason, the tokens are automatically refunded.</p>
          <div class="feat-list">
            <div class="fl-item">Light tools: 5 tokens (Focus Shield, Skill ROI)</div>
            <div class="fl-item">Medium tools: 15 tokens (Deep Work, Research)</div>
            <div class="fl-item">Heavy tools: 30–50 tokens (Claude-powered)</div>
            <div class="fl-item">100% auto-refund on any failure — zero risk</div>
          </div>
        </div>
        <div class="feature-visual reveal reveal-d1">
          <div class="fv-top">
            <div class="fv-title">🪙 Token Dashboard</div>
            <div class="fv-status">1,047 remaining</div>
          </div>
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:12px;color:var(--text2)">Monthly allocation</div>
              <div style="font-size:22px;font-weight:800;color:var(--text)">1,200</div>
            </div>
            <div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;">
              <div style="width:13%;height:100%;background:var(--accent);border-radius:3px;"></div>
            </div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--text3)">153 used · 1,047 remaining · resets in 18d</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:12px;"><div style="font-size:18px;font-weight:700;color:var(--text)">0</div><div style="font-family:var(--mono);font-size:10px;color:var(--green);margin-top:2px">Auto-refunded</div></div>
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:12px;"><div style="font-size:18px;font-weight:700;color:var(--text)">Never</div><div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:2px">Tokens expire</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ PRICING ═══════════════════ -->
<section id="pricing" class="section" style="background:var(--bg2)">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">Pricing</div>
      <h2>Start free.<br><span>Scale when ready.</span></h2>
      <p>Token-based billing. No seat fees. No hidden usage costs. Pay only for the AI runs you actually make — and get refunded if anything fails.</p>
    </div>

    <div class="billing-toggle">
      <span class="toggle-label on" id="t-mo">Monthly</span>
      <div class="toggle-switch" id="btog" onclick="toggleBill()">
        <div class="toggle-knob"></div>
      </div>
      <span class="toggle-label" id="t-yr">Annual</span>
      <span class="save-badge" id="stag" style="display:none">Save 20%</span>
    </div>

    <div class="pricing-grid">
      <!-- Starter -->
      <div class="price-card reveal">
        <div>
          <div class="plan-name">Starter</div>
          <div class="plan-price">
            <span class="plan-price-sym">$</span>
            <span class="plan-price-num pa" data-mo="0" data-yr="0">0</span>
            <span class="plan-price-period">/mo</span>
          </div>
          <div class="plan-desc">Perfect for trying REIOGN. 3-day full access, no card needed.</div>
        </div>
        <div class="plan-sep"></div>
        <div class="plan-features">
          <div class="pf-item"><div class="pf-check on">✓</div>All 10 AI tools</div>
          <div class="pf-item"><div class="pf-check on">✓</div>100 starter tokens</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Full session history</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>Token rollover</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>Priority model routing</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>API access</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>Team seats</div>
        </div>
        <button class="plan-btn ghost" onclick="scrollTo('#cta-final')">Start Free Trial →</button>
      </div>

      <!-- Dominate -->
      <div class="price-card featured reveal reveal-d1">
        <div class="featured-glow"></div>
        <div class="plan-badge">Most Popular</div>
        <div>
          <div class="plan-name">Dominate</div>
          <div class="plan-price">
            <span class="plan-price-sym">$</span>
            <span class="plan-price-num pa" data-mo="29" data-yr="23">29</span>
            <span class="plan-price-period">/mo</span>
          </div>
          <div class="plan-desc">For individuals serious about peak performance. Full toolkit, rollover tokens.</div>
        </div>
        <div class="plan-sep" style="background:rgba(79,127,255,.15)"></div>
        <div class="plan-features">
          <div class="pf-item"><div class="pf-check on">✓</div>All 10 AI tools — unlimited runs</div>
          <div class="pf-item"><div class="pf-check on">✓</div>1,200 tokens/mo with rollover</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Priority Claude + Gemini routing</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Full history + export</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Auto-refund on any failure</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>API access</div>
          <div class="pf-item dim"><div class="pf-check off">—</div>Team seats</div>
        </div>
        <button class="plan-btn primary" onclick="scrollTo('#cta-final')">Start Free, Upgrade Later →</button>
      </div>

      <!-- Reign -->
      <div class="price-card reveal reveal-d2">
        <div>
          <div class="plan-name">Reign</div>
          <div class="plan-price">
            <span class="plan-price-sym">$</span>
            <span class="plan-price-num pa" data-mo="79" data-yr="63">79</span>
            <span class="plan-price-period">/mo</span>
          </div>
          <div class="plan-desc">For teams and builders. API access, 5 seats, analytics dashboard.</div>
        </div>
        <div class="plan-sep"></div>
        <div class="plan-features">
          <div class="pf-item"><div class="pf-check on">✓</div>Everything in Dominate</div>
          <div class="pf-item"><div class="pf-check on">✓</div>5,000 tokens/mo with rollover</div>
          <div class="pf-item"><div class="pf-check on">✓</div>REST API + webhooks</div>
          <div class="pf-item"><div class="pf-check on">✓</div>5 team seats included</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Analytics dashboard</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Priority support + SLA</div>
          <div class="pf-item"><div class="pf-check on">✓</div>Custom model configs</div>
        </div>
        <button class="plan-btn ghost" onclick="scrollTo('#cta-final')">Get Reign →</button>
      </div>
    </div>

    <div class="pricing-footnote">
      Token costs: Focus Shield / Skill ROI = 5 · Deep Work / Memory / Research / Execution = 15 · Opportunity / Decision = 30 · Cognitive Clone = 50 · Wealth Mapper = 40<br>
      Tokens never expire · Roll over monthly · Auto-refund on failure · Cancel in under 8 seconds
    </div>
  </div>
</section>

<!-- ═══════════════════ TESTIMONIALS ═══════════════════ -->
<section id="testimonials" class="section">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">Testimonials</div>
      <h2>Real people.<br><span>Real results.</span></h2>
      <p>Not average users. High-performers who needed more than ChatGPT could give them.</p>
    </div>

    <div class="testi-grid">
      <div class="testi-card reveal">
        <div class="testi-stars"><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span></div>
        <p class="testi-q"><em>"Used Cognitive Clone to prep for a board presentation. It knew my blind spots before I did."</em> Closed a $2.4M round the same week. REIOGN isn't a tool — it's a cognitive advantage.</p>
        <div class="testi-author">
          <div class="ta-av" style="background:rgba(79,127,255,.1);color:var(--accent)">AM</div>
          <div><div class="ta-name">Arjun Mehta</div><div class="ta-role">Founder & CEO · Series A SaaS</div></div>
          <div class="ta-badge">↑ $2.4M</div>
        </div>
      </div>
      <div class="testi-card reveal reveal-d1">
        <div class="testi-stars"><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span></div>
        <p class="testi-q"><em>"Deep Work Engine restructured everything I was doing wrong."</em> 5 hours of scattered effort became 3 hours of pure output. My team noticed within the first week.</p>
        <div class="testi-author">
          <div class="ta-av" style="background:rgba(16,185,129,.1);color:var(--green)">PS</div>
          <div><div class="ta-name">Priya Sharma</div><div class="ta-role">Head of Growth · Fintech</div></div>
          <div class="ta-badge">↑ 3.2× Output</div>
        </div>
      </div>
      <div class="testi-card reveal reveal-d2">
        <div class="testi-stars"><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span><span class="ts">★</span></div>
        <p class="testi-q"><em>"Opportunity Radar found a channel I'd been blind to for two years."</em> First outreach call using the insights landed a 6-figure consulting contract. I've been a Reign subscriber since.</p>
        <div class="testi-author">
          <div class="ta-av" style="background:rgba(245,158,11,.1);color:var(--amber)">KR</div>
          <div><div class="ta-name">Kyle Ramos</div><div class="ta-role">Principal · B2B Strategy</div></div>
          <div class="ta-badge">↑ $120K</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ SECURITY ═══════════════════ -->
<section id="security" class="section-sm" style="background:var(--bg2)">
  <div class="container">
    <div class="section-heading reveal" style="max-width:540px">
      <div class="tag">Trust & Security</div>
      <h2>Built to be<br><span>trusted.</span></h2>
    </div>
    <div class="security-grid">
      <div class="sec-card reveal">
        <div class="sec-icon" style="background:rgba(79,127,255,.1)">🔒</div>
        <div class="sec-title">End-to-end encryption</div>
        <div class="sec-desc">All session data encrypted in transit and at rest. AES-256 + TLS 1.3. Your ideas never leave your control.</div>
      </div>
      <div class="sec-card reveal reveal-d1">
        <div class="sec-icon" style="background:rgba(16,185,129,.1)">🛡️</div>
        <div class="sec-title">Zero data training</div>
        <div class="sec-desc">We never use your session data to train any model. Your work is yours — private by default, always.</div>
      </div>
      <div class="sec-card reveal reveal-d2">
        <div class="sec-icon" style="background:rgba(245,158,11,.1)">⚡</div>
        <div class="sec-title">99.9% uptime SLA</div>
        <div class="sec-desc">Enterprise-grade infrastructure with automatic failover. Status page. Incidents resolved before you notice.</div>
      </div>
      <div class="sec-card reveal reveal-d3">
        <div class="sec-icon" style="background:rgba(255,90,90,.1)">🔄</div>
        <div class="sec-title">Auto-refund guarantee</div>
        <div class="sec-desc">If any AI run fails for any reason — model error, timeout, bad output — tokens are automatically returned. Zero risk.</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ FAQ ═══════════════════ -->
<section id="faq" class="section">
  <div class="container">
    <div class="section-heading reveal">
      <div class="tag">FAQ</div>
      <h2>Questions,<br><span>answered.</span></h2>
    </div>
    <div class="faq-list">
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">What exactly is a token, and how does billing work? <span class="faq-icon">+</span></div>
        <div class="faq-a">Tokens are REIOGN's billing unit. Each AI tool has a fixed token cost — ranging from 5 tokens for instant light tools (Focus Shield, Skill ROI) to 50 for heavy Claude-powered tools (Cognitive Clone). Tokens are deducted when a session completes successfully. If any run fails, tokens are automatically refunded. They roll over monthly and never expire.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">Which AI models does REIOGN use? <span class="faq-icon">+</span></div>
        <div class="faq-a">REIOGN uses three models, auto-routed based on task requirements: Claude AI (Anthropic) for heavy reasoning and multi-step analysis, Gemini Pro (Google) for research, synthesis, and quality-sensitive tasks, and Groq LLaMA for instant-speed lightweight operations. You never need to configure routing — it happens automatically.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">How is REIOGN different from ChatGPT or Claude directly? <span class="faq-icon">+</span></div>
        <div class="faq-a">ChatGPT and Claude are general-purpose assistants — you bring the prompts, the structure, and the context. REIOGN is a structured execution system. Every tool has a defined input format, a pre-built prompt architecture, and a structured output schema. You describe your goal in plain language, and REIOGN handles the rest. No prompt engineering. No configuration. Just structured results.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">Is there really a free trial with no credit card? <span class="faq-icon">+</span></div>
        <div class="faq-a">Yes. 3-day free trial with all 10 tools unlocked and 100 starter tokens. No credit card required. No dark patterns — we don't ask for payment info until you choose to upgrade. If you don't see clear value within 72 hours, you owe nothing and lose nothing.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">Can I cancel at any time? <span class="faq-icon">+</span></div>
        <div class="faq-a">Yes. Cancel in under 8 seconds from the account settings page. No dark patterns, no "please confirm" loops, no cancellation fees. Unused tokens are held in your account for 12 months after cancellation in case you return.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="toggleFaq(this)">Do tokens expire? <span class="faq-icon">+</span></div>
        <div class="faq-a">No. Unused tokens roll over to the following month and never expire for active accounts. Tokens are only held (not lost) for 12 months if you cancel, and are immediately available if you reactivate.</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════ FINAL CTA ═══════════════════ -->
<section id="cta-final">
  <div class="cta-grid-bg"></div>
  <div class="cta-content container">
    <div class="tag reveal">Get started</div>
    <h2 class="cta-h reveal">Start your free trial.<br><span>No card. No risk.</span></h2>
    <p class="cta-p reveal">3 days. All 10 tools. 100 starter tokens. If you don't see the value — you owe nothing.</p>
    <div class="cta-ctas reveal">
      <button class="btn-primary" style="font-size:16px;padding:15px 32px">
        Create Free Account →
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
      <button class="btn-secondary" style="font-size:16px">Talk to Sales</button>
    </div>
    <div class="cta-footnote reveal">Free trial · No credit card · Cancel in 8 seconds · Auto-refund on failure</div>
  </div>
</section>

<!-- ═══════════════════ FOOTER ═══════════════════ -->
<footer id="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="fl-mark"></div>
          <span class="fl-name">REIOGN</span>
        </div>
        <p class="footer-desc">10 purpose-built AI tools in one unified workspace. Built for people who execute.</p>
        <div class="footer-socials">
          <div class="fsoc" title="X">
            <svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor"><path d="M7.55 5.51 12.27 0h-1.13L7.04 4.78 3.82 0H0l4.96 7.22L0 13h1.13l4.33-5.04L8.82 13H12.64L7.55 5.51Z"/></svg>
          </div>
          <div class="fsoc" title="LinkedIn">
            <svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor"><path d="M2.91 1.3a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0ZM.44 4.33H2.7V13H.44V4.33Zm3.64 0H6.3v1.18h.03c.26-.5.9-1.02 1.86-1.02C10.42 4.49 11 5.87 11 7.83V13H8.75V8.28c0-.84-.02-1.93-1.18-1.93-1.18 0-1.36.92-1.36 1.87V13H4V4.33Z"/></svg>
          </div>
          <div class="fsoc" title="Discord">
            <svg width="13" height="11" viewBox="0 0 14 11" fill="currentColor"><path d="M11.86 1.03A11.5 11.5 0 0 0 9.1.25a.04.04 0 0 0-.04.02c-.13.24-.27.54-.37.79a10.6 10.6 0 0 0-3.38 0 7.77 7.77 0 0 0-.38-.79.04.04 0 0 0-.04-.02 11.5 11.5 0 0 0-2.76.78.04.04 0 0 0-.02.02C.3 3.9-.18 6.7.06 9.47c0 .02.01.03.02.04a11.57 11.57 0 0 0 3.5 1.78.04.04 0 0 0 .04-.01c.27-.37.51-.76.72-1.17a.04.04 0 0 0-.02-.06 7.6 7.6 0 0 1-1.1-.53.04.04 0 0 1 0-.07l.22-.17a.04.04 0 0 1 .04 0c2.3 1.06 4.79 1.06 7.07 0a.04.04 0 0 1 .04 0l.22.17c.02.02.02.06 0 .07-.35.21-.72.39-1.1.53a.04.04 0 0 0-.02.06c.21.41.46.8.72 1.17a.04.04 0 0 0 .04.01 11.54 11.54 0 0 0 3.51-1.78.04.04 0 0 0 .02-.04c.29-3.17-.49-5.93-2.07-8.38Z"/></svg>
          </div>
          <div class="fsoc" title="GitHub">
            <svg width="13" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          </div>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Product</div>
        <div class="footer-links">
          <a href="#tools">AI Tools</a>
          <a href="#overview">Platform</a>
          <a href="#pricing">Pricing</a>
          <a href="#">Changelog</a>
          <a href="#">Roadmap</a>
          <a href="#">Status</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Company</div>
        <div class="footer-links">
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Resources</div>
        <div class="footer-links">
          <a href="#">Documentation</a>
          <a href="#">API Reference</a>
          <a href="#">Community</a>
          <a href="#">Guides</a>
          <a href="#">Support</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Legal</div>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
          <a href="#">Security</a>
          <a href="#">GDPR</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2026 REIOGN. All rights reserved.</span>
      <div class="footer-legal">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Cookies</a>
      </div>
      <div class="footer-status">All systems operational</div>
    </div>
  </div>
</footer>

<!-- ═══════════════════ SCRIPTS ═══════════════════ -->
<script>
'use strict';

/* ─── INTRO CANVAS ─── */
(()=>{
  const cv = document.getElementById('intro-cv');
  const ctx = cv.getContext('2d');
  let W, H, pts = [], t = 0;
  const N = 120;

  function init() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
    pts = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        r: Math.random() * 1.5 + .3,
        c: Math.random() > .8 ? '79,127,255' : '232,234,240',
        p: Math.random() * Math.PI * 2,
        a: Math.random() * .3 + .08,
      });
    }
  }
  init();
  addEventListener('resize', init);

  function frame() {
    t += .005;
    ctx.fillStyle = 'rgba(5,7,9,.16)';
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(79,127,255,.022)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    // edges
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(79,127,255,${.07 * (1 - d / 140)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }

    // nodes
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.p += .02;
      const g = .5 + Math.sin(p.p) * .25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + Math.sin(p.p) * .15), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a * g})`;
      ctx.fill();
    });

    // vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H * .04, W/2, H/2, H * .72);
    vg.addColorStop(0, 'rgba(5,7,9,0)');
    vg.addColorStop(1, 'rgba(5,7,9,.7)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(frame);
  }
  frame();
})();

/* ─── BOOT SEQUENCE ─── */
window.addEventListener('load', () => {
  const logo = document.getElementById('intro-logo');
  const tag = document.getElementById('intro-tag');
  const bar = document.getElementById('intro-bar');

  setTimeout(() => { logo.style.opacity = '1'; logo.style.transform = 'translateY(0)'; }, 200);
  setTimeout(() => { tag.style.opacity = '1'; }, 600);
  setTimeout(() => { bar.style.width = '100%'; }, 400);

  setTimeout(() => {
    document.getElementById('intro').classList.add('exit');
    document.getElementById('nav').classList.add('on');
    setTimeout(() => { document.getElementById('intro').style.display = 'none'; }, 800);
  }, 2600);

  // Init observers after intro
  setTimeout(initObservers, 400);
});

/* ─── SCROLL NAV ─── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

/* ─── INTERSECTION OBSERVERS ─── */
function initObservers() {
  // Reveal on scroll
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  // Counter animation
  const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count);
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 2000, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.floor(ease * target).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cntObs.unobserve(el);
      }
    });
  }, { threshold: .5 });

  document.querySelectorAll('[data-count]').forEach(el => cntObs.observe(el));

  // Tool card mouse tracking
  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
}

/* ─── SCROLL HELPER ─── */
function scrollTo(sel) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ─── MOBILE MENU ─── */
let mmOpen = false;
function toggleMM() {
  mmOpen = !mmOpen;
  document.getElementById('mmenu').classList.toggle('on', mmOpen);
  const spans = document.querySelectorAll('#burger span');
  if (mmOpen) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
}
function closeMM() {
  mmOpen = false;
  document.getElementById('mmenu').classList.remove('on');
  document.querySelectorAll('#burger span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

/* ─── PRICING TOGGLE ─── */
let annual = false;
function toggleBill() {
  annual = !annual;
  document.getElementById('btog').classList.toggle('on', annual);
  document.getElementById('t-mo').classList.toggle('on', !annual);
  document.getElementById('t-yr').classList.toggle('on', annual);
  document.getElementById('stag').style.display = annual ? 'inline-flex' : 'none';
  document.querySelectorAll('.pa').forEach(el => {
    el.textContent = annual ? el.dataset.yr : el.dataset.mo;
  });
}

/* ─── FAQ ─── */
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ─── LIVE COUNTER ─── */
setInterval(() => {
  // subtle flicker for aliveness
}, 6000);
</script>
</body>
</html>
