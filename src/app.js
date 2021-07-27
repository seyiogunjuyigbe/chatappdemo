const express = require('express');
require('dotenv').config();
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } })
const connectDb = require('./database');
const errorHandler = require('./middlewares/errorhandler.js');
const routes = require('./routes');
const Utils = require('./utils')
connectDb()
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(routes)
app.use(errorHandler);

io.on('connection', socket => {
    // Welcome current user
    socket.emit('message', 'Welcome');
    // broadcasr when user connects
    socket.broadcast.emit('message', "A user has just joined the chat");
    socket.on('chat-message', async (payload) => {
        try {
            const { message, room } = payload;
            let userData = await Utils.get({ socketId: socket.id });
            if (!userData.data) {
                throw new Error("User not found")
            }
            let user = userData.data
            let newMsg = {
                sender: user._id,
                text: message,
                room
            }
            let msg = await Utils.createDoc("message", newMsg);
            if (!msg.data) {
                throw new Error("An error occured sending your message")

            }
            io.to(room).emit('message', Utils.formatMessage(user.username, msg.data.text));
        } catch (err) {
            // socket.emit("no-auth")
            console.log(err)
        }
    })
    // broadcasr when user disconnects
    socket.on('send-token', async token => {
        try {
            let user = await Utils.getUserFromToken(token);
            if (!user.data) {
                socket.emit("no-auth")
            }
            socket.emit('current-user', user.data)
            let users = await Utils.appendUser(socket.id, user.data);
            console.log(true)
            socket.emit('new-user', users)
        } catch (error) {
            console.log(error)
            socket.emit("no-auth")

        }


    })
    socket.on('room-request', async (user, room) => {
        try {
            await Utils.appendUser(socket.id, user);
            socket.join(room._id)
            let messages = await Utils.get("message", { room: room._id }, true, "sender");
            let parsedMessages = messages.data ? messages.data.map(m => {
                return { text: m.text, username: m.sender.username, time: moment.utc(m.createdAt).format("hh:mm") }
            }) : []
            io.to(room._id).emit('online-users', {
                users,
                room, messages: parsedMessages
            })
            // socket.emit('room-entered', { room, messages: parsedMessages })

        } catch (error) {
            console.log(error)
        }
    })

    socket.on('disconnect', () => {
        // socket.emit('user-left', "A user has left the chat")
    })
})
server.listen(PORT, () => console.log(`app running on ${PORT}`))