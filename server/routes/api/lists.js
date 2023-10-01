const express = require('express');
const router = express.Router();

const {
    addList,
    updateLists,
    updateListsCards,
    updateTitle,
    reorder,
} = require('../../controllers/listsController');

router.route("/")
    .put(updateLists)
    .post(addList)

router.route("/cards")
    .put(updateListsCards)

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)


module.exports = router;
