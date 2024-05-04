const express = require('express');
const router = express.Router();

const {
    getWritedowns,
    getWritedown,
    reorder,
    updateContent,
    updateTitle,
    updateHighlight,
    deleteWritedown,
} = require('../../controllers/writedownsController');

router.route("/")
    .get(getWritedowns)

router.route("/:id")
    .get(getWritedown)
    .delete(deleteWritedown)

router.route("/:id/rank")
    .get(reorder)

router.route("/:id/content")
    .get(updateContent)

router.route("/:id/title")
    .get(updateTitle)

router.route("/:id/highlight")
    .get(updateHighlight)

module.exports = router;
