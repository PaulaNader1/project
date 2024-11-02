const pool = require('./db'); // Import the pool from db.js
const bcrypt = require('bcryptjs');

// Function to create a new user (signup)
const createUser = async (email, password) => {
   try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
         'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
         [email, hashedPassword]
      );
      return result.rows[0];
   } catch (err) {
      throw err;
   }
};

// Function to get user by email (login)
const getUserByEmail = async (email) => {
   try {
      const result = await pool.query(
         'SELECT * FROM users WHERE email = $1',
         [email]
      );
      return result.rows[0];
   } catch (err) {
      throw err;
   }
};

module.exports = { createUser, getUserByEmail };
