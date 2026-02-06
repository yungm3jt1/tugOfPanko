// components/game/GameHeader.tsx
import React from "react";
import Image from "next/image";

interface GameHeaderProps {
  score: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ score }) => {
  return (
    <header className="absolute left-4 right-4 flex flex-col items-center z-20 pointer-events-none ">
      <Image
        src="/logo_main.png"
        alt="Tug of Panko Logo"
        width={400}
        height={120}
        className="w-[80%] max-w-[500px] h-auto object-contain drop-shadow-md"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="mt-2 bg-black/70 text-orange-400 px-6 py-1.5 border-2 border-orange-500 font-pixel text-sm">
        SCORE: {score}
      </div>
    </header>
  );
};

export default GameHeader;
