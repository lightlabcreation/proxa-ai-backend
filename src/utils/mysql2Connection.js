// MySQL2 connection utility for license operations
const mysql = require('mysql2/promise');
require('dotenv').config();

// Support both DB_USER and DB_USERNAME for Railway compatibility
const { DB_HOST, DB_NAME, DB_USERNAME, DB_USER, DB_PASSWORD, NODE_ENV, DB_SSL } = process.env;
const dbUsername = DB_USERNAME || DB_USER; // Railway may use DB_USER

// Determine if SSL is required
// SSL is required in production (Railway) but NOT in local development
// Can also be explicitly controlled via DB_SSL environment variable
const isProduction = NODE_ENV === 'production';
const requiresSSL = DB_SSL === 'true' || (DB_SSL !== 'false' && isProduction);

// Build connection pool configuration
const poolConfig = {
  host: DB_HOST,
  user: dbUsername,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL configuration ONLY for production/Railway
if (requiresSSL) {
  poolConfig.ssl = {
    rejectUnauthorized: false // Railway uses self-signed certificates
  };
  console.log('🔒 MySQL2 pool: SSL enabled (Production mode)');
} else {
  console.log('🔓 MySQL2 pool: SSL disabled (Development mode)');
}

// Create connection pool
const pool = mysql.createPool(poolConfig);

module.exports = pool;
