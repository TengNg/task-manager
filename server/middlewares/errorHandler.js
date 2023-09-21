const errorHandler = (err, _req, res, _next) => {
    res.status(500).json({ errMsg: err.message });
}

module.exports = errorHandler;
