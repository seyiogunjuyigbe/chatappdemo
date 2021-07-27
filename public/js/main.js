const chatForm = document.querySelector('#chat-form');

const socket = io(baseUrl);
const chatMessages = document.querySelector('.chat-messages');
let token = checkAuth();
console.log(token);
socket.emit("send-token", token)
const room = window.location.href.replace(window.location.origin + "/chat/", "");

var currentUser;
var currentRoom;



socket.on('current-user', user => {
    currentUser = user
})
if (room && room.match(/^[a-f\d]{24}$/i)) {
    socket.emit("room-request", { user: currentUser, room })
}
socket.on('message', messages => {
    messages.forEach(message => {
        renderMessage(message);
    })

    chatMessages.scrollTop = chatMessages.scrollHeight
});

socket.on('new-user', users => {
    console.log('updating')
    updateOnlineUsers(users)
})
socket.on("no-auth", () => {
    console.log("no auth");
    window.location.href = window.location.origin + "/auth/login"
})
socket.on('room-entered', (data) => {
    let { messages, room } = data;
    currentRoom = room._id
    renderRoomMessages(messages)
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    let token = checkAuth();
    console.log("sending");
    console.log({ message: msg, token, room })
    socket.emit('chat-message', { message: msg, token, room });
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus()
})
document.querySelectorAll('.online-user').forEach(user => {
    user.addEventListener('click', function (e) {
        console.log('opening...')

        if (user.getAttribute('data-') !== currentUser.username) {
            openRoom([currentUser.username, user.getAttribute('data-')])
        }
    })
})
function renderMessage(msg) {

    let { text, username, time } = msg
    const div = document.createElement('div');
    div.classList.add('message');
    if (text) {
        div.innerHTML = ` <p class="meta">${username} <span>${time}</span></p>
          <p class="text">${text}</p>`;
    }

    chatMessages.appendChild(div)
}

function updateOnlineUsers(users) {
    if (!currentUser) {
        checkAuth()
    }
    if (users.length === 1 && users[0].username === currentUser.username) {
        document.querySelector('#users').innerHTML = `<small style="font-style:italics;">You seem to be the only one here</small>`
    } else {
        document.querySelector('#users').innerHTML = ""
        users.forEach(user => {

            if (user.username !== currentUser.username) {
                let list = document.createElement('li');
                let li = document.createElement('a');
                li.setAttribute('data-', user.username);
                li.innerHTML = `${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`
                li.setAttribute('href', `/chat?users[]=${user._id}&users[]=${currentUser._id}`)
                list.appendChild(li);
                document.querySelector('#users').appendChild(list)
            }

        })
    }


}
socket.on('online-users', onlineUsers => {
    if (onlineUsers) {
        updateOnlineUsers(onlineUsers)
    }
})

function openRoom(usernames = []) {
    socket.emit('room-request', usernames)
}
function renderRoomMessages(messages = []) {

    chatMessages.innerHTML = "";
    messages.forEach(message => {
        renderMessage(message)
    })
}
function checkAuth() {
    let token = localStorage.getItem("token")
    if (!token) {
        window.location.href = window.location.origin + "/auth/login"
    } else {
        return token
    }
}