const express = require('express');
const router = express.Router();

const {
    addList,
    updateLists
} = require('../../controllers/listsController');

const { authenticateToken } = require("../../middlewares/authenticateToken");

router.route("/")
    .put(updateLists)
    .post(addList)


module.exports = router;
