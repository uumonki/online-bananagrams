export interface GameState {
  revealedLetters: string[];
  remainingLetters: number;
  playerWords: Record<string, string[]>;
}