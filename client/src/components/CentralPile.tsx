import { LetterTile } from "./Tiles";
import KeyIcon from "./KeyIcon";

interface CentralPileProps {
  revealedLetters: string[];
  remainingLetters: number;
  isPlayerTurn: boolean;
}

const CentralPile: React.FC<CentralPileProps> = ({
  revealedLetters,
  remainingLetters,
  isPlayerTurn,
}) => {
  return (
    <div className="h-full w-full">
      <div className="mb-4 text-lg font-semibold">Tiles left: {remainingLetters}</div>
      <div className="flex flex-wrap">
        {revealedLetters.map((letter, idx) => (
          <LetterTile
            key={idx}
            letter={letter}
            size={8}
            textSize="text-xl"
            className="m-1"
          />
        ))}
      </div>
      {isPlayerTurn && (
        <div className="mt-4">
          Your turn! <KeyIcon className="relative -top-0.5">Space</KeyIcon> to flip.
        </div>
      )}
    </div>
  );
};

export default CentralPile;
