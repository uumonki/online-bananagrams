import React from 'react';
import { RoomState } from '../../../server/src/types';
import Game from './Game';
import WaitingRoom from './WaitingRoom';

interface GameRoomProps {
  roomState: RoomState | null;
};

const GameRoom: React.FC<GameRoomProps> = ({ roomState }) => {

  if (!roomState) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {roomState ? (
        <div>
          {roomState.active ? (
            <Game roomState={roomState} />
          ) : (
            <WaitingRoom roomState={roomState} />
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default GameRoom;