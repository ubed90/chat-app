"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
// HTTP FOR SOCKETS
const http = __importStar(require("http"));
// Sockets
const socketio = __importStar(require("socket.io"));
// Import Profanity Service
const bad_words_1 = __importDefault(require("bad-words"));
// Import our Utils
const fromUtils = __importStar(require("./utils"));
// Getting Public Directory Path
const publicDirectoryPath = (0, path_1.join)(__dirname, "../public");
// Getting the port from ENV VARIABLES
const port = process.env.PORT || 3000;
// Initializing Express App
const app = (0, express_1.default)();
// HTTP SERVER
const server = http.createServer(app);
// Create Socket Server
const io = new socketio.Server(server);
// Setting the Public Directory to our custom path
app.use(express_1.default.static(publicDirectoryPath));
// Clearing all Users and rooms using Api Call
app.post('/clear', (req, res) => {
    fromUtils.clearAllData();
    io.emit('redirectAllConnections');
    return res.status(200).send('Data Cleared Successfully!');
});
// let count: number = 0;
// Socket Events
io.on('connection', (socket) => {
    // CHAT APP
    socket.on('join', ({ userName, roomName }, callBack) => {
        const { error, user } = fromUtils.addUser({ id: socket.id, userName, roomName: roomName.toLowerCase() });
        if (error) {
            return callBack(error);
        }
        socket.join(user === null || user === void 0 ? void 0 : user.roomName);
        socket.emit('message', fromUtils.generateMessage(`Welcome ${user === null || user === void 0 ? void 0 : user.userName}`, 'admin'));
        socket.broadcast.to(user === null || user === void 0 ? void 0 : user.roomName).emit('message', fromUtils.generateMessage(`${userName} has joined.`, 'admin'));
        io.to(user === null || user === void 0 ? void 0 : user.roomName).emit('roomData', {
            room: user === null || user === void 0 ? void 0 : user.roomName,
            users: fromUtils.getAllUsersInRoom(user === null || user === void 0 ? void 0 : user.roomName)
        });
        callBack();
    });
    socket.on('sendMessage', (message, callBack) => {
        const filter = new bad_words_1.default();
        if (filter.isProfane(message)) {
            return callBack('Message contains prohibited words!');
        }
        const user = fromUtils.getUser(socket.id);
        io.to(user === null || user === void 0 ? void 0 : user.roomName).emit('message', fromUtils.generateMessage(message, user === null || user === void 0 ? void 0 : user.userName));
        callBack();
    });
    socket.on('sendLocation', ({ latitude, longitude }, callBack) => {
        const user = fromUtils.getUser(socket.id);
        io.to(user === null || user === void 0 ? void 0 : user.roomName).emit('shareLocation', fromUtils.generateMessage(`https://google.com/maps?q=${latitude},${longitude}`, user === null || user === void 0 ? void 0 : user.userName));
        callBack();
    });
    socket.on('disconnect', () => {
        const user = fromUtils.removeUser(socket.id);
        if (user) {
            io.to(user.roomName).emit('message', fromUtils.generateMessage(`${user.userName} has left the room!`, 'admin'));
            io.to(user === null || user === void 0 ? void 0 : user.roomName).emit('roomData', {
                room: user === null || user === void 0 ? void 0 : user.roomName,
                users: fromUtils.getAllUsersInRoom(user === null || user === void 0 ? void 0 : user.roomName)
            });
        }
    });
});
server.listen(port, () => {
    console.log("Server is up on port ", port);
});
