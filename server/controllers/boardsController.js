const mongoose = require('mongoose');

const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const User = require("../models/User");

const getUser = (username, option = { lean: true }) => {
    const foundUser = User.findOne({ username });
    if (option.lean) foundUser.lean();
    return foundUser;
};

const getBoards = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const boards = await Board.find({
        $or: [
            { createdBy: foundUser._id },
            { members: foundUser._id },
        ]
    });

    if (!foundUser.recentlyViewedBoardId) return res.json({ boards });

    const foundBoard = await Board.findById(foundUser.recentlyViewedBoardId);
    if (!foundBoard) return res.json({ boards });

    let recentlyViewedBoard = undefined;
    const indexOfMember = foundBoard.members.indexOf(foundUser._id);
    const isOwner = foundBoard.createdBy.toString() === foundUser._id.toString();
    if (indexOfMember !== -1 || isOwner) {
        recentlyViewedBoard = foundBoard;
    }

    return res.json({ boards, recentlyViewedBoard });
};

const getBoard = async (req, res) => {
    const { id } = req.params;
    const { username } = req.user;

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const board = await Board
        .findOne({
            _id: id,
            $or: [
                { createdBy: foundUser._id },
                { members: foundUser._id },
            ],
        })
        .sort({ createdAt: -1 })
        .populate({
            path: 'createdBy',
            select: 'username profileImage createdAt'
        })
        .populate({
            path: 'members',
            select: 'username profileImage createdAt'
        });

    if (!board) return res.status(404).json({ msg: "board not found" });

    // set recently viewed board
    if (foundUser.recentlyViewedBoardId !== board._id) {
        board.lastViewed = Date.now();
        foundUser.recentlyViewedBoardId = board._id;
        foundUser.save();
        board.save();
    }

    const lists = await List.find({ boardId: id }).sort({ order: 'asc' });

    const listsWithCardsPromises = lists.map(async (list) => {
        const cards = await Card.find({ listId: list._id }).sort({ order: 'asc' });
        return {
            ...list.toObject(),
            cards
        }
    })

    const listsWithCards = await Promise.all(listsWithCardsPromises);

    return res.json({
        board,
        lists: listsWithCards,
    });
}

const createBoard = async (req, res) => {
    const { title, description } = req.body;
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const newBoard = new Board({
        title,
        description,
        createdBy: foundUser._id
    });

    await newBoard.save();
    return res.status(201).json({ msg: 'new board created', newBoard });
};

const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const newBoard = await Board.findOneAndUpdate({ _id: id }, { title, description }, { new: true });
    return res.status(200).json({ msg: 'board updated', newBoard });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const newBoard = await Board.findOneAndUpdate({ _id: id }, { title }, { new: true });
    return res.status(200).json({ msg: 'board updated', newBoard });
};

const updateDescription = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const newBoard = await Board.findOneAndUpdate({ _id: id }, { description }, { new: true });
    return res.status(200).json({ msg: 'board updated', newBoard });
};

