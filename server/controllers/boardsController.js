const mongoose = require('mongoose');

const Board = require("../models/Board");
const BoardMembership = require("../models/BoardMembership");
const List = require("../models/List");
const Card = require("../models/Card");
const User = require("../models/User");

const { isActionAuthorized } = require('../services/boardActionAuthorizeService');
const { userByUsername: getUser } = require('../services/userService');

const saveBoardActivity = require('../services/saveBoardActivity');

const getBoards = async (req, res) => {
    const { userId } = req.user;
    const { filter } = req.query;

    const boards = await Board.find({
        $or: [{ createdBy: userId }, { members: userId }]
    }).sort({ title: 'asc' }).lean();

    const mapped = boards.map(board => {
        const owned = board.createdBy.toString() === userId;
        return {
            ...board,
            owned
        }
    });

    const ownedBoardsCount = mapped.filter(b => b.owned === true).length;
    const joinedBoardsCount = mapped.length - ownedBoardsCount;

    let validStatus = "";
    if (filter && Array.isArray(filter) && filter.length > 0) {
        validStatus = filter[0];
    } else {
        validStatus = filter;
    }

    let filtered = [...mapped];
    if (validStatus === "owned") {
        filtered = filtered.filter(b => b.owned);
    } else if (validStatus === "joined") {
        filtered = filtered.filter(b => !b.owned);
    }

    return res.json({
        boards: filtered,
        total: mapped.length,
        totalOwned: ownedBoardsCount,
        totalJoined: joinedBoardsCount
    });
};

const getOwnedBoards = async (req, res) => {
    const { userId } = req.user;
    const boards = await Board.find({ createdBy: userId }).lean();
    return res.json({ boards });
};

const getBoard = async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'invalid board-id' });
    }

    const board = await Board
        .findOne({
            _id: id,
            $or: [
                { visibility: 'public' },
                { createdBy: userId },
                { members: userId },
            ],
        })
        .populate({
            path: 'createdBy',
            select: 'username createdAt'
        })
        .populate({
            path: 'members',
            select: 'username createdAt'
        })

    if (!board) {
        return res.status(400).json({ msg: 'board not found' });
    }

    // sync list count
    const listCount = await List.countDocuments({ boardId: id });
    board.listCount = listCount;

    // sync card count
    const cardCount = await Card.countDocuments({ boardId: id });
    board.cardCount = cardCount;

    await board.save();

    const listsWithCards = await List.aggregate([
        {
            $match: {
                boardId: board._id
            }
        },
        {
            $lookup: {
                from: 'cards',
                let: { id: '$_id' },
                as: 'cards',
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$listId', '$$id'] }
                        }
                    },
                    {
                        $sort: { order: 1 }
                    },
                    {
                        $project: { description: 0, updatedAt: 0 }
                    }
                ]
            }
        },
        {
            $sort: { order: 1 }
        }
    ]);

    const memberships = await BoardMembership
        .find({ boardId: board._id })
        .lean();

    return res.json({
        board,
        lists: listsWithCards,
        memberships,
    });
}

const getBoardStats = async (req, res) => {
    const { id } = req.params;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0)
    const staleCardCount = await Card.countDocuments({
        boardId: id,
        dueDate: { $lt: today }
    });

    res.status(200).json({ board: foundBoard, priorityLevelStats, staleCardCount });
};

const createBoard = async (req, res) => {
    const { userId } = req.user;
    const { title, description } = req.body;
    const newBoard = new Board({
        title,
        description,
        createdBy: userId
    });
    await newBoard.save();
    return res.status(201).json({ msg: 'new board created', newBoard });
};

const updateTitle = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const { userId } = req.user;

    const { board, authorized } = await isActionAuthorized(id, userId);
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    const currentTitle = board.title;

    board.title = title;
    board.save();

    if (title !== currentTitle) {
        await saveBoardActivity({
            boardId: id,
            userId,
            action: "update board title",
            type: "board",
            description: `${currentTitle} > ${title}`,
        })
    }

    return res.status(200).json({ msg: 'board updated', newBoard: board });
};

