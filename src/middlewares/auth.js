const getJWT = require('../services/jwtService');
const User = require('../models/user');
const response = require('./response');

module.exports = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2) {
            const scheme = parts[0];
            const credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                const token = credentials;
                getJWT.decodeToken(token, async (err, decoded) => {
                    if (err) {
                        return response(res, 400, err.message);
                    }
                    try {
                        req.user = await User.findById(decoded.id);
                        if (!req.user) {
                            return response(res, 401, 'invalid token');
                        }
                        next();
                    } catch (error) {
                        return response(res, 401, error.message);
                    }
                });
            } else {
                return response(
                    res,
                    401,
                    'An error occured. Please log in again'
                );
            }
        } else {
            return response(
                res,
                401,
                'An error occured. Please log in again'
            );
        }
    } else {
        return response(res, 401, 'You need to be logged in to continue');
    }

};
