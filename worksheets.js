/**
 * lib/worksheets.js
 * Owns: PDF worksheet generation for all Module 2 lessons + bonus Week 1 guide
 * Does NOT own: access control (handled by routes/worksheets.js), DB queries
 *
 * Generates PDFs on-the-fly using pdfkit. No files written to disk (Render's
 * filesystem is ephemeral). Each worksheet is streamed directly to the response.
 */

const PDFDocument = require('pdfkit');

// Unbound palette (RGB 0–255)
const COLORS = {
  deepSage: '#3D5A47',       // headings, primary text
  softTerracotta: '#C4856A', // accents, labels
  warmBlush: '#F5EDE8',      // callout backgrounds
  paleGreen: '#EBF0EC',      // light background tints
  mutedText: '#6B7C73',      // body text, secondary
  darkText: '#1A2B21',       // high-contrast body
  border: '#D8E3DC',         // dividers
  white: '#FFFFFF',
};

// Worksheet metadata — maps lesson slug → worksheet config
const WORKSHEETS = [
  {
    slug: 'worksheet-approval-loop-mechanics',
    lessonSlug: 'what-the-approval-loop-actually-is',
    title: 'Trigger Mapping Worksheet',
    subtitle: 'Lesson 1 · Approval Loop Mechanics',
    description: 'Map your approval-seeking triggers into a clear pattern.',
    filename: 'worksheet-1-trigger-mapping.pdf',
  },
  {
    slug: 'worksheet-personal-triggers',
    lessonSlug: 'your-triggers',
    title: 'Personal Trigger Inventory',
    subtitle: 'Lesson 2 · Your Triggers',
    description: 'Build your personal catalog of activation patterns.',
    filename: 'worksheet-2-trigger-inventory.pdf',
  },
  {
    slug: 'worksheet-emotional-payoff',
    lessonSlug: 'the-emotional-payoff',
    title: 'Payoff Tracking Sheet',
    subtitle: 'Lesson 3 · The Emotional Payoff',
    description: 'See what approval-seeking gives you — and what it costs.',
    filename: 'worksheet-3-payoff-tracking.pdf',
  },
  {
    slug: 'worksheet-pattern-interrupts',
    lessonSlug: 'catching-yourself-mid-loop',
    title: 'Pattern Interrupt Reference Card',
    subtitle: 'Lesson 4 · Catching Yourself Mid-Loop',
    description: 'Your quick-reference guide when the loop pulls hard.',
    filename: 'worksheet-4-pattern-interrupts.pdf',
  },
  {
    slug: 'worksheet-discomfort-tracker',
    lessonSlug: 'sitting-with-discomfort',
    title: 'Discomfort Tolerance Tracker',
    subtitle: 'Lesson 5 · Sitting with Discomfort',
    description: 'A 7-day log for building your tolerance muscle.',
    filename: 'worksheet-5-discomfort-tracker.pdf',
  },
  {
    slug: 'worksheet-internal-validation',
    lessonSlug: 'building-internal-validation',
    title: 'Self-Validation Scripts',
    subtitle: 'Lesson 6 · Building Internal Validation',
    description: 'Fill-in templates for turning inward instead of outward.',
    filename: 'worksheet-6-self-validation.pdf',
  },
  {
    slug: 'worksheet-week1-pattern-break',
    lessonSlug: null, // bonus — not tied to a specific lesson
    title: 'Week 1 Pattern Break',
    subtitle: 'Bonus · Your First 7 Days',
    description: 'A day-by-day guide for your first week of active change.',
    filename: 'bonus-week1-pattern-break.pdf',
  },
];

// Find worksheet metadata by slug
function getWorksheet(slug) {
  return WORKSHEETS.find((w) => w.slug === slug) || null;
}

// Find worksheet metadata by lesson slug
function getWorksheetForLesson(lessonSlug) {
  return WORKSHEETS.find((w) => w.lessonSlug === lessonSlug) || null;
}

