const express = require('express');
const router = express.Router();

const {
    updateUsername,
    updatePassword,
} = require("../../controllers/userController");

router.route("/new-username")
    .put(updateUsername);

router.route("/new-password")
    .put(updatePassword);

module.exports = router;
