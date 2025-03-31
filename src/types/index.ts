export interface GameState {
  revealedLetters: string[];
  remainingLetters: number;
  playerWords: Record<string, string[]>;
}

export interface RoomState {
  active: boolean;
  players: string[];
  currentPlayer: string;
  turnTimeout: number;
  gameState: GameState;
}