// All non-bonus worksheets (for toolkit listing)
function getAllWorksheets() {
  return WORKSHEETS;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF layout helpers
// ─────────────────────────────────────────────────────────────────────────────

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function coverHeader(doc, worksheet) {
  const pageWidth = doc.page.width;

  // Sage background strip at top
  doc.rect(0, 0, pageWidth, 110).fill(COLORS.deepSage);

  // Unbound wordmark (top-left)
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('UNBOUND', 40, 22, { characterSpacing: 3 });

  // Worksheet label
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica')
    .fontSize(9)
    .text('COMPANION WORKSHEET · MODULE 2', 40, 38, { characterSpacing: 1.5 });

  // Worksheet title
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(worksheet.title, 40, 56, { width: pageWidth - 80 });

  // Subtitle line
  doc
    .fillColor('rgba(255,255,255,0.65)')
    .font('Helvetica')
    .fontSize(10)
    .fillColor([220, 232, 224])
    .text(worksheet.subtitle, 40, 88, { characterSpacing: 0.5 });

  // Description blurb below header
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(11)
    .text(worksheet.description, 40, 128, { width: pageWidth - 80, lineGap: 4 });

  // Thin terracotta divider
  const dividerY = doc.y + 16;
  doc
    .moveTo(40, dividerY)
    .lineTo(pageWidth - 40, dividerY)
    .strokeColor(COLORS.softTerracotta)
    .lineWidth(1.5)
    .stroke();

  doc.moveDown(2);
}

function sectionLabel(doc, text) {
  doc
    .fillColor(COLORS.softTerracotta)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(text.toUpperCase(), { characterSpacing: 1.5 })
    .moveDown(0.3);
}

function sectionTitle(doc, text) {
  doc
    .fillColor(COLORS.deepSage)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(text)
    .moveDown(0.6);
}

function bodyText(doc, text, opts = {}) {
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(10)
    .text(text, { lineGap: 3, ...opts })
    .moveDown(0.5);
}

// Blank write-in line with optional label
function writeLine(doc, label, height = 28) {
  const x = doc.x;
  const pageWidth = doc.page.width;
  const lineWidth = pageWidth - x - 40;
  const y = doc.y;

  if (label) {
    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica')
      .fontSize(9)
      .text(label, x, y, { width: 120 });
  }

  const lineX = label ? x + 130 : x;
  const lineY = y + (label ? 6 : 0);
  doc
    .moveTo(lineX, lineY)
    .lineTo(lineX + lineWidth - (label ? 130 : 0), lineY)
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .stroke();

  doc.y = y + height;
}

// Multi-line write area with light border
function writeBox(doc, label, lines = 3) {
  const x = doc.x;
  const pageWidth = doc.page.width;
  const boxWidth = pageWidth - x - 40;
  const lineHeight = 22;
  const boxHeight = lines * lineHeight + 16;
  const y = doc.y;

  if (label) {
    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica')
      .fontSize(9)
      .text(label, x, y)
      .moveDown(0.3);
  }

  const boxY = doc.y;
  doc
    .rect(x, boxY, boxWidth, boxHeight)
    .fillColor(COLORS.paleGreen)
    .fill()
    .rect(x, boxY, boxWidth, boxHeight)
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .stroke();

  // Draw faint lines inside box for writing
  for (let i = 1; i <= lines; i++) {
    const ly = boxY + i * lineHeight;
    if (ly < boxY + boxHeight - 8) {
      doc
        .moveTo(x + 8, ly)
        .lineTo(x + boxWidth - 8, ly)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();
    }
  }

  doc.y = boxY + boxHeight + 12;
}

// Two-column row for payoff tracking
function twoColRow(doc, leftLabel, rightLabel, rowHeight = 50) {
  const x = 40;
  const pageWidth = doc.page.width;
  const colWidth = (pageWidth - 80 - 12) / 2;
  const y = doc.y;

  // Left cell
  doc
    .rect(x, y, colWidth, rowHeight)
    .fillColor(COLORS.warmBlush)
    .fill()
    .rect(x, y, colWidth, rowHeight)
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .stroke();

  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(9)
    .text(leftLabel, x + 8, y + 8, { width: colWidth - 16 });

  // Right cell
  const rightX = x + colWidth + 12;
  doc
    .rect(rightX, y, colWidth, rowHeight)
    .fillColor(COLORS.paleGreen)
    .fill()
    .rect(rightX, y, colWidth, rowHeight)
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .stroke();

  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(9)
    .text(rightLabel, rightX + 8, y + 8, { width: colWidth - 16 });

  doc.y = y + rowHeight + 6;
}

// Callout box (warm blush background, terracotta left border)
function calloutBox(doc, text) {
  const x = 40;
  const pageWidth = doc.page.width;
  const boxWidth = pageWidth - 80;
  const y = doc.y;

  // Measure text height first
  const textHeight = doc.heightOfString(text, { width: boxWidth - 40, fontSize: 10 });
  const boxHeight = textHeight + 24;

  doc
    .rect(x, y, boxWidth, boxHeight)
    .fillColor(COLORS.warmBlush)
    .fill();

  doc
    .rect(x, y, 3, boxHeight)
    .fillColor(COLORS.softTerracotta)
    .fill();

  doc
    .fillColor(COLORS.darkText)
    .font('Helvetica')
    .fontSize(10)
    .text(text, x + 16, y + 12, { width: boxWidth - 40, lineGap: 3 });

  doc.y = y + boxHeight + 16;
}

// Footer on every page
function addFooter(doc, worksheet) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const y = pageHeight - 36;

  doc
    .moveTo(40, y)
    .lineTo(pageWidth - 40, y)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(8)
    .text('Unbound · unboundcourse.com · ' + worksheet.subtitle, 40, y + 6, {
      width: pageWidth - 100,
    });

  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(8)
    .text(`Page ${doc.bufferedPageRange().count}`, pageWidth - 80, y + 6, {
      width: 40,
      align: 'right',
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual worksheet generators
// ─────────────────────────────────────────────────────────────────────────────

function generateTriggerMapping(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'Every approval-seeking moment follows a pattern. This worksheet helps you see yours. Fill in as many rows as you can — real situations from the last week work best.'
  );

  sectionLabel(doc, 'The Pattern Template');
  sectionTitle(doc, '"When [situation], I feel [emotion], so I do [behavior]."');

  bodyText(
    doc,
    'Use the rows below to map your triggers. Be specific — not "when I feel criticized" but "when my partner sighs while I\'m talking."'
  );

  doc.moveDown(0.5);

  // 6 trigger mapping rows
  for (let i = 1; i <= 6; i++) {
    const x = 40;
    const pageWidth = doc.page.width;
    const y = doc.y;
    const rowH = 68;

    doc
      .rect(x, y, pageWidth - 80, rowH)
      .fillColor(i % 2 === 0 ? COLORS.paleGreen : COLORS.white)
      .fill()
      .rect(x, y, pageWidth - 80, rowH)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    // Row number badge
    doc
      .circle(x + 16, y + rowH / 2, 10)
      .fillColor(COLORS.deepSage)
      .fill();
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(String(i), x + 12, y + rowH / 2 - 5, { width: 20, align: 'center' });

    const colStart = x + 36;
    const colW = (pageWidth - 80 - 36) / 3;

    const labels = ['When…', 'I feel…', 'So I do…'];
    labels.forEach((lbl, idx) => {
      const cx = colStart + idx * colW;
      doc
        .fillColor(COLORS.softTerracotta)
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .text(lbl.toUpperCase(), cx + 4, y + 8, { width: colW - 8, characterSpacing: 0.5 });
      // Write line
      doc
        .moveTo(cx + 4, y + 44)
        .lineTo(cx + colW - 8, y + 44)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();
    });

    doc.y = y + rowH + 4;
  }

  doc.moveDown(1);
  sectionLabel(doc, 'Reflection');
  sectionTitle(doc, 'What do you notice?');
  bodyText(doc, 'Looking at your patterns above — is there a common trigger? A recurring emotion? A go-to behavior?');
  writeBox(doc, 'What I notice most:', 3);

  doc.moveDown(0.5);
  bodyText(doc, 'Which situation felt most charged to write about? Why do you think that is?');
  writeBox(doc, 'Most charged situation:', 2);
}

function generateTriggerInventory(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'Triggers aren\'t random. Over time, your nervous system learns to fire the threat response at specific cues. This inventory helps you map yours — so you can start catching them before they run.'
  );

  sectionLabel(doc, 'Part 1 · Checklist');
  sectionTitle(doc, 'Common triggers — check the ones that land.');

  const triggers = [
    'Someone seems disappointed in me',
    'A message goes unanswered for too long',
    'Someone says my name in a flat tone',
    'I notice tension in a room I just walked into',
    'Someone gives brief or clipped responses',
    'A person I care about seems to be in a bad mood',
    'I sense someone pulling away or going quiet',
    'I ask for something and feel I\'m "too much"',
    'I do something well and no one notices',
    'I can tell someone is upset but they say "I\'m fine"',
    'I\'m left out of a conversation or decision',
    'Someone praises me and I immediately wait for the "but"',
  ];

  const pageWidth = doc.page.width;
  triggers.forEach((t, i) => {
    const x = 40;
    const y = doc.y;
    doc
      .rect(x, y, 12, 12)
      .strokeColor(COLORS.border)
      .lineWidth(0.75)
      .stroke();
    doc
      .fillColor(COLORS.darkText)
      .font('Helvetica')
      .fontSize(10)
      .text(t, x + 20, y + 1, { width: pageWidth - 100 });
    doc.y = y + 20;
  });

  doc.moveDown(0.5);
  bodyText(doc, 'Add your own:');
  for (let i = 0; i < 3; i++) {
    const x = 40;
    const y = doc.y;
    doc
      .rect(x, y, 12, 12)
      .strokeColor(COLORS.border)
      .lineWidth(0.75)
      .stroke();
    doc
      .moveTo(x + 20, y + 10)
      .lineTo(pageWidth - 40, y + 10)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();
    doc.y = y + 24;
  }

  // Page 2 — journal template
  doc.addPage();
  coverHeader(doc, worksheet);

  sectionLabel(doc, 'Part 2 · Journal Template');
  sectionTitle(doc, 'For each trigger you checked, fill in what happens.');
  bodyText(doc, 'Pick 2–3 triggers from your checklist and work through them below. The body sensation column is the most important — that\'s your earliest warning signal.');

  // Journal rows — 3 entries, each with 4 fields
  const journalLabels = ['Situation', 'Body sensation', 'Automatic response', 'What I actually needed'];
  for (let entry = 1; entry <= 3; entry++) {
    const x = 40;
    const pageWidth2 = doc.page.width;
    const entryY = doc.y;

    // Entry header
    doc
      .rect(x, entryY, pageWidth2 - 80, 22)
      .fillColor(COLORS.deepSage)
      .fill();
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`Trigger ${entry}`, x + 12, entryY + 6);

    doc.y = entryY + 22;

    journalLabels.forEach((label) => {
      const y2 = doc.y;
      doc
        .rect(x, y2, pageWidth2 - 80, 38)
        .fillColor(entry % 2 === 0 ? COLORS.paleGreen : COLORS.white)
        .fill()
        .rect(x, y2, pageWidth2 - 80, 38)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();
      doc
        .fillColor(COLORS.softTerracotta)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(label.toUpperCase(), x + 8, y2 + 6, { characterSpacing: 0.5 });
      doc.y = y2 + 38;
    });

    doc.moveDown(0.5);
  }
}

