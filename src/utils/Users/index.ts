export interface User {
    id: string,
    userName: string,
    roomName: string
}

let users: User[] = [];


export const addUser = (user: User): { error?: string, user?: User } => {
    const userName = user.userName.trim().toLowerCase();


    if(!userName || !user.roomName) {
        return {
            error: 'Username and Roomname are required'
        }
    }


    const existingUser = users.find(user => (user.roomName.toLowerCase() === user.roomName) && (user.userName.toLowerCase() === userName));

    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    users.push(user);
    return { user };
}



export const removeUser = (id: string) => {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0]; 
    }
}


export const getUser = (id: string): User | undefined => {
    return users.find(user => user.id === id);
}


export const getAllUsersInRoom = (roomName: string): User[] => {
    return users.filter(user => user.roomName === roomName.trim().toLowerCase());
}

export const clearAllData = () => {
    users = [];
}