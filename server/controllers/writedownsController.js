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

const getWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    return res.status(200).json({ writedown });
};

const reorder = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.rank = req.body.rank;
    await writedown.save();
    return res.status(200).json({ rank: writedown.rank });
};

const updateContent = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.content = req.body.content;
    await writedown.save();
    return res.status(200).json({ newContnet: writedown.content });
};

const updateTitle = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.title = req.body.title;
    await writedown.save();
    return res.status(200).json({ newTitle: writedown.title });
};

const updateHighlight = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    writedown.highlight = req.body.highlight;
    await writedown.save();
    return res.status(200).json({ newTitle: writedown.highlight });
};

const deleteWritedown = async (req, res) => {
    const { writedown } = await handleAuthorizationAndGetWritedown(req, res);
    await Writedown.findByIdAndDelete(writedown._id);
    return res.status(200).json({ message: 'writedown deleted' });
};

module.exports = {
    getWritedown,
    reorder,
    updateContent,
    updateTitle,
    updateHighlight,
    deleteWritedown,
};
