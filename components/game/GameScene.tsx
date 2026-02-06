// components/game/GameScene.tsx
import React from "react";
import Image from "next/image";

interface Player {
  id: string;
  username: string;
  team: "blue" | "red";
}

interface GameSceneProps {
  score: number;
  players: Player[];
  winner?: "blue" | "red" | null;
}

const GameScene: React.FC<GameSceneProps> = ({ score, players, winner }) => {
  // Score -50 to 50.
  // We want the LOSING team to be dragged into the center (50%) at max score.
  // Algorithm: gap = scale.
  // If scale=30 and gap=30:
  // Score 0: Blue at 20%, Red at 80% (Safe on cliffs)
  // Score 50: Center becomes 80%, Blue dragged to 50% (Abyss), Red to 110%
  // Score -50: Center becomes 20%, Red dragged to 50% (Abyss), Blue to -10%
  const centerPercent = 50 + (score / 50) * 30;

  // Team anchors: 30% from center
  const blueAnchor = centerPercent - 30;
  const redAnchor = centerPercent + 30;

  const blueTeam = players.filter((p) => p.team === "blue");
  const redTeam = players.filter((p) => p.team === "red");

  // Rope stretches from last blue chicken to last red chicken
  const ropeStart = blueAnchor - Math.max(0, blueTeam.length - 1) * 4;
  const ropeEnd = redAnchor + Math.max(0, redTeam.length - 1) * 4;

  // When game is finished, ALL losers fall together
  const isFalling = (team: "blue" | "red") => {
    if (!winner) return false;
    return winner !== team; // Losers fall
  };

  return (
    <div className="flex-1 w-full relative flex items-center justify-center mt-32 mb-10 max-w-6xl mx-auto h-[400px]">
      {/* Rope */}
      <div
        className="absolute top-[40%] h-3 bg-[#dcb159] border-y-2 border-black z-10"
        style={{
          left: `${ropeStart}%`,
          width: `${ropeEnd - ropeStart}%`,
          transition: "all 0.1s linear",
          transform: "translateY(-50%)",
        }}
      ></div>

      {/* Blue Team */}
      {blueTeam.map((player, index) => {
        // Stack players behind the anchor
        const pos = blueAnchor - index * 4;
        const falling = isFalling("blue");

        return (
          <div
            key={player.id}
            className={`absolute top-[calc(38%-48px)] z-20 flex flex-col items-center transition-all duration-100 ease-linear ${falling ? "animate-fall-down" : ""}`}
            style={{
              left: `${pos}%`,
              transform: "translateX(-50%)",
              transition: "left 0.1s linear",
            }}
          >
            <div
              className={`relative w-20 h-20 md:w-24 md:h-24 ${score > 10 ? "rotate-6" : score < -10 ? "-rotate-6" : ""}`}
            >
              <Image
                src="/panko.png"
                alt="Blue Panko"
                fill
                className="object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="mt-1 bg-blue-600/80 text-white text-[10px] px-2 py-0.5 rounded border border-black font-bold whitespace-nowrap">
              {player.username}
            </div>
          </div>
        );
      })}

      {/* Red Team */}
      {redTeam.map((player, index) => {
        const pos = redAnchor + index * 7;
        const falling = isFalling("red");

        return (
          <div
            key={player.id}
            className={`absolute top-[calc(38%-48px)] z-20 flex flex-col items-center transition-all duration-100 ease-linear ${falling ? "animate-fall-down" : ""}`}
            style={{
              left: `${pos}%`,
              transform: "translateX(-50%)",
              transition: "left 0.1s linear",
            }}
          >
            <div
              className={`relative w-20 h-20 md:w-24 md:h-24 ${score > 10 ? "rotate-6" : score < -10 ? "-rotate-6" : ""}`}
            >
              {/* Flip red team */}
              <Image
                src="/panko.png"
                alt="Red Panko"
                fill
                className="object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                style={{ imageRendering: "pixelated", transform: "scaleX(-1)" }}
              />
              <div className="absolute inset-0 bg-red-500/30 mix-blend-overlay"></div>
            </div>
            <div className="mt-1 bg-red-600/80 text-white text-[10px] px-2 py-0.5 rounded border border-black font-bold whitespace-nowrap">
              {player.username}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameScene;
