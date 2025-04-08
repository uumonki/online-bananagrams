import React, { useEffect, useState } from 'react';
import { RoomState } from '../../../server/src/types';
import socket from '../socket';

interface GameProps {
  roomState: RoomState;
}

const Game: React.FC<GameProps> = ({ roomState }) => {
  const [letters, setLetters] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [status, setStatus] = useState('');
  const [yourTurn, setYourTurn] = useState(false);

  useEffect(() => {
    socket.on('table_updated', (data: { letters: string[] }) => {
      setLetters(data.letters);
    });

    socket.on('your_turn', () => {
      setYourTurn(true);
      setStatus("It's your turn! You have 1 minute.");
    });

    socket.on('word_accepted', ({ word }) => {
      setStatus(`Word accepted: ${word}`);
      setWord('');
    });

    socket.on('word_rejected', ({ reason }) => {
      setStatus(`Word rejected: ${reason}`);
    });

    socket.on('game_over', () => {
      setStatus('Game over!');
    });

    return () => {
      socket.off('table_updated');
      socket.off('your_turn');
      socket.off('word_accepted');
      socket.off('word_rejected');
      socket.off('game_over');
    };
  }, []);

  const submitWord = () => {
    if (!word.trim()) return;
    socket.emit('submit_word', { word: word.trim(), pin: roomState.pin });
  };

  const flipLetter = () => {
    socket.emit('flip_letter', { pin: roomState.pin });
    setYourTurn(false);
    setStatus('Flipped a letter.');
  };

  return (
    <div className="space-y-4">
      <pre>
        <code>{JSON.stringify(roomState, null, 2)}</code>
      </pre>
      <p>Room {roomState.pin}</p>
      <div className="flex flex-wrap gap-2">
        {letters.map((char, idx) => (
          <span
            key={idx}
            className="text-2xl border px-2 py-1 rounded bg-yellow-100"
          >
            {char.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border px-2 py-1"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter word"
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={submitWord}
        >
          Submit
        </button>
        {yourTurn && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={flipLetter}
          >
            Flip
          </button>
        )}
      </div>

      <div>{status}</div>
    </div>
  );
};

export default Game;
