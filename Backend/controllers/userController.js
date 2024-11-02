const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    const { email, password } = req.body;

    // Validate password strength
    if (password.length < 8 || !/[!@#$%^&*]/.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and contain a special character.' });
    }

    try {
        // Check if the email is already registered
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Create the new user
        const user = await userModel.createUser(email, password);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const id = user.id;
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, id });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const userInfo = await userModel.getUserById(userId);
        const userOrders = await orderModel.getOrdersByUserId(userId);
        res.json({ userInfo, userOrders });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to retrieve profile information' });
    }
};

module.exports = { signup, login, getUserProfile };
