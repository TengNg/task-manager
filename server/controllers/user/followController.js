const User = require('../models/User.js');

const followUser = async (req, res) => {
    const { username } = req.user;
    const { usernameToFollow } = req.body;

    if (username === usernameToFollow) {
        return res.status(403).json({ msg: "you can't follow yourself" });
    }

    const foundUser = await User.findOne({ username });
    if (!foundUser) {
        return res.status(403).json({ msg: "Unauthorized" });
    }

    const foundUserToFollow = await User.findOne({ username: usernameToFollow });
    if (!foundUserToFollow) {
        return res.status(403).json({ msg: "followee not found" });
    }

    if (foundUser.following.includes(foundUserToFollow._id)) {
        return res.status(409).json({ msg: "you are already following this user" });
    }

    try {
        foundUser.following.push(foundUserToFollow._id);
        await foundUser.save();

        foundUserToFollow.followers.push(foundUser._id);
        await foundUserToFollow.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: err.message });
    }

    return res.status(200).json({ msg: "you now follow this user" });
}

module.exports = {
    followUser,
};
