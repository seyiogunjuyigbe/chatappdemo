module.exports = (res, status, view, data = null) =>
    res.status(status).render(view, data);
