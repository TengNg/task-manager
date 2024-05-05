const mongoose = require('mongoose');

const Board = require("../models/Board");
const BoardMembership = require("../models/BoardMembership");
const List = require("../models/List");
const Card = require("../models/Card");
const User = require("../models/User");

const { isActionAuthorized } = require('../services/boardActionAuthorizeService');
const { userByUsername: getUser } = require('../services/userService');

const getBoards = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const boards = await Board.find({
        $or: [
            { createdBy: foundUser._id },
            { members: foundUser._id },
        ]
    }).lean();

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

const getOwnedBoards = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const boards = await Board.find({ createdBy: foundUser._id }).lean();

    return res.json({ boards });
};

const getBoard = async (req, res) => {
    const { id } = req.params;
    const { username } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "board not found" });

    const foundUser = await User.findOne({ username });
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const board = await Board
        .findOne({
            _id: id,
            $or: [
                { visibility: 'public' },
                { createdBy: foundUser._id },
                { members: foundUser._id },
            ],
        })
        .populate({
            path: 'createdBy',
            select: 'username profileImage createdAt'
        })
        .populate({
            path: 'members',
            select: 'username profileImage createdAt'
        })

    if (!board) return res.status(404).json({ msg: "board not found" });

    // set recently viewed board
    if (foundUser.recentlyViewedBoardId !== board._id) {
        foundUser.recentlyViewedBoardId = board._id;
        foundUser.save();
    }

    const lists = await List.find({ boardId: id }).sort({ order: 'asc' });

    // for making sure board has correct list count
    board.listCount = lists.length;
    await board.save();

    const listsWithCardsPromises = lists.map(async (list) => {
        const cards = await Card.find({ listId: list._id }).sort({ order: 'asc' }).lean();

        return {
            ...list.toObject(),
            cards
        }
    })

    const listsWithCards = await Promise.all(listsWithCardsPromises);

    const memberships = await BoardMembership
        .find({ boardId: board._id })
        //.populate({
        //    path: 'userId',
        //    select: 'username '
        //})
        .lean();

    return res.json({
        board,
        lists: listsWithCards,
        memberships,
    });
}

const getBoardStats = async (req, res) => {
    const { id } = req.params;
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const foundBoard = await Board.findById(id)
        .populate({
            path: 'createdBy',
            select: 'username'
        })
        .populate({
            path: 'members',
            select: 'username'
        })
        .lean();

    if (!foundBoard) return res.status(403).json({ msg: "board not found" });

    const priorityLevelStats = await Card.aggregate([
        {
            $match: {
                boardId: mongoose.Types.ObjectId.createFromHexString(id),
            }
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: [{ $ifNull: ['$priorityLevel', null] }, null] },
                                { $eq: ['$priorityLevel', undefined] },
                                { $eq: ['$priorityLevel', ''] },
                            ]
                        },
                        then: 'none',
                        else: '$priorityLevel',
                    }
                },
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({ board: foundBoard, priorityLevelStats });
};

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

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const { username } = req.user;

    const { board, user: _, authorized } = await isActionAuthorized(id, username);

    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    board.title = title;
    board.save();

    return res.status(200).json({ msg: 'board updated', newBoard: board });
};

const updateDescription = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const { username } = req.user;

    const { board, user: _, authorized } = await isActionAuthorized(id, username);

    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    board.description = description;
    board.save();

    return res.status(200).json({ msg: 'board updated', newBoard: board });
};

const updateVisibility = async (req, res) => {
    const { id } = req.params;
    const { visibility } = req.body;
    const { username } = req.user;

    const { board, user: _, authorized } = await isActionAuthorized(id, username, { ownerOnly: true });

    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    board.visibility = visibility;
    board.save();
    return res.status(200).json({ msg: 'board updated', newBoard: board });
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

    const foundBoardMembership = await BoardMembership.findOne({ boardId: board._id, userId: user._id });
    if (foundBoardMembership) {
        await BoardMembership.deleteOne({ boardId: board._id, userId: user._id });
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

    await BoardMembership.deleteOne({
        boardId: board._id,
        userId: foundMember._id,
        role: 'member'
    });

    res.status(200).json({ msg: 'Member removed from the board successfully' });
};

const closeBoard = async (req, res) => {
    const { username } = req.user;
    const { id } = req.params;

    const { board: _board, user: _user, authorized } = await isActionAuthorized(id, username, { ownerOnly: true });
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    await Card.deleteMany({ boardId: id });
    await List.deleteMany({ boardId: id });
    await BoardMembership.deleteMany({ boardId: id });
    await Board.deleteOne({ _id: id });

    res.status(200).json({ msg: 'board closed' });
};

const copyBoard = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const { username } = req.user

    const { board: foundBoard, user: foundUser, authorized } = await isActionAuthorized(id, username, { ownerOnly: true });
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    const newBoardId = new mongoose.Types.ObjectId();
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
            const { title, description, order, highlight, priorityLevel } = card;
            const newCard = new Card({
                title,
                description,
                order,
                highlight,
                priorityLevel,
                boardId: newBoardId,
                listId: newListId,
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
    getOwnedBoards,
    getBoardStats,
    createBoard,
    getBoard,
    updateVisibility,
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
