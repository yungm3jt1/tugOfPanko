// components/game/GameBackground.tsx
import React from "react";
import Image from "next/image";

const GameBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Image
        src="/bg.png"
        alt="Background"
        fill
        className="object-cover"
        style={{ imageRendering: "pixelated" }}
        priority
      />
    </div>
  );
};

export default GameBackground;