const leaveBoard = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) {
        return res.status(404).json({ error: 'Board not found' });
    }

    const user = await getUser(username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const indexOfMember = board.members.indexOf(user._id);
    if (indexOfMember !== -1) {
        board.members.splice(indexOfMember, 1);
        await board.save();
    } else {
        return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json({ msg: 'Member removed from the board successfully' });
};

const removeMemberFromBoard = async (req, res) => {
    const { username } = req.user;
    const { id, memberName } = req.params;

    const board = await Board.findById(id);
    if (!board) {
        return res.status(404).json({ error: 'Board not found' });
    }

    const user = await getUser(username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const foundMember = await getUser(memberName);
    if (board.createdBy.toString() === foundMember._id.toString()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const indexOfMember = board.members.indexOf(foundMember._id);
    if (indexOfMember !== -1) {
        board.members.splice(indexOfMember, 1);
        await board.save();
    } else {
        return res.status(404).json({ error: 'Member not found in the board' });
    }

    res.status(200).json({ msg: 'Member removed from the board successfully' });
};

const closeBoard = async (req, res) => {
    const { id } = req.params;
    const lists = await List.find({ boardId: id });

    const cardPromises = lists.map(async (list) => {
        await Card.deleteMany({ listId: list._id });
    });

    await Promise.all(cardPromises);
    await List.deleteMany({ boardId: id });
    await Board.findByIdAndDelete(id);

    res.status(200).json({ msg: 'board closed' });
};

const copyBoard = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const { username } = req.user

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const newBoardId = new mongoose.Types.ObjectId();
    const foundBoard = await Board.findById(id);
    const lists = await List.find({ boardId: foundBoard.id });

    const newBoard = new Board({
        _id: newBoardId,
        title: title || foundBoard.title,
        description: description || foundBoard.description,
        createdBy: foundUser._id
    });

    await newBoard.save();

    for (const list of lists) {
        const newListId = new mongoose.Types.ObjectId();
        const { _id, title, order } = list;
        const newList = new List({
            _id: newListId,
            title,
            order,
            boardId: newBoardId,
        });

        await newList.save();

        const cards = await Card.find({ listId: _id });
        for (const card of cards) {
            const { title, description, order, highlight } = card;
            const newCard = new Card({
                title,
                description,
                order,
                highlight,
                listId: newListId
            });

            await newCard.save();
        }
    }

    return res.status(200).json({ msg: 'board copied' });
};

const togglePinBoard = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;

    const foundBoard = await Board.findById(id);
    const foundUser = await getUser(username, { lean: false });

    if (!foundUser) return res.status(403).json({ msg: "user not found" });
    if (!foundBoard) return res.status(403).json({ msg: "board not found" });

    if (foundUser.pinnedBoardIdCollection && foundUser.pinnedBoardIdCollection.has(id)) {
        const result = await User.findOneAndUpdate(
            { username },
            { $unset: { [`pinnedBoardIdCollection.${id}`]: 1 } },
            { new: true }
        ).select('pinnedBoardIdCollection');
        return res.status(200).json({ result });
    } else {
        const result = await User.findOneAndUpdate(
            { username },
            { $set: { [`pinnedBoardIdCollection.${id}`]: { title: foundBoard?.title } } },
            { new: true, upsert: true }
        ).select('pinnedBoardIdCollection');
        return res.status(200).json({ result });
    }
};

const deletePinnedBoard = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;

    const foundUser = await getUser(username, { lean: false });
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    if (foundUser.pinnedBoardIdCollection && foundUser.pinnedBoardIdCollection.has(id)) {
        const result = await User.findOneAndUpdate(
            { username },
            { $unset: { [`pinnedBoardIdCollection.${id}`]: 1 } },
            { new: true }
        ).select('pinnedBoardIdCollection');
        return res.status(200).json({ result });
    }

    return res.status(404).json({ msg: 'pinned board not found' });
};

const updatePinnedBoardsCollection = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username, { lean: false });
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const result = await User.findOneAndUpdate(
        { username },
        { $unset: { ['pinnedBoardIdCollection']: 1 } },
        { new: true }
    ).select('pinnedBoardIdCollection');

    return res.status(200).json({ result });
};

const cleanPinnedBoardsCollection = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username, { lean: false });
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const result = await User.findOneAndUpdate(
        { username },
        { pinnedBoardIdCollection: {} },
        { new: true }
    ).select('pinnedBoardIdCollection');

    return res.status(200).json({ result });
};

module.exports = {
    getBoards,
    createBoard,
    getBoard,
    updateBoard,
    updateTitle,
    updateDescription,
    leaveBoard,
    removeMemberFromBoard,
    closeBoard,
    copyBoard,
    togglePinBoard,
    deletePinnedBoard,
    updatePinnedBoardsCollection,
    cleanPinnedBoardsCollection,
};
