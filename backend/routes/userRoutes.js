const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);
router.post('/updateProfile', userController.updateProfile);
router.post('/swapRequests', userController.requestSwap);
router.get('/messages', userController.getMessages);

module.exports = router;