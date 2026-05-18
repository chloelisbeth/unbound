/**
 * lib/track.js
 * Fire-and-forget analytics helpers used by middleware and route handlers.
 * These functions return immediately — tracking failures never block responses.
 */

const analyticsDb = require('../db/analytics');

// Extract UTM params from a URLSearchParams or raw query string
function extractUtms(req) {
  const params = req.query || {};
  return {
    utmSource: params.utm_source || null,
    utmMedium: params.utm_medium || null,
    utmCampaign: params.utm_campaign || null,
  };
}

// Ensure the session has a stable ID for anonymous tracking.
// cookie-session creates req.session.uid lazily on first write.
function getSessionId(req) {
  if (!req.session.uid) {
    req.session.uid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return req.session.uid;
}

// Record a page view — fire and forget, never blocks.
function recordPageView(req, path) {
  const sessionId = getSessionId(req);
  const { utmSource, utmMedium, utmCampaign } = extractUtms(req);
  analyticsDb.recordPageView({
    sessionId,
    path,
    referrer: req.get('referer') || null,
    utmSource,
    utmMedium,
    utmCampaign,
    userAgent: req.get('user-agent') || null,
  }).catch((err) => console.error('track: recordPageView error:', err.message));
}

// Record a conversion event — fire and forget, never blocks.
// First-occurrence-only semantics enforced by db layer (ON CONFLICT DO NOTHING).
function trackConversion(req, eventType, metadata) {
  const sessionId = getSessionId(req);
  analyticsDb.recordConversionEvent({
    sessionId,
    eventType,
    metadata,
  }).catch((err) => console.error('track: trackConversion error:', err.message));
}

module.exports = { getSessionId, recordPageView, trackConversion };