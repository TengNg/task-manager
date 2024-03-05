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
    togglePinBoard,
    deletePinnedBoard,
    updatePinnedBoardsCollection,
} = require('../../controllers/boardsController');

router.route("/")
    .get(getBoards)
    .post(createBoard)

router.route("/:id")
    .get(getBoard)
    .put(updateBoard)
    .delete(closeBoard)

router.route("/:id/members/:memberName")
    .put(removeMemberFromBoard)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/copy/:id")
    .post(copyBoard)

router.route("/:id/pinned")
    .put(togglePinBoard)
    .delete(deletePinnedBoard)

router.route("/pinned/save")
    .put(updatePinnedBoardsCollection)

module.exports = router;
