import { Server } from 'socket.io';
import { RoomState } from 'types';
import { Timer, UniqueRecord } from 'utils';
import Game from 'game/Game';
import { MAX_PLAYERS, TURN_TIMEOUT_MS, INACTIVE_TURN_TIMEOUT_MS } from 'config';

export default class Room {
  active: boolean = false;

  private players: string[] = [];
  // invariant: set(players) = playerNicknames.keys()
  private playerNicknames: UniqueRecord<string, string> = new UniqueRecord();
  // TODO: Implement inactive players
  private inactivePlayers = new Set<string>();
  // TODO: Implement disconnected players when player disconnects while active
  // TODO: Implement emitting when reconnected
  private disconnectedPlayers = new Set<string>();
  private currentPlayerIndex = 0;
  private currentGame: Game = new Game();

  private turnTimeout: Timer | null = null;

  constructor(private _pin: string, private io: Server) { }

  get pin() { return this._pin; }

  get ownerId() {
    // first player that isn't disconnected
    return this.players.find(p => !this.disconnectedPlayers.has(p)) ?? '';
  }

  get state(): RoomState {
    return {
      active: this.active,
      players: this.players,
      playerNicknames: this.playerNicknames.record,
      ownerId: this.ownerId,
      inactivePlayers: [...this.inactivePlayers],
      disconnectedPlayers: [...this.disconnectedPlayers],
      currentPlayerId: this.players[this.currentPlayerIndex],
      turnTimeout: this.turnTimeout?.getTimeLeft() ?? TURN_TIMEOUT_MS,
      gameState: this.currentGame.state,
    };
  }

  private startGame() {
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

  endGame() {
    // TODO: Implement end game logic, announce score, remove disconnected players

    // remove disconnected players
    this.playerNicknames = this.playerNicknames.filter(p => !this.disconnectedPlayers.has(p));
    this.players = this.players.filter(p => !this.disconnectedPlayers.has(p));
    this.disconnectedPlayers.clear();
  }

  isFull(): boolean {
    return this.players.length >= MAX_PLAYERS;
  }

  hasNickname(nickname: string): boolean {
    return this.playerNicknames.has(nickname);
  }

  connectPlayer(playerId: string, nickname: string): boolean {
    if (!this.players.includes(playerId) && !this.isFull()) {
      if (this.playerNicknames.set(playerId, nickname)) {
        // nickname is unique, add player
        this.players.push(playerId);
        this.broadcastState();
        return true;
      }
    } else if (this.disconnectedPlayers.has(playerId)) {
      this.reconnectPlayer(playerId);
      return true;
    }
    return false;
  }

  private reconnectPlayer(playerId: string) {
    if (this.disconnectedPlayers.delete(playerId))
      this.broadcastState();
  }

  private activatePlayer(playerId: string) {
    if (this.inactivePlayers.delete(playerId) || this.disconnectedPlayers.delete(playerId)) {
      this.broadcastState();
    }
  }

  disconnectPlayer(playerId: string) {
    if (this.hasPlayer(playerId)) {
      if (!this.active) this.removePlayer(playerId);
      else {
        this.disconnectedPlayers.add(playerId);
        // if all players are disconnected, reset the game
        // to prevent infinite loop
        if (this.numConnectedPlayers <= 0) this.resetGame();
      }
      this.broadcastState();
    }
  }

  private removePlayer(playerId: string) {
    this.players = this.players.filter(p => p !== playerId);
    this.playerNicknames.remove(playerId);
    this.inactivePlayers.delete(playerId);
    this.disconnectedPlayers.delete(playerId);
  }

  get numPlayers() {
    return this.players.length;
  }

  get numConnectedPlayers() {
    // disconnectedPlayers subset of players
    return this.numPlayers - this.disconnectedPlayers.size;
  }

  isEmpty = () => this.numConnectedPlayers <= 0;

  hasPlayer(playerId: string) {
    return this.players.includes(playerId);
  }

  playerIsActive(playerId: string) {
    return !this.inactivePlayers.has(playerId) && !this.disconnectedPlayers.has(playerId);
  }

  private startTurn() {
    if (this.turnTimeout) this.turnTimeout.pause();
    const currentPlayerId = this.players[this.currentPlayerIndex];
    this.io.to(this.pin).emit('start_turn', { playerId: currentPlayerId });

    const timeoutInMilliseconds = this.playerIsActive(currentPlayerId)
      ? TURN_TIMEOUT_MS
      : INACTIVE_TURN_TIMEOUT_MS;

    this.turnTimeout = new Timer(() => {
      this.flipAndAdvance();
    }, timeoutInMilliseconds);
    this.broadcastState();
  }

  private flipAndAdvance() {
    this.currentGame.flipNextLetter();
    if (!this.currentGame.deckIsEmpty()) {
      this.currentPlayerIndex = this.getNextConnectedPlayerIndex();
      this.startTurn();
    } else {
      this.endGame();
    }
  }

  private getNextConnectedPlayerIndex() {
    let nextIndex = this.currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % this.players.length;
    } while (this.disconnectedPlayers.has(this.players[nextIndex]));
    return nextIndex;
  }

  handleStartGame(playerId: string) {
    if (playerId !== this.ownerId) return;
    if (this.numPlayers < 2) return;
    this.startGame();
  }

  handleFlip(playerId: string) {
    this.activatePlayer(playerId);
    if (this.players[this.currentPlayerIndex] !== playerId) return;
    this.flipAndAdvance();
  }

  handleWordSubmission(playerId: string, word: string, originPlayerId?: string, originWord?: string) {
    this.activatePlayer(playerId);
    if (originPlayerId && originWord) {
      this.currentGame.stealWord(playerId, word, originPlayerId, originWord);
    } else {
      this.currentGame.claimWord(playerId, word);
    }

    // Interrupt turn
    this.currentPlayerIndex = this.players.indexOf(playerId);
    this.startTurn();
  }

  broadcastState() {
    this.io.to(this.pin).emit('state_update', this.state);
  }
}