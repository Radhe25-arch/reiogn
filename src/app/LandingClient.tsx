// ─── FIXED INTRO CANVAS SECTION ───
// Replace the canvas block in your LandingClient.tsx with this.
// The error was: 'cv' is possibly 'null' at line 372

useEffect(() => {
  const cv = document.getElementById('intro-cv') as HTMLCanvasElement | null;
  if (!cv) return; // ✅ NULL CHECK — fixes the TypeScript error

  const ctx = cv.getContext('2d');
  if (!ctx) return; // ✅ also guard ctx

  let W = 0, H = 0, pts: Pt[] = [];
  const N = 100;

  function init() {
    W = cv!.width = window.innerWidth;
    H = cv!.height = window.innerHeight;
    pts = [];
    for (let i = 0; i < N; i++)
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        r: Math.random() * 1.5 + .3,
        p: Math.random() * Math.PI * 2,
        a: Math.random() * .3 + .08
      });
  }

  init();
  window.addEventListener("resize", init);

  let raf: number;
  function frame() {
    // ... your existing frame logic here (unchanged)
    raf = requestAnimationFrame(frame);
  }
  frame();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", init);
  };
}, []);
