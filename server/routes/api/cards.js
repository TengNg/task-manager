const express = require('express');
const router = express.Router();

const {
    addCard,
    updateCard,
    updateTitle,
    updateDescription,
    updateHighlight,
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

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/:id/new-highlight")
    .put(updateHighlight)

module.exports = router;
