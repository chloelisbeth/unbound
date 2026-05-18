/**
 * db/email-sequence.js
 * Owns: email nurture sequence state on the subscribers table
 * Does NOT own: email sending (lib/send-email.js), subscriber creation (db/subscribers.js)
 */

let pool;

function setPool(p) {
  pool = p;
}

// Subscribers who signed up but haven't received Email 1 yet.
// Returns max 50 at a time to keep per-run volume safe.
async function getPendingEmail1() {
  const result = await pool.query(
    `SELECT id, email, name, subscribed_at
       FROM subscribers
      WHERE unsubscribed_at IS NULL
        AND email1_sent_at IS NULL
      ORDER BY subscribed_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Subscribers who received Email 1 >= 3 days ago and haven't received Email 2 yet.
async function getPendingEmail2() {
  const result = await pool.query(
    `SELECT id, email, name, subscribed_at
       FROM subscribers
      WHERE unsubscribed_at IS NULL
        AND email1_sent_at IS NOT NULL
        AND email2_sent_at IS NULL
        AND email1_sent_at <= NOW() - INTERVAL '3 days'
      ORDER BY email1_sent_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Subscribers who received Email 2 >= 4 days ago (7 days from signup) and haven't received Email 3 yet.
async function getPendingEmail3() {
  const result = await pool.query(
    `SELECT id, email, name, subscribed_at
       FROM subscribers
      WHERE unsubscribed_at IS NULL
        AND email2_sent_at IS NOT NULL
        AND email3_sent_at IS NULL
        AND email2_sent_at <= NOW() - INTERVAL '4 days'
      ORDER BY email2_sent_at ASC
      LIMIT 50`
  );
  return result.rows;
}

// Mark a specific sequence email as sent for a subscriber.
// emailNum: 1 | 2 | 3
async function markEmailSent(subscriberId, emailNum) {
  const column = `email${emailNum}_sent_at`;
  await pool.query(
    `UPDATE subscribers SET ${column} = NOW() WHERE id = $1`,
    [subscriberId]
  );
}

module.exports = { setPool, getPendingEmail1, getPendingEmail2, getPendingEmail3, markEmailSent };
