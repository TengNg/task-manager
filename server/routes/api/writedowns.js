const express = require('express');
const router = express.Router();

const {
    getWritedowns,
    getWritedown,
    createWritedown,
    updateTitle,
    saveWritedown,
    pinWritedown,
    deleteWritedown,
} = require('../../controllers/writedownsController');

router.route("/")
    .get(getWritedowns)
    .post(createWritedown)

router.route("/:writedownId")
    .get(getWritedown)
    .delete(deleteWritedown)
    .put(saveWritedown)

router.route("/:writedownId/pin")
    .put(pinWritedown)

router.route("/:writedownId/update-title")
    .put(updateTitle);

module.exports = router;
