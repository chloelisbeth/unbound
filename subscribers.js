/**
 * db/subscribers.js
 * Owns: subscribers table — email signups from landing page and lesson prompts
 * Does NOT own: session management, email sending (those live in routes/lib layers)
 */

let pool;

function setPool(p) {
  pool = p;
}

// Insert a new subscriber. Idempotent: re-submitting the same email is a no-op.
// Returns { inserted: true } on new record, { inserted: false } if already existed.
async function subscribe({ email, name, source }) {
  const result = await pool.query(
    `INSERT INTO subscribers (email, name, source)
     VALUES ($1, $2, $3)
     ON CONFLICT (LOWER(email)) DO NOTHING
     RETURNING id`,
    [email.toLowerCase().trim(), name || null, source || 'landing']
  );
  return { inserted: result.rows.length > 0 };
}

// Check if an email is already subscribed
async function isSubscribed(email) {
  const result = await pool.query(
    'SELECT id FROM subscribers WHERE LOWER(email) = $1 AND unsubscribed_at IS NULL LIMIT 1',
    [email.toLowerCase().trim()]
  );
  return result.rows.length > 0;
}

module.exports = { setPool, subscribe, isSubscribed };
