/**
 * db/lessons.js
 * Owns: modules, lessons, lesson_progress tables
 * Does NOT own: user authentication, session management, payment state
 */

let pool;

function setPool(p) {
  pool = p;
}

// Fetch all modules with their lesson counts
async function getAllModules() {
  const result = await pool.query(`
    SELECT m.*,
      COUNT(l.id)::int AS lesson_count
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id
    GROUP BY m.id
    ORDER BY m.sort_order
  `);
  return result.rows;
}

// Fetch a single module by slug
async function getModuleBySlug(slug) {
  const result = await pool.query(
    'SELECT * FROM modules WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

// Fetch all lessons for a module, ordered
async function getLessonsForModule(moduleId) {
  const result = await pool.query(
    'SELECT * FROM lessons WHERE module_id = $1 ORDER BY sort_order',
    [moduleId]
  );
  return result.rows;
}

// Fetch one lesson by module slug + lesson slug
async function getLessonBySlug(moduleSlug, lessonSlug) {
  const result = await pool.query(
    `SELECT l.*, m.slug AS module_slug, m.title AS module_title
     FROM lessons l
     JOIN modules m ON m.id = l.module_id
     WHERE m.slug = $1 AND l.slug = $2`,
    [moduleSlug, lessonSlug]
  );
  return result.rows[0] || null;
}

// Get prev/next lessons for navigation
async function getAdjacentLessons(moduleId, sortOrder) {
  const [prevResult, nextResult] = await Promise.all([
    pool.query(
      `SELECT slug, title FROM lessons
       WHERE module_id = $1 AND sort_order < $2
       ORDER BY sort_order DESC LIMIT 1`,
      [moduleId, sortOrder]
    ),
    pool.query(
      `SELECT slug, title FROM lessons
       WHERE module_id = $1 AND sort_order > $2
       ORDER BY sort_order ASC LIMIT 1`,
      [moduleId, sortOrder]
    ),
  ]);
  return {
    prev: prevResult.rows[0] || null,
    next: nextResult.rows[0] || null,
  };
}

// Get set of completed lesson IDs for a session
async function getCompletedLessonIds(sessionId) {
  const result = await pool.query(
    'SELECT lesson_id FROM lesson_progress WHERE session_id = $1',
    [sessionId]
  );
  return new Set(result.rows.map((r) => r.lesson_id));
}

// Mark a lesson as complete for a session (idempotent)
async function markLessonComplete(sessionId, lessonId) {
  await pool.query(
    `INSERT INTO lesson_progress (session_id, lesson_id)
     VALUES ($1, $2)
     ON CONFLICT (session_id, lesson_id) DO NOTHING`,
    [sessionId, lessonId]
  );
}

// Get first incomplete lesson in a module for "resume" UX
async function getFirstIncompleteLessonSlug(sessionId, moduleId) {
  const result = await pool.query(
    `SELECT l.slug
     FROM lessons l
     LEFT JOIN lesson_progress lp
       ON lp.lesson_id = l.id AND lp.session_id = $1
     WHERE l.module_id = $2 AND lp.id IS NULL
     ORDER BY l.sort_order
     LIMIT 1`,
    [sessionId, moduleId]
  );
  return result.rows[0]?.slug || null;
}

module.exports = {
  setPool,
  getAllModules,
  getModuleBySlug,
  getLessonsForModule,
  getLessonBySlug,
  getAdjacentLessons,
  getCompletedLessonIds,
  markLessonComplete,
  getFirstIncompleteLessonSlug,
};
