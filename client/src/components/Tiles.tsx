import React from "react";

interface LetterTileProps {
  letter: string;
  size?: number | string;
  textSize?: string;
  className?: string;
};

export const LetterTile: React.FC<LetterTileProps> = ({
  letter,
  size = 6,
  textSize = "text-md",
  className = "",
}) => {
  const sizeClasses = `w-${size} h-${size} `;

  return (
    <div
      className={
        `flex items-center justify-center border rounded `
        + sizeClasses
        + textSize
        + ` ${className}`
      }
    >
      {letter[0]}
    </div>
  );
};

interface WordTilesProps {
  children: string;
  tileSize?: number;
  space?: number | string;
};

export const WordTiles: React.FC<WordTilesProps> = ({
  tileSize = 6,
  space = "px",
  children
}) => {
  const word = typeof children === "string" ? children.toUpperCase() : "";

  return (
    <div className={"flex space-x-" + String(space)}>
      {word.split("").map((letter, idx) => (
        <LetterTile
          key={idx}
          letter={letter}
          size={tileSize}
        />
      ))}
    </div>
  );
};
