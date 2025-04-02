import { Server } from 'socket.io';
import Room from '../rooms/Room';

jest.mock('socket.io');
jest.useFakeTimers();

describe('Room', () => {
  let io: Server;
  let room: Room;

  beforeEach(() => {
    io = new Server() as jest.Mocked<Server>;
    io.to = jest.fn().mockReturnValue({
      emit: jest.fn(),
    });
    room = new Room('1234', 'ownerId', io);
  });

  afterEach(() => {
    room.resetGame();
    jest.restoreAllMocks();
  });

  test('add player', () => {
    room.addPlayer('player1');
    expect(room.hasPlayer('player1')).toBe(true);
    expect(room.isFull()).toBe(false);
    expect(room.numPlayers()).toBe(2);
  });

  test('remove player', () => {
    room.addPlayer('player1');
    room.removePlayer('player1');
    expect(room.hasPlayer('player1')).toBe(false);
    expect(room.numPlayers()).toBe(1);
  });

  test('has player', () => {
    room.addPlayer('player1');
    expect(room.hasPlayer('player1')).toBe(true);
    expect(room.hasPlayer('player2')).toBe(false);
  });

  test('player change should broadcast state', () => {
    room.addPlayer('player1');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      players: ['ownerId', 'player1'],
    }));
    room.removePlayer('player1');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      players: ['ownerId'],
    }));
  });

  test('check empty room', () => {
    expect(room.isEmpty()).toBe(false); // owner is in the room
    room.removePlayer('ownerId');
    expect(room.isEmpty()).toBe(true);
  });

  test('check full room', () => {
    expect(room.isFull()).toBe(false);
    room.addPlayer('player1');
    room.addPlayer('player2');
    room.addPlayer('player3');
    room.addPlayer('player4');
    expect(room.isFull()).toBe(true);
  });

  test('start game', () => {
    room.startGame();
    expect(io.to).toHaveBeenCalledWith('1234');
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'ownerId' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      active: true,
      players: ['ownerId'],
      currentPlayer: 'ownerId',
      turnTimeout: 30000,
      gameState: expect.any(Object),
    }));
  });

  test('flip', () => {
    room.addPlayer('player1');
    room.addPlayer('player2');
    room.startGame();
    jest.advanceTimersByTime(2000);
    room.handleFlip('ownerId');
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'player1' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      active: true,
      players: ['ownerId', 'player1', 'player2'],
      currentPlayer: 'player1',
      turnTimeout: 30000,
      gameState: expect.any(Object),
    }));
  });

  test('timeout forces flip', () => {
    room.addPlayer('player1');
    room.addPlayer('player2');
    room.startGame();
    jest.advanceTimersByTime(31000);
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'player1' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayer: 'player1',
    }));
  });

  test('turns wrap around', () => {
    room.addPlayer('player1');
    room.addPlayer('player2');
    jest.advanceTimersByTime(180000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayer: 'ownerId',
    }));
    room.handleFlip('ownerId');
    room.handleFlip('player1');
    room.handleFlip('player2');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayer: 'ownerId',
    }));
  });

  test('should not allow a player to flip out of turn', () => {
    room.addPlayer('player1');
    room.startGame();
    room.handleFlip('player1');
    expect(io.to('1234').emit).not.toHaveBeenCalledWith('start_turn', { playerId: 'player1' });
  });

  test('should handle word submission and interrupt turn', () => {
    const claimWord = jest.spyOn((room as any).currentGame, 'claimWord');
    claimWord.mockImplementation(() => { });

    room.addPlayer('player1');
    room.addPlayer('player2');
    room.addPlayer('player3');

    room.startGame();
    room.handleWordSubmission('player2', 'bananagrams');
    expect(claimWord).toHaveBeenCalledWith('player2', 'bananagrams', undefined, undefined);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayer: 'player2'
    }));
    jest.advanceTimersByTime(30000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayer: 'player3'
    }));
  });
});

