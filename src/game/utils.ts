import { MultiSet } from 'mnemonist';

/**
 * In-place shuffle of an array.
 */
export function shuffle<T>(array: T[]): T[] {
  // https://stackoverflow.com/questions/48083353/i-want-to-know-how-to-shuffle-an-array-in-typescript
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

/**
 * Subtract two multisets. Assumes b is a subset of a.
 */
export function subtractMultiSet<T>(a: MultiSet<T>, b: MultiSet<T>): MultiSet<T> {
  const result = new MultiSet<T>();
  a.forEachMultiplicity((count, key) => {
    result.add(key, count - b.multiplicity(key));
  });
  return result;
}

export function validateEnglishWord(word: string, originWord?: string): boolean {
  // Check if word is at least 3 characters long
  if (word.length < 3) return false;

  // Check if word and originWord are the same lemmatised word
  if (originWord !== undefined) {
    // more logic here, maybe use wordnet
  }

  // Check if word is in the dictionary, also using wordnet
  return true;
}