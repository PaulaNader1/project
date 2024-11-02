const { Pool } = require('pg'); // Use 'pg' if you are using the pg package
require('dotenv').config();

const pool = new Pool({
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   password: process.env.DB_PASS,
   port: process.env.DB_PORT,
});

// Check the database connection
pool.connect((err) => {
   if (err) {
      console.error('Database connection error:', err.stack);
   } else {
      console.log('Database connected successfully');
   }
});

module.exports = pool;
