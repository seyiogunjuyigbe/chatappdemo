const { validationResult } = require('express-validator');
const response = require('./response');

module.exports = (view = "error") => {
    return function validate(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = {};
            errors.array().forEach(err => (error[err.param] = err.msg));
            response(res, 400, view, { err: Object.values(error) });
            return;
        }

        next();
    }
}
