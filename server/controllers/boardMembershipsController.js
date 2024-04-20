const mongoose = require('mongoose');

const Board = require("../models/Board");
const BoardMembership = require("../models/BoardMembership");

const getUser = (username, option = { lean: true }) => {
    const foundUser = User.findOne({ username });
    if (option.lean) foundUser.lean();
    return foundUser;
};

const getBoardMemberships = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const { boardId } = req.params;
    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) return res.status(404).json({ msg: "board not found" });

    const memberships = await BoardMembership.find({ boardId }).lean();

    return res.json({ memberships });
};

module.exports = {
    getBoardMemberships
};

