/**
 * db/reset-sequence.js
 * Owns: reset_buyers table — drip sequence state for $12 Reset guide purchasers
 * Does NOT own: email sending (lib/send-reset-emails.js), Stripe verification (routes/reset.js)
 */

let pool;

function setPool(p) {
  pool = p;
}

// Record a new Reset buyer. Idempotent by email — re-purchase doesn't create a duplicate row.
async function recordResetBuyer({ email, stripeSessionId }) {
  await pool.query(
    `INSERT INTO reset_buyers (email, stripe_session_id)
     VALUES ($1, $2)
     ON CONFLICT (LOWER(email)) DO NOTHING`,
    [email.toLowerCase().trim(), stripeSessionId]
  );
}

// Buyers who haven't received Email 1 yet. Max 50/run.
async function getPendingResetEmail1() {
  const result = await pool.query(
    `SELECT id, email, purchased_at
       FROM reset_buyers
      WHERE email1_sent_at IS NULL
      ORDER BY purchased_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Buyers who got Email 1 >= 3 days ago and haven't received Email 2.
async function getPendingResetEmail2() {
  const result = await pool.query(
    `SELECT id, email, purchased_at
       FROM reset_buyers
      WHERE email1_sent_at IS NOT NULL
        AND email2_sent_at IS NULL
        AND email1_sent_at <= NOW() - INTERVAL '3 days'
      ORDER BY email1_sent_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Buyers who got Email 2 >= 4 days ago (7 days from purchase) and haven't received Email 3.
async function getPendingResetEmail3() {
  const result = await pool.query(
    `SELECT id, email, purchased_at
       FROM reset_buyers
      WHERE email2_sent_at IS NOT NULL
        AND email3_sent_at IS NULL
        AND email2_sent_at <= NOW() - INTERVAL '4 days'
      ORDER BY email2_sent_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Mark a specific drip email as sent. emailNum: 1 | 2 | 3
async function markResetEmailSent(buyerId, emailNum) {
  const column = `email${emailNum}_sent_at`;
  await pool.query(
    `UPDATE reset_buyers SET ${column} = NOW() WHERE id = $1`,
    [buyerId]
  );
}

module.exports = {
  setPool,
  recordResetBuyer,
  getPendingResetEmail1,
  getPendingResetEmail2,
  getPendingResetEmail3,
  markResetEmailSent,
};
