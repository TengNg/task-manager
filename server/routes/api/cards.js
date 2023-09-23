const express = require('express');
const router = express.Router();

const {
    addCard,
} = require('../../controllers/cardsController');

const { authenticateToken } = require("../../middlewares/authenticateToken");

router.route("/")
    .post(addCard)


module.exports = router;
