import React, { useEffect, useState } from 'react';
import socket from '../socket';

interface LobbyProps {
  onJoined: (pin: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoined }) => {
  const [joinPin, setJoinPin] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    socket.on('room_created', ({ pin }) => {
      setStatus(`Room created: ${pin}`);
      onJoined(pin);
    });

    socket.on('room_creation_failed', () => {
      setStatus('Room creation failed.');
    });

    socket.on('room_joined', ({ pin }) => {
      setStatus(`Joined room: ${pin}`);
      onJoined(pin);
    });

    socket.on('room_not_found', () => setStatus('Room not found.'));
    socket.on('room_full', () => setStatus('Room is full.'));

    return () => {
      socket.off('room_created');
      socket.off('room_creation_failed');
      socket.off('room_joined');
      socket.off('room_not_found');
      socket.off('room_full');
    };
  }, [onJoined]);

  return (
    <div className="space-y-4">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => socket.emit('create_room')}
      >
        Create Room
      </button>

      <div>
        <input
          className="border px-2 py-1 mr-2"
          value={joinPin}
          onChange={(e) => setJoinPin(e.target.value)}
          placeholder="Enter room PIN"
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => socket.emit('join_room', joinPin)}
        >
          Join Room
        </button>
      </div>

      <div>{status}</div>
    </div>
  );
};

export default Lobby;
