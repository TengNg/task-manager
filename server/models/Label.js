const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: String,
    color: String,
    category: String,
});

module.exports = mongoose.model('Card', labelSchema);;
