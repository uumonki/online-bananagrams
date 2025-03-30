import { MultiSet } from 'mnemonist';

import { PublicGameState } from './types';
import { shuffle, validateWord } from './utils';
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
export default class GameState {
  private remainingLetters: string[] = shuffle([...unshuffledDeck]);
  private revealedLetters: MultiSet<string> = new MultiSet<string>();
  private playerWords: Record<string, string[]> = {};

  flipLetter(): string | null {
    const letter = this.remainingLetters.pop();
    if (letter) this.revealedLetters.add(letter);
    return letter ?? null;
  }

  claimWord(
    playerId: string,
    word: string,
    targetPlayerId?: string,
    targetWord?: string
  ): boolean {
    if (!validateWord(word, targetWord)) return false;

    const wordLetters = MultiSet.from(word);
    if (targetPlayerId) { // additional validation for stealing words
      // validate that targetPlayer does have targetWord
      if (!this.playerWords[targetPlayerId]?.includes(targetWord ?? '')) return false;
      // targetword must be a subset of wordLetters
      const targetWordLetters = MultiSet.from(targetWord!);
      if (!MultiSet.isSubset(targetWordLetters, wordLetters)) return false;
      // remove targetWordLetters from wordLetters
      targetWordLetters.forEachMultiplicity((count, key) => {
        wordLetters.remove(key, count);
      });
    }

    if (!MultiSet.isSubset(wordLetters, this.revealedLetters)) return false;

    // remove word letters from revealedLetters
    wordLetters.forEachMultiplicity((count, key) => {
      this.revealedLetters.remove(key, count);
    });

    // remove one instance of targetWord from targetPlayer
    if (targetPlayerId) {
      this.playerWords[targetPlayerId]?.splice(
        this.playerWords[targetPlayerId].indexOf(targetWord!), 1
      );
    }

    // add word to playerWords
    (this.playerWords[playerId] ??= []).push(word);
    return true;
  }

  getPublicState(): PublicGameState {
    return {
      revealedLetters: [...this.revealedLetters],
      remainingLetters: this.remainingLetters.length,
      playerWords: { ...this.playerWords },
    };
  }

}