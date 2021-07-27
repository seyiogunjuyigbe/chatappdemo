const path = require("path");
const Models = require("require-all")(path.resolve(__dirname, "../models"));
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const moment = require('moment');
const users = []
exports.createDoc = async (model, payload) => {
    if (!Object.keys(Models).includes(model)) {
        return { success: false, error: "Invalid model selected" }
    }
    let data = await Models[model].create({ ...payload });
    return { success: true, data }
}
exports.get = async (model, options = {}, multiple = false, populate = "") => {
    function stripQuery(model, options = {}, multiple = false, populate = "") {
        let query = model[multiple ? 'find' : 'findOne'](options);
        if (populate) {
            query = query.populate(populate)
        }
        return query
    }
    if (!Object.keys(Models).includes(model)) {
        return { success: false, error: "Invalid model selected" }
    }
    let data = await stripQuery(Models[model], options, multiple, populate);
    return { success: true, data }
}

exports.getUserFromToken = async (token) => {
    let decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById({ _id: decodedToken.id });
    if (!user) return { success: false, message: "User account not found" }
    return { success: true, data: user }
}
exports.formatMessage = (username, text) => {
    return {
        username, text, time: moment.utc().format("hh:mm")
    }
}
exports.appendUser = async (socketId, user) => {
    user.set({ socketId });
    await user.save();
    users.push(user);
    // console.log(users)
    return users
}

exports.removeUser = (socketId) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}