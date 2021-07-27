const User = require('../models/user');
const Token = require('../models/token');
const response = require('../middlewares/response');
const sendMail = require('../services/email.service');
const moment = require('moment');
const crypto = require('crypto');
const { generateToken } = require('../services/jwt.service');

const { SITE_URL } = process.env;
module.exports = {
    async renderRegisterPage(req, res, next) {
        try {
            return res.status(200).render('register', { err: null })
        } catch (error) {
            next(error)
        }
    },
    async renderLoginPage(req, res, next) {
        try {
            return res.status(200).render('login', { err: null })
        } catch (error) {
            next(error)
        }
    },
    async register(req, res, next) {
        try {
            const { email, username } = req.body;
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return response(res, 409, "register", { err: `An account with this ${existingUser.email === email ? "email" : "username"} already exists` });
            }
            const newUser = await User.create({
                ...req.body,
            });
            const emailToken = await Token.create({
                token: crypto.randomBytes(20).toString('hex'),
                user: newUser._id,
                type: 'verify-email',
                expiresIn: moment.utc().add(1, 'day'),
            });
            let { id, firstName, lastName } = newUser
            const token = generateToken({
                id,
                firstName,
                lastName,
                email,
                username
            });
            let link = `${SITE_URL}/verify/${emailToken.token}`;
            const subject = 'Welcome!';
            const body = `
      Hi <b>${newUser.firstName} ${newUser.lastName}</b>,
                                    <br />
                                    <br />
                                    We may need to send you critical information
                                    about our service and it is important that
                                    we have an accurate email address.
                                    <br /><br />

                                    <p>
                                      Click on the link above to confirm your
                                      email address.
                                    </p>
      `;
            await sendMail(subject, email, body, link, 'Verify your Account');
            return response(res, 200, 'redirect', { to: "/", data: { token, user: newUser } });

        } catch (error) {
            return next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            let user = await User.findOne({ username });
            console.log(password, user)

            if (!user) {
                return response(res, 401, 'login', { err: 'Invalid username or password' });
            }
            // validate password
            if (!user.comparePassword(password)) {
                return response(res, 401, 'login', { err: 'Invalid username or password' });
            }
            let { firstName, lastName, id, email } = user;
            let token = generateToken({
                id,
                firstName,
                lastName,
                email,
                username
            });
            return response(res, 200, 'redirect', { to: "/", data: { token, user } });
        } catch (err) {
            next(err);
        }
    },

    async verify(req, res, next) {
        if (!req.params.token)
            return response(
                res,
                400,
                'We were unable to find a user for this token.'
            );
        try {
            const token = await Token.findOne({
                token: req.params.token,
                type: 'verify-email',
            }).populate('user');
            if (!token)
                return response(
                    res,
                    400,
                    'Your verification link may have expired. Please request a new one'
                );
            if (
                token.expired ||
                moment.utc(token.expiresIn).diff(moment.utc(), 'minutes') < 0
            ) {
                // expire token
                token.expired = true;
                await token.save();
                return response(
                    res,
                    403,
                    'Verification link expired. Please request a new onw'
                );
            }
            // If we found a token, find a matching user
            let { user } = token;
            if (!user)
                return response(
                    res,
                    400,
                    'We were unable to find a user for this link.'
                );
            if (user.isVerified)
                return response(res, 400, 'This user has already been verified.');
            // Verify and save the user
            user.isVerified = true;
            await user.save();
            token.expired = true;
            await token.save();
            return response(res, 200, 'Account verified successfully.', user.role);
        } catch (err) {
            next(err);
        }
    },
    async resendToken(req, res, next) {
        try {
            const { email } = req.query;
            if (!email) return response(res, 400, 'Email required');
            const user = await User.findOne({ email });
            if (!user)
                return response(
                    res,
                    401,
                    `The email address ${email} is not associated with any account. Double-check your email address and try again.`
                );
            if (user.isVerified)
                return response(
                    res,
                    400,
                    'This account has already been verified. Please log in.'
                );
            await Token.updateMany({
                user: user._id,
                type: 'verify-email',
                expired: false,
            }, { expired: true });
            const token = await Token.create({
                token: crypto.randomBytes(20).toString('hex'),
                expiresIn: moment.utc().add(1, 'hours'),
                user,
                type: 'verify-email',
            });
            let link = `${SITE_URL}/verify/${token.token}`;
            let subject = 'Account Verification';
            let message = `
                    Please click on the link to verify your account. \n`;
            console.log({ link });
            await sendMail(subject, user.email, message, link, 'Verify Email');
            return response(res, 200, 'Verification mail sent successfully');
        } catch (err) {
            next(err);
        }
    },
    async renderRecoveryPage(req, res, next) {
        try {
            return response(res, 200, "recover", { err: null })
        } catch (error) {
            next(error)
        }
    },
    async recover(req, res, next) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user)
                return response(
                    res,
                    401, "recover",
                    { err: `The email address ${email} is not associated with any account.` }
                );
            await Token.updateMany(
                { user: user._id, type: 'password-reset', expired: false },
                { expired: true }
            );
            const token = await Token.create({
                token: crypto.randomBytes(20).toString('hex'),
                expiresIn: moment.utc().add(1, 'hours'),
                user,
                type: 'password-reset',
            });
            let link = `${SITE_URL}/auth/password/reset/${token.token}`;
            console.log({ link });
            let subject = 'Reset Password';
            let message = `Please click on the link to reset your password.`;
            await sendMail(
                subject,
                email,
                message,
                link,
                'Reset Password'
            );
            return response(
                res,
                200,
                "recover-success",
                { message: `A reset email has been sent to ${user.email}`, email },

            );
        } catch (err) {
            next(err);
        }
    },
    async renderResetPage(req, res, next) {
        try {
            return response(res, 200, "reset", { err: null, token: req.params.token })
        } catch (error) {
            next(error)
        }
    },
    async resetPassword(req, res, next) {
        try {
            const token = await Token.findOne({
                token: req.params.token,
                type: 'password-reset',
            }).populate('user');
            if (!token)
                return response(
                    res,
                    400,
                    'We were unable to find a valid code. Your token my have expired.'
                );
            if (
                token.expired ||
                moment.utc(token.expiresIn).diff(moment.utc(), 'minutes') < 0
            ) {
                // expire token
                token.expired = true;
                await token.save();
                return response(
                    res,
                    403,
                    'Verification link expired. Please request a new one'
                );
            }
            let { user } = token;
            if (!user)
                return response(
                    res,
                    404,
                    'Password reset link is invalid or has expired.'
                );
            // Set the new password
            user.password = req.body.password;
            user.isVerified = true;
            await user.save();
            // send email
            let subject = 'Your password has been changed';
            let text = `This is a confirmation that the password for your account ${user.email} has just been changed.\n`;
            await sendMail(subject, user.email, text);
            return res.redirect('/auth/login');
        } catch (err) {
            next(err);
        }
    }
};
