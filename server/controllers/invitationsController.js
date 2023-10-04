const Invitation = require("../models/Invitation");
const User = require("../models/User");

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
            .populate({
                path: 'invitedUserId',
                select: 'username profileImage'
            })
            .populate({
                path: 'invitedByUserId',
                select: 'username profileImage'
            });
        ;

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

module.exports = {
    getInvitations,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
};
