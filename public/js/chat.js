const socket = io();


// CHAT APP
const messageForm = document.getElementById('message-form');
const textInput = messageForm.querySelector('input');
const sendBtn = messageForm.querySelector('button');
const sendLocation = document.getElementById('send-location');
const messagesContainer = document.getElementById('messages');
const userListContainer = document.querySelector('.chat-sidebar_userList');
const userNameContainer = document.querySelector('.chat-sidebar__userName');
const roomNameContainer = document.querySelector('.room-name');
const usersOnlineContainer = document.querySelector('.users-online');


// Temmplates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const userTemplate = document.querySelector('#user-template').innerHTML;



// Mobile Menubar
const hamburger = document.querySelector('.chat-sidebar_heading-icons');
const sidebar = document.querySelector('.chat-sidebar');


// Options
const { userName, roomName } = Qs.parse(location.search, { ignoreQueryPrefix: true });


// Helper Functions
const toggleMobileMenu = () => {
    hamburger.firstElementChild.classList.toggle('active');
    hamburger.lastElementChild.classList.toggle('active');

    sidebar.classList.toggle('open');
}

// Event Listeners
// messagesContainer.addEventListener('scroll', (e) => {
//     console.log(e.target.scrollTop, e.target.scrollHeight);
// })
hamburger.addEventListener('click', toggleMobileMenu);

textInput.addEventListener('click', () => {
    if(sidebar.classList.contains('open')) {
       toggleMobileMenu(); 
    }
})


// Main logic

const autoScroll = () => {
    const newMessage = messagesContainer.firstElementChild;

    const newMessageStyles = getComputedStyle(newMessage);

    const messagesContainerStyles = getComputedStyle(messagesContainer);

    const messagesGap = parseInt(messagesContainerStyles.gap);

    const newMessageMargin = parseInt(newMessageStyles.marginBottom);

    const newMessageHeight = newMessage.offsetHeight + newMessageMargin + messagesGap;


    // const visibleHeight = messagesContainer.offsetHeight;


    const containerHeight = messagesContainer.scrollHeight;

    const scrollOffset = containerHeight + messagesContainer.scrollTop;

    // console.log(containerHeight, newMessageHeight,containerHeight - newMessageHeight, scrollOffset, containerHeight - newMessageHeight <= scrollOffset);

    if(containerHeight - newMessageHeight <= scrollOffset) {

        messagesContainer.scrollTop = 0;
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

    usersOnlineContainer.innerText = `Users Online: ${users.length}`;

    userListContainer.innerHTML = markup;
})


socket.on('redirectAllConnections', () => {
    alert("Admin Cleared Database. Redirecting you to home..");
    location.href = '/';
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