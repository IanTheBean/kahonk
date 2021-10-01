socket = io();
const roomInput = document.getElementById("room input");
const nameInput = document.getElementById("name input");

function joinRoom(){
    socket.emit("join room", ( { name : nameInput.value, code : roomInput.value } ));
}

function createRoom(){
    socket.emit("create room", (nameInput.value));
}

