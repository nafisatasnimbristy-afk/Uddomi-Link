const express = require('express');
const router = express.Router();
const { addRoleToUser, removeRoleFromUser } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addRoleToUser);
router.post('/remove', protect, removeRoleFromUser);

module.exports = router;
