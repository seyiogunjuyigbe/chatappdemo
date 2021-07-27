const path = require("path");
const Models = require("require-all")(path.resolve(__dirname, "../models"));
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const moment = require('moment');
var users = []
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
    try {
        let dec = await jwt.verify(token, process.env.JWT_SECRET)
        if (!dec) {
            return { success: false, message: "token expired" }
        }
        var decodedToken = dec;
        let user = await User.findById({ _id: decodedToken.id });
        if (!user) return { success: false, message: "User account not found" }
        return { success: true, data: user }
    } catch (err) {
        return { success: false, message: err }

    }


}
exports.formatMessage = (username, text, time = "") => {
    return {
        username, text, time: time ? moment.utc(time).format("hh:mm") : moment.utc().format("hh:mm")
    }
}
exports.appendUser = async (socketId, user) => {
    if (!users.find(u => {
        return String(u._id) === String(user._id)
    })) {
        user.set({ socketId });
        await user.save();
        users.push(user);
    }
    users = users.filter((value, index, self) => {
        return self.indexOf(value) === index;
    })
    return users
}

exports.removeUser = (socketId) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
exports.fetchUsers = () => {
    return users
}