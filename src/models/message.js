const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: { type: String, required: "Message text can not be empty" },
    status: {
        type: String,
        enum: ['sent', "delivered"],
        default: "sent"
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }
}, { timestamps: true })
module.exports = mongoose.model('Message', messageSchema)