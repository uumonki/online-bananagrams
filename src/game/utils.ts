export function validateEnglishWord(word: string, originWord?: string): boolean {
  // Check if word is at least 3 characters long
  if (word.length < 3) return false;

  // Check if word is in the dictionary, also using wordnet
  return true;
}

export function validateEnglishWordSteal(word: string, originWord: string): boolean {
  // Check if word and originWord are the same lemmatised word
  // more logic here, maybe use wordnet
  return true;
}