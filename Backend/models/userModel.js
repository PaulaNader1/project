const pool = require('./db'); // Import the pool from db.js
const bcrypt = require('bcryptjs');

// Function to create a new user (signup)
const createUser = async (email, password, role = 'user') => {
   try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
         'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email',
         [email, hashedPassword, role]
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

const getUserById = async (id) => {
   try {
      const result = await pool.query(
         'SELECT * FROM users WHERE id = $1',
         [id]
      );
      return result.rows[0];
   } catch (err) {
      throw err;
   }
};

const updateUserStatus = async (userId, status) => {
   if (!userId || isNaN(userId)) {
       console.warn('Invalid userId for status update:', userId);
       return;
   }

   try {
       await pool.query(
           'UPDATE users SET status = $1 WHERE id = $2',
           [status, userId]
       );
       console.log("user status updated")
   } catch (err) {
       console.error('Error updating user status:', err);
       throw err;
   }
};


module.exports = {updateUserStatus, createUser, getUserByEmail, getUserById };
