import React, { useEffect, useState } from 'react';
import socket from '../socket';

interface LobbyProps {
  onJoined: (pin: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoined }) => {
  const [nickname, setNickname] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [status, setStatus] = useState('');
  const [joining, setJoining] = useState(false);

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

  const handleCreate = () => {
    if (nickname.trim()) {
      socket.emit('create_room', nickname);
    } else {
      setStatus('Please enter a nickname first.');
    }
  };

  const handleJoin = () => {
    if (!joining) {
      setJoining(true);
    } else {
      if (nickname.trim() && joinPin.trim()) {
        socket.emit('join_room', joinPin, nickname);
      } else {
        setStatus('Please enter both a nickname and PIN.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {!joining && (
        <>
          <input
            className="border px-3 py-2 rounded w-64 text-center"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
          />

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-64"
            onClick={handleCreate}
          >
            Create Room
          </button>
        </>
      )}

      {joining && (
        <input
          className="border px-3 py-2 rounded w-64 text-center"
          value={joinPin}
          onChange={(e) => setJoinPin(e.target.value)}
          placeholder="Enter room PIN"
        />
      )}

      <button
        className={`px-4 py-2 ${joining ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white rounded w-64`}
        onClick={handleJoin}
      >
        {joining ? 'Enter' : 'Join Room'}
      </button>

      {status && <div className="text-sm text-red-600">{status}</div>}
    </div>
  );
};

export default Lobby;
