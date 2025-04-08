import socket from "../socket";
import { useState, useEffect } from "react";
import { RoomState } from "../../../server/src/types";
import { MAX_PLAYERS } from "../../../server/src/config";

interface WaitingRoomProps {
  roomState: RoomState;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomState }) => {
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    socket.on("not_enough_players", () => {
      setErrorMessage("Not enough players to start the game.");
      setTimeout(() => setErrorMessage(''), 5000);
    });

    return () => {
      socket.off("not_enough_players");
    }
  }, []);

  const handleCopy = () => {
    const link = `${window.location.origin}/?pin=${roomState.pin}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleStartGame = () => {
    socket.emit("start_game", roomState.pin);
  };

  return (
    <div className="flex flex-col space-y-2 items-center justify-center h-screen">
      <p className="text-lg text-center text-black">
        Room PIN: {roomState.pin}
      </p>
      <div className="flex flex-col p-6 bg-white rounded drop-shadow-sm w-100 text-left">
        <p className="text-lg text-black mb-2">
          Players ({roomState.players.length}/{MAX_PLAYERS})
        </p>
        <ul className="list-none list-inside space-y-2">
          {roomState.players.map((player) => (
            <li key={roomState.playerNicknames[player]} className="border-2 border-gray-200 px-3 py-1">
              <span className="text-lg text-black">
                {roomState.playerNicknames[player]}
              </span>
              {player === roomState.ownerId && (
                <span className="text-sm text-gray-500"> (Host)</span>
              )}
              {player === socket.id && (
                <span className="text-sm text-gray-500"> (You)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {socket.id === roomState.ownerId ? (
        <div>
          <div className="flex space-x-3 mt-2">
            <button
              className="px-4 py-2 border text-black hover:bg-black/10 rounded"
              onClick={handleCopy}
            >
              {copied ? "Link copied!" : (
                <span className="flex items-center">
                  <img src="/link.svg" className="inline mr-1" width="16" height="16" />
                  <span>Copy invite link</span>
                </span>
              )}
            </button>
            <button
              className="px-4 py-2 border text-black hover:bg-black/10 rounded"
              onClick={handleStartGame}
            >
              <span className="flex items-center">
                <img src="/play.svg" className="inline mr-1" width="16" height="16" />
                <span>Start game</span>
              </span>
            </button>
          </div>
          {errorMessage && <div className="text-sm text-red-600 text-center mt-1">{errorMessage}</div>}
        </div>
      ) : (
        <div className="flex space-x-2">

        </div>
      )
      }
    </div>
  );
}

export default WaitingRoom;