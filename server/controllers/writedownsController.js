const mongoose = require('mongoose');

const Writedown = require("../models/Writedown");

const { userByUsername: getUser } = require('../services/userService');

const findWritedown = async (writedownId, option = { lean: true }) => {
    const foundWritedown = Writedown.findById(writedownId);
    if (option.lean) foundWritedown.lean();
    return foundWritedown;
};

const isActionAuthorized = async (writedownId, username) => {
    const foundUser = await getUser(username);
    if (!foundUser) return { authorized: false, error: 'user not found' }

    const foundWritedown = await findWritedown(writedownId, { lean: false });
    if (!foundWritedown) return { authorized: false, error: 'writedown not found' }

    return {
        authorized: true,
        writedown: foundWritedown
    }
};

const handleAuthorizationAndGetWritedown = async (req, res) => {
    const { writedownId } = req.params;
    const { username } = req.user;

    const { authorized, error, writedown } = await isActionAuthorized(writedownId, username);

    if (!authorized) return res.status(403).json({ msg: error || "unauthorized" });

    return { writedown };
};

const getWritedowns = async (req, res) => {
    const { username } = req.user;
    const foundUser = await getUser(username);
    if (!foundUser) return res.status(403).json({ msg: "user not found" });
    const writedowns = await Writedown.find({ owner: foundUser._id }).select('-content').sort({ pinned: -1, content: -1, createdAt: -1 }).lean();
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

    const newWritedown = new Writedown({
        owner: foundUser._id
    });

    await newWritedown.save();

    return res.status(201).json({ msg: 'new writedown added', newWritedown });
};

const saveWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    const { content } = req.body;

    const contentFirst50Chars = content.substring(0, 50);
    writedown.content = content;
    writedown.title = content.length > 50 ? contentFirst50Chars + "..." : contentFirst50Chars;

    await writedown.save();

    const { _id, title, createdAt } = writedown;
    const updatedWritedown = { _id, title, createdAt }

    return res.status(200).json({ msg: 'writedown updated', updatedWritedown });
};

const pinWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.pinned = !writedown.pinned;
    await writedown.save();
    return res.status(200).json({ message: 'writedown pinned', pinned: writedown.pinned });
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
    deleteWritedown,
};
