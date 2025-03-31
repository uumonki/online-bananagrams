import { Server, Socket } from 'socket.io';
import Room from './Room';

export default class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private currentRoomIndex = 0;
  private roomHash = (i: number) => i * 2654435761 % 10000;
  private atCapacity = () => this.rooms.size >= 10000;

  constructor(private io: Server) { }

  createRoom(socket: Socket): string {
    const pin = this.generateRoomPin();
    const room = new Room(pin, socket.id, this.io);
    this.rooms.set(pin, room);
    return pin;
  }

  closeRoom(pin: string) {
    this.rooms.delete(pin);
  }

  addPlayerToRoom(pin: string, playerId: string) {
    // requires hasRoom(pin) to be true
    this.rooms.get(pin)!.addPlayer(playerId);
  }

  disconnectPlayer(socket: Socket) {
    const room = this.getRoomBySocket(socket);
    if (room) {
      room.removePlayer(socket.id);
      if (room.getPlayers().length === 0) {
        this.closeRoom(room.pin);
      }
    }
  }

  private getRoomBySocket(socket: Socket): Room | undefined {
    return [...this.rooms.values()].find(room => room.hasPlayer(socket.id));
  }

  hasRoom(pin: string): boolean {
    return this.rooms.has(pin);
  }

  roomFull(pin: string): boolean {
    // requires hasRoom(pin) to be true
    return this.rooms.get(pin)!.isFull();
  }

  generateRoomPin(): string {
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