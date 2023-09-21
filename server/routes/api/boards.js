const express = require('express');
const router = express.Router();

const {
    getBoards,
    createBoard,
    getBoard,
} = require('../../controllers/boardsController');

const { authenticateToken } = require("../../middlewares/authenticateToken");

router.route("/")
    .get(authenticateToken, getBoards)
    .post(authenticateToken, createBoard)

router.route("/:id")
    .get(getBoard)


module.exports = router;