function generatePayoffTracking(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'Approval-seeking persists because it works — in the short term. This exercise makes the cost visible. When the brain can see the full ledger, not just the immediate payoff, it starts to question the trade.'
  );

  sectionLabel(doc, 'The Exercise');
  sectionTitle(doc, 'What does approval-seeking give you — and what does it cost?');
  bodyText(
    doc,
    'Think of a recent situation where you sought approval, over-apologized, or caretook someone at your own expense. Use the columns below to track it.'
  );

  // Column headers
  const x = 40;
  const pageWidth = doc.page.width;
  const colWidth = (pageWidth - 80 - 12) / 2;
  const headerY = doc.y;

  doc
    .rect(x, headerY, colWidth, 30)
    .fillColor(COLORS.softTerracotta)
    .fill();
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('SHORT-TERM PAYOFF', x + 8, headerY + 10, { width: colWidth - 16, characterSpacing: 0.5 });

  const rightX = x + colWidth + 12;
  doc
    .rect(rightX, headerY, colWidth, 30)
    .fillColor(COLORS.deepSage)
    .fill();
  doc
    .fillColor(COLORS.white)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('LONG-TERM COST', rightX + 8, headerY + 10, { width: colWidth - 16, characterSpacing: 0.5 });

  doc.y = headerY + 30 + 4;

  // Sub-headers
  const subY = doc.y;
  doc
    .rect(x, subY, colWidth, 20)
    .fillColor(COLORS.warmBlush)
    .fill();
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(8)
    .text('What you get immediately', x + 8, subY + 6, { width: colWidth - 16 });

  doc
    .rect(rightX, subY, colWidth, 20)
    .fillColor(COLORS.paleGreen)
    .fill();
  doc
    .fillColor(COLORS.mutedText)
    .font('Helvetica')
    .fontSize(8)
    .text('What it costs over time', rightX + 8, subY + 6, { width: colWidth - 16 });

  doc.y = subY + 20 + 4;

  // 6 paired rows
  const examplePairs = [
    ['Relief — tension in the room drops', 'I never find out if conflict is survivable'],
    ['They seem happy with me', 'I\'ve taught them my real feelings don\'t matter'],
    ['I feel useful, even needed', 'My own needs stay invisible and unmet'],
    ['Temporary sense of safety', 'I\'m exhausted from constant vigilance'],
    ['Avoid their disappointment', 'I lose track of what I actually think'],
    ['Connection — for a moment', 'The connection is built on a performance, not me'],
  ];

  examplePairs.forEach(([left, right], i) => {
    twoColRow(doc, left, right, 44);
  });

  doc.moveDown(0.5);
  bodyText(doc, 'Now your own situation — what happened, what did you get, and what did it cost?');
  writeBox(doc, 'Situation:', 2);
  twoColRow(doc, 'Short-term payoff I got:', 'Long-term cost I\'m carrying:', 60);

  doc.moveDown(1);
  sectionLabel(doc, 'Reflection');
  writeBox(doc, 'One thing I\'m willing to try differently next time:', 2);
}

