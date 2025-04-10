import React from 'react';
import { RoomState } from '../../../server/src/types';
import socket from '../socket';
import { WordTiles } from './Tiles';
import StatusCircle from './StatusCircle';

interface OpponentsProps {
  roomState: RoomState;
}

const OpponentColumn: React.FC<{
  id: string;
  isConnected: boolean;
  nickname: string;
  words: string[];
  isTheirTurn: boolean;
}> = ({ id, isConnected, nickname, words, isTheirTurn }) => {
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  const resizeRef = (div: HTMLDivElement | null) => {
    if (div) {
      const updateHeight = () => {
        const parentHeight = div.parentElement?.clientHeight ?? 0;
        const siblingHeights = Array.from(div.parentElement?.children ?? [])
          .filter((child) => child !== div)
          .reduce((total, sibling) => total + (sibling.clientHeight || 0), 0);
        const spacing = parseFloat(getComputedStyle(div).getPropertyValue('--spacing')) ?? 0;
        const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const spacingInPx = spacing * remToPx;
        div.style.height = `${parentHeight - siblingHeights - spacingInPx}px`;
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);

      return () => {
        window.removeEventListener("resize", updateHeight);
      };
    }
  }

  return (
    <div key={id} className="flex flex-col min-w-[150px]">
      <div className="flex justify-center items-center space-x-2 py-2">
        <StatusCircle status={isConnected ? "connected" : "disconnected"} className='inline-block' />
        <span className={`text-center ${isTheirTurn ? " font-bold" : ""}`}>{nickname}</span>
      </div>
      <div
        className="h-[300px] block"
        ref={resizeRef}
      >
        <div
          className="grid gap-y-0.5 gap-x-3 w-min"
          style={{
            minHeight: "100%",
            maxHeight: "100%",
            gridAutoFlow: "column",
            gridTemplateRows: `repeat(auto-fit, 1.75rem)`,
            gridAutoColumns: "min-content"
          }}
        >
          {sortedWords.map((word, index) => (
            <div
              key={index}
            >
              <WordTiles>{word}</WordTiles>
            </div>
          ))}
        </div>
      </div>
    </div>


  );
};

const Opponents: React.FC<OpponentsProps> = ({ roomState }) => {
  const opponents = roomState.players.filter((id) => id !== socket.id);

  return (
    <div className="h-full w-full flex flex-nowrap justify-center p-2 gap-16 relative">
      <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 -rotate-90 text-4xl opacity-30 whitespace-nowrap -z-10">
        OPPONENTS
      </div>
      {opponents.map((id) => (
        <OpponentColumn
          key={id}
          isConnected={!roomState.disconnectedPlayers.includes(id)}
          id={id}
          nickname={roomState.playerNicknames[id]}
          words={roomState.gameState.playerWords[id] ?? []}
          isTheirTurn={roomState.currentPlayerId === id}
        />
      ))}
    </div>
  );
};

export default Opponents;