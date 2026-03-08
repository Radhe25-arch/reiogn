import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.EMAIL_FROM ?? 'noreply@reiogn.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reiogn.com'

// ── Shared email wrapper ────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>REIOGN</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',Arial,sans-serif;background:#040508;color:#eef0ff;}
  .shell{max-width:560px;margin:0 auto;background:#040508;padding:0;}
  .header{background:linear-gradient(135deg,#07080f 0%,#0c0e1a 50%,#07080f 100%);border-bottom:1px solid rgba(184,255,0,0.15);padding:28px 36px;display:flex;align-items:center;gap:12px;}
  .logo-mark{width:38px;height:38px;border-radius:9px;background:#b8ff00;display:inline-flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#07080f;vertical-align:middle;}
  .logo-name{font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#eef0ff;vertical-align:middle;margin-left:8px;}
  .body{padding:36px 36px 28px;background:#07080f;}
  .footer{background:#040508;border-top:1px solid rgba(255,255,255,0.06);padding:20px 36px;text-align:center;}
  .footer p{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(238,240,255,0.28);}
  a{color:#b8ff00;text-decoration:none;}
</style>
</head>
<body>
<div class="shell">
<div class="header">
  <table><tr>
    <td><div class="logo-mark">RE</div></td>
    <td><span class="logo-name">REIOGN</span></td>
  </tr></table>
</div>
<div class="body">${content}</div>
<div class="footer">
  <p>© 2025 REIOGN. All rights reserved. · <a href="${APP_URL}" style="color:rgba(184,255,0,0.5);">reiogn.com</a></p>
  <p style="margin-top:6px;">You received this because you have an account at REIOGN.</p>
</div>
</div>
</body>
</html>`
}

// ── Welcome email ────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const html = emailWrapper(`
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
  <p style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:rgba(184,255,0,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">// WELCOME ABOARD</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:32px;font-weight:800;letter-spacing:-1.5px;color:#eef0ff;line-height:1.1;margin-bottom:8px;">
    Welcome to <span style="color:#b8ff00;">REIOGN</span>,<br/>${name}.
  </h1>
  <p style="font-size:15px;color:rgba(238,240,255,0.55);line-height:1.7;margin-bottom:28px;font-weight:300;">
    Your elite AI intelligence platform is active. You have <strong style="color:#b8ff00;">500 free trial tokens</strong> loaded and ready to deploy.
  </p>

  <table width="100%" style="background:rgba(184,255,0,0.06);border:1px solid rgba(184,255,0,0.18);border-radius:10px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
    <tr><td style="padding:20px 24px;">
      <p style="font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(184,255,0,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">YOUR TOKEN BALANCE</p>
      <p style="font-family:'Syne',sans-serif;font-size:42px;font-weight:800;letter-spacing:-2px;color:#b8ff00;margin-bottom:4px;">500</p>
      <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(238,240,255,0.28);">TRIAL TOKENS · ACTIVE NOW</p>
      <table width="100%" style="margin-top:14px;" cellpadding="0" cellspacing="0">
        <tr>
          <td width="80%" style="background:rgba(184,255,0,0.15);height:3px;border-radius:2px;"></td>
          <td width="20%" style="background:rgba(255,255,255,0.06);height:3px;border-radius:2px;"></td>
        </tr>
      </table>
    </td></tr>
  </table>

  <p style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#eef0ff;margin-bottom:10px;">Start with these tools:</p>
  <table width="100%" style="margin-bottom:28px;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background:#0c0e1a;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 14px;width:48%;" valign="top">
        <p style="font-size:18px;margin-bottom:6px;">🧠</p>
        <p style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#eef0ff;margin-bottom:3px;">Deep Work Engine</p>
        <p style="font-size:11.5px;color:rgba(238,240,255,0.4);">Optimize your cognitive schedule</p>
      </td>
      <td width="4%"></td>
      <td style="background:#0c0e1a;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 14px;width:48%;" valign="top">
        <p style="font-size:18px;margin-bottom:6px;">🎲</p>
        <p style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#eef0ff;margin-bottom:3px;">Decision Simulator</p>
        <p style="font-size:11.5px;color:rgba(238,240,255,0.4);">Run multi-scenario risk models</p>
      </td>
    </tr>
  </table>

  <table cellpadding="0" cellspacing="0"><tr><td>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#b8ff00;color:#07080f;padding:14px 28px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;text-decoration:none;">
      Open Dashboard →
    </a>
  </td></tr></table>

  <p style="font-size:12px;color:rgba(238,240,255,0.25);margin-top:24px;font-family:'JetBrains Mono',monospace;">
    Trial active · 500 tokens · 10 AI tools unlocked
  </p>
</td></tr>
</table>
`)

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `⬡ Welcome to REIOGN, ${name} — Your AI is Ready`,
    html,
  })
}

// ── Payment success + receipt email ────────────────────────────────────
export async function sendPaymentSuccessEmail(
  to: string,
  name: string,
  plan: string,
  amount: number,
  currency: string,
  invoiceId: string,
  tokens: number
) {
  const amountFormatted = currency === 'INR'
    ? `₹${(amount / 100).toLocaleString('en-IN')}`
    : `${currency} ${(amount / 100).toFixed(2)}`

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const planColors: Record<string, string> = {
    STARTER: '#00f0c8',
    PRO:     '#b8ff00',
    ELITE:   '#ffb830',
  }
  const planColor = planColors[plan.toUpperCase()] ?? '#b8ff00'

  const html = emailWrapper(`
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
  <table width="100%" style="margin-bottom:6px;" cellpadding="0" cellspacing="0">
    <tr>
      <td><p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(0,240,200,0.6);letter-spacing:2px;text-transform:uppercase;">// PAYMENT CONFIRMED</p></td>
      <td align="right"><p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(238,240,255,0.28);">${dateStr}</p></td>
    </tr>
  </table>

  <h1 style="font-family:'Syne',sans-serif;font-size:30px;font-weight:800;letter-spacing:-1.5px;color:#eef0ff;margin-bottom:6px;">
    Payment <span style="color:#00f0c8;">Confirmed</span> ✓
  </h1>
  <p style="font-size:14px;color:rgba(238,240,255,0.55);margin-bottom:28px;font-weight:300;">
    Hi ${name}, your <strong style="color:${planColor};">${plan}</strong> plan is now live.
  </p>

  <!-- Receipt Card -->
  <table width="100%" style="background:#0c0e1a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:24px;" cellpadding="0" cellspacing="0">
    <tr><td style="background:rgba(0,240,200,0.06);border-bottom:1px solid rgba(0,240,200,0.12);padding:14px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(238,240,255,0.4);letter-spacing:1.5px;text-transform:uppercase;">RECEIPT</p></td>
        <td align="right"><p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(238,240,255,0.28);">#${invoiceId.slice(-8).toUpperCase()}</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="font-size:13px;color:rgba(238,240,255,0.4);">Plan</p></td>
            <td align="right"><p style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:${planColor};">${plan}</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="font-size:13px;color:rgba(238,240,255,0.4);">Tokens granted</p></td>
            <td align="right"><p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#b8ff00;">${tokens.toLocaleString()} tkn</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="font-size:13px;color:rgba(238,240,255,0.4);">Date</p></td>
            <td align="right"><p style="font-size:13px;color:#eef0ff;">${dateStr}</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#eef0ff;">Total Charged</p></td>
            <td align="right"><p style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-1px;color:#00f0c8;">${amountFormatted}</p></td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>
  </table>

  <p style="font-size:12.5px;color:rgba(238,240,255,0.4);margin-bottom:20px;">
    Your full receipt is available in your dashboard. You can view and download it anytime from <strong style="color:rgba(238,240,255,0.6);">Settings → Billing</strong>.
  </p>

  <table cellpadding="0" cellspacing="0"><tr>
    <td>
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#b8ff00;color:#07080f;padding:13px 26px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:700;font-size:13.5px;text-decoration:none;margin-right:10px;">
        Go to Dashboard →
      </a>
    </td>
    <td>
      <a href="${APP_URL}/dashboard?tab=billing" style="display:inline-block;background:transparent;color:rgba(238,240,255,0.6);padding:12px 24px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:600;font-size:13px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);">
        View Receipt
      </a>
    </td>
  </tr></table>
</td></tr>
</table>
`)

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `✓ Payment confirmed — REIOGN ${plan} Plan · ${amountFormatted}`,
    html,
  })
}

// ── Referral bonus email ────────────────────────────────────────────────
export async function sendReferralBonusEmail(to: string, name: string, tokens: number, referredName: string) {
  const html = emailWrapper(`
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
  <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(0,240,200,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">// REFERRAL BONUS CREDITED</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:30px;font-weight:800;letter-spacing:-1.5px;color:#eef0ff;margin-bottom:10px;">
    You earned <span style="color:#00f0c8;">+${tokens} tokens</span> ⟡
  </h1>
  <p style="font-size:14px;color:rgba(238,240,255,0.55);line-height:1.7;margin-bottom:24px;font-weight:300;">
    Hi ${name}, <strong style="color:#eef0ff;">${referredName}</strong> just joined REIOGN using your referral code. Tokens have been instantly credited to your account.
  </p>

  <table width="100%" style="background:rgba(0,240,200,0.06);border:1px solid rgba(0,240,200,0.18);border-radius:10px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
    <tr><td style="padding:20px 24px;">
      <p style="font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(0,240,200,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">TOKENS CREDITED</p>
      <p style="font-family:'Syne',sans-serif;font-size:46px;font-weight:800;letter-spacing:-2px;color:#00f0c8;margin-bottom:4px;">+${tokens}</p>
      <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(238,240,255,0.28);">INSTANT · NO EXPIRY · NO CAP</p>
    </td></tr>
  </table>

  <p style="font-size:13px;color:rgba(238,240,255,0.4);margin-bottom:20px;font-family:'JetBrains Mono',monospace;">
    Share your code with more friends to earn unlimited tokens.
  </p>

  <table cellpadding="0" cellspacing="0"><tr><td>
    <a href="${APP_URL}/dashboard?tab=referral" style="display:inline-block;background:#b8ff00;color:#07080f;padding:13px 26px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:700;font-size:13.5px;text-decoration:none;">
      View Your Referral Code →
    </a>
  </td></tr></table>
</td></tr>
</table>
`)

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `⟡ You earned +${tokens} tokens — ${referredName} joined via your referral!`,
    html,
  })
}

// ── Email verification ───────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`

  const html = emailWrapper(`
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
  <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(184,255,0,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">// VERIFY YOUR EMAIL</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-1.5px;color:#eef0ff;margin-bottom:10px;">
    Confirm your <span style="color:#b8ff00;">email address</span>
  </h1>
  <p style="font-size:14px;color:rgba(238,240,255,0.55);line-height:1.7;margin-bottom:28px;font-weight:300;">
    Hi ${name}, click below to verify your email and unlock full access to REIOGN.
  </p>

  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td>
    <a href="${verifyUrl}" style="display:inline-block;background:#b8ff00;color:#07080f;padding:14px 30px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;text-decoration:none;">
      Verify Email →
    </a>
  </td></tr></table>

  <p style="font-size:12px;color:rgba(238,240,255,0.3);font-family:'JetBrains Mono',monospace;">
    Link expires in 24 hours. If you didn't create this account, ignore this email.
  </p>
</td></tr>
</table>
`)

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `⬡ Verify your REIOGN email address`,
    html,
  })
}

// ── Password reset email ────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  const html = emailWrapper(`
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
  <p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,79,114,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">// PASSWORD RESET</p>
  <h1 style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-1.5px;color:#eef0ff;margin-bottom:10px;">
    Reset your <span style="color:#ff4f72;">password</span>
  </h1>
  <p style="font-size:14px;color:rgba(238,240,255,0.55);line-height:1.7;margin-bottom:28px;font-weight:300;">
    Hi ${name}, we received a request to reset your REIOGN password. Click below to set a new one.
  </p>

  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td>
    <a href="${resetUrl}" style="display:inline-block;background:#ff4f72;color:#fff;padding:14px 30px;border-radius:7px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;text-decoration:none;">
      Reset Password →
    </a>
  </td></tr></table>

  <p style="font-size:12px;color:rgba(238,240,255,0.3);font-family:'JetBrains Mono',monospace;">
    Link expires in 1 hour. If you didn't request this, your account is safe — ignore this email.
  </p>
</td></tr>
</table>
`)

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `⬡ Reset your REIOGN password`,
    html,
  })
}