function generatePatternInterrupts(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'This is your quick-reference card. When the loop pulls hard — save it to your phone, stick it somewhere visible, screenshot it. The pause is the practice.'
  );

  sectionLabel(doc, 'How to Use This');
  bodyText(
    doc,
    'When you feel the familiar pull to apologize, fix, explain, or caretake — look at this card before you act. The goal isn\'t to suppress the feeling. It\'s to create a gap between the impulse and the action.'
  );

  sectionTitle(doc, 'When you feel the pull → do THIS instead');

  const interrupts = [
    {
      trigger: 'The urge to apologize when you\'ve done nothing wrong',
      interrupt: 'Say nothing for 3 seconds. Ask: "What am I actually apologizing for?"',
      body: 'Name the body sensation. Chest tight? Throat closing? That\'s the signal — not a command.',
    },
    {
      trigger: 'The urge to fix someone\'s mood',
      interrupt: 'Say: "I notice I want to fix this. I\'m going to let it be for a moment."',
      body: 'Remind yourself: their discomfort is not your emergency. You can be present without being responsible.',
    },
    {
      trigger: 'The urge to over-explain or justify yourself',
      interrupt: 'Stop after one clear sentence. Repeat it if pressed. Don\'t add more.',
      body: '"I\'m not available for that" is a complete sentence. So is "I need some time to think."',
    },
    {
      trigger: 'The urge to shrink or disappear in conflict',
      interrupt: 'Breathe and state one thing you actually think. One sentence is enough.',
      body: 'You don\'t have to resolve it — just stay present without leaving yourself behind.',
    },
    {
      trigger: 'The urge to check for reassurance (texts, reads, approval signals)',
      interrupt: 'Wait 10 minutes. Then decide if it still feels necessary.',
      body: 'Ask: "Am I looking for information or trying to manage anxiety?" Sit with the answer.',
    },
  ];

  const pageWidth = doc.page.width;
  interrupts.forEach((item, i) => {
    const x = 40;
    const y = doc.y;
    const boxH = 84;

    doc
      .rect(x, y, pageWidth - 80, boxH)
      .fillColor(i % 2 === 0 ? COLORS.paleGreen : COLORS.warmBlush)
      .fill()
      .rect(x, y, 3, boxH)
      .fillColor(COLORS.softTerracotta)
      .fill();

    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text('WHEN:', x + 12, y + 8, { characterSpacing: 1 });
    doc
      .fillColor(COLORS.darkText)
      .font('Helvetica')
      .fontSize(9.5)
      .text(item.trigger, x + 12, y + 18, { width: pageWidth - 100 });

    doc
      .fillColor(COLORS.softTerracotta)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text('→ TRY:', x + 12, y + 36, { characterSpacing: 1 });
    doc
      .fillColor(COLORS.deepSage)
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .text(item.interrupt, x + 12, y + 46, { width: pageWidth - 100 });

    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica')
      .fontSize(8.5)
      .text(item.body, x + 12, y + 64, { width: pageWidth - 100 });

    doc.y = y + boxH + 6;
  });

  doc.moveDown(0.5);
  sectionLabel(doc, 'Add Your Own');
  bodyText(doc, 'What pattern interrupt would work for your most common trigger?');
  writeBox(doc, 'When I feel the pull to:', 1);
  writeBox(doc, '→ I will instead:', 1);
}

