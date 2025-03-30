import { Server } from 'socket.io';
import Game from 'game/Game';
import { MAX_PLAYERS } from 'config';

export default class Room {
  private players: string[] = [];
  private gameState: Game = new Game();
  private started = false;

  constructor(
    private pin: string,
    private ownerId: string,
    private io: Server
  ) {
    this.players.push(ownerId);
  }

  isFull(): boolean {
    return this.players.length >= MAX_PLAYERS;
  }

  addPlayer(playerId: string) {
    if (!this.players.includes(playerId)) {
      this.players.push(playerId);
    }
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter(p => p !== playerId);
  }

  broadcastState() {
    this.io.to(this.pin).emit('state_update', this.gameState.getGameState());
  }

  // More methods for game logic will go here
}