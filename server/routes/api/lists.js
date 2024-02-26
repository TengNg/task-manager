const express = require('express');
const router = express.Router();

const {
    addList,
    updateLists,
    updateTitle,
    deleteList,
    copyList,
    reorder,
    moveList,
    getListCount,
} = require('../../controllers/listsController');

router.route("/b/:boardId/count")
    .get(getListCount);

router.route("/")
    .put(updateLists)
    .post(addList)

router.route("/:id")
    .delete(deleteList);

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/copy/:id")
    .post(copyList)

router.route("/move/:id/b/:boardId/i/:index")
    .post(moveList)

module.exports = router;