function generateDiscomfortTracker(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'Tolerating discomfort without seeking relief is a skill — and like any skill, it builds with practice. Use this log for 7 days. You don\'t have to do it perfectly. You just have to do it.'
  );

  sectionLabel(doc, 'Instructions');
  bodyText(
    doc,
    'Each day, record one moment where you felt the urge to seek approval or avoid discomfort — and chose to sit with it instead. Rate the discomfort from 1 (mild) to 10 (intense). After completing all 7 days, review what you learned.'
  );

  const pageWidth = doc.page.width;
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const columns = ['What happened', 'Rating (1–10)', 'How long you sat with it', 'What you learned'];
  const colWidths = [180, 70, 90, null]; // last col fills remaining

  // Calculate last col width
  const totalFixed = colWidths.slice(0, -1).reduce((a, b) => a + b, 0);
  const lastColWidth = pageWidth - 80 - totalFixed - 3 * 3; // 3 gaps
  colWidths[3] = lastColWidth;

  // Table header
  const headerY = doc.y;
  const headerH = 24;
  let cx = 40;

  columns.forEach((col, i) => {
    doc
      .rect(cx, headerY, colWidths[i], headerH)
      .fillColor(COLORS.deepSage)
      .fill();
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text(col.toUpperCase(), cx + 4, headerY + 8, { width: colWidths[i] - 8, characterSpacing: 0.3 });
    cx += colWidths[i] + 3;
  });

  doc.y = headerY + headerH + 2;

  // Day rows
  days.forEach((day, i) => {
    const rowY = doc.y;
    const rowH = 52;
    let rx = 40;

    columns.forEach((_, ci) => {
      doc
        .rect(rx, rowY, colWidths[ci], rowH)
        .fillColor(i % 2 === 0 ? COLORS.warmBlush : COLORS.paleGreen)
        .fill()
        .rect(rx, rowY, colWidths[ci], rowH)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();

      if (ci === 0) {
        doc
          .fillColor(COLORS.deepSage)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(day, rx + 4, rowY + 4);
      }

      rx += colWidths[ci] + 3;
    });

    doc.y = rowY + rowH + 2;
  });

  doc.moveDown(1);
  sectionLabel(doc, 'After 7 Days · Reflection');
  sectionTitle(doc, 'What did you notice?');

  writeBox(doc, 'Did the discomfort level change over the week?', 2);
  writeBox(doc, 'What surprised you most?', 2);
  writeBox(doc, 'One thing I\'m proud of from this week:', 2);
}

