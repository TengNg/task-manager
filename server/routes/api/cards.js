const express = require('express');
const router = express.Router();

const {
    getCard,
    addCard,
    updateTitle,
    updateDescription,
    updateHighlight,
    updatePriorityLevel,
    deleteCard,
    reorder,
    copyCard,
    updateOwner,
} = require('../../controllers/cardsController');

router.route("/")
    .post(addCard)

router.route("/:id")
    .get(getCard)
    .delete(deleteCard)

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/:id/new-highlight")
    .put(updateHighlight)

router.route("/:id/copy")
    .post(copyCard)

router.route("/:id/member/update")
    .put(updateOwner)

router.route("/:id/priority/update")
    .put(updatePriorityLevel)

module.exports = router;
