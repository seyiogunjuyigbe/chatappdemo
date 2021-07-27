const Room = require('../models/room');

exports.renderChatPage = async (req, res, next) => {
    try {
        return res.render('chat', { user: req.user, baseUrl: req.headers.host, isRoom: false })
    } catch (error) {
        next(error)
    }
}
exports.generateRoom = async (req, res, next) => {
    try {
        let { users } = req.query;
        if (Array.isArray(users) && users.length > 1) {
            let userQ = users.map(u => {
                return { users: u }
            })
            console.log(userQ)
            let room = await Room.findOne({ $and: userQ });
            console.log(room)
            if (!room) {
                room = await Room.create({ users })
            }
            return res.redirect(`/chat/${room._id}`)
        }
        else {
            return res.redirect("/chat")
        }
    } catch (error) {
        next(error)
    }
}
exports.getRoom = async (req, res, next) => {
    try {
        let { roomId } = req.params;

        let room = await Room.findById(roomId).populate('users');
        if (!room) {
            return res.status(404).render('error', { err: 'room not found' })
        }
        return res.render('chat', { users: room.users, room: room._id, baseUrl: req.headers.host, isRoom: true })
    } catch (error) {
        next(error)
    }
}