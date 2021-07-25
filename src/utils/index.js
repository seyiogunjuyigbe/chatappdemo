const path = require("path");
const Models = require("require-all")(path.resolve(__dirname, "../models"));
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require('../models/user')
exports.createDoc = async (model, payload) => {
    if (!Object.keys(Models).includes(model)) {
        return { success: false, error: "Invalid model selected" }
    }
    let data = await Models[model].create({ ...payload });
    return { success: true, data }
}
exports.getDoc = async (model, options = {}) => {
    if (!Object.keys(Models).includes(model)) {
        return { success: false, error: "Invalid model selected" }
    }
    let data = await Models[model].findOne(options);
    return { success: true, data }
}

exports.getUserFromToken = async (token) => {
    let decodedToken = await jwt.verify(token, process.env.JWT_KEY);
    let user = await User.findById({ _id: decodedToken._id });
    if (!user) return { success: false, message: "User account not found" }
    return { success: true, user }
}