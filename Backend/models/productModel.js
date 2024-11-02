const pool = require('./db'); // Import the pool from db.js

// Function to get all products
const getAllProducts = async () => {
    try {
        const result = await pool.query('SELECT * FROM products');
        return result.rows;
    } catch (err) {
        throw err;
    }
};

module.exports = { getAllProducts };
