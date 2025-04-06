const express = require('express');
const router = express.Router();

const {
    getBoards,
    getOwnedBoards,
    getBoardStats,
    createBoard,
    getBoard,
    updateVisibility,
    updateTitle,
    updateDescription,
    leaveBoard,
    removeMemberFromBoard,
    closeBoard,
    copyBoard,
    togglePinBoard,
    deletePinnedBoard,
    cleanPinnedBoardsCollection,
    updatePinnedBoardsCollection,
} = require('../../controllers/boardsController');

router.route("/")
    .get(getBoards)
    .post(createBoard)

router.route("/owned")
    .get(getOwnedBoards)

router.route("/:id")
    .get(getBoard)
    .delete(closeBoard)

router.route("/:id/stats")
    .get(getBoardStats)

router.route("/:id/members/leave")
    .put(leaveBoard)

router.route("/:id/members/:memberName")
    .put(removeMemberFromBoard)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/:id/new-visibility")
    .put(updateVisibility)

router.route("/copy/:id")
    .post(copyBoard)

router.route("/:id/pinned")
    .put(togglePinBoard)
    .delete(deletePinnedBoard)

router.route("/pinned/update")
    .put(updatePinnedBoardsCollection)

router.route("/pinned/clean")
    .put(cleanPinnedBoardsCollection)

module.exports = router;
