const express = require('express');
const router = express.Router();

const {
    addList,
    updateLists,
    updateTitle,
    deleteList,
    reorder,
} = require('../../controllers/listsController');

router.route("/")
    .put(updateLists)
    .post(addList)

router.route("/:id")
    .delete(deleteList);

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)


module.exports = router;
