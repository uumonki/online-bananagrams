export interface GameState {
  revealedLetters: string[];
  remainingLetters: number;
  playerWords: Record<string, string[]>;
}

export interface RoomState {
  active: boolean;
  players: string[];
  ownerId: string;
  inactivePlayers: string[];
  disconnectedPlayers: string[];
  currentPlayerId: string;
  turnTimeout: number;
  gameState: GameState;
}
