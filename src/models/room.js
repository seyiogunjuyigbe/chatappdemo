const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: ['active', "archived"],
        default: "active"
    }
}, { timestamps: true })
module.exports = mongoose.model('Room', roomSchema)