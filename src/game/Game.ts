import { MultiSet } from 'mnemonist';

import { GameState } from 'types';
import { shuffle, subtractMultiSet } from 'utils';
import { validateEnglishWord, validateEnglishWordSteal } from './utils';
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

  claimWord(playerId: string, word: string): boolean {
    if (word.length < 3) return false;
    if (!validateEnglishWord(word)) return false;
    const lettersToDraw = MultiSet.from(word);
    if (!this.deckHasLetters(lettersToDraw)) return false;

    // Update game state
    this.removeLettersFromDeck(lettersToDraw);
    this.addWordToPlayer(playerId, word);
    return true;
  }

  stealWord(playerId: string, word: string, originPlayerId: string, originWord: string): boolean {
    if (!validateEnglishWord(word)) return false;
    if (!validateEnglishWordSteal(word, originWord)) return false;

    const lettersToDraw = this.lettersRemainingAfterStealingFrom(word, originPlayerId, originWord)
    // Check that the origin has originWord and that the deck has the letters
    if (!lettersToDraw) return false;
    if (!this.deckHasLetters(lettersToDraw)) return false;

    // Update game state
    this.removeLettersFromDeck(lettersToDraw);
    this.removeWordFromPlayer(originPlayerId, originWord);
    this.addWordToPlayer(playerId, word);
    return true;
  }

  private deckHasLetters(letters: MultiSet<string>): boolean {
    return MultiSet.isSubset(letters, this.revealedLetters);
  }

  /**
   * Validate first this.deckHasLetters(letters) before calling this method.
   */
  private removeLettersFromDeck(letters: MultiSet<string>) {
    this.revealedLetters = subtractMultiSet(this.revealedLetters, letters);
  }

  deckIsEmpty(): boolean {
    return this.unflippedLetters.length === 0;
  }

  get state(): GameState {
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
  private lettersRemainingAfterStealingFrom(
    word: string,
    targetPlayerId: string,
    targetWord: string
  ): MultiSet<string> | undefined {
    const wordLetters = MultiSet.from(word);
    const targetWordLetters = MultiSet.from(targetWord);
    const isValidSteal = (this.playerHasWord(targetPlayerId, targetWord) &&
      MultiSet.isSubset(targetWordLetters, wordLetters)) &&
      word.length > targetWord.length;

    if (isValidSteal) return subtractMultiSet(wordLetters, targetWordLetters);
  }

  private playerHasWord(playerId: string, word: string): boolean {
    if (!this.playerWords[playerId]) return false;
    return this.playerWords[playerId].includes(word);
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