const express = require('express');
const router = express.Router();

const {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
    updateTitle,
    updateDescription,
    removeMemberFromBoard,
    closeBoard,
    copyBoard,
} = require('../../controllers/boardsController');

router.route("/")
    .get(getBoards)
    .post(createBoard)

router.route("/:id")
    .get(getBoard)
    .put(updateBoard)
    .delete(closeBoard)

router.route("/:id/members/:memberId")
    .put(removeMemberFromBoard)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/copy/:id")
    .post(copyBoard)

module.exports = router;
