const jwt = require('jsonwebtoken');
const { JWT_SECRET, TOKEN_EXPIRY } = process.env;

module.exports = {
    generateToken: payload => {
        try {
            const token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: Number(TOKEN_EXPIRY),
            });
            return token;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    decodeToken: (token, callback) => {
        try {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) return callback(err);
                return callback(false, decoded);
            });
        } catch (err) {
            console.log(err);
            return null;
        }
    },
};
