const Writedown = require('../models/Writedown');
const { userByUsername: getUser } = require('./userService');

const saveNewWritedown = async (writedownData) => {
    const newWritedown = new Writedown(writedownData);
    return await newWritedown.save();
};

const writedownsByUserId = async (userId) => {
    const result = await Writedown.find({ owner: userId }).select('-content').sort({ pinned: -1, content: -1, createdAt: -1 }).lean();
    return result;
};

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

module.exports = {
    saveNewWritedown,
    writedownsByUserId,
    findWritedown,
    isActionAuthorized,
    handleAuthorizationAndGetWritedown,
};
