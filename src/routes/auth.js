const express = require('express');
const { check } = require('express-validator');
const Auth = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');

const router = express.Router();
router.get('/register', Auth.renderRegisterPage);
router.get('/login', Auth.renderLoginPage);

router.post(
    '/register',
    [
        check('firstName').notEmpty().withMessage('firstName is required'),
        check('lastName').notEmpty().withMessage('lastName is required'),
        check('email').isEmail().withMessage('Enter a valid email address'),
        check('username').notEmpty().withMessage('username is required'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    validate("register"),
    Auth.register
);
router.post(
    '/login',
    [
        check('username').notEmpty().withMessage('Enter your username'),
        check('password').not().isEmpty().withMessage('Password is required'),
    ],
    validate("login"),
    Auth.login
);
router.get('/verify-email/:token', Auth.verify);
router.get('/verify-token/resend', Auth.resendToken);
router.get('/password/recover', Auth.renderRecoveryPage);
router.post('/password/recover', Auth.recover);
router.post(
    '/password/reset/:token',
    [
        check('password')
            .not()
            .isEmpty()
            .isLength({ min: 6 })
            .withMessage('Must be at least 8 chars long'),
        check('confirmPassword', 'Passwords do not match').custom(
            (value, { req }) => value === req.body.password
        ),
    ],
    validate("reset"),
    Auth.resetPassword
);
router.get(
    '/password/reset/:token', Auth.renderResetPage)
module.exports = router;
