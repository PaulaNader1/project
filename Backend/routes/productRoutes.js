const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productController');

// Route to get all products
router.get('/', productsController.getAllProducts);

module.exports = router;
