import Game from 'game/Game';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
    (game as any).unflippedLetters = ['M', 'U', 'S', 'T', 'A', 'B'];
  });

  afterEach(() => { });

  test('flip next letter', () => {
    expect(game.flipNextLetter()).toBe('B');
    expect(game.flipNextLetter()).toBe('A');
    expect(game.flipNextLetter()).toBe('T');
    expect(game.flipNextLetter()).toBe('S');
    expect(game.flipNextLetter()).toBe('U');

    expect(game.state).toEqual({
      revealedLetters: ['B', 'A', 'T', 'S', 'U'],
      remainingLetters: 1,
      playerWords: {},
    });

    expect(game.flipNextLetter()).toBe('M');
    expect(game.flipNextLetter()).toBe(null);
    expect(game.deckIsEmpty()).toBe(true);
  });

  test('claim word', () => {
    for (let i = 0; i < 2; i++) {
      game.flipNextLetter();
    }
    expect(game.claimWord('player1', 'BAT')).toBe(false);
    expect(game.claimWord('player1', 'BA')).toBe(false);

    game.flipNextLetter();
    expect(game.claimWord('player1', 'BAT')).toBe(true);
    expect(game.state).toEqual({
      revealedLetters: [],
      remainingLetters: 3,
      playerWords: { player1: ['BAT'] },
    });

    for (let i = 0; i < 3; i++) {
      game.flipNextLetter();
    }
    expect(game.claimWord('player2', 'MUST')).toBe(false);
    expect(game.claimWord('player2', 'SUM')).toBe(true);

    expect(game.state).toEqual({
      revealedLetters: [],
      remainingLetters: 0,
      playerWords: { player1: ['BAT'], player2: ['SUM'] },
    });
  });

  test('steal word', () => {
    for (let i = 0; i < 4; i++) {
      game.flipNextLetter();
    }
    game.claimWord('player1', 'BAT');
    expect(game.stealWord('player2', 'STAB', 'player1', 'BAT')).toBe(true);
    expect(game.state).toEqual({
      revealedLetters: [],
      remainingLetters: 2,
      playerWords: { player1: [], player2: ['STAB'] },
    });
  });

  test('steal word invalid', () => {
    for (let i = 0; i < 4; i++) {
      game.flipNextLetter();
    }
    game.claimWord('player1', 'BAT');
    expect(game.stealWord('player2', 'BATS', 'player1', 'BAT')).toBe(false);
    expect(game.stealWord('player2', 'BAT', 'player1', 'BAT')).toBe(false);
    expect(game.stealWord('player2', 'SAT', 'player1', 'BAT')).toBe(false);
    expect(game.stealWord('player2', 'BART', 'player1', 'BAT')).toBe(false);
    expect(game.stealWord('player2', 'STAB', 'player3', 'BAT')).toBe(false);
    expect(game.state).toEqual({
      revealedLetters: ['S'],
      remainingLetters: 2,
      playerWords: { player1: ['BAT'] },
    });
  });

  test('invalid english word', () => {
    for (let i = 0; i < 6; i++) {
      game.flipNextLetter();
    }
    expect(game.claimWord('player1', 'TAS')).toBe(false);
    game.claimWord('player1', 'BAT');
    expect(game.stealWord('player2', 'TASB', 'player1', 'BAT')).toBe(false);
  });
});