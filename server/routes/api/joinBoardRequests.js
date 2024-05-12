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
    .post(sendRequest)

router.route("/:boardId")
    .get(getBoardRequests)

router.route("/:requestId")
    .delete(removeRequest)

router.route("/:requestId/accept")
    .put(acceptRequest)

router.route("/:requestId/reject")
    .put(rejectRequest)

module.exports = router;

