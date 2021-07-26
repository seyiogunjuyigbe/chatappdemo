const { startCase } = require('lodash');
const pluralize = require('pluralize');
module.exports = function errorHandler(err, req, res, next) {
    if (err.code === 'ENOTFOUND') {
        return res.status(500).render('error', {
            err: 'Service not available at the moment. Please try again later',
        });
    }

    if (
        err.message &&
        err.message.includes('Cast to ObjectId failed for value')
    ) {
        return res.status(400).render('error', {
            err: `invalid parameter sent ${err.message ? err.message : null}`,
        });
    }

    if (err.code === 11000) {
        const vars = err.message.split(':');
        const tableName = vars[1].split(' ')[1].split('.')[1];
        const modelName = startCase(pluralize.singular(tableName));
        const fieldName = vars[2].split(' ')[1].split('_')[0];
        return res.status(400).render('error', {
            err: `${modelName} with the ${fieldName} exists`,
        });
    }
    if (err.message) {
        if (err.message.match(/validation failed/i)) {
            let message = err.message.replace(/[^]*validation failed: /g, '');
            return res.status(400).render('error', {
                err: message,
            });
        }
    }
    if (/^5/.test(err.status) || !err.status) {
        const message = err.message || 'Something broke. We will fix it';
        return res.status(500).render('error', {
            err: message,
        });
    }

    if (err.response) {
        const errorText = JSON.parse(err.response.text);

        if (errorText) {
            return res.status(500).render('error', {
                err: errorText,
            });
        }
    }

    if (err.message) {
        return res.status(500).render('error', {
            err: err.message,
        });
    }

    res.status(404).render('error', { err: 'Not Found' });
};
