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
    let onlineUsers = [];
    // todo: add user to list of online users
    console.log("new user connected");

    // Welcome current user
    socket.emit('message', 'Welcome');
    // broadcasr when user connects
    socket.broadcast.emit('message', "A user has just joined the chat");
    socket.on('chat-message', async (payload) => {
        try {
            const { message, token, recipientUsername } = payload;
            let userData = await Utils.getUserFromToken(token);
            if (!userData.data) {
                throw new Error("User not found")
            }
            let user = userData.data
            let recipientData = await Utils.get('user', { username: recipientUsername });
            // if (!recipientData.data) {
            //     throw new Error("recipient not found")
            // }
            let recipient = recipientData.data;
            let room = await Utils.get("room", { $and: [{ users: user._id }] });
            if (!room.data) {
                room = await Utils.createDoc("room", { users: [user._id] })
            }
            let newMsg = {
                sender: user._id,
                recipient: recipient ? recipient._id : null,
                text: message,
                room: room.data._id
            }
            let msg = await Utils.createDoc("message", newMsg);
            if (!msg.data) {
                throw new Error("An error occured sending your message")

            }
            socket.emit('message', Utils.formatMessage(user.username, msg.data.text))
        } catch (err) {
            socket.emit("no-auth")
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
            socket.emit('new-user', user.data.username)
        } catch (error) {
            console.log(error)
            socket.emit("no-auth")

        }


    })
    socket.on('room-request', async (usernames = []) => {
        try {
            let userQuery = await Promise.all(usernames.map(async u => {
                let user = await Utils.get('user', { username: u });
                if (user) {
                    return { user: user._id }
                }
            }));
            let room = await Utils.get('room', { $and: userQuery });
            if (!room) {
                let users = userQuery.map(user => user.user)
                room = await Utils.createDoc('room', users)
            }
            let messages = await Utils.get("message", { room: room._id }, true, "sender");
            let parsedMessages = messages.map(m => {
                return { text: m.text, username: m.sender.username, time: moment.utc(m.createdAt).format("hh:mm") }
            })
            socket.emit('room-entered', { room, messages: parsedMessages })

        } catch (error) {
            console.log(error)
        }
    })
    socket.on("joined", username => {
        onlineUsers.push(username);
        onlineUsers = onlineUsers.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        socket.emit("online-users", onlineUsers)
    })
    socket.on('disconnect', () => {
        // socket.emit('user-left', "A user has left the chat")
    })
})
server.listen(PORT, () => console.log(`app running on ${PORT}`))