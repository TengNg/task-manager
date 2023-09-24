const express = require('express');
const router = express.Router();

const {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
} = require('../../controllers/boardsController');

const { authenticateToken } = require("../../middlewares/authenticateToken");

router.route("/")
    .get(authenticateToken, getBoards)
    .post(authenticateToken, createBoard)

router.route("/:id")
    .get(getBoard)
    .put(updateBoard)


module.exports = router;