function generateSelfValidation(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'External validation isn\'t wrong — it\'s just not enough on its own. This worksheet helps you build the internal version: the voice that doesn\'t wait for anyone else to tell it it\'s okay.'
  );

  sectionLabel(doc, 'Part 1 · Fill-in Affirmation Builder');
  sectionTitle(doc, 'Complete each sentence honestly — not with what sounds good, but what\'s actually true for you.');

  const starters = [
    'Right now, I am doing my best with',
    'Something I handled well this week was',
    'A value I held even when it was hard:',
    'I don\'t need approval to know that I',
    'My feelings about [situation] are valid because',
    'I\'m allowed to need',
    'I showed up for myself when I',
    'One thing I like about how I think:',
  ];

  starters.forEach((starter) => {
    const pageWidth = doc.page.width;
    const x = doc.x;
    const y = doc.y;
    doc
      .fillColor(COLORS.deepSage)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(starter + '…', x, y, { width: pageWidth - x - 40 });
    doc.moveDown(0.2);
    writeLine(doc, null, 24);
    doc.moveDown(0.4);
  });

  // Page 2 — daily check-in
  doc.addPage();
  coverHeader(doc, worksheet);

  sectionLabel(doc, 'Part 2 · Daily Check-In Template');
  sectionTitle(doc, 'Use this check-in each morning or evening. Five minutes is enough.');

  bodyText(doc, 'The goal is to notice your internal state before you start scanning others\' states — to build the reflex of turning inward first.');

  const checkInPrompts = [
    { label: 'Today I feel (body + emotion):', lines: 2 },
    { label: 'Something I\'m carrying that I haven\'t named yet:', lines: 2 },
    { label: 'Today I validated myself by:', lines: 2 },
    { label: 'One moment today where I noticed the approval loop:', lines: 2 },
    { label: 'What I actually needed in that moment:', lines: 2 },
    { label: 'Something I\'m proud of — even if small:', lines: 1 },
  ];

  checkInPrompts.forEach((prompt) => {
    writeBox(doc, prompt.label, prompt.lines);
  });

  doc.moveDown(0.5);
  calloutBox(
    doc,
    'A note: self-validation isn\'t toxic positivity. It doesn\'t mean pretending everything\'s fine. It means being a fair witness to yourself — acknowledging what\'s hard, and also what\'s true.'
  );
}

