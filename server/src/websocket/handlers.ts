import { Socket } from 'socket.io';
import RoomManager from 'rooms/RoomManager';

export const handleConnection = (socket: Socket, roomManager: RoomManager) => {
  socket.on('create_room', () => {
    const pin = roomManager.createRoom(socket);
    if (!pin) {
      socket.emit('room_creation_failed');
      return;
    }
    socket.emit('room_created', { pin });
  });

  socket.on('join_room', (pin: string) => {
    if (!roomManager.hasRoom(pin)) {
      socket.emit('room_not_found');
      return;
    }

    if (roomManager.roomFull(pin)) {
      socket.emit('room_full');
      return;
    }

    roomManager.addPlayerToRoom(pin, socket.id);
    socket.join(pin);
    socket.emit('room_joined', { pin });
  });

  socket.on('disconnect', () => {
    roomManager.disconnectPlayer(socket);
  });
};