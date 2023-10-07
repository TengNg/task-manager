const express = require('express');
const router = express.Router();

const {
    updateUsername,
} = require("../../controllers/userController");

router.route("/new-username")
    .put(updateUsername);

module.exports = router;
