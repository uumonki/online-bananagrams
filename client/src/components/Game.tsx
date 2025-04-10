import React, { useEffect, useState, useRef } from 'react';
import { RoomState } from '../../../server/src/types';
import findWordConstructions from '../utils/findWordConstructions';
import Opponents from './Opponents';
import CentralPile from './CentralPile';
import { WordTiles } from './Tiles';
import socket from '../socket';

interface GameProps {
  roomState: RoomState;
}

const Game: React.FC<GameProps> = ({ roomState }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<string>('');
  const inputElementRef = useRef<HTMLInputElement>(null);
  const roomStateRef = useRef<RoomState>(roomState);
  const thisPlayerIdRef = useRef<string>(socket.id!);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if letter pressed, add it to the input
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        setInput((prev) => prev + e.key.toUpperCase());
      }
      // if backspace pressed, remove last letter
      else if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      }
      // if enter pressed, send the word
      else if (e.key === 'Enter') {
        handleSubmit();
        setInput('');
      }
      // if escape pressed, clear the input
      else if (e.key === 'Escape') {
        setInput('');
      }
      // if space pressed, attempt to flip letter
      else if (e.key === ' ') {
        if (roomStateRef.current.currentPlayerId === thisPlayerIdRef.current) {
          socket.emit('flip_letter', roomStateRef.current.pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    socket.on('word_submit_failed', () => {
      alert('Invalid word!');
      setInput('');
    });

    socket.on('word_submitted', () => {
      setInput('');
    });

    return () => {
      socket.off('word_submit_failed');
      socket.off('word_submitted');
    };
  }, []);

  const handleSubmit = () => {
    const word = inputRef.current.trim().toUpperCase();
    if (word.length > 0) {
      const constructions = findWordConstructions(word, roomStateRef.current.gameState);
      console.log(constructions);
      if (constructions.length === 0) {
        alert('Invalid word!');
        return;
      }
      const play = constructions[0];
      if (play === 'FromCentralPile') {
        socket.emit('submit_word', roomStateRef.current.pin, word);
        return;
      } else {
        const { originPlayer, originWord } = play as { originPlayer: string; originWord: string };
        socket.emit('submit_word', roomStateRef.current.pin, word, originPlayer, originWord);
        return;
      }
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top 40% Opponents Words */}
      <div className="h-[40%] w-full">
        <Opponents roomState={roomState} />
      </div>

      {/* Bottom 60% divided into left and right halves */}
      <div className="h-[60%] w-full flex">
        {/* Bottom Left - Revealed Letters and Tiles Left */}
        <div className="w-1/2 h-full p-4">
          <CentralPile
            revealedLetters={roomState.gameState.revealedLetters}
            remainingLetters={roomState.gameState.remainingLetters}
            isPlayerTurn={roomState.currentPlayerId === thisPlayerIdRef.current}
          />
        </div>

        {/* Bottom Right - Player Words + Input */}
        <div className="w-1/2 h-full p-4 flex flex-col justify-end">
          <div className="mb-4 flex flex-wrap-reverse content-end">
            {(roomState.gameState.playerWords[thisPlayerIdRef.current] || []).map((word, index) => (
              <div key={index} className="m-1">
                <WordTiles>{word}</WordTiles>
              </div>
            ))}
          </div>
          <input
            ref={inputElementRef}
            type="text"
            value={input}
            readOnly
            className="w-full p-2 border rounded bg-white text-black"
            placeholder="Start typing anywhere..."
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
