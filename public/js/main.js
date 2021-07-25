const chatForm = document.querySelector('#chat-form');

const socket = io(baseUrl);
socket.on('message', message => {
    console.log(message)
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    let roomId;
    let token = localStorage.getItem('token');
    if (!token) {
        // user is unauthenticated. redirect to login

    }
    socket.emit('chat-message', { message, roomId, token })
})