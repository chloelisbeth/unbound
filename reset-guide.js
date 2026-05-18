/**
 * lib/reset-guide.js
 * Owns: PDF generation for the 5-Minute Reset guide (on-the-fly, streamed)
 * Does NOT own: access control (routes/reset.js), email delivery
 *
 * Generates a 9-page PDF using pdfkit. No disk writes — streamed directly
 * to the HTTP response. Render's filesystem is ephemeral.
 */

const PDFDocument = require('pdfkit');

const COLORS = {
  deepSage: '#3D5A47',
  softTerracotta: '#C4856A',
  warmBlush: '#F5EDE8',
  paleGreen: '#EBF0EC',
  mutedText: '#6B7C73',
  darkText: '#1A2B21',
  border: '#D8E3DC',
  white: '#FFFFFF',
  lightSage: '#7A9E87',
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout helpers
// ─────────────────────────────────────────────────────────────────────────────

function coverPage(doc) {
  const W = doc.page.width;
  const H = doc.page.height;

  // Full-bleed sage background
  doc.rect(0, 0, W, H).fill(COLORS.deepSage);

  // Terracotta accent strip at top
  doc.rect(0, 0, W, 6).fill(COLORS.softTerracotta);

  // Wordmark
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('UNBOUND', 56, 48, { characterSpacing: 4 });

  // Category label
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica')
    .fontSize(9)
    .text('IN-THE-MOMENT REGULATION GUIDE', 56, 65, { characterSpacing: 1.5 });

  // Main title
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(52)
    .text('The', 56, 160)
    .fontSize(64)
    .text('5-Minute', 56, 210)
    .text('Reset.', 56, 278);

  // Subtitle
  doc
    .fillColor('rgba(255,255,255,0.7)')
    .font('Helvetica')
    .fontSize(14)
    .fillColor([200, 220, 210])
    .text('Break the loop before it breaks you.', 56, 360, { width: 320 });

  // Divider line
  doc
    .moveTo(56, 400)
    .lineTo(200, 400)
    .strokeColor(COLORS.softTerracotta)
    .lineWidth(1.5)
    .stroke();

  // Tagline block
  doc
    .fillColor([200, 220, 210])
    .font('Helvetica')
    .fontSize(11)
    .text('For codependent people who react before they think,', 56, 416, { width: 360, lineGap: 4 })
    .text('who send texts they regret, who spiral.', 56, 432, { width: 360 });

  // Bottom info strip
  doc.rect(0, H - 60, W, 60).fill('rgba(0,0,0,0.2)');
  doc
    .fillColor([180, 200, 190])
    .font('Helvetica')
    .fontSize(9)
    .text('9 PAGES  ·  KEEP ON YOUR PHONE  ·  USE IN THE MOMENT', 56, H - 38, {
      characterSpacing: 1,
    });
}

function pageHeader(doc, pageTitle, pageNum) {
  const W = doc.page.width;

  // Slim sage strip
  doc.rect(0, 0, W, 52).fill(COLORS.deepSage);

  // Page title
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(pageTitle.toUpperCase(), 40, 20, { characterSpacing: 1.5, width: W - 120 });

  // Page number badge
  doc
    .circle(W - 56, 26, 14)
    .fillColor(COLORS.softTerracotta)
    .fill();
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(String(pageNum), W - 62, 21, { width: 28, align: 'center' });

  doc.y = 68;
}

function pageFooter(doc) {
  const W = doc.page.width;
  const H = doc.page.height;
  doc
    .moveTo(40, H - 32)
    .lineTo(W - 40, H - 32)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(7.5)
    .text('Unbound · 5-Minute Reset Guide · unbound-4300.polsia.app', 40, H - 22, {
      characterSpacing: 0.3,
    });
}

function sectionLabel(doc, text) {
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(text.toUpperCase(), { characterSpacing: 1.5 })
    .moveDown(0.3);
}

function heading(doc, text, size = 18) {
  doc
    .fillColor(COLORS.deepSage)
    .font('Helvetica-Bold')
    .fontSize(size)
    .text(text)
    .moveDown(0.5);
}

function body(doc, text, opts = {}) {
  doc
    .fillColor(COLORS.darkText)
    .font('Helvetica')
    .fontSize(10.5)
    .text(text, { lineGap: 4, ...opts })
    .moveDown(0.6);
}

function muted(doc, text, opts = {}) {
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(10)
    .text(text, { lineGap: 3, ...opts })
    .moveDown(0.5);
}

function callout(doc, text) {
  const W = doc.page.width;
  const x = 40;
  const boxW = W - 80;
  const y = doc.y;
  const textH = doc.heightOfString(text, { width: boxW - 40, fontSize: 10.5 });
  const boxH = textH + 28;

  doc.rect(x, y, boxW, boxH).fill(COLORS.warmBlush);
  doc.rect(x, y, 3, boxH).fill(COLORS.softTerracotta);

  doc
    .fillColor(COLORS.darkText)
    .font('Helvetica')
    .fontSize(10.5)
    .text(text, x + 16, y + 14, { width: boxW - 36, lineGap: 4 });

  doc.y = y + boxH + 16;
}

function sageBox(doc, text) {
  const W = doc.page.width;
  const x = 40;
  const boxW = W - 80;
  const y = doc.y;
  const textH = doc.heightOfString(text, { width: boxW - 32, fontSize: 10.5 });
  const boxH = textH + 28;

  doc.rect(x, y, boxW, boxH).fill(COLORS.paleGreen);
  doc.rect(x, y, boxW, boxH).stroke().strokeColor(COLORS.border).lineWidth(0.5).stroke();

  doc
    .fillColor(COLORS.deepSage)
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(text, x + 16, y + 14, { width: boxW - 32, lineGap: 4 });

  doc.y = y + boxH + 16;
}

function stepBox(doc, stepNum, stepTitle, stepText, highlight = false) {
  const W = doc.page.width;
  const x = 40;
  const boxW = W - 80;
  const y = doc.y;
  const textH = doc.heightOfString(stepText, { width: boxW - 70, fontSize: 10 });
  const boxH = Math.max(60, textH + 32);

  doc.rect(x, y, boxW, boxH).fill(highlight ? COLORS.warmBlush : COLORS.paleGreen);
  doc.rect(x, y, boxW, boxH).strokeColor(COLORS.border).lineWidth(0.5).stroke();

  // Step circle
  doc.circle(x + 24, y + boxH / 2, 14).fill(highlight ? COLORS.softTerracotta : COLORS.deepSage);
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(String(stepNum), x + 18, y + boxH / 2 - 6, { width: 28, align: 'center' });

  // Content
  doc
    .fillColor(COLORS.deepSage)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(stepTitle, x + 48, y + 12, { width: boxW - 60 });
  doc
    .fillColor(COLORS.darkText)
    .font('Helvetica')
    .fontSize(10)
    .text(stepText, x + 48, y + 28, { width: boxW - 60, lineGap: 3 });

  doc.y = y + boxH + 6;
}

function patternCard(doc, icon, title, trigger, reset) {
  const W = doc.page.width;
  const x = 40;
  const boxW = W - 80;
  const y = doc.y;

  // Header bar
  const headerH = 36;
  doc.rect(x, y, boxW, headerH).fill(COLORS.deepSage);
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(`${icon}  ${title}`, x + 16, y + 10, { width: boxW - 32 });

  // Trigger block
  const triggerH = 32 + doc.heightOfString(trigger, { width: boxW - 32, fontSize: 10 });
  doc.rect(x, y + headerH, boxW, triggerH).fill(COLORS.warmBlush);
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('WHEN YOU FEEL:', x + 16, y + headerH + 10, { characterSpacing: 1 });
  doc
    .fillColor(COLORS.darkText)
    .font('Helvetica')
    .fontSize(10)
    .text(trigger, x + 16, y + headerH + 22, { width: boxW - 32, lineGap: 3 });

  // Reset block
  const resetTextH = doc.heightOfString(reset, { width: boxW - 32, fontSize: 10 });
  const resetH = resetTextH + 32;
  doc.rect(x, y + headerH + triggerH, boxW, resetH).fill(COLORS.paleGreen);
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text('→ TRY THIS:', x + 16, y + headerH + triggerH + 10, { characterSpacing: 1 });
  doc
    .fillColor(COLORS.deepSage)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(reset, x + 16, y + headerH + triggerH + 22, { width: boxW - 32, lineGap: 3 });

  doc.y = y + headerH + triggerH + resetH + 10;
}

function phoneCard(doc, title, lines) {
  const W = doc.page.width;
  const halfW = (W - 80 - 10) / 2;

  // Two phone cards side by side
  // This is called once, so we render the full single card
  const x = 40;
  const y = doc.y;

  const cardH = lines.length * 36 + 52;
  const cornerR = 12;

  // Phone screen border
  doc
    .roundedRect(x, y, W - 80, cardH, cornerR)
    .fill(COLORS.deepSage);

  // Notch simulation
  doc
    .roundedRect(W / 2 - 30, y + 8, 60, 12, 6)
    .fill('rgba(0,0,0,0.3)');

  // Card title
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(title.toUpperCase(), x + 20, y + 28, { characterSpacing: 1.5, width: W - 120 });

  // Lines
  lines.forEach((line, i) => {
    const lineY = y + 46 + i * 36;
    doc.rect(x + 16, lineY, W - 80 - 32, 28).fill('rgba(255,255,255,0.08)');
    doc
      .fillColor(COLORS.white)
      .font('Helvetica')
      .fontSize(10)
      .text(line, x + 24, lineY + 8, { width: W - 80 - 48 });
  });

  doc.y = y + cardH + 12;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page generators
// ─────────────────────────────────────────────────────────────────────────────

function pageCover(doc) {
  coverPage(doc);
  pageFooter(doc);
}

function pageWhyTheLoop(doc) {
  doc.addPage();
  pageHeader(doc, 'Why The Loop Happens', 2);

  sectionLabel(doc, 'The Science');
  heading(doc, 'Your brain reacts before\nyou can decide.', 20);

  body(
    doc,
    'Codependent patterns aren\'t personality flaws. They\'re learned responses — habits your nervous system developed to manage threat, connection, and belonging. The amygdala (your brain\'s threat-detection system) fires in milliseconds. Your prefrontal cortex — the part that reasons — takes 200–500ms to catch up.'
  );

  body(
    doc,
    'By the time you\'re aware of the impulse, the loop has already started. The text is being typed. The apology is already forming. The urge to fix the mood is pulling hard.'
  );

  callout(
    doc,
    'The gap between knowing a pattern and being able to stop it is the real problem. It has nothing to do with willpower. It has to do with how quickly the nervous system moves — and what you have ready when it does.'
  );

  sectionLabel(doc, 'The Mechanism');
  heading(doc, 'The approval loop runs on dopamine.', 15);

  body(
    doc,
    'When you help someone and they\'re relieved, your brain registers that as a reward. When you smooth over tension and they soften, the reward fires again. Your nervous system learns: this works. Do more of it. The loop doesn\'t need the external approval to keep running — it just needs the expectation of it.'
  );

  sageBox(doc, 'This is why understanding the pattern doesn\'t break it. The loop is subcortical. The prefrontal cortex can observe it — but it can\'t just override it with a decision. You need a tool that works at the speed of the loop.');

  pageFooter(doc);
}

function pageTheProtocol(doc) {
  doc.addPage();
  pageHeader(doc, 'The 5-Minute Protocol', 3);

  sectionLabel(doc, 'The Core Practice');
  heading(doc, 'When you feel the loop starting —\nuse this sequence.', 17);

  muted(
    doc,
    'You can do this anywhere. A bathroom. A parked car. Thirty seconds before you respond to a text. The protocol creates a gap between the impulse and the action.'
  );

  stepBox(doc, 1, 'Name what you feel (30 seconds)',
    'Before anything else — name the sensation. Not the story, not the situation. Just: "My chest is tight." "My throat is closing." "I feel a pull to fix this." Naming activates the prefrontal cortex, which is exactly what slows the amygdala response.',
    false);

  stepBox(doc, 2, 'Three slow exhales (1 minute)',
    'Exhale longer than you inhale. Count: inhale 4, exhale 6. Three full cycles. This activates the parasympathetic nervous system directly — it\'s physiological, not metaphorical. Your heart rate will drop within seconds.',
    true);

  stepBox(doc, 3, 'Ask the grounding question (1 minute)',
    '"What is actually happening right now — not what I\'m afraid is happening?" Codependent reactions are often responses to interpretations, not facts. The question forces you to separate the two.',
    false);

  stepBox(doc, 4, 'Check the need (1 minute)',
    '"What do I actually need in this moment? What am I looking for by doing the thing I want to do?" You might need reassurance. Safety. To be heard. But the action you\'re about to take may not get you there.',
    true);

  stepBox(doc, 5, 'Choose your response (30 seconds)',
    'Now act — from the regulated state, not the reactive one. You might do the same thing. That\'s fine. But you chose it instead of being run by it.',
    false);

  callout(doc, 'The goal isn\'t to feel nothing. It\'s to create a pause long enough for your thinking brain to participate in the decision.');

  pageFooter(doc);
}

function pagePatterns(doc) {
  // Pages 4–6: Pattern-specific resets (across multiple pages)

  doc.addPage();
  pageHeader(doc, 'Pattern-Specific Resets', 4);

  sectionLabel(doc, 'The Four Common Loops');
  heading(doc, 'Different loops need different entries.', 17);

  muted(
    doc,
    'The protocol on page 3 works for all of them. But each pattern has a specific entry point that works faster. Find yours.'
  );

  patternCard(
    doc, '🌀', 'The Spiral',
    'A message hasn\'t been answered. Someone\'s tone shifted. You can\'t tell if they\'re upset with you. Your mind is running scenarios.',
    'Ground in the physical: name 5 things you can see. Then ask: "What is the one thing I actually know for certain right now?" Only the thing you know. Not the thing you fear.'
  );

  doc.moveDown(0.5);

  patternCard(
    doc, '👀', 'The Vigilance',
    'You walked into a room and immediately started scanning. Who\'s upset? What\'s the energy? Is everyone okay? You\'re not even in your own experience yet — you\'re managing everyone else\'s.',
    'Before you scan the room, scan yourself. Ask: "How am I?" — not them. Not the energy. You. This isn\'t selfish. It\'s the reset. You can\'t be present for others from outside your own body.'
  );

  doc.addPage();
  pageHeader(doc, 'Pattern-Specific Resets', 5);

  patternCard(
    doc, '🛠️', 'The Urge to Fix',
    'Someone is in a bad mood, crying, struggling. Everything in you wants to help, solve, smooth it over. You feel responsible for their state — like if you don\'t act, something bad will happen.',
    'Say this internally: "Their discomfort is not my emergency." Then sit with the discomfort of not fixing it for 60 seconds. You don\'t have to stay frozen — you can offer presence without taking ownership. "I\'m here" is different from "let me fix this."'
  );

  doc.moveDown(0.5);

  patternCard(
    doc, '😬', 'The Guilt Rush',
    'You said no, set a limit, or didn\'t perform the expected behavior. Now the guilt is enormous — disproportionate to what you actually did. You feel like you did something wrong even though you didn\'t.',
    'Ask: "What rule am I breaking right now — and whose rule is it?" Usually the guilt isn\'t about something bad you did. It\'s about violating an internalized rule that says your needs don\'t matter. Name the rule. Question whether it\'s true.'
  );

  doc.addPage();
  pageHeader(doc, 'The Loop Interrupt', 6);

  sectionLabel(doc, 'When The Pull Is Strongest');
  heading(doc, 'What to do when you\'re too far in.', 17);

  body(
    doc,
    'Sometimes you won\'t catch it in time. The spiral is already running. The text is already sent. The apology is already out. This is what to do then.'
  );

  callout(
    doc,
    'The loop doesn\'t end when the situation ends. It ends when your nervous system gets the signal that you\'re safe — that no threat is present. The fastest way to send that signal is physical.'
  );

  stepBox(doc, 1, 'Stop adding to it',
    'Don\'t send the follow-up message. Don\'t explain the explanation. Don\'t fix the apology. The impulse to keep going is the loop trying to find resolution. Stopping is the interruption.',
    false);

  stepBox(doc, 2, 'Change your physical state',
    'Cold water on your face or wrists. A short walk. Slow, deliberate exhales. The nervous system responds to physiology faster than to thought. You\'re not reasoning your way out — you\'re resetting.',
    true);

  stepBox(doc, 3, 'Name it without judgment',
    '"I got pulled into the loop. That\'s what happened. I can see it now." Not: "I did it again, I\'m hopeless." Just: the neutral observation. The observation is the exit.',
    false);

  stepBox(doc, 4, 'Come back later',
    'After you\'re regulated — not before — you can decide whether any follow-up is actually needed. Often: it isn\'t. The loop convinced you it was urgent. It usually isn\'t.',
    true);

  pageFooter(doc);
}

function pageQuickRef(doc) {
  // Pages 7–8: Quick reference cards (screenshot-friendly)
  doc.addPage();
  pageHeader(doc, 'Quick-Reference Cards — Screenshot These', 7);

  sectionLabel(doc, 'For Your Phone');
  body(doc, 'Save these to your camera roll. The next time you feel the pull, open them before you act.');

  phoneCard(doc, 'The 5-Minute Reset', [
    '1. Name the body sensation (30s)',
    '2. Three slow exhales — out longer than in (1m)',
    '3. "What is actually happening vs. what I fear?" (1m)',
    '4. "What do I actually need right now?" (1m)',
    '5. Choose your response from here (30s)',
  ]);

  doc.moveDown(0.5);

  phoneCard(doc, 'When The Spiral Hits', [
    'Name 5 things you can see',
    '"What is the one thing I know for certain?"',
    'Not what you fear — what you know',
    'Hold that. Exhale. Wait.',
  ]);

  doc.addPage();
  pageHeader(doc, 'Quick-Reference Cards', 8);

  phoneCard(doc, 'When You Want to Fix', [
    '"Their discomfort is not my emergency."',
    'Sit with the urge for 60 seconds',
    '"I\'m here" ≠ "let me fix this"',
    'Presence is enough. You don\'t have to solve it.',
  ]);

  doc.moveDown(0.5);

  phoneCard(doc, 'When The Guilt Rush Hits', [
    '"What rule am I breaking?"',
    '"Whose rule is it?"',
    '"Is it true that my needs don\'t matter here?"',
    'Having a need is not wrong.',
  ]);

  doc.moveDown(0.5);

  phoneCard(doc, 'When You\'re Too Far In', [
    'Stop adding to it. No follow-up.',
    'Cold water. Walk. Slow exhale.',
    '"I got pulled in. I can see it now."',
    'Regulated state first. Then decide.',
  ]);

  pageFooter(doc);
}

function pageBuildingTheHabit(doc) {
  doc.addPage();
  pageHeader(doc, 'Building the Habit', 9);

  sectionLabel(doc, 'Making This Automatic');
  heading(doc, 'The goal: reach for this before\nyou need to think about it.', 17);

  body(
    doc,
    'Right now, the loop runs automatically. The goal of the 5-Minute Reset is to build an equally automatic counter-response — not through willpower, but through repetition.'
  );

  sectionLabel(doc, 'The Three-Week Ladder');

  stepBox(doc, 1, 'Week 1: After the loop',
    'Don\'t try to catch it in real time yet. Just do the protocol after — once you\'re already in the spiral. This trains your nervous system to associate the loop with the reset, even retroactively.',
    false);

  stepBox(doc, 2, 'Week 2: During the loop',
    'Start catching it mid-spiral. You\'ll be 3 steps in before you notice — that\'s fine. Notice, and begin the protocol from there. Partial interrupts count.',
    true);

  stepBox(doc, 3, 'Week 3: Before the loop',
    'Now you\'re catching the earliest signal — the body sensation, the first thought. The protocol runs before the spiral gains momentum. This is where the automatic response lives.',
    false);

  sageBox(
    doc,
    'You\'re not building a new identity. You\'re building a new reflex. One that says: when I feel this, I do that. Not forever. Just long enough that the pattern loses its grip.'
  );

  sectionLabel(doc, 'What To Expect');

  body(
    doc,
    'The first few times you use this, it will feel deliberate and slightly awkward. That\'s normal. The loop is familiar; the reset is new. Keep going. The awkwardness is what learning feels like — not evidence that it\'s not working.'
  );

  callout(
    doc,
    'If you want to go deeper: Unbound\'s course covers the full psychology of the approval loop, your specific triggers, and six weeks of exercises for breaking the pattern at the root. Module 1 is free. unbound-4300.polsia.app/learn'
  );

  pageFooter(doc);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: stream the full PDF to the response
// ─────────────────────────────────────────────────────────────────────────────

function streamResetGuidePDF(res) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 40,
    autoFirstPage: true,
    bufferPages: true,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="5-minute-reset-guide.pdf"');
  doc.pipe(res);

  // Page 1: Cover
  pageCover(doc);

  // Page 2: Why the loop
  pageWhyTheLoop(doc);

  // Page 3: The protocol
  pageTheProtocol(doc);

  // Pages 4–6: Pattern-specific resets + interrupt
  pagePatterns(doc);

  // Pages 7–8: Quick-reference cards
  pageQuickRef(doc);

  // Page 9: Building the habit
  pageBuildingTheHabit(doc);

  doc.end();
}

module.exports = { streamResetGuidePDF };
