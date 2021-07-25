const jwt = require('jsonwebtoken');
const User = require('../models/user')
exports.getUserFromToken = async (token) => {
    let decodedToken = await jwt.verify(token, process.env.JWT_KEY);
    let user = await User.findById({ _id: decodedToken._id });
    if (!user) return { success: false, message: "User account not found" }
    return { success: true, user }
}