import { Server, Socket } from 'socket.io';
import Room from './Room';

export default class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private currentRoomIndex = 0;
  private roomHash = (i: number) => i * 2654435761 % 10000;
  private atCapacity = () => this.rooms.size >= 10000;

  constructor(private io: Server) { }

  handleConnection(socket: Socket) {
    socket.on('create_room', (cb) => {
      const pin = this.createRoom(socket);
      socket.join(pin);
      cb({ success: true, pin });
    });

    socket.on('join_room', ({ pin }, cb) => {
      const room = this.rooms.get(pin);
      if (room === undefined) return cb({ success: false, message: 'Room not found' });
      if (room.isFull()) return cb({ success: false, message: 'Room is full' });

      socket.join(pin);
      room.addPlayer(socket.id);
      cb({ success: true });
      room.broadcastState();
    });
  }

  createRoom(socket: Socket): string {
    const pin = this.generateRoomPin();
    const room = new Room(pin, socket.id, this.io);
    this.rooms.set(pin, room);
    return pin;
  }

  closeRoom(pin: string) {
    this.rooms.delete(pin);
  }

  generateRoomPin(): string {
    if (this.atCapacity()) {
      throw new Error('Room capacity reached');
    }
    var next = this.roomHash(++this.currentRoomIndex).toString().padStart(4, '0');
    while (this.rooms.has(next)) {
      next = this.roomHash(++this.currentRoomIndex).toString().padStart(4, '0');
    }
    return next;
  }
}