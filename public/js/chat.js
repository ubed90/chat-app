const socket = io();


// CHAT APP
const messageForm = document.getElementById('message-form');
const textInput = messageForm.querySelector('input');
const sendBtn = messageForm.querySelector('button');
const sendLocation = document.getElementById('send-location');
const messagesContainer = document.getElementById('messages');
const userListContainer = document.querySelector('.chat-sidebar_userList');
const userNameContainer = document.querySelector('.chat-sidebar__userName');
const roomNameContainer = document.querySelector('.chat-sidebar_heading');


// Temmplates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const userTemplate = document.querySelector('#user-template').innerHTML;


// Options
const { userName, roomName } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const newMessage = messagesContainer.firstElementChild;

    const newMessageStyles = getComputedStyle(newMessage);

    const messagesContainerStyles = getComputedStyle(messagesContainer);

    const messagesGap = parseInt(messagesContainerStyles.gap);

    const newMessageMargin = parseInt(newMessageStyles.marginBottom);

    const newMessageHeight = newMessage.offsetHeight + newMessageMargin + messagesGap;


    const visibleHeight = messagesContainer.offsetHeight;


    const containerHeight = messagesContainer.scrollHeight;

    const scrollOffset = messagesContainer.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}


messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if(textInput.value === '') {
        return;
    }

    sendBtn.setAttribute('disabled', 'disabled');
    textInput.focus();


    socket.emit('sendMessage', textInput.value, (error) => {
        sendBtn.removeAttribute('disabled');
        textInput.value = '';
    });
})


socket.on('message', (message) => {
    const markup = Mustache.render(messageTemplate, { message: message.text, createdAt: moment(message.createdAt).format('h:mm a'), username: message.userName, owner: message.userName === 'admin' ? 'admin' : (message.userName === userName ? 'self' : 'else') });

    messagesContainer.insertAdjacentHTML('afterbegin', markup);

    autoScroll();
})


sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    sendLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            sendLocation.removeAttribute('disabled');
        });
    })
})


socket.on('shareLocation', (location) => {

    const markup = Mustache.render(locationTemplate, { location: location.text, createdAt: moment(location.createdAt).format('h:mm a'), username: location.userName, owner: location.userName === 'admin' ? 'admin' : (location.userName === userName ? 'self' : 'else') });

    messagesContainer.insertAdjacentHTML('afterbegin', markup);

    autoScroll();
})


socket.on('roomData', (roomData) => {

    if(!roomData.users.length) {
        return;
    }

    const users = roomData.users.filter(user => user.userName !== userName);

    const markup = Mustache.render(userTemplate, { users });

    userListContainer.innerHTML = markup;
})


socket.emit('join', { userName, roomName }, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
        return;
    }

    roomNameContainer.innerText = roomName.trim();
    userNameContainer.innerText = userName.trim();
})