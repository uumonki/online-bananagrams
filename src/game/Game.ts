import { MultiSet } from 'mnemonist';

import { GameState } from './types';
import { shuffle, validateEnglishWord, subtractMultiSet } from './utils';
import { letterFrequencyTable } from 'config';

const unshuffledDeck: string[] = Object.entries(letterFrequencyTable).flatMap(
  ([letter, count]) => Array(count).fill(letter)
);

/**
 * Represents the state of the game.
 * 
 * The game state includes the remaining deck, the revealed letters,
 * and the words submitted by each player.
 *
 * The game state is responsible for managing the game logic, such as flipping
 * the next letter, submitting a word, and providing the public game state.
 * It is not responsible for validating player actions or handling player
 * connections.
 * 
 * Each game state is associated with a single round of the game. If a game
 * room starts a new round, a new game state should be created.
*/
export default class Game {
  private unflippedLetters: string[] = shuffle([...unshuffledDeck]);
  private revealedLetters: MultiSet<string> = new MultiSet<string>();
  private playerWords: Record<string, string[]> = {};

  flipNextLetter(): string | null {
    const letter = this.unflippedLetters.pop();
    if (letter) this.revealedLetters.add(letter);
    return letter ?? null;
  }

  claimWord(
    playerId: string,
    word: string,
    targetPlayerId?: string,
    targetWord?: string
  ): boolean {
    if (!validateEnglishWord(word, targetWord)) return false;

    const lettersToDraw = targetPlayerId && targetWord
      ? this.stealWordFrom(word, targetPlayerId, targetWord)
      : MultiSet.from(word);

    // Check that the target has the target word and that the deck has the letters
    if (!lettersToDraw) return false;
    if (MultiSet.isSubset(lettersToDraw!, this.revealedLetters)) return false;

    // Update game state
    this.revealedLetters = subtractMultiSet(this.revealedLetters, lettersToDraw);
    if (targetPlayerId) this.removeWordFromPlayer(targetPlayerId, targetWord!);
    this.addWordToPlayer(playerId, word);

    return true;
  }

  getGameState(): GameState {
    return {
      revealedLetters: [...this.revealedLetters],
      remainingLetters: this.unflippedLetters.length,
      playerWords: { ...this.playerWords },
    };
  }

  /**
   * Validate that the targetPlayer has the targetWord and that it is 
   * a subset of word
   * 
   * Returns the remaining letters in word after removing targetWord 
   * if valid, otherwise undefined
   */
  private stealWordFrom(
    word: string,
    targetPlayerId: string,
    targetWord: string
  ): MultiSet<string> | undefined {
    const wordLetters = MultiSet.from(word);
    const targetWordLetters = MultiSet.from(targetWord);
    if (
      this.playerWords[targetPlayerId]?.includes(targetWord) &&
      MultiSet.isSubset(targetWordLetters, wordLetters)
    ) {
      targetWordLetters.forEachMultiplicity((count, key) => {
        wordLetters.remove(key, count);
      });
      return wordLetters;
    } else return;
  }

  private addWordToPlayer(playerId: string, word: string) {
    (this.playerWords[playerId] ??= []).push(word);
  }

  /** Removes one instance of word from playerId. */
  private removeWordFromPlayer(playerId: string, word: string) {
    this.playerWords[playerId]?.splice(
      this.playerWords[playerId].indexOf(word), 1
    );
  }
}