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

app.use(cors())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public')));

app.use(routes)
app.use(errorHandler);
io.on('connection', socket => {
    // todo: add user to list of online users

    // Welcome current user
    socket.emit('message', 'Welcome');
    // broadcasr when user connects
    socket.broadcast.emit('message', "A user has just joined the chat");
    socket.on('chat-message', async (payload) => {
        // check that room is valid
        const { message, token, recipientUsername } = payload;
        let user = await Utils.getUserFromToken(token);
        let recipient = await getDoc('User', { username: recipientUsername })
        let room = await Utils.getDoc("Room", { $and: [{ users: user._id }, { users: recipient._id }] });
        if (!room) {
            room = await Utils.createDoc("Room", { users: [user._id, recipient._id] })
        }
        // create message doc
        console.log({ msg })
        try {
            let payload = {

            }
            await Utils.createDoc("Message", {})
        } catch (err) {

        }
    })
    // broadcasr when user disconnects
    socket.on('disconnect', () => {
        io.emit('message', "A user has left the chat")
    })
})
server.listen(PORT, () => console.log(`app running on ${PORT}`))