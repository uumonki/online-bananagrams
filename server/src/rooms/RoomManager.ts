import { Server, Socket } from 'socket.io';
import { Player } from 'types';
import Room from './Room';

type PlayerId = string;
type RoomPin = string;

export default class RoomManager {
  // invariant: all rooms are non-empty
  private rooms: Map<RoomPin, Room> = new Map();
  private currentRoomIndex = 0;
  private roomHash = (i: number) => i * 2654435761 % 10000;
  private atCapacity = () => this.rooms.size >= 10000;

  constructor(private io: Server) { }

  createRoomWithPlayer(player: Player): RoomPin {
    const pin = this.generateRoomPin();
    const room = new Room(pin, this.io);
    room.connectPlayer(player.socketId, player.nickname);
    this.rooms.set(pin, room);
    return pin;
  }

  closeRoom(pin: RoomPin) {
    this.rooms.delete(pin);
  }

  addPlayerToRoom(pin: RoomPin, player: Player) {
    if (this.hasRoom(pin)) {
      const room = this.rooms.get(pin);
      room!.connectPlayer(player.socketId, player.nickname);
    }
  }

  disconnectPlayer(socket: Socket) {
    const room = this.getRoomBySocket(socket);
    if (room) {
      room.disconnectPlayer(socket.id);
      if (room.isEmpty()) this.closeRoom(room.pin);
    }
  }

  startGameWithOwnerId(pin: RoomPin, ownerId: PlayerId) {
    if (this.hasRoom(pin)) {
      const room = this.rooms.get(pin);
      room!.handleStartGame(ownerId);
    }
  }

  flipLetter(pin: RoomPin, socketId: PlayerId) {
    if (this.hasRoom(pin)) {
      const room = this.rooms.get(pin);
      room!.handleFlip(socketId);
    }
  }

  submitWord(pin: RoomPin, socketId: PlayerId, word: string, originPlayerId?: PlayerId, originWord?: string) {
    if (this.hasRoom(pin)) {
      const room = this.rooms.get(pin);
      return room!.handleWordSubmission(socketId, word, originPlayerId, originWord);
    }
  }

  private getRoomBySocket(socket: Socket): Room | undefined {
    return [...this.rooms.values()].find(room => room.hasPlayer(socket.id));
  }

  hasRoom(pin: RoomPin): boolean {
    return this.rooms.has(pin);
  }

  roomHasEnoughPlayers(pin: RoomPin): boolean {
    // requires hasRoom(pin) to be true
    return this.rooms.get(pin)!.hasEnoughPlayers();
  }

  roomFull(pin: RoomPin): boolean {
    // requires hasRoom(pin) to be true
    return this.rooms.get(pin)!.isFull();
  }

  hasNickname(pin: RoomPin, nickname: string): boolean {
    // requires hasRoom(pin) to be true
    return this.rooms.get(pin)!.hasNickname(nickname);
  }

  hasPlayer(pin: RoomPin, playerId: PlayerId): boolean {
    // requires hasRoom(pin) to be true
    return this.rooms.get(pin)!.hasPlayer(playerId);
  }

  getRoomState(pin: RoomPin) {
    return this.rooms.get(pin)?.state;
  }

  private generateRoomPin(): RoomPin {
    if (this.atCapacity()) {
      return '';
    }
    var next = this.roomHash(++this.currentRoomIndex).toString().padStart(4, '0');
    while (this.rooms.has(next)) {
      next = this.roomHash(++this.currentRoomIndex).toString().padStart(4, '0');
    }
    return next;
  }
}