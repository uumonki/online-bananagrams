import React, { useEffect, useState } from 'react';
import './App.css';
import Lobby from './components/Lobby';
import socket from './socket';
import { RoomState } from '../../server/src/types';
import GameRoom from './components/GameRoom';

// TODO: handle reconnect-failed, disconnect, and reconnect events

const App: React.FC = () => {
  const [pin, setPin] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  useEffect(() => {
    // Listen for state_update events
    socket.on('state_update', (state: RoomState) => {
      console.log('State update received:', state);
      setRoomState(state);
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('state_update');
    };
  }, []);

  return (
    <div>
      {pin ? (
        <GameRoom roomState={roomState} />
      ) : (
        <Lobby onJoined={(roomPin) => {
          setPin(roomPin);
          socket.emit('get_room_state', roomPin);
          window.history.replaceState({}, document.title, window.location.pathname);
        }} />
      )}
    </div>
  );
};

export default App;