const updateDescription = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const { userId } = req.user;

    const { board, authorized } = await isActionAuthorized(id, userId);

    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    const currentDescription = board.description;

    board.description = description;
    board.save();

    if (description !== currentDescription) {
        await saveBoardActivity({
            boardId: id,
            userId,
            action: "update board description",
            type: "board",
            description: board.description,
        })
    }

    return res.status(200).json({ msg: 'board updated', newBoard: board });
};

const updateVisibility = async (req, res) => {
    const { id } = req.params;
    const { visibility } = req.body;
    const { userId } = req.user;

    const { board, authorized } = await isActionAuthorized(id, userId, { ownerOnly: true });
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    board.visibility = visibility;
    board.save();

    return res.status(200).json({ msg: 'board updated', newBoard: board });
};

const leaveBoard = async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;

    const { board, authorized } = await isActionAuthorized(id, userId, { ownerOnly: false });
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    const indexOfMember = board.members.indexOf(userId);
    if (indexOfMember !== -1) {
        board.members.splice(indexOfMember, 1);
        await board.save();
    } else {
        return res.status(404).json({ error: 'Member not found' });
    }

    const foundBoardMembership = await BoardMembership.findOne({ boardId: board._id, userId });
    if (foundBoardMembership) {
        await BoardMembership.deleteOne({ boardId: board._id, userId });
    }

    res.status(200).json({ msg: 'Member removed from the board successfully' });
};

const removeMemberFromBoard = async (req, res) => {
    const { userId } = req.user;
    const { id, memberName } = req.params;

    const { board, authorized } = await isActionAuthorized(id, userId, { ownerOnly: false });
    if (!authorized) {
        return res.status(403).json({ error: "unauthorized" });
    }

    const foundMember = await getUser(memberName);
    if (!foundMember || board.createdBy.toString() === foundMember._id.toString()) {
        return res.status(401).json({ error: 'unauthorized' });
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
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { userId } = req.user;
        const { id } = req.params;

        const { board: _board, user: _user, authorized } = await isActionAuthorized(id, userId, { ownerOnly: true });
        if (!authorized) return res.status(403).json({ msg: "unauthorized" });

        await Card.deleteMany({ boardId: id }, { session });
        await List.deleteMany({ boardId: id }, { session });
        await BoardMembership.deleteMany({ boardId: id }, { session });
        await Board.deleteOne({ _id: id }, { session });

        throw "Close board: Testing"

        await session.commitTransaction();

        res.status(200).json({ msg: 'board closed' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const copyBoard = async (req, res) => {
    const session = mongoose.startSession();

    try {

        const { id } = req.params;
        const { title, description } = req.body;
        const { userId } = req.user

        const { board: foundBoard, authorized } = await isActionAuthorized(id, userId, { ownerOnly: true });
        if (!authorized) return res.status(403).json({ msg: "unauthorized" });

        const newBoardId = new mongoose.Types.ObjectId();
        const lists = await List.find({ boardId: foundBoard.id });

        const newBoard = new Board({
            _id: newBoardId,
            title: title || foundBoard.title,
            description: description || foundBoard.description,
            createdBy: userId,
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

        await session.commitTransaction();

        return res.status(200).json({ msg: 'board copied' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const togglePinBoard = async (req, res) => {
    const { userId, username } = req.user;
    const { id } = req.params;

    const { board: foundBoard, authorized } = await isActionAuthorized(id, userId, { ownerOnly: false });
    if (!authorized) return res.status(403).json({ msg: "unauthorized" });

    const foundUser = await getUser(username, { lean: false });
    if (foundUser.pinnedBoardIdCollection && foundUser.pinnedBoardIdCollection.has(id)) {
        const result = await User.findOneAndUpdate(
            { _id: userId },
            { $unset: { [`pinnedBoardIdCollection.${id}`]: 1 } },
            { new: true }
        ).select('pinnedBoardIdCollection');
        return res.status(200).json({ result });
    } else {
        const result = await User.findOneAndUpdate(
            { _id: userId },
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
    cleanPinnedBoardsCollection,
};
