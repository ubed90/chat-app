import express, { Express, Request, Response } from "express";
import { join } from "path";

// HTTP FOR SOCKETS
import * as http from "http";

// Sockets
import * as socketio from "socket.io";


// Import Profanity Service
import badWordsFilter from "bad-words";


// Import our Utils
import * as fromUtils from "./utils";

// Getting Public Directory Path
const publicDirectoryPath = join(__dirname, "../public");

// Getting the port from ENV VARIABLES
const port = process.env.PORT || 3000;

// Initializing Express App
const app: Express = express();

// HTTP SERVER
const server: http.Server = http.createServer(app);

// Create Socket Server
const io = new socketio.Server(server);

// Setting the Public Directory to our custom path
app.use(express.static(publicDirectoryPath));

// Clearing all Users and rooms using Api Call
app.post('/clear', (req: Request, res: Response) => {
  fromUtils.clearAllData();

  io.emit('redirectAllConnections')

  return res.status(200).send('Data Cleared Successfully!')
});

// let count: number = 0;

// Socket Events
io.on('connection', (socket: socketio.Socket) => {


    // CHAT APP

    socket.on('join', ({ userName, roomName }: { [key: string]: string }, callBack) => {
      const { error, user } = fromUtils.addUser({ id: socket.id, userName, roomName: roomName.toLowerCase() });

      if(error) {
        return callBack(error);
      }

      socket.join(user?.roomName as string);

      socket.emit('message', fromUtils.generateMessage(`Welcome ${user?.userName}`, 'admin'));


      socket.broadcast.to(user?.roomName as string).emit('message', fromUtils.generateMessage(`${userName} has joined.`, 'admin'));

      io.to(user?.roomName as string).emit('roomData', {
        room: user?.roomName,
        users: fromUtils.getAllUsersInRoom(user?.roomName as string)
      })


      callBack();
    })


    socket.on('sendMessage', (message, callBack) => {
        const filter = new badWordsFilter();


        if (filter.isProfane(message)) {
          return callBack('Message contains prohibited words!')
        }

        const user = fromUtils.getUser(socket.id);

        io.to(user?.roomName as string).emit('message', fromUtils.generateMessage(message, user?.userName));

        callBack();
    })


    socket.on('sendLocation', ({ latitude, longitude }, callBack) => {
      const user = fromUtils.getUser(socket.id);

      io.to(user?.roomName as string).emit('shareLocation', fromUtils.generateMessage(`https://google.com/maps?q=${latitude},${longitude}`, user?.userName));

      callBack();
    })


    socket.on('disconnect', () => {
      const user = fromUtils.removeUser(socket.id);

      if(user) {
        io.to(user.roomName).emit('message', fromUtils.generateMessage(`${user.userName} has left the room!`, 'admin'));
        io.to(user?.roomName as string).emit('roomData', {
          room: user?.roomName,
          users: fromUtils.getAllUsersInRoom(user?.roomName as string)
        })
      }

    })
})

server.listen(port, () => {
  console.log("Server is up on port ", port);
});


