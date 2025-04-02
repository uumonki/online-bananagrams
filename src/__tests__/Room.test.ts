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
    room = new Room('1234', io);
    room.addPlayer('ownerId');
  });

  afterEach(() => {
    room.resetGame();
    jest.restoreAllMocks();
  });

  test('add player', () => {
    expect(room.hasPlayer('player1Id')).toBe(false);
    expect(room.numPlayers).toBe(1); // owner is in the room
    room.addPlayer('player1Id');
    expect(room.hasPlayer('player1Id')).toBe(true);
    expect(room.isFull()).toBe(false);
    expect(room.numPlayers).toBe(2);
  });

  test('remove player', () => {
    room.addPlayer('player1Id');
    room.disconnectPlayer('player1Id');
    expect(room.hasPlayer('player1Id')).toBe(false);
    expect(room.numPlayers).toBe(1);
  });

  test('has player', () => {
    room.addPlayer('player1Id');
    expect(room.hasPlayer('player1Id')).toBe(true);
    expect(room.hasPlayer('player2Id')).toBe(false);
  });

  test('disconnect and reconnect while active', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    room.disconnectPlayer('player1Id');
    expect(room.numPlayers).toBe(3);
    expect(room.numConnectedPlayers).toBe(2);
    expect(room.hasPlayer('player1Id')).toBe(true);
    expect(room.playerIsActive('player1Id')).toBe(false);
    room.reconnectPlayer('player1Id');
    expect(room.numConnectedPlayers).toBe(3);
  });

  test('disconnecting everyone resets game', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    room.disconnectPlayer('ownerId');
    room.disconnectPlayer('player1Id');
    room.disconnectPlayer('player2Id');
    expect(room.active).toBe(false);
  });

  test('end game with disconnected players', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    room.disconnectPlayer('player1Id');
    expect(room.numConnectedPlayers).toBe(2);
    expect(room.numPlayers).toBe(3);
    room.endGame();
    expect(room.numConnectedPlayers).toBe(2);
    expect(room.numPlayers).toBe(2);
  });

  test('owner disconnect should change owner', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    room.disconnectPlayer('ownerId');
    expect(room.ownerId).toBe('player1Id');
  });

  test('player change should broadcast state', () => {
    room.addPlayer('player1Id');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      players: ['ownerId', 'player1Id'],
    }));
    room.addPlayer('player2Id');
    expect(io.to('1234').emit).toHaveBeenCalledTimes(3);
    room.addPlayer('player1Id');
    expect(io.to('1234').emit).toHaveBeenCalledTimes(3);
    room.disconnectPlayer('player1Id');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      players: ['ownerId', 'player2Id'],
    }));
  });

  test('check empty room', () => {
    expect(room.isEmpty()).toBe(false); // owner is in the room
    room.disconnectPlayer('ownerId');
    expect(room.isEmpty()).toBe(true);
  });

  test('check full room', () => {
    expect(room.isFull()).toBe(false);
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.addPlayer('player3Id');
    room.addPlayer('player4Id');
    expect(room.isFull()).toBe(true);
  });

  test('cannot add player to full room', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.addPlayer('player3Id');
    room.addPlayer('player4Id');
    room.addPlayer('player5Id');
    expect(room.numPlayers).toBe(5);
  });

  test('only owner can start game', () => {
    room.addPlayer('player1Id');
    room.handleStartGame('player1Id');
    expect(room.active).toBe(false);
    room.handleStartGame('ownerId');
    expect(room.active).toBe(true);
  });

  test('cannot start with less than 2 players', () => {
    room.handleStartGame('ownerId');
    expect(room.active).toBe(false);
    room.addPlayer('player1Id');
    room.handleStartGame('ownerId');
    expect(room.active).toBe(true);
  });

  test('start game', () => {
    room.addPlayer('player1Id');
    room.handleStartGame('ownerId');
    expect(io.to).toHaveBeenCalledWith('1234');
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'ownerId' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      active: true,
      players: ['ownerId', 'player1Id'],
      currentPlayerId: 'ownerId',
      turnTimeout: 30000,
      gameState: expect.any(Object),
    }));
  });

  test('flip', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    jest.advanceTimersByTime(2000);
    room.handleFlip('ownerId');
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'player1Id' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      active: true,
      players: ['ownerId', 'player1Id', 'player2Id'],
      currentPlayerId: 'player1Id',
      turnTimeout: 30000,
      gameState: expect.any(Object),
    }));
  });

  test('timeout forces flip', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.handleStartGame('ownerId');
    jest.advanceTimersByTime(31000);
    expect(io.to('1234').emit).toHaveBeenCalledWith('start_turn', { playerId: 'player1Id' });
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player1Id',
    }));
  });

  test('turns wrap around', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    jest.advanceTimersByTime(180000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'ownerId',
    }));
    room.handleFlip('ownerId');
    room.handleFlip('player1Id');
    room.handleFlip('player2Id');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'ownerId',
    }));
  });

  test('should not allow a player to flip out of turn', () => {
    room.addPlayer('player1Id');
    room.handleStartGame('ownerId');
    room.handleFlip('player1Id');
    expect(io.to('1234').emit).not.toHaveBeenCalledWith('start_turn', { playerId: 'player1Id' });
  });

  test('disconnected players should be skipped', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.addPlayer('player3Id');
    room.handleStartGame('ownerId');
    room.disconnectPlayer('player1Id');
    jest.advanceTimersByTime(30000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player2Id',
    }));
  });

  test('inactive players should have shorter turn timeout', () => {
    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.addPlayer('player3Id');
    room.handleStartGame('ownerId');
    (room as any).inactivePlayers.add('player1Id');
    jest.advanceTimersByTime(30000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player1Id',
    }));
    jest.advanceTimersByTime(5000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player2Id',
    }));
  });

  test('should handle word submission and interrupt turn', () => {
    const claimWord = jest.spyOn((room as any).currentGame, 'claimWord');
    claimWord.mockImplementation(() => { });

    room.addPlayer('player1Id');
    room.addPlayer('player2Id');
    room.addPlayer('player3Id');

    room.handleStartGame('ownerId');
    room.handleWordSubmission('player2Id', 'bananagrams');
    expect(claimWord).toHaveBeenCalledWith('player2Id', 'bananagrams');
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player2Id'
    }));
    jest.advanceTimersByTime(30000);
    expect(io.to('1234').emit).toHaveBeenLastCalledWith('state_update', expect.objectContaining({
      currentPlayerId: 'player3Id'
    }));
  });
});

