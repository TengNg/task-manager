require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const errorHandler = require('./middlewares/errorHandler');
const credentials = require('./middlewares/credentials');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_CONNECTION).then(() => console.log('connected')).catch((err) => console.log(err));

app.use(credentials);
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

// Routes ==========
app.get("/", (_, res) => {
    res.json({ msg: "home page" });
});

app.use("/home", require("./routes/home"));
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/logout", require("./routes/logout"));
app.use("/refresh", require("./routes/refresh"));
app.use("/check-cookies", require("./routes/checkCookies"));

app.use("/boards", require("./routes/api/boards"));

// =================

app.use(errorHandler);

app.listen(PORT, () => console.log(`app is listening on PORT ${PORT}`));
