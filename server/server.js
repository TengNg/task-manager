require('dotenv').config();
require('express-async-errors');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authenticateToken = require("./middlewares/authenticateToken.js");
const errorHandler = require('./middlewares/errorHandler');
const credentials = require('./middlewares/credentials');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT || 3001;

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

app.use("/home", require("./routes/home"));
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
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
