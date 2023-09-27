const express = require('express');
const router = express.Router();

const {
    addList,
    updateLists,
    updateListsCards,
} = require('../../controllers/listsController');

router.route("/")
    .put(updateLists)
    .post(addList)

router.route("/cards")
    .put(updateListsCards)

module.exports = router;
