const getJWT = require('../services/jwt.service');
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
                        return res.redirect("/auth/login");
                    }
                    try {
                        req.user = await User.findById(decoded.id);
                        if (!req.user) {
                            return res.redirect("/auth/login");
                        }
                        next();
                    } catch (error) {
                        return res.redirect("/auth/login");

                    }
                });
            } else {
                return res.redirect("/auth/login");

            }
        } else {
            return res.redirect("/auth/login");

        }
    } else {
        return res.redirect("/auth/login");

    }

};
