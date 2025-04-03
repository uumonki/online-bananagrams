import { Server } from 'socket.io';
import RoomManager from 'rooms/RoomManager';
import { handleConnection } from './handlers';

export const setupWebSocket = (io: Server) => {
  const roomManager = new RoomManager(io);

  io.on('connection', socket => {
    handleConnection(socket, roomManager);
  });
};