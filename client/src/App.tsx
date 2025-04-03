import React, { useState } from 'react';
import Lobby from './components/Lobby';

// TODO: handle reconnect-failed, disconnect, and reconnect events

const App: React.FC = () => {
  const [pin, setPin] = useState<string | null>(null);

  return (
    <div className="p-6">
      {pin ? (
        <div>
          <h2 className="text-xl font-bold">Joined Room {pin}</h2>
        </div>
      ) : (
        <Lobby onJoined={(roomPin) => setPin(roomPin)} />
      )}
    </div>
  );
};

export default App;