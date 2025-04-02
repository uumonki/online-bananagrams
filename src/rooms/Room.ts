import { Server } from 'socket.io';
import { RoomState } from 'types';
import { Timer } from 'utils';
import Game from 'game/Game';
import { MAX_PLAYERS, TURN_TIMEOUT_MS } from 'config';

export default class Room {
  pin: string;
  active: boolean = false;

  private players: string[] = [];
  // TODO: Implement inactive players
  private inactivePlayers = new Set<number>();
  // TODO: Implement disconnected players when player disconnects while active
  private disconnectedPlayers = new Set<number>();
  private currentPlayerIndex = 0;
  private currentGame: Game = new Game();

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
    this.active = false;
    this.currentGame = new Game();
    this.currentPlayerIndex = 0;
    this.turnTimeout?.pause();
    this.turnTimeout = null;
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
    this.broadcastState();
  }

  numPlayers = () => this.players.length;

  isEmpty = () => this.numPlayers() === 0;

  hasPlayer(playerId: string) {
    return this.players.includes(playerId);
  }

  private startTurn() {
    if (this.turnTimeout) this.turnTimeout.pause();
    const currentPlayer = this.players[this.currentPlayerIndex];
    this.io.to(this.pin).emit('start_turn', { playerId: currentPlayer });
    this.turnTimeout = new Timer(() => {
      this.flipAndAdvance();
    }, TURN_TIMEOUT_MS);
    this.broadcastState();
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