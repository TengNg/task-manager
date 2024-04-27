const express = require('express');
const router = express.Router();

const {
    getAllRequests,
    getBoardRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeRequest,
} = require("../../controllers/joinBoardRequestsController");

router.route("/")
    .get(getAllRequests)

router.route("/:boardId")
    .get(getBoardRequests)
    .post(sendRequest)
    .delete(removeRequest)

router.route("/:boardId/accept")
    .put(acceptRequest)

router.route("/:boardId/reject")
    .put(rejectRequest)

module.exports = router;

