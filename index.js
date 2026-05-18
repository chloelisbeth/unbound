/**
 * db/index.js
 * Owns: database pool construction — the ONLY place `new Pool()` is created
 * Does NOT own: query logic (lives in db/<entity>.js files)
 */

const { Pool } = require('pg');
const lessonsDb = require('./lessons');
const purchasesDb = require('./purchases');
const subscribersDb = require('./subscribers');
const emailSeqDb = require('./email-sequence');
const resetSeqDb = require('./reset-sequence');
const analyticsDb = require('./analytics');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

// Inject pool into domain db modules
lessonsDb.setPool(pool);
purchasesDb.setPool(pool);
subscribersDb.setPool(pool);
emailSeqDb.setPool(pool);
resetSeqDb.setPool(pool);
analyticsDb.setPool(pool);

module.exports = { pool };
