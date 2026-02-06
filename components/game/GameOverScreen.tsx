// components/game/GameOverScreen.tsx
import React from "react";

interface GameOverScreenProps {
  winner: string | null;
  onReset: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, onReset }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center font-pixel">
      <div className="bg-black border-4 border-orange-500 p-10 text-center shadow-[0_0_60px_rgba(234,88,12,0.4)]">
        <h2
          className={`text-2xl md:text-4xl mb-6 ${winner?.includes("Blue") ? "text-blue-400" : winner?.includes("Red") ? "text-red-400" : "text-orange-400"}`}
        >
          {winner === "Blue Team"
            ? "BLUE SAVED PANKO!"
            : winner === "Red Team"
              ? "RED COOKED PANKO!"
              : winner}
        </h2>
        <div className="text-sm text-orange-200 mb-6 animate-pulse">
          {winner === "Blue Team"
            ? "Red fell into the lava!"
            : winner === "Red Team"
              ? "Blue fell into the lava!"
              : "Someone disconnected!"}
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-orange-600 border-b-4 border-orange-800 text-black font-bold text-sm hover:bg-orange-500 active:border-b-0 active:translate-y-1 transition-all"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
