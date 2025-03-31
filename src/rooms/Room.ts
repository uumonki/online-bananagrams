import { Server } from 'socket.io';
import { RoomState } from 'types';
import { Timer } from 'utils';
import Game from 'game/Game';
import { MAX_PLAYERS, TURN_TIMEOUT_MS } from 'config';

export default class Room {
  pin: string;

  private players: string[] = [];
  private inactivePlayers = new Set<number>();
  private currentPlayerIndex = 0;
  private currentGame: Game = new Game();
  private active = false;

  private turnTimeout: Timer | null = null;

  constructor(
    pin: string,
    private ownerId: string,
    private io: Server
  ) {
    this.pin = pin;
    this.players.push(ownerId);
  }

  startGame() {
    this.active = true;
    this.startTurn();
  }

  resetGame() {
    this.currentGame = new Game();
    this.broadcastState();
  }

  isFull(): boolean {
    return this.players.length >= MAX_PLAYERS;
  }

  addPlayer(playerId: string) {
    if (!this.players.includes(playerId)) {
      this.players.push(playerId);
    }
    this.broadcastState();
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter(p => p !== playerId);
  }

  getPlayers = () => this.players;

  hasPlayer(playerId: string) {
    return this.players.includes(playerId);
  }

  private startTurn() {
    if (this.turnTimeout) this.turnTimeout.pause();
    this.broadcastState();
    const currentPlayer = this.players[this.currentPlayerIndex];
    this.io.to(this.pin).emit('start_turn', { playerId: currentPlayer });
    this.turnTimeout = new Timer(() => {
      this.flipAndAdvance();
    }, TURN_TIMEOUT_MS);
  }

  private flipAndAdvance() {
    this.currentGame.flipNextLetter();
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.startTurn();
  }

  handleFlip(playerId: string) {
    if (this.players[this.currentPlayerIndex] !== playerId) return;
    this.flipAndAdvance();
  }

  handleWordSubmission(playerId: string, word: string, targetPlayerId?: string, targetWord?: string) {
    this.currentGame.claimWord(playerId, word, targetPlayerId, targetWord);

    // Interrupt turn
    this.currentPlayerIndex = this.players.indexOf(playerId);
    this.startTurn();
  }

  getRoomState(): RoomState {
    return {
      active: this.active,
      players: this.players,
      currentPlayer: this.players[this.currentPlayerIndex],
      turnTimeout: this.turnTimeout?.getTimeLeft() ?? TURN_TIMEOUT_MS,
      gameState: this.currentGame.getGameState(),
    };
  }

  broadcastState() {
    this.io.to(this.pin).emit('state_update', this.getRoomState());
  }
}