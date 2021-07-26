const chatForm = document.querySelector('#chat-form');

const socket = io(baseUrl);
const chatMessages = document.querySelector('.chat-messages');
let token;
var currentUser;
var currentRoom;
checkAuth()

if (!currentRoom) {
    chatMessages.style.display = "block"

}
socket.on('current-user', user => {
    currentUser = user
})
socket.on('message', message => {
    renderMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight
});

socket.on('new-user', username => {
    updateOnlineUsers(username)
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
    checkAuth()
    socket.emit('chat-message', { message: msg, token });
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus()
})
document.querySelectorAll('.online-users').forEach(user => {
    user.addEventListener('click', e => {
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

function updateOnlineUsers(username) {
    socket.emit('joined', username)
}
socket.on('online-users', onlineUsers => {
    if (onlineUsers) {
        console.log(onlineUsers)
        onlineUsers.forEach(user => {
            let li = document.createElement('li');
            li.setAttribute('data-', user);
            li.classList.add('online-user');
            if (user === currentUser.username) {
                li.classList.add('disabled');

            }
            li.innerHTML = `${user}`
            document.querySelector('#users').appendChild(li)
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
        socket.emit("send-token", token)
    }
}