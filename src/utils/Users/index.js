"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllData = exports.getAllUsersInRoom = exports.getUser = exports.removeUser = exports.addUser = void 0;
let users = [];
const addUser = (user) => {
    const userName = user.userName.trim().toLowerCase();
    if (!userName || !user.roomName) {
        return {
            error: 'Username and Roomname are required'
        };
    }
    const existingUser = users.find(user => (user.roomName.toLowerCase() === user.roomName) && (user.userName.toLowerCase() === userName));
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }
    users.push(user);
    return { user };
};
exports.addUser = addUser;
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};
exports.removeUser = removeUser;
const getUser = (id) => {
    return users.find(user => user.id === id);
};
exports.getUser = getUser;
const getAllUsersInRoom = (roomName) => {
    return users.filter(user => user.roomName === roomName.trim().toLowerCase());
};
exports.getAllUsersInRoom = getAllUsersInRoom;
const clearAllData = () => {
    users = [];
};
exports.clearAllData = clearAllData;
