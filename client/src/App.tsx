import React, { useState } from 'react';
import './App.css';
import Lobby from './components/Lobby';

// TODO: handle reconnect-failed, disconnect, and reconnect events

const App: React.FC = () => {
  const [pin, setPin] = useState<string | null>(null);

  return (
    <div>
      {pin ? (
        <div className="flex items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-gray-800">Joined Room {pin}</h2>
        </div>
      ) : (
        <Lobby onJoined={(roomPin) => setPin(roomPin)} />
      )}
    </div>
  );
};

export default App;
