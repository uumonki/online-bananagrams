import { GameState } from "../../../server/src/types";

type PlayerId = string;

type WordConstruction =
  | "FromCentralPile"
  | {
    originPlayer: PlayerId;
    originWord: string;
  }

export default function findWordConstructions(
  word: string,
  gameState: GameState
): WordConstruction[] {
  const constructions: WordConstruction[] = [];

  const wordLetters = new Multiset(word.split(''));
  const centralPile = new Multiset(gameState.revealedLetters);

  if (wordLetters.isSubsetOf(centralPile)) {
    constructions.push("FromCentralPile");
  }

  // loop through playerWords record
  for (const [playerId, playerWords] of Object.entries(gameState.playerWords)) {
    for (const playerWord of playerWords) {
      const playerWordLetters = new Multiset(playerWord.split(''));
      if (word.length > playerWord.length && playerWordLetters.isSubsetOf(wordLetters)) {
        const remainingLetters = wordLetters.subtract(playerWordLetters);
        if (remainingLetters.isSubsetOf(centralPile)) {
          constructions.push({
            originPlayer: playerId,
            originWord: playerWord,
          });
        }
      }
    }
  }

  return constructions;
}

class Multiset {
  private counts: Map<string, number>;
  private _size = 0;

  constructor(items: string[] = []) {
    this.counts = new Map();
    for (const item of items) {
      this.add(item);
    }
  }

  add(item: string, count = 1) {
    this.counts.set(item, (this.counts.get(item) ?? 0) + count);
    this._size += count;
  }

  get(item: string): number {
    return this.counts.get(item) ?? 0;
  }

  isSubsetOf(other: Multiset): boolean {
    for (const [item, count] of this.counts.entries()) {
      if (count > other.get(item)) {
        return false;
      }
    }
    return true;
  }

  subtract(other: Multiset): Multiset {
    const result = new Multiset();
    for (const [item, count] of this.counts.entries()) {
      const diff = count - other.get(item);
      if (diff > 0) {
        result.add(item, diff);
      }
    }
    return result;
  }

  get size(): number {
    return this.size;
  }
}
