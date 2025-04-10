type PlayerId = string;
type RoomPin = string;

export interface GameState {
  revealedLetters: string[];
  remainingLetters: number;
  playerWords: Record<PlayerId, string[]>;
}

export interface RoomState {
  pin: RoomPin;
  active: boolean;
  players: PlayerId[];
  playerNicknames: Record<PlayerId, string>;
  ownerId: PlayerId;
  inactivePlayers: PlayerId[];
  disconnectedPlayers: PlayerId[];
  currentPlayerId: PlayerId;
  turnTimeout: number;
  gameState: GameState;
}

export interface Player {
  socketId: PlayerId;
  nickname: string;
}
