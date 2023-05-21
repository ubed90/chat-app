const socket = io();

// Query Selectors
const loadingModal = document.querySelector('.loading-modal');
const selectRooms = document.getElementById('availableRooms');
const roomName = document.getElementById('roomName');

// Event Listeners
selectRooms.addEventListener('change', (e) => {
    if(selectRooms.options[selectRooms.selectedIndex].value === 'select') {
        return;
    }

    roomName.value = selectRooms.options[selectRooms.selectedIndex].value
});


socket.on('newRoomCreated', (rooms) => {
    // loadingModal.classList.add('active');

    // const allRooms = ['Select', ...rooms];

    if(rooms.length > 0) {
        selectRooms.removeAttribute('disabled');

        selectRooms.options[0].innerText = 'Select'

        rooms.forEach((room, index) => {
            selectRooms.add(new Option(room, room.toLowerCase(), index === 0))
        })
    }

    loadingModal.classList.remove('active');
})