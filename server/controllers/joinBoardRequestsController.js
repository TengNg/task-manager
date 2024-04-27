const Board = require("../models/Board");
const JoinBoardRequest = require("../models/JoinBoardRequest");

const mongoose = require('mongoose');

const { userByUsername: getUser } = require('../services/userService');

const findUser = async (req, res) => {
    const { username } = req.user;
    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });
    return foundUser;
};

const findBoard = async (req, res) => {
    const { boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) return res.status(403).json({ msg: "board not found, invalid id" });

    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) return res.status(403).json({ msg: "board not found" });
    return foundBoard;
};

const findUserAndBoard = async (req, res) => {
    const foundUser = await findUser(req, res);
    const foundBoard = await findBoard(req, res);
    return { foundUser, foundBoard };
};

const getAllRequests = async (req, res) => {
    const foundUser = await findUser(req, res);

    const ownedBoardIds = await Board.find({ createdBy: foundUser._id }).distinct('_id').lean();

    const joinRequests = await JoinBoardRequest
        .find({
            boardId: { $in: ownedBoardIds }
        })
        .populate({
            path: 'requester',
            select: 'username profileImage createdAt'
        })
        .populate({
            path: 'boardId',
            select: 'title description visibility listCount',
            populate: {
                path: 'createdBy',
                select: 'username'
            }
        })
        .sort({ createdAt: -1 })
        .lean();
    return res.json({ joinRequests });
};

const getBoardRequests = async (req, res) => {
    const { foundUser: _foundUser, foundBoard } = await findUserAndBoard(req, res);
    const joinRequests = await JoinBoardRequest.find({ boardId: foundBoard._id }).populate('requester').lean();
    return res.json({ joinRequests });
};

const sendRequest = async (req, res) => {
    const { foundUser, foundBoard } = await findUserAndBoard(req, res);

    if (foundBoard.members.includes(foundUser._id)) return res.status(409).json({ msg: 'already a member' });

    const joinRequestExists = await JoinBoardRequest.findOne({ boardId: foundBoard._id, requester: foundUser._id });
    if (joinRequestExists) return res.status(409).json({ msg: 'join request already sent' });

    const joinRequest = new JoinBoardRequest({
        boardId: foundBoard._id,
        requester: foundUser._id
    });

    await joinRequest.save();
    return res.status(201).json({ msg: 'join request sent' });
};

const acceptRequest = async (req, res) => {
    const { foundUser, foundBoard } = await findUserAndBoard(req, res);

    if (foundBoard.members.includes(foundUser._id)) return res.status(409).json({ msg: 'already a member' });

    const { requesterName } = req.body;
    const requester = await getUser(requesterName);
    if (!requester) return res.status(403).json({ msg: "requester not found" });

    const acceptedRequest = await JoinBoardRequest.findOneAndUpdate(
        { boardId: foundBoard._id, requester: requester._id },
        { status: 'accepted' },
        { new: true }
    );

    if (!acceptedRequest) return res.status(403).json({ msg: "request not found" });

    foundBoard.members.push(requester._id);
    foundBoard.save();

    return res.json({ msg: 'request accepted' });
};

const rejectRequest = async (req, res) => {
    const { foundUser, foundBoard } = await findUserAndBoard(req, res);

    if (foundBoard.members.includes(foundUser._id)) return res.status(409).json({ msg: 'already a member' });

    const { requesterName } = req.body;
    const requester = await getUser(requesterName);
    if (!requester) return res.status(403).json({ msg: "requester not found" });

    const rejectedRequest = await JoinBoardRequest.findOneAndUpdate(
        { boardId: foundBoard._id, requester: requester._id },
        { status: 'declined' },
        { new: true }
    );

    if (!rejectedRequest) return res.status(403).json({ msg: "request not found" });

    return res.json({ msg: 'request rejected' });
};

const removeRequest = async (req, res) => {
    const { foundUser: _, foundBoard } = await findUserAndBoard(req, res);

    const { requesterName } = req.body;
    const requester = await getUser(requesterName);
    if (!requester) return res.status(403).json({ msg: "requester not found" });

    const removedRequest = await JoinBoardRequest.findOneAndDelete({ boardId: foundBoard._id, requester: requester._id });
    if (!removedRequest) return res.status(403).json({ msg: "request not found" });

    return res.json({ removedRequest });
};

module.exports = {
    getAllRequests,
    getBoardRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeRequest,
};

