import React from 'react';
import { RoomState } from '../../../server/src/types';
import Game from './Game';
import WaitingRoom from './WaitingRoom';

interface GameRoomProps {
  roomState: RoomState | null;
};

const GameRoom: React.FC<GameRoomProps> = ({ roomState }) => {

  if (!roomState) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <div>
        {roomState.active ? (
          <Game roomState={roomState} />
        ) : (
          <WaitingRoom roomState={roomState} />
        )}
      </div>
    </div>
  );
}

export default GameRoom;