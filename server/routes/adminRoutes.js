const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/users', protect, requireAdmin, getAllUsers);
router.delete('/users/:id', protect, requireAdmin, deleteUser);
router.put('/users/:id/role', protect, requireAdmin, updateUserRole);

module.exports = router;
