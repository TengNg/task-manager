const Writedown = require("../models/Writedown");

const {
    saveNewWritedown,
    writedownsByUserId,
    handleAuthorizationAndGetWritedown,
} = require('../services/writedownService');

const getWritedowns = async (req, res) => {
    const { userId } = req.user;
    const writedowns = await writedownsByUserId(userId);
    return res.status(200).json({ writedowns });
};

const getWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    return res.status(200).json({ writedown });
};

const createWritedown = async (req, res) => {
    const { userId } = req.user;
    const { rank } = req.body;
    const newWritedown = await saveNewWritedown({ owner: userId, order: rank });
    return res.status(200).json({ msg: 'new writedown added', newWritedown });
};

const saveWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    const { content } = req.body;

    writedown.content = content;
    await writedown.save();

    const { _id, title, createdAt } = writedown;
    const updatedWritedown = { _id, title, content, createdAt }

    return res.status(200).json({ msg: 'writedown updated', updatedWritedown });
};

const pinWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.pinned = !writedown.pinned;
    await writedown.save();
    return res.status(200).json({ message: 'writedown pinned', pinned: writedown.pinned });
};

const updateTitle = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    const { title } = req.body;
    writedown.title = title;
    await writedown.save();
    return res.status(200).json({ message: 'writedown updated', newTitle: writedown.title });
};

const deleteWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    await Writedown.findByIdAndDelete(writedown._id);
    return res.status(200).json({ message: 'writedown deleted' });
};

const reorder = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    const { rank } = req.body;
    writedown.order = rank;
    await writedown.save();
    return res.status(204);
};

module.exports = {
    getWritedowns,
    getWritedown,
    createWritedown,
    saveWritedown,
    pinWritedown,
    updateTitle,
    deleteWritedown,
    reorder,
};
