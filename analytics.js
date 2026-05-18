/**
 * db/analytics.js
 * Owns: page_views and conversion_events tables
 * Does NOT own: HTTP responses, session management (those live at the routes layer)
 */

let pool;

// Set by db/index.js on boot
function setPool(p) {
  pool = p;
}

// ── Page Views ────────────────────────────────────────────────────────────────

// Record a single page view. Idempotent per call — no conflict handling needed.
async function recordPageView({ sessionId, path, referrer, utmSource, utmMedium, utmCampaign, userAgent }) {
  await pool.query(
    `INSERT INTO page_views (session_id, path, referrer, utm_source, utm_medium, utm_campaign, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sessionId, path, referrer || null, utmSource || null, utmMedium || null, utmCampaign || null, userAgent || null]
  );
}

// ── Conversion Events ──────────────────────────────────────────────────────────

// Record a conversion event. Idempotent — first occurrence per session/event_type only.
// Subsequent calls with the same session_id + event_type are silently ignored.
async function recordConversionEvent({ sessionId, eventType, metadata }) {
  await pool.query(
    `INSERT INTO conversion_events (session_id, event_type, metadata)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [sessionId, eventType, metadata ? JSON.stringify(metadata) : null]
  );
}

// ── Analytics Queries ─────────────────────────────────────────────────────────

// Page views for a specific path within a time window (hours)
async function getPageViewsByPath(path, hoursAgo) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM page_views
     WHERE path = $1 AND created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'`,
    [path]
  );
  return result.rows[0].count;
}

// Page views broken down by path within a time window
async function getPageViewsByPathAll(hoursAgo) {
  const result = await pool.query(
    `SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS unique_sessions
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'
     GROUP BY path
     ORDER BY views DESC`
  );
  return result.rows;
}

// Unique sessions per day within a time window
async function getUniqueSessionsPerDay(hoursAgo) {
  const result = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(DISTINCT session_id)::int AS unique_sessions
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );
  return result.rows;
}

// Total page views within a time window
async function getTotalPageViews(hoursAgo) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'`
  );
  return result.rows[0].count;
}

// Total unique sessions within a time window
async function getTotalUniqueSessions(hoursAgo) {
  const result = await pool.query(
    `SELECT COUNT(DISTINCT session_id)::int AS count
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'`
  );
  return result.rows[0].count;
}

// Conversion event counts by type within a time window
async function getConversionEventCounts(hoursAgo) {
  const result = await pool.query(
    `SELECT event_type, COUNT(*)::int AS count
     FROM conversion_events
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'
     GROUP BY event_type
     ORDER BY count DESC`
  );
  return result.rows;
}

// Total conversion events within a time window
async function getTotalConversionEvents(hoursAgo) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM conversion_events
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'`
  );
  return result.rows[0].count;
}

// Referrer breakdown (top referrers by session count)
async function getReferrerBreakdown(hoursAgo, limit = 10) {
  const result = await pool.query(
    `SELECT COALESCE(NULLIF(referrer, ''), 'direct') AS referrer,
            COUNT(*)::int AS views,
            COUNT(DISTINCT session_id)::int AS unique_sessions
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'
     GROUP BY referrer
     ORDER BY unique_sessions DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// UTM source breakdown
async function getUtmBreakdown(hoursAgo, limit = 10) {
  const result = await pool.query(
    `SELECT COALESCE(NULLIF(utm_source, ''), 'none') AS utm_source,
            COALESCE(NULLIF(utm_medium, ''), 'none') AS utm_medium,
            COALESCE(NULLIF(utm_campaign, ''), 'none') AS utm_campaign,
            COUNT(DISTINCT session_id)::int AS sessions,
            COUNT(*)::int AS page_views
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '${parseInt(hoursAgo)} hours'
       AND utm_source IS NOT NULL
     GROUP BY utm_source, utm_medium, utm_campaign
     ORDER BY sessions DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = {
  setPool,
  recordPageView,
  recordConversionEvent,
  getPageViewsByPath,
  getPageViewsByPathAll,
  getUniqueSessionsPerDay,
  getTotalPageViews,
  getTotalUniqueSessions,
  getConversionEventCounts,
  getTotalConversionEvents,
  getReferrerBreakdown,
  getUtmBreakdown,
};