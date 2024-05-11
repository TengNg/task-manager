const express = require('express');
const router = express.Router();

const {
    getBoardActivities,
} = require('../../controllers/boardActivitiesController');

router.route("/:boardId")
    .get(getBoardActivities);

module.exports = router;
