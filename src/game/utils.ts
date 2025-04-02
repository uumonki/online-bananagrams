export function validateEnglishWord(word: string, originWord?: string): boolean {
  // TODO: Implement this function
  if (word === 'TAS' || word === 'TASB') return false;
  // Check if word is in the dictionary, also using wordnet
  return true;
}

export function validateEnglishWordSteal(word: string, originWord: string): boolean {
  // Check if word and originWord are the same lemmatised word
  // more logic here, maybe use wordnet
  if (word.slice(-1) === 'S' && word.slice(0, -1) === originWord) return false;
  return true;
}