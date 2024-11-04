const orderModel = require('../models/orderModel');

// Controller to create an order
const createOrder = async (req, res) => {
    const { userId, products } = req.body; // Assuming `userId` and `products` array are sent in the request body
    console.log(userId);

    try {
        const order = await orderModel.createOrder(userId, products);
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// Controller to get order details by order ID
const getOrderById = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await orderModel.getOrderById(orderId);
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        await orderModel.updateOrderStatus(orderId, status);
        res.status(200).json({ message: `Order ${orderId} status updated to ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Controller to get all orders with user data
const getAllOrdersWithUserData = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrdersWithUserData();
        console.log(orders)
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


module.exports = { getAllOrdersWithUserData, createOrder, getOrderById, updateOrderStatus, getAllOrders};
