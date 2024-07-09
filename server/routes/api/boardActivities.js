const express = require('express');
const router = express.Router();

const {
    getBoardActivities,
    deleteAllBoardActivities,
} = require('../../controllers/boardActivitiesController');

router.route("/:boardId")
    .get(getBoardActivities)
    .delete(deleteAllBoardActivities)

module.exports = router;
