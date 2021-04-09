const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//agarrar user y sala
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const socket = io();

//unirse a una sala
socket.emit('joinRoom', { username, room })

//agarrar sala y usuarios
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

//mensaje desde servidor
socket.on('message', message => {
    outputMessage(message);
})

//envio del mensaje
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //agarrar texto del mensaje
    const msg = e.target.elements.msg.value;

    //enviar mensaje al servidor
    socket.emit('chatMessage', msg);

    //scroll automatico
    chatMessages.scrollTop = chatMessages.scrollHeight;

    //limpiar input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//enviar mensaje en el DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//añadir nombre de sala al dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//añadir users al DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}