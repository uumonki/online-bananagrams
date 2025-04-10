import React, { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../socket';

interface LobbyProps {
  onJoined: (pin: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoined }) => {
  const [nickname, setNickname] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [status, setStatus] = useState('');
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (nicknameInputRef.current) {
      nicknameInputRef.current.focus(); // Focus the input on mount
    }
  }, []);

  useEffect(() => {
    socket.on('room_created', (data: { pin: string }) => {
      setStatus(`Room created: ${data.pin}`);
      onJoined(data.pin);
    });

    socket.on('room_creation_failed', () => {
      setStatus('We are at capacity. Please try again later.');
    });

    socket.on('room_joined', (data: { pin: string }) => {
      setStatus(`Joined room: ${data.pin}`);
      onJoined(data.pin);
    });

    socket.on('room_not_found', () => setStatus('Room not found.'));
    socket.on('room_full', () => setStatus('Room is full.'));
    socket.on('nickname_taken', () => setStatus('Nickname already taken.'));

    return () => {
      socket.off('room_created');
      socket.off('room_creation_failed');
      socket.off('room_joined');
      socket.off('room_not_found');
      socket.off('room_full');
      socket.off('nickname_taken');
    };
  }, [onJoined]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillPin = params.get('pin');
    if (prefillPin) {
      setJoinPin(prefillPin);
    }
  }, []);

  const isValidNickname = useCallback((name: string): boolean => {
    const nicknameRegex = /^[a-zA-Z0-9]{1,16}$/;
    return nicknameRegex.test(name);
  }, []);

  const clearStatusAfterDelay = useCallback(() => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => setStatus(''), 5000);
  }, []);

  const handleCreate = useCallback(() => {
    if (!isValidNickname(nickname)) {
      setStatus('Nickname must be alphanumeric and 1-16 characters long.');
      clearStatusAfterDelay();
      return;
    }
    socket.emit('create_room', nickname);
  }, [nickname, isValidNickname, clearStatusAfterDelay]);

  const handleJoin = useCallback(() => {
    if (!isValidNickname(nickname)) {
      setStatus('Nickname must be alphanumeric and 1-16 characters long.');
      clearStatusAfterDelay();
      return;
    }
    if (!joinPin.trim()) {
      setStatus('Please enter a valid room PIN.');
      clearStatusAfterDelay();
      return;
    }
    socket.emit('join_room', joinPin, nickname);
  }, [nickname, joinPin, isValidNickname, clearStatusAfterDelay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (joinPin) {
          handleJoin();
        } else {
          handleCreate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [joinPin, handleCreate, handleJoin]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-screen h-screen">
      <h1 className="text-3xl mb-3">Bananagrams</h1>
      <div className="flex flex-col space-y-2 p-6 bg-white rounded drop-shadow-sm w-100">
        <input
          ref={nicknameInputRef}
          className="border px-3 py-2 rounded text-center bg-white"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          maxLength={16}
          aria-label="Enter your nickname"
        />
      </div>
      <div className="flex flex-col space-y-2 p-6 bg-white rounded drop-shadow-sm w-100">
        <div className="flex space-x-2">
          <input
            className="border px-3 py-2 rounded flex-grow text-center w-2/3 bg-white"
            value={joinPin}
            onChange={(e) => setJoinPin(e.target.value)}
            placeholder="Room PIN"
            maxLength={4}
            aria-label="Enter room PIN"
          />
          <button
            className="px-4 py-2 bg-white border text-black hover:bg-gray-100 rounded w-1/3"
            onClick={handleJoin}
            aria-label="Join Room"
          >
            Join Room
          </button>
        </div>

        <div className="text-center text-sm text-gray-500"> — OR — </div>

        <button
          className="px-4 py-2 bg-white border text-black hover:bg-gray-100 rounded"
          onClick={handleCreate}
          aria-label="Create Room"
        >
          Create Room
        </button>
      </div>
      {status && <div className="text-sm text-red-600 text-center">{status}</div>}
    </div>
  );
};

export default Lobby;
