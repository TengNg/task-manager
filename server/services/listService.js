const List = require('../models/List.js');

const listById = (id, option = { lean: true }) => {
    const foundList = List.findById(id);
    if (option.lean) foundList.lean();
    return foundList;
};

const saveList = (listData) => {
    const newList = new List(listData);
    return newList.save();
};

module.exports = {
    listById,
    saveList,
}
