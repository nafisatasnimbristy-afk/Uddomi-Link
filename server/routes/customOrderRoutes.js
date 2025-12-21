const express = require('express');
const router = express.Router();
const {
    createCustomOrder,
    getOrdersForSeller,
    getOrdersForCustomer,
    getOrderById,
    updateOrder,
    addMessage
} = require('../controllers/customOrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCustomOrder);
router.get('/seller/orders', protect, getOrdersForSeller);
router.get('/customer/orders', protect, getOrdersForCustomer);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, updateOrder);
router.post('/:id/message', protect, addMessage);

module.exports = router;
