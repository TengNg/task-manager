const User = require("../models/User");
const Board = require("../models/Board");
const BoardActivity = require("../models/BoardActivity");

const getBoardActivities = async (req, res) => {
    const { username } = req.user;

    const foundUser = User.findOne({ username }).lean();
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const { boardId } = req.params;
    const foundBoard = await Board.findById(boardId).lean();
    if (!foundBoard) return res.status(404).json({ msg: "board not found" });

    let { perPage, page } = req.query;
    perPage = +perPage || 20;
    page = +page || 1;

    const activities = await BoardActivity
        .find({ board: boardId })
        .populate({
            path: 'user',
            select: '-_id username'
        })
        .populate({
            path: 'card',
            select: 'title'
        })
        .populate({
            path: 'list',
            select: '-_id title'
        })
        .sort({ createdAt: 'desc' })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean()

    return res.json({ activities });
};

module.exports = {
    getBoardActivities
};
