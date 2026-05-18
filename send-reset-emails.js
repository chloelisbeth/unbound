/**
 * lib/send-reset-emails.js
 * Owns: drip email templates + senders for $12 Reset guide buyers (3-email upsell sequence)
 * Does NOT own: sequence scheduling (routes/email-sequence.js), buyer DB state (db/reset-sequence.js)
 */

const PROXY_URL = 'https://polsia.com/api/proxy/email/send';
const APP_URL = 'https://unbound-4300.polsia.app';

function apiKey() {
  return process.env.POLSIA_API_KEY;
}

// Core send wrapper — throws on non-2xx
async function sendEmail({ to, subject, body, html }) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ to, subject, body, html }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Email proxy ${res.status}: ${text}`);
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Shared email chrome
// ─────────────────────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #f9f7f4; font-family: 'DM Sans', Arial, sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #3D5A47; padding: 28px 36px; }
  .header h1 { margin: 0; color: #fff; font-size: 20px; letter-spacing: 0.5px; }
  .header-sub { margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 13px; }
  .body { padding: 32px 36px; color: #3d3530; font-size: 15px; line-height: 1.7; }
  .body p { margin: 0 0 16px; }
  .callout { background: #E8F0EA; border-left: 3px solid #3D5A47; padding: 16px 20px; border-radius: 4px; margin: 24px 0; font-size: 14px; color: #3d3530; line-height: 1.6; }
  .cta { display: inline-block; background: #C4856A; color: #fff !important; text-decoration: none; padding: 13px 32px; border-radius: 100px; font-size: 15px; font-weight: 600; margin: 8px 0 16px; }
  .cta-green { display: inline-block; background: #3D5A47; color: #fff !important; text-decoration: none; padding: 13px 32px; border-radius: 100px; font-size: 15px; font-weight: 600; margin: 8px 0 16px; }
  .footer { padding: 20px 36px; font-size: 12px; color: #9a8a82; border-top: 1px solid #f0ebe6; }
  a { color: #C4856A; }
`;

