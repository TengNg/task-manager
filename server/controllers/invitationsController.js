const Invitation = require("../models/Invitation");
const User = require("../models/User");
const Board = require("../models/Board");
const BoardMembership = require("../models/BoardMembership");

const { MAX_BOARD_MEMBER_COUNT } = require('../data/limits');

const getUser = (username) => {
    const foundUser = User.findOne({ username }).lean();
    return foundUser;
};

const getInvitations = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const invitations = await Invitation
        .find({ invitedUserId: foundUser._id })
        .sort({ createdAt: -1 })
        .populate({
            path: 'invitedUserId',
            select: 'username profileImage createdAt'
        })
        .populate({
            path: 'invitedByUserId',
            select: 'username profileImage createdAt'
        });

    res.status(200).json({ invitations });
};

const sendInvitation = async (req, res) => {
    const { username } = req.user;
    const sender = await getUser(username);
    if (!sender) return res.status(403).json({ msg: "can't send invitation" });

    const { boardId, receiverName } = req.body;

    const receiver = await getUser(receiverName);
    if (!receiver) return res.status(404).json({ msg: "username is not found" });

    if (username === receiverName) return res.status(409).json({ msg: "can't send invitation" });

    const board = await Board.findById(boardId);
    if (board.members.indexOf(receiver._id) !== -1) return res.status(409).json({ msg: "this user is already in this board" });

    const foundInvitation = await Invitation
        .findOne({
            boardId,
            invitedByUserId: sender._id,
            invitedUserId: receiver._id,
            status: { $in: ['pending'] }
        })
        .sort({ createdAt: -1 })

    if (foundInvitation) return res.status(409).json({ msg: "invitation is already sent" }); // Conflict

    const invitation = new Invitation({
        boardId,
        invitedUserId: receiver._id,
        invitedByUserId: sender._id,
    })

    await invitation.save();
    res.status(201).json(invitation);
};

const acceptInvitation = async (req, res) => {
    const { id } = req.params;

    let invitation = await Invitation.findById(id);
    if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
    }

    const { boardId, invitedUserId } = invitation;
    const board = await Board.findById(boardId);
    if (!board) {
        return res.status(404).json({ error: 'Board not found' });
    }

    if (board.members.length >= MAX_BOARD_MEMBER_COUNT) {
        return res.status(409).json({ error: 'Board is full' });
    }

    const boardMembership = await BoardMembership.create({
        boardId,
        userId: invitedUserId,
        role: 'member',
    });

    if (!boardMembership) {
        return res.status(500).json({ error: 'Failed to create board membership' });
    }

    if (!board.members.includes(invitedUserId)) {
        board.members.push(invitedUserId);
        invitation.status = 'accepted';
        await board.save();
        await invitation.save();
    } else {
        return res.status(500).json({ error: 'Failed to add member to the board' });
    }

    res.json({ invitation });
}

const rejectInvitation = async (req, res) => {
    const { id } = req.params;

    const invitation = await Invitation.findByIdAndUpdate(
        id,
        { status: 'rejected' },
        { new: true }
    );

    res.json({ invitation });
}

const removeInvitation = async (req, res) => {
    const { id } = req.params;

    const removed = await Invitation.findByIdAndDelete(id);

    if (!removed) {
        return res.status(404).json({ error: 'Invitation not found' });
    }

    res.status(200).json({ message: 'Invitation removed successfully' });
};

module.exports = {
    getInvitations,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    removeInvitation,
};
