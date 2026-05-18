/**
 * lib/send-email.js
 * Owns: email sending via Polsia email proxy + nurture sequence templates
 * Does NOT own: sequence scheduling logic (routes/email-sequence.js), subscriber DB state (db/email-sequence.js)
 */

const PROXY_URL = 'https://polsia.com/api/proxy/email/send';
const CONTACT_URL = 'https://polsia.com/api/proxy/email/contacts';
const FROM_LABEL = 'Unbound'; // shown in email clients via proxy from-name
const APP_URL = 'https://unbound-4300.polsia.app';

function apiKey() {
  return process.env.POLSIA_API_KEY;
}

// Register a contact with the email proxy so sends are never rate-limited.
// Call this when a subscriber is first created.
async function registerContact({ email, name }) {
  try {
    await fetch(CONTACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        email,
        name: name || undefined,
        source: 'signup',
      }),
    });
  } catch (err) {
    // Non-fatal — sequence send will still work; just log
    console.error('registerContact error:', err.message);
  }
}

// Core send wrapper. Returns { ok: true } or throws on non-2xx.
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
// Email templates
// ─────────────────────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #f9f7f4; font-family: 'DM Sans', Arial, sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #5c7a6b; padding: 28px 36px; }
  .header h1 { margin: 0; color: #fff; font-size: 20px; letter-spacing: 0.5px; }
  .body { padding: 32px 36px; color: #3d3530; font-size: 15px; line-height: 1.7; }
  .body p { margin: 0 0 16px; }
  .callout { background: #fdf0ec; border-left: 3px solid #c05c3c; padding: 16px 20px; border-radius: 4px; margin: 24px 0; font-size: 14px; }
  .cta { display: inline-block; background: #c05c3c; color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 600; margin: 16px 0; }
  .footer { padding: 20px 36px; font-size: 12px; color: #9a8a82; border-top: 1px solid #f0ebe6; }
  a { color: #c05c3c; }
`;

function wrapHtml(subject, innerHtml) {
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
    <div class="header"><h1>Unbound</h1></div>
    <div class="body">
      ${innerHtml}
    </div>
    <div class="footer">
      You're receiving this because you signed up for Unbound's free lesson.<br>
      <a href="${APP_URL}/api/unsubscribe?email={{EMAIL}}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`.replace('{{EMAIL}}', ''); // placeholder; real unsub handled separately
}

// Email 1 — Day 0: Welcome + first lesson
function buildEmail1Html(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return wrapHtml('Your first lesson is waiting', `
    <p>${greeting}</p>
    <p>You're in. Module 1 — <strong>"What Is Codependency, Really?"</strong> — is ready for you right now.</p>
    <p>Most people come to Unbound with a feeling they can't quite name: a persistent sense that their worth depends on how others are doing. That they're fine as long as no one around them is upset. That helping — even when it hurts — is just who they are.</p>
    <p>Module 1 is where we start to name that. Six lessons that walk you through what codependency actually is, where it came from, and — most importantly — how to recognize it in your own life. Not in someone else's. Yours.</p>
    <div class="callout">
      <strong>What Module 1 covers:</strong><br>
      What codependency actually is (and isn't) · The caretaker trap · Other-focus and self-abandonment · Where these patterns come from · The approval loop · Recognizing yourself in all of it
    </div>
    <p>Start wherever feels right. There's no wrong order, no deadline. This is yours to take at your own pace.</p>
    <a class="cta" href="${APP_URL}/learn">Start Module 1 →</a>
    <p style="margin-top: 24px; font-size: 14px; color: #7a6a62;">One thing worth knowing: reading about a pattern and breaking one are two different things. Module 1 is the reading. We'll talk about the breaking soon.</p>
  `);
}

function buildEmail1Text(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return `${greeting}

You're in. Module 1 — "What Is Codependency, Really?" — is ready for you now.

Six lessons that walk you through what codependency actually is, where it came from, and how to recognize it in your own life.

Start here: ${APP_URL}/learn

One thing worth knowing: reading about a pattern and breaking one are two different things. Module 1 is the reading. We'll talk about the breaking soon.`;
}

// Email 2 — Day 3: Pattern insight + soft CTA to continue
function buildEmail2Html(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return wrapHtml('Why you keep doing this (and why knowing isn\'t enough)', `
    <p>${greeting}</p>
    <p>Here's something that doesn't get said enough about codependency:</p>
    <p><strong>Most people who struggle with it already know they do it.</strong></p>
    <p>They know they over-explain themselves. They know they say yes when they mean no. They know they scan the room for who's upset and feel responsible for fixing it. They've known this for years, sometimes decades.</p>
    <p>And they still do it.</p>
    <p>That gap — between knowing a pattern and being able to stop it — is the real problem. And it has nothing to do with willpower or self-awareness. It has to do with how deeply these patterns are wired.</p>
    <div class="callout">
      <strong>The science behind the loop:</strong> Codependent behaviors activate the same dopamine reward pathways as any other habit. When you help someone and they're relieved, your brain registers that as success — and reinforces the behavior. It feels like care. It <em>is</em> care. It's also a loop that doesn't need external approval to keep running; your nervous system runs it automatically.
    </div>
    <p>This is what Module 1 is really about: building the vocabulary to describe what's happening. The amygdala response when someone seems upset. The cortisol spike when you disappoint someone. The relief you feel — the <em>reward</em> — when you smooth things over.</p>
    <p>Understanding it doesn't break it. But it's where breaking it begins.</p>
    <p>If you haven't finished Module 1 yet, this is a good week to come back to it. The last two lessons — "The Approval Loop" and "Recognizing Yourself Here" — are where a lot of people have their first real moment of clarity.</p>
    <a class="cta" href="${APP_URL}/learn">Continue Module 1 →</a>
    <p style="margin-top: 24px; font-size: 14px; color: #7a6a62;">More soon. The next email is about what actually comes after recognition.</p>
  `);
}

function buildEmail2Text(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return `${greeting}

Here's something that doesn't get said enough about codependency: most people who struggle with it already know they do it.

That gap — between knowing a pattern and being able to stop it — is the real problem. It has nothing to do with willpower or self-awareness. It has to do with how deeply these patterns are wired.

Understanding the pattern doesn't break it. But it's where breaking it begins.

If you haven't finished Module 1 yet, the last two lessons are where most people have their first real moment of clarity.

Continue here: ${APP_URL}/learn`;
}

// Email 3 — Day 7: Recognition vs. breaking + introduce paid course
function buildEmail3Html(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return wrapHtml('You\'ve seen the pattern. Here\'s how to break it.', `
    <p>${greeting}</p>
    <p>Module 1 teaches you to see yourself clearly.</p>
    <p>That's not a small thing. Most people spend years not being able to name what's happening — just feeling exhausted, resentful, never quite okay. Seeing it is the first real shift.</p>
    <p>But seeing it isn't the same as changing it.</p>
    <p>Module 2 — <strong>"Breaking the Approval Loop"</strong> — is where the actual work starts. It picks up exactly where Module 1 ends: you know you have the pattern. Now, what do you do when it's happening in real time?</p>
    <div class="callout">
      <strong>What Module 2 covers:</strong><br>
      What the approval loop actually is (and the control dimension most people miss) · Your personal triggers · The emotional payoff keeping the loop alive · How to catch yourself mid-loop — before you've already acted · Sitting with discomfort instead of reacting to it · Building genuine internal validation
    </div>
    <p>One of the things I hear most from people who've gone through both modules:</p>
    <p><em>"I always knew I was a people-pleaser. I just thought that's who I was. Module 1 showed me it was a pattern. Module 2 showed me I could interrupt it. The first time I didn't apologize for something that wasn't my fault — and actually stayed with that feeling instead of backpedaling — something shifted. I felt like a different person."</em></p>
    <p>That kind of shift doesn't happen from reading about it. It happens from working through the specific exercises, the trigger mapping, the discomfort tolerance practice. That's what the full course is built around.</p>
    <p>The Full Course includes both modules — all 12 lessons — plus the complete worksheet toolkit: 6 companion worksheets and the Week 1 Pattern Break bonus. Everything you need to move from recognizing the pattern to actually interrupting it.</p>
    <a class="cta" href="${APP_URL}/pricing">See what's included →</a>
    <p style="margin-top: 24px; font-size: 14px; color: #7a6a62;">No pressure either way. If Module 1 was useful and you're ready to go deeper, the course is there. If you need more time, that's fine too — Module 1 isn't going anywhere.</p>
  `);
}

function buildEmail3Text(name) {
  const first = name ? name.split(' ')[0] : null;
  const greeting = first ? `Hi ${first},` : 'Hi,';
  return `${greeting}

Module 1 teaches you to see yourself clearly. That's not a small thing.

But seeing it isn't the same as changing it.

Module 2 — "Breaking the Approval Loop" — is where the actual work starts. It picks up exactly where Module 1 ends: you know you have the pattern. Now, what do you do when it's happening in real time?

The Full Course includes both modules — all 12 lessons — plus the complete worksheet toolkit. Everything you need to move from recognizing the pattern to actually interrupting it.

See what's included: ${APP_URL}/pricing

No pressure either way. If Module 1 was useful and you're ready to go deeper, the course is there.`;
}

// ─────────────────────────────────────────────────────────────────
// Exported senders
// ─────────────────────────────────────────────────────────────────

async function sendEmail1(subscriber) {
  return sendEmail({
    to: subscriber.email,
    subject: 'Your first lesson is waiting',
    body: buildEmail1Text(subscriber.name),
    html: buildEmail1Html(subscriber.name),
  });
}

async function sendEmail2(subscriber) {
  return sendEmail({
    to: subscriber.email,
    subject: "Why you keep doing this (and why knowing isn't enough)",
    body: buildEmail2Text(subscriber.name),
    html: buildEmail2Html(subscriber.name),
  });
}

async function sendEmail3(subscriber) {
  return sendEmail({
    to: subscriber.email,
    subject: "You've seen the pattern. Here's how to break it.",
    body: buildEmail3Text(subscriber.name),
    html: buildEmail3Html(subscriber.name),
  });
}

module.exports = { registerContact, sendEmail1, sendEmail2, sendEmail3 };
