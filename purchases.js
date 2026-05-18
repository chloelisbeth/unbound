/**
 * db/purchases.js
 * Owns: purchases table — verified Stripe payments, tier unlocks
 * Does NOT own: session management, Stripe API calls (those are in routes/pricing.js)
 */

let pool;

function setPool(p) {
  pool = p;
}

// Record a verified payment (idempotent by stripe_session_id)
async function recordPurchase({ sessionId, email, stripeSessionId, productName, amountCents, tier }) {
  await pool.query(
    `INSERT INTO purchases (session_id, email, stripe_session_id, product_name, amount_cents, tier)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (stripe_session_id) DO NOTHING`,
    [sessionId, email || null, stripeSessionId, productName, amountCents, tier]
  );
}

// Check if a session has purchased a given tier or higher
// Tier hierarchy: 'full' < 'premium'
async function hasAccess(sessionId, requiredTier) {
  const tiers = requiredTier === 'premium' ? ['premium'] : ['full', 'premium'];
  const result = await pool.query(
    `SELECT id FROM purchases WHERE session_id = $1 AND tier = ANY($2) LIMIT 1`,
    [sessionId, tiers]
  );
  return result.rows.length > 0;
}

// Check access by email (used after payment when session might differ)
async function hasAccessByEmail(email, requiredTier) {
  if (!email) return false;
  const tiers = requiredTier === 'premium' ? ['premium'] : ['full', 'premium'];
  const result = await pool.query(
    `SELECT id FROM purchases WHERE email = $1 AND tier = ANY($2) LIMIT 1`,
    [email, tiers]
  );
  return result.rows.length > 0;
}

// Get most recent purchase for a session
async function getLatestPurchase(sessionId) {
  const result = await pool.query(
    `SELECT * FROM purchases WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [sessionId]
  );
  return result.rows[0] || null;
}

// Restore purchase: re-link an email's purchase to the current session.
// Returns the matched purchase row, or null if none found.
// Also updates the session_id on the purchase row so future hasAccess() checks hit it.
async function restorePurchaseByEmail(email, newSessionId) {
  if (!email || !newSessionId) return null;

  // Find the most recent paid purchase for this email
  const findResult = await pool.query(
    `SELECT * FROM purchases WHERE email = $1 AND tier IN ('full','premium')
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );
  const purchase = findResult.rows[0];
  if (!purchase) return null;

  // Update session_id so hasAccess(newSessionId) works going forward
  await pool.query(
    `UPDATE purchases SET session_id = $1 WHERE id = $2`,
    [newSessionId, purchase.id]
  );

  return { ...purchase, session_id: newSessionId };
}

module.exports = { setPool, recordPurchase, hasAccess, hasAccessByEmail, getLatestPurchase, restorePurchaseByEmail };
