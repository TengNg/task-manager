const express = require('express');
const router = express.Router();

const {
    addCard,
    updateCard,
} = require('../../controllers/cardsController');

router.route("/")
    .post(addCard)

router.put(":/id")
    .put(updateCard)

module.exports = router;
