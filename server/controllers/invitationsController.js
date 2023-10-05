const Invitation = require("../models/Invitation");
const User = require("../models/User");
const Board = require("../models/Board");

const getUser = (username) => {
    const foundUser = User.findOne({ username });
    return foundUser;
};

const getInvitations = async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendInvitation = async (req, res) => {
    try {
        const { username } = req.user;
        const sender = await getUser(username);
        if (!sender) return res.status(403).json({ msg: "Cannot send invitation" });

        const { boardId, receiverName } = req.body;

        const receiver = await getUser(receiverName);
        if (!receiver) return res.status(404).json({ msg: "Username is not found" });

        const board = await Board.findById(boardId);
        if (board.members.indexOf(receiver._id) !== -1) return res.status(409).json({ msg: "User is already in this board" });

        const foundInvitation = await Invitation
            .findOne({
                invitedByUserId: sender._id,
                invitedUserId: receiver._id,
                status: { $in: ['pending', 'accepted'] }
            })
            .sort({ createdAt: -1 })

        if (foundInvitation) return res.status(409).json({ msg: "Invitation is already sent" }); // Conflict

        const invitation = new Invitation({
            boardId,
            invitedUserId: receiver._id,
            invitedByUserId: sender._id,
        })

        await invitation.save();
        res.status(201).json(invitation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await Invitation.findByIdAndUpdate(
            id,
            { status: 'accepted' },
            { new: true }
        );

        const { boardId, invitedUserId } = invitation;

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        if (!board.members.includes(invitedUserId)) {
            board.members.push(invitedUserId);
            await board.save(); // Save the board to persist the changes
        }

        res.json({ invitation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const rejectInvitation = async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await Invitation.findByIdAndUpdate(
            id,
            { status: 'rejected' },
            { new: true }
        );

        res.json({ invitation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const removeInvitation = async (req, res) => {
    try {
        const { id } = req.params;

        const removed = await Invitation.findByIdAndRemove(id);

        if (!removed) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        res.status(200).json({ message: 'Invitation removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getInvitations,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    removeInvitation,
};
