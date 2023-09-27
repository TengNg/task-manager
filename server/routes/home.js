const express = require('express');
const router = express.Router();
const { getUserInfo } = require('../controllers/homeController.js');
const authenticateToken = require('../middlewares/authenticateToken.js')

router.get('/', authenticateToken, getUserInfo);

module.exports = router;
