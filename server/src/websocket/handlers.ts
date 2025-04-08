import { Socket } from 'socket.io';
import { Player } from 'types';
import { NICKNAME_REGEX } from 'config';
import RoomManager from 'rooms/RoomManager';

export const handleConnection = (socket: Socket, roomManager: RoomManager) => {
  socket.on('create_room', (nickname: string) => {
    const player: Player = {
      socketId: socket.id,
      nickname: nickname,
    };
    const pin = roomManager.createRoomWithPlayer(player);
    if (!pin) {
      socket.emit('room_creation_failed');
      return;
    }
    socket.join(pin);
    socket.emit('room_created', { pin });
  });

  socket.on('join_room', (pin: string, nickname: string) => {
    if (!NICKNAME_REGEX.test(nickname)) return;

    if (!roomManager.hasRoom(pin)) {
      socket.emit('room_not_found');
      return;
    }

    if (roomManager.roomFull(pin)) {
      socket.emit('room_full');
      return;
    }

    if (roomManager.hasNickname(pin, nickname)) {
      socket.emit('nickname_taken');
      return;
    }

    const player: Player = {
      socketId: socket.id,
      nickname: nickname,
    };
    roomManager.addPlayerToRoom(pin, player);
    socket.join(pin);
    socket.emit('room_joined', { pin });
  });

  socket.on('disconnect', () => {
    roomManager.disconnectPlayer(socket);
  });

  socket.on('get_room_state', (pin: string) => {
    if (!roomManager.hasRoom(pin)) {
      socket.emit('room_not_found');
      return;
    }
    if (!roomManager.hasPlayer(pin, socket.id)) {
      return;
    }
    const state = roomManager.getRoomState(pin);
    socket.emit('state_update', state);
  });

  socket.on('start_game', (pin: string) => {
    if (!roomManager.hasRoom(pin)) {
      socket.emit('room_not_found');
      return;
    }
    if (!roomManager.roomHasEnoughPlayers(pin)) {
      socket.emit('not_enough_players');
      return;
    }
    roomManager.startGameWithOwnerId(pin, socket.id);
  }
  );
};