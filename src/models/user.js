const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const userSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: 100,
        },
        password: {
            type: String,
            required: 'Your password is required',
            maxlength: 100,
        }
    },
    { timestamps: true, bufferTimeoutMS: 30000 }
);
userSchema.options.toJSON = {
    transform(doc, ret) {
        delete ret.password;
        return ret;
    },
};

userSchema.methods.comparePassword = function verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function preSave(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) return next(error);

            user.password = hash;
            next();
        });
    });
});


module.exports = mongoose.model('User', userSchema);
