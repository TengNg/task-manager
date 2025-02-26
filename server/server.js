require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authenticateToken = require("./middlewares/authenticateToken");
const errorHandler = require('./middlewares/errorHandler');
const credentials = require('./middlewares/credentials');
const rateLimiter = require('./middlewares/rateLimiter');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { sendAuthCookies } = require('./services/createAuthTokensService');
const { generateRandomHex } = require('./utils/generateRandomHex.js');

const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

mongoose.set("strictQuery", true);
mongoose
    .connect(process.env.DB_CONNECTION)
    .catch((err) => console.log(err));

app.use(credentials);
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json())

app.get("/auth/discord", (_req, res) => {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CALLBACK_URL = `${SERVER_URL}/auth/discord/callback`;
    const SCOPE = "identify email";
    const discordAuthURL =
        "https://discord.com/oauth2/authorize?" +
        "client_id=" + CLIENT_ID + "&" +
        "redirect_uri=" + encodeURIComponent(CALLBACK_URL) + "&" +
        "response_type=code&" +
        "scope=" + encodeURIComponent(SCOPE);
    res.redirect(discordAuthURL);
});

app.get("/auth/discord/callback", async (req, res) => {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_SECRET_ID;
    const CALLBACK_URL = `${SERVER_URL}/auth/discord/callback`;
    const FAILURE_REDIRECT_URL = `${FRONTEND_URL}/login?authorize_failed=true`;

    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: "Authorization code not provided!" });
    }

    try {
        /*
         * docs: https://discord.com/developers/docs/topics/oauth2
         * only accept a content type of application/x-www-form-urlencoded
         * JSON content is not permitted and will return an error
         */
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: CALLBACK_URL,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error("Error fetching token");
        }

        const accessToken = tokenData.access_token;
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userResponse.ok) {
            throw new Error("Error fetching user data");
        }

        const currentProfile = await userResponse.json();
        if (!currentProfile.verified) {
            throw new Error("User is not verified");
        }

        let user = await User.findOne({ discordId: currentProfile.id });
        if (!user) {
            const secureId = generateRandomHex(10);
            const initialUsername = `${currentProfile.username}-${secureId}`;
            try {
                user = await User.create({
                    username: initialUsername,
                    discordId: currentProfile.id
                });
            } catch (err) {
                return res.redirect(FAILURE_REDIRECT_URL);
            }
        }

        sendAuthCookies(res, user, null);
        return res.redirect(`${FRONTEND_URL}`);
    } catch (error) {
        console.error("Authentication error:", error);
        return res.redirect(`${FAILURE_REDIRECT_URL}&message=${error.message}`);
    }
});

app.use("/home", require("./routes/home"));
app.use("/register", rateLimiter, require("./routes/register"));
app.use("/login", rateLimiter, require("./routes/login"));
app.use("/logout", require("./routes/logout"));
app.use("/refresh", require("./routes/refresh"));
app.use("/check-cookies", require("./routes/checkCookies"));

app.use(authenticateToken);
app.use("/boards", require("./routes/api/boards"));
app.use("/lists", require("./routes/api/lists"));
app.use("/cards", require("./routes/api/cards"));
app.use("/invitations", require("./routes/api/invitations"));
app.use("/chats", require("./routes/api/chats"));
app.use("/join_board_requests", require("./routes/api/joinBoardRequests"));
app.use("/account/edit", require("./routes/api/account"));
app.use("/personal_writedowns", require("./routes/api/writedowns"));
app.use("/board_activities", require("./routes/api/boardActivities"));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`app is listening on PORT ${PORT}`));
}

module.exports = app;
