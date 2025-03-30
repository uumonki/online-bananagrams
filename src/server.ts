import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from 'rooms/RoomManager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

const gameRoomManager = new RoomManager(io);

io.on('connection', (socket) => {
  gameRoomManager.handleConnection(socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});