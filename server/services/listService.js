const List = require('../models/List.js');

const listById = (id, option = { lean: true }) => {
    const foundList = List.findById(id);
    if (option.lean) foundList.lean();
    return foundList;
};

module.exports = {
    listById
}