function wrapHtml(subject, headerSub, innerHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Unbound</h1>
      <p class="header-sub">${headerSub}</p>
    </div>
    <div class="body">
      ${innerHtml}
    </div>
    <div class="footer">
      You're receiving this because you purchased the 5-Minute Reset from Unbound.<br>
      <a href="${APP_URL}/reset">unbound-4300.polsia.app/reset</a>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────
// Email 1 — Immediate: How to get the most from the guide
// ─────────────────────────────────────────────────────────────────

function buildResetEmail1Html() {
  return wrapHtml(
    'How to use your 5-Minute Reset',
    'A few things worth knowing before you open it.',
    `
    <p>Your guide is downloaded and ready. Before you set it aside, here's the thing most people miss:</p>

    <p><strong>The Reset works best when you use it before you need it.</strong></p>

    <p>That sounds counterintuitive, but it's the difference between using it and forgetting you have it. Read through the protocol once today — not in a moment of stress, just for familiarity. Then save the phone screenshot cards to your camera roll. That's it. Five minutes of prep now means you'll actually use it in the moment.</p>

    <div class="callout">
      <strong>Quick-start guide:</strong><br>
      1. Read the 5-Step Protocol (pages 4–5) once for familiarity<br>
      2. Find your pattern type in the Pattern-Specific Resets (pages 6–9)<br>
      3. Save the Phone Screenshot Cards to your camera roll<br>
      4. The next time you feel the loop starting — open it
    </div>

    <p>One more thing: the Reset is built to interrupt a pattern in the moment. Understanding <em>why</em> that pattern exists in the first place takes a bit more. If you want that context, Module 1 of Unbound's core course is free — six lessons, no account, no payment needed.</p>

    <p>It covers what codependency actually is, where these loops come from, and why knowing about a pattern doesn't automatically make you stop doing it. It's a useful companion to what you just downloaded.</p>

    <a class="cta" href="${APP_URL}/learn">Read Module 1 free →</a>

    <p style="margin-top: 24px; font-size: 14px; color: #7a6a62;">Questions about the guide? Reply to this email.</p>
  `
  );
}

function buildResetEmail1Text() {
  return `Your guide is ready. Before you set it aside, here's the one thing most people miss:

The Reset works best when you use it before you need it.

Read through the 5-Step Protocol once today — not in a moment of stress, just for familiarity. Then save the phone screenshot cards to your camera roll. That's it. Five minutes of prep now means you'll actually reach for it when you need it.

Quick-start:
1. Read the 5-Step Protocol (pages 4-5) once
2. Find your pattern type in the Pattern-Specific Resets (pages 6-9)
3. Save the Phone Screenshot Cards to your camera roll

The Reset interrupts a pattern in the moment. Understanding why that pattern exists takes a bit more — and Module 1 of Unbound's course covers that. Free, no account needed.

Start Module 1: ${APP_URL}/learn`;
}

// ─────────────────────────────────────────────────────────────────
// Email 2 — Day 3: The pattern behind the pattern
// ─────────────────────────────────────────────────────────────────

function buildResetEmail2Html() {
  return wrapHtml(
    'The pattern behind the pattern',
    'Why the loop keeps running even when you know it\'s there.',
    `
    <p>You downloaded the Reset because something in the description rang true. Maybe it was "before the text" or "before the apology that isn't yours." Maybe it was just the title.</p>

    <p>That recognition — that quick sense of "yes, that's me" — is important. But there's something worth understanding about why that recognition doesn't automatically make the pattern stop.</p>

    <p><strong>Codependent loops run on dopamine, not decisions.</strong></p>

    <p>When you help someone who's upset and they calm down, your brain registers that as success. It releases dopamine. It reinforces the behavior. The loop becomes automatic — not because you chose it, but because your nervous system learned that it works.</p>

    <div class="callout">
      <strong>The neuroscience, briefly:</strong> The same reward pathways that make habits sticky are what keep codependent patterns in place. Your amygdala fires when someone seems upset. Your cortisol spikes when you disappoint someone. The relief you feel when you smooth things over — that's dopamine. The loop doesn't need external pressure to keep running. Your nervous system runs it on its own.
    </div>

    <p>The Reset gives you a five-minute interrupt. That's real and it's useful. But the deeper work — understanding your specific triggers, mapping the emotional payoff, building tolerance for the discomfort of <em>not</em> responding — that's what actually changes the pattern over time.</p>

    <p>That's what Unbound's full course is built around. Module 1 is free if you want to start there. Module 2 is where the interruption work begins.</p>

    <a class="cta" href="${APP_URL}/learn">Explore the free module →</a>

    <p style="margin-top: 24px; font-size: 14px; color: #7a6a62;">More on this Friday — specifically what changes after you can consistently interrupt the loop.</p>
  `
  );
}

function buildResetEmail2Text() {
  return `You downloaded the Reset because something rang true. That recognition is important — but it doesn't automatically make the pattern stop.

Here's why: codependent loops run on dopamine, not decisions.

When you help someone who's upset and they calm down, your brain registers that as success. It releases dopamine. The loop becomes automatic — not because you chose it, but because your nervous system learned it works.

The amygdala fires when someone seems upset. Cortisol spikes when you disappoint someone. The relief you feel when you smooth it over — that's dopamine. Your nervous system runs this loop on its own.

The Reset gives you a five-minute interrupt. But the deeper work — mapping your triggers, understanding the emotional payoff, building tolerance for not responding — is what changes the pattern over time.

That's what Unbound's full course covers. Module 1 is free.

Start here: ${APP_URL}/learn

More on this Friday.`;
}

// ─────────────────────────────────────────────────────────────────
// Email 3 — Day 7: Ready for the full program?
// ─────────────────────────────────────────────────────────────────

function buildResetEmail3Html() {
  return wrapHtml(
    'Ready to go deeper?',
    'From interrupting the loop to actually breaking it.',
    `
    <p>A week ago you downloaded a tool for interrupting codependent patterns in the moment. This email is about what comes next — if you want it.</p>

    <p>The Reset is a repair tool. It catches you mid-loop and gives you five minutes to step back. That's genuinely useful. But repair is different from change.</p>

    <p><strong>Change happens when you understand the loop well enough that it starts to lose its grip before it even starts.</strong></p>

    <p>That's what Unbound's full course is built for. Two modules, 12 lessons:</p>

    <div class="callout">
      <strong>Module 1 — What Is Codependency, Really?</strong><br>
      The caretaker trap. Other-focus and self-abandonment. Where these patterns come from. The approval loop. Free — you can start today.<br><br>
      <strong>Module 2 — Breaking the Approval Loop</strong><br>
      Your personal triggers. The emotional payoff keeping the loop alive. How to catch yourself mid-loop before you've already acted. Sitting with discomfort instead of reacting to it. Building internal validation that doesn't depend on other people's states.
    </div>

    <p>One thing people say after completing both modules: it's not that the urge disappears. It's that there's a beat — a moment of recognition — before the automatic response kicks in. And in that beat, there's a choice.</p>

    <p>That beat is what the course builds. The Reset helps you use it when you're in the thick of it. The course teaches you to find it faster.</p>

    <p>The full course is $97 right now (launch pricing, ends May 29). No subscription, no account. Yours permanently.</p>

    <a class="cta-green" href="${APP_URL}/pricing">See what's included →</a>

    <p style="margin-top: 8px; font-size: 14px; color: #7a6a62;">If you're not ready, that's fine — Module 1 is still free whenever you want it. But if the Reset has been useful and you want to go further, this is the next step.</p>
  `
  );
}

function buildResetEmail3Text() {
  return `A week ago you downloaded a tool for interrupting codependent patterns in the moment. This email is about what comes next.

The Reset is a repair tool. Repair is different from change.

Change happens when you understand the loop well enough that it starts to lose its grip before it even starts.

That's what Unbound's full course is built for. Two modules, 12 lessons:

Module 1 — What Is Codependency, Really? (Free)
The caretaker trap. Other-focus and self-abandonment. Where these patterns come from. The approval loop.

Module 2 — Breaking the Approval Loop
Your personal triggers. The emotional payoff keeping the loop alive. How to catch yourself before you've already acted. Building internal validation that doesn't depend on other people.

People say after completing both: it's not that the urge disappears. It's that there's a beat before the automatic response — and in that beat, there's a choice.

The course builds that beat.

Full course: $97 right now (launch pricing, ends May 29). No subscription, no account.

See what's included: ${APP_URL}/pricing

If you're not ready, Module 1 is still free whenever you want it.`;
}

// ─────────────────────────────────────────────────────────────────
// Exported senders
// ─────────────────────────────────────────────────────────────────

async function sendResetEmail1(buyer) {
  return sendEmail({
    to: buyer.email,
    subject: 'How to use your 5-Minute Reset',
    body: buildResetEmail1Text(),
    html: buildResetEmail1Html(),
  });
}

async function sendResetEmail2(buyer) {
  return sendEmail({
    to: buyer.email,
    subject: 'The pattern behind the pattern',
    body: buildResetEmail2Text(),
    html: buildResetEmail2Html(),
  });
}

async function sendResetEmail3(buyer) {
  return sendEmail({
    to: buyer.email,
    subject: 'Ready to go deeper?',
    body: buildResetEmail3Text(),
    html: buildResetEmail3Html(),
  });
}

module.exports = { sendResetEmail1, sendResetEmail2, sendResetEmail3 };