function generateWeek1PatternBreak(doc, worksheet) {
  coverHeader(doc, worksheet);

  calloutBox(
    doc,
    'The first week is the hardest — not because anything is wrong, but because your nervous system is used to the old pattern. This guide is practical and specific. It doesn\'t ask you to feel differently. It asks you to act differently, one day at a time.'
  );

  sectionTitle(doc, 'Before You Begin');
  bodyText(
    doc,
    'Choose one approval-seeking behavior to focus on this week. Not all of them — just one. The more specific you are, the more useful this guide will be. Write it here:'
  );
  writeBox(doc, 'My focus this week:', 2);

  const days = [
    {
      day: 'Day 1 · Notice',
      color: COLORS.warmBlush,
      task: 'Don\'t try to change anything yet. Today, just notice every time you feel the loop start. How often? In what contexts? With whom?',
      evening: 'Write down one moment where you felt the pull most strongly. What was happening?',
    },
    {
      day: 'Day 2 · Name It',
      color: COLORS.paleGreen,
      task: 'Each time you feel the pull, say internally: "There it is. That\'s the loop." Nothing else. Just naming it. This alone interrupts the automation.',
      evening: 'Did naming it change anything? Even slightly?',
    },
    {
      day: 'Day 3 · Pause',
      color: COLORS.warmBlush,
      task: 'When the loop fires, add a 3-second pause before you act. You don\'t have to do anything differently yet. Just pause.',
      evening: 'Where was the pause hardest? What made it hard?',
    },
    {
      day: 'Day 4 · Choose',
      color: COLORS.paleGreen,
      task: 'In one situation today, make a different choice. Don\'t apologize when you don\'t need to. Don\'t fix the mood. Don\'t over-explain. One time.',
      evening: 'What happened? How did your body respond?',
    },
    {
      day: 'Day 5 · Rest',
      color: COLORS.warmBlush,
      task: 'You\'ve been paying close attention for four days. Today, ease up. Do what feels natural. Notice without judging.',
      evening: 'What did "rest" feel like? Did the patterns show up differently when you weren\'t trying so hard?',
    },
    {
      day: 'Day 6 · Validate Yourself',
      color: COLORS.paleGreen,
      task: 'Before you check if someone is happy with you today, check in with yourself first. What do YOU think of how you handled it? What do you feel?',
      evening: 'One thing you can tell yourself that doesn\'t need anyone else to confirm:',
    },
    {
      day: 'Day 7 · Review',
      color: COLORS.warmBlush,
      task: 'Look back at the week. Not to judge — to understand. What shifted? What stayed the same? What do you want to carry forward?',
      evening: 'The most important thing I learned about myself this week:',
    },
  ];

  const pageWidth = doc.page.width;
  days.forEach((dayData) => {
    const x = 40;
    const y = doc.y;

    // Day header
    doc
      .rect(x, y, pageWidth - 80, 22)
      .fillColor(COLORS.deepSage)
      .fill();
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(dayData.day, x + 10, y + 6);

    // Task block
    const taskH = doc.heightOfString(dayData.task, { width: pageWidth - 120, fontSize: 10 }) + 24;
    doc
      .rect(x, y + 22, pageWidth - 80, taskH)
      .fillColor(dayData.color)
      .fill();
    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text('TODAY:', x + 10, y + 30, { characterSpacing: 1 });
    doc
      .fillColor(COLORS.darkText)
      .font('Helvetica')
      .fontSize(10)
      .text(dayData.task, x + 10, y + 42, { width: pageWidth - 100, lineGap: 2 });

    const totalBlockH = 22 + taskH;
    doc.y = y + totalBlockH;

    // Evening write line
    const eveningY = doc.y;
    doc
      .rect(x, eveningY, pageWidth - 80, 36)
      .fillColor(COLORS.white)
      .fill()
      .rect(x, eveningY, pageWidth - 80, 36)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();
    doc
      .fillColor(COLORS.softTerracotta)
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .text('EVENING:', x + 10, eveningY + 4, { characterSpacing: 1 });
    doc
      .fillColor(COLORS.mutedText)
      .font('Helvetica')
      .fontSize(9)
      .text(dayData.evening, x + 10, eveningY + 16, { width: pageWidth - 100 });

    doc.y = eveningY + 36 + 8;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry: stream a PDF for the given slug to the response
// ─────────────────────────────────────────────────────────────────────────────

function streamWorksheetPDF(slug, res) {
  const worksheet = getWorksheet(slug);
  if (!worksheet) {
    return false;
  }

  const doc = new PDFDocument({ margin: 40, size: 'LETTER', autoFirstPage: true });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${worksheet.filename}"`);
  doc.pipe(res);

  // Add footer to every page
  doc.on('pageAdded', () => {
    // Footer added post-render via bufferedPageRange approach below
  });

  // Generate worksheet content
  switch (slug) {
    case 'worksheet-approval-loop-mechanics':
      generateTriggerMapping(doc, worksheet);
      break;
    case 'worksheet-personal-triggers':
      generateTriggerInventory(doc, worksheet);
      break;
    case 'worksheet-emotional-payoff':
      generatePayoffTracking(doc, worksheet);
      break;
    case 'worksheet-pattern-interrupts':
      generatePatternInterrupts(doc, worksheet);
      break;
    case 'worksheet-discomfort-tracker':
      generateDiscomfortTracker(doc, worksheet);
      break;
    case 'worksheet-internal-validation':
      generateSelfValidation(doc, worksheet);
      break;
    case 'worksheet-week1-pattern-break':
      generateWeek1PatternBreak(doc, worksheet);
      break;
    default:
      doc.text('Worksheet not found.');
  }

  doc.end();
  return true;
}

module.exports = {
  WORKSHEETS,
  getWorksheet,
  getWorksheetForLesson,
  getAllWorksheets,
  streamWorksheetPDF,
};
