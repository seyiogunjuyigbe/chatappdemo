const chatForm = document.querySelector('#chat-form');

const socket = io(baseUrl);
const chatMessages = document.querySelector('.chat-messages');
let token = checkAuth()
socket.emit("send-token", token)
const room = window.location.href.replace(window.location.origin + "/chat/", "");

var currentUser;
var currentRoom;


if (!currentRoom) {
    chatMessages.style.display = "none"

}
socket.on('current-user', user => {
    currentUser = user
})
if (room && room.match(/^[a-f\d]{24}$/i)) {
    socket.emit("room-request", { user: currentUser, room })
}
socket.on('message', message => {
    renderMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight
});

socket.on('new-user', users => {
    console.log('updating')
    updateOnlineUsers(users)
})
socket.on("no-auth", () => {
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
    let token = checkAuth()
    socket.emit('chat-message', { message: msg, token });
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
    chatMessages.style.display = "block"

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
    console.log(users)
    users.forEach(user => {

        if (user.username !== currentUser.username) {
            let li = document.createElement('a');
            li.setAttribute('data-', user.username);
            li.classList.add('online-user');
            li.innerHTML = `${user.username}`
            li.setAttribute('href', `/chat?users[]=${user._id}&users[]=${currentUser._id}`)
            document.querySelector('#users').appendChild(li)
        }

    })
}
socket.on('online-users', onlineUsers => {
    if (onlineUsers) {
        console.log(onlineUsers)
        onlineUsers.forEach(user => {

        })
    }
})

function openRoom(usernames = []) {
    socket.emit('room-request', usernames)
}
function renderRoomMessages(messages = []) {
    chatMessages.style.display = "block"

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