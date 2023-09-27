const express = require('express');
const router = express.Router();

const {
    addCard,
} = require('../../controllers/cardsController');

router.route("/")
    .post(addCard)


module.exports = router;
