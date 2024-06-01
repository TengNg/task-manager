const Writedown = require("../models/Writedown");

const { userByUsername: getUser } = require('../services/userService');
const { saveNewWritedown, writedownsByUserId, handleAuthorizationAndGetWritedown } = require('../services/writedownService');

const getWritedowns = async (req, res) => {
    const { username } = req.user;
    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });
    const writedowns = await writedownsByUserId(foundUser._id);
    return res.status(200).json({ writedowns });
};

const getWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    return res.status(200).json({ writedown });
};

const createWritedown = async (req, res) => {
    const { username } = req.user;

    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });

    const newWritedown = await saveNewWritedown({ owner: foundUser._id });

    return res.status(200).json({ msg: 'new writedown added', newWritedown });
};

const saveWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    const { content } = req.body;

    writedown.content = content;
    await writedown.save();

    const { _id, title, createdAt } = writedown;
    const updatedWritedown = { _id, title, content: content.substring(0, 30), createdAt }

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

module.exports = {
    getWritedowns,
    getWritedown,
    createWritedown,
    saveWritedown,
    pinWritedown,
    updateTitle,
    deleteWritedown,
};
