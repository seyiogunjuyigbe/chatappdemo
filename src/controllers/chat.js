exports.renderChatPage = async (req, res, next) => {
    try {
        return res.render('chat', { user: req.user, baseUrl: req.headers.host })
    } catch (error) {
        next(error)
    }
}