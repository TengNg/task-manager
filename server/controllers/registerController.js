const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { usernameRegex } = require('../data/regex');

const handleRegister = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: "Username and password are required" });
    if (!usernameRegex.test(username)) return res.status(400).json({ error: "Username not valid" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const foundUser = await User.findOne({ username }).lean();
    if (foundUser) return res.status(409).json({ msg: "Username is already exists" }); // Conflict

    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username,
            password: hashedPwd,
        });
        await newUser.save();
        return res.status(201).json({ msg: 'Success', newUser });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = { handleRegister };
