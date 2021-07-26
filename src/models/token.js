const mongoose = require('mongoose');

const { Schema } = mongoose;

const tokenSchema = new Schema(
    {
        token: { type: String, required: true },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        expiresIn: Date,
        type: {
            type: String,
            enum: ['verify-email', 'password-reset'],
            required: true,
        },
        expired: { type: Boolean, default: false },
    },
    { timestamps: true }
);
module.exports = mongoose.model('token', tokenSchema);
