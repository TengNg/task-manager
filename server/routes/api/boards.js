const express = require('express');
const router = express.Router();

const {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
    updateTitle,
} = require('../../controllers/boardsController');

router.route("/")
    .get(getBoards)
    .post(createBoard)

router.route("/:id")
    .get(getBoard)
    .put(updateBoard)

router.route("/:id/new-title")
    .put(updateTitle)

module.exports = router;
