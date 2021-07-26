const chatForm = document.querySelector('#chat-form');
let onlineUsers = [];
const socket = io(baseUrl);
const chatMessages = document.querySelector('.chat-messages');
let token;
var currentUser;
let auth = document.cookie.split("=");
if (auth[0] === "token") {
    token = auth[1];
    socket.emit("send-token", token)
}
if (!token) {
    window.location.href = window.location.origin + "/auth/login"
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
socket.on('room-entered', messages => {
    renderRoomMessages(messages)
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    let token;
    let auth = document.cookie.split("=");
    if (auth[0] === "token") {
        token = auth[1];
    }
    if (!token) {
        window.location.href = window.location.origin + "/auth/login"
    }

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
    let { text, username, time } = msg
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = ` <p class="meta">${username} <span>${time}</span></p>
          <p class="text">${text}</p>`;
    chatMessages.appendChild(div)
}

function updateOnlineUsers(username) {
    onlineUsers.push(username);
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
function openRoom(usernames = []) {
    socket.emit('room-request', usernames)
}
function renderRoomMessages(messages = []) {
    chatMessages.innerHTML = "";
    messages.forEach(message => {
        renderMessage(message)
    })
}