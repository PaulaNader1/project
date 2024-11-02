const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orderController');

// Route to create an order
router.post('/create', ordersController.createOrder);

// Route to get order details by order ID
router.get('/:orderId', ordersController.getOrderById);

// Route to update order status by order ID
router.put('/:orderId/status', ordersController.updateOrderStatus);

module.exports = router;
