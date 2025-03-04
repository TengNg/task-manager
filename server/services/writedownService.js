const Writedown = require('../models/Writedown');

const isActionAuthorized = async (writedownId) => {
    const foundWritedown = await findWritedown(writedownId, { lean: false });
    if (!foundWritedown) {
        return { authorized: false, error: 'writedown not found' }
    }

    return {
        authorized: true,
        writedown: foundWritedown
    }
};

const saveNewWritedown = async (writedownData) => {
    const newWritedown = new Writedown(writedownData);
    return await newWritedown.save();
};

const writedownsByUserId = async (userId) => {
    const result = await Writedown
        .find({ owner: userId })
        .sort({ order: 'asc' })
        .lean();
    return result;
};

const findWritedown = async (writedownId, option = { lean: true }) => {
    const foundWritedown = Writedown.findById(writedownId);
    if (option.lean) foundWritedown.lean();
    return foundWritedown;
};

const handleAuthorizationAndGetWritedown = async (req, res) => {
    const { writedownId } = req.params;
    const {
        authorized,
        error,
        writedown,
    } = await isActionAuthorized(writedownId);
    if (!authorized) {
        return res.status(403).json({ msg: error || "unauthorized" });
    }
    return { writedown };
};

module.exports = {
    saveNewWritedown,
    writedownsByUserId,
    findWritedown,
    isActionAuthorized,
    handleAuthorizationAndGetWritedown,
};
