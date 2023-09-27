const express = require('express');
const router = express.Router();

const {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
} = require('../../controllers/boardsController');

router.route("/")
    .get(getBoards)
    .post(createBoard)

router.route("/:id")
    .get(getBoard)
    .put(updateBoard)


module.exports = router;
