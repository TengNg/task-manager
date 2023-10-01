const express = require('express');
const router = express.Router();

const {
    addCard,
    updateCard,
    updateTitle,
    reorder,
} = require('../../controllers/cardsController');

router.route("/")
    .post(addCard)

router.route(":/id")
    .put(updateCard)

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)


module.exports = router;
