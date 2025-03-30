export interface PublicGameState {
  revealedLetters: string[];
  remainingLetters: number;
  playerWords: Record<string, string[]>;
}