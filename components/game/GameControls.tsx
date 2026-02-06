// components/game/GameControls.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface GameControlsProps {
  onPull: (direction: "left" | "right") => void;
  team: "left" | "right";
}

const GameControls: React.FC<GameControlsProps> = ({ onPull, team }) => {
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [combo, setCombo] = useState(0);

  // Cheat code state
  const [cheatCode, setCheatCode] = useState("");
  const [isCheater, setIsCheater] = useState(false);

  // Skill Wheel State
  const [rotation, setRotation] = useState(0);
  const [targetAngle, setTargetAngle] = useState(Math.random() * 300); // Random start
  const requestRef = useRef<number>(0);
  const speedRef = useRef(3); // Degrees per frame
  const rotationRef = useRef(0);

  const animate = useCallback(() => {
    // Increase speed slightly with frames generally to make it harder over time?
    // No, speed increases on combo.
    rotationRef.current = (rotationRef.current + speedRef.current) % 360;
    setRotation(rotationRef.current);
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (team) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [team, animate]);

  const handleAction = useCallback(() => {
    if (!team) return;

    const current = rotationRef.current;
    const width = 45; // Size of the green zone in degrees
    // Center of the target zone
    const targetCenter = (targetAngle + width / 2) % 360;

    // Calculate shortest distance between angles
    let diff = Math.abs(current - targetCenter);
    if (diff > 180) diff = 360 - diff;

    // Check hit (half width tolerance) OR if cheater mode is active
    if (isCheater || diff < width / 2) {
      // Hit!
      onPull(team);
      setLastResult("hit");
      setCombo((prev) => prev + 1);

      // Move target randomly
      setTargetAngle(Math.random() * 300);

      // Speed up on succesive hits (cap at 15)
      speedRef.current = Math.min(3 + (combo + 1) * 0.5, 12);
    } else {
      // Miss
      setLastResult("miss");
      setCombo(0);
      // Reset speed
      speedRef.current = 3;
    }

    // Clear feedback
    setTimeout(() => setLastResult(null), 300);
  }, [team, targetAngle, onPull, combo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cheat code logic
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        setCheatCode((prev) => {
          const newCode = (prev + e.key).toLowerCase();
          if (newCode.includes("cheater")) {
            setIsCheater(true);
            // Visual feedback?
            console.log("CHEAT ACTIVATED");
            return "";
          }
          return newCode.slice(-7); // Keep last 7 chars
        });
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  return (
    <div
      className="w-full bg-gradient-to-t from-black via-black to-gray-950 border-t-4 border-orange-500/80 py-5 z-30 flex items-center justify-center relative select-none gap-8"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Left side - Info */}
      <div className="flex flex-col items-center gap-3 min-w-[120px]">
        {/* Team indicator */}
        <div className="font-pixel text-[10px]">
          <span
            className={`px-3 py-1.5 border-2 block text-center ${team === "left" ? "bg-blue-800/60 border-blue-500 text-blue-300" : "bg-red-800/60 border-red-500 text-red-300"}`}
          >
            {team === "left" ? "⚔ BLUE" : "⚔ RED"}
          </span>
        </div>
        {/* Combo */}
        <div className="font-pixel text-[10px] text-orange-400 text-center">
          COMBO
          <div className="text-orange-300 text-lg mt-0.5">{combo}</div>
        </div>
        {isCheater && (
          <span className="font-pixel text-red-500 animate-pulse text-[8px]">
            GOD MODE
          </span>
        )}
      </div>

      {/* Center - SKILL WHEEL */}
      <div className="flex flex-col items-center">
        <div
          className="relative w-36 h-36 bg-gray-950 border-4 border-orange-500 cursor-pointer active:scale-95 transition-transform shadow-[0_0_30px_rgba(234,88,12,0.25),inset_0_0_20px_rgba(0,0,0,0.5)]"
          onClick={handleAction}
          style={{ clipPath: "circle(50%)" }}
        >
          {/* Target Zone */}
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `conic-gradient(transparent ${targetAngle}deg, #16a34a ${targetAngle}deg, #22c55e ${targetAngle + 30}deg, #16a34a ${targetAngle + 60}deg, transparent ${targetAngle + 60}deg)`,
              clipPath: "circle(50%)",
            }}
          ></div>

          {/* Tick marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute inset-0 z-10"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className="w-[2px] h-2 bg-orange-800/40 mx-auto"></div>
            </div>
          ))}

          {/* Center dot */}
          <div
            className="absolute inset-0 m-auto w-3 h-3 bg-orange-400 z-30 border-2 border-orange-600"
            style={{ clipPath: "circle(50%)" }}
          ></div>

          {/* Needle */}
          <div
            className="absolute inset-0 z-20"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="w-1 h-[45%] bg-gradient-to-t from-orange-600 to-orange-300 mx-auto origin-bottom mt-[5%] shadow-[0_0_8px_rgba(234,88,12,0.9)]"></div>
          </div>

          {/* Visual Feedback */}
          <div
            className={`absolute inset-0 transition-all duration-150 pointer-events-none 
              ${lastResult === "hit" ? "bg-green-500/25 scale-110" : lastResult === "miss" ? "bg-red-500/25" : ""}`}
            style={{ clipPath: "circle(50%)" }}
          ></div>
        </div>
      </div>

      {/* Right side - Controls hint */}
      <div className="flex flex-col items-center gap-2 min-w-[120px]">
        <div className="font-pixel text-[10px] text-orange-600 text-center leading-relaxed">
          HIT THE
          <br />
          <span className="text-green-400">GREEN</span> ZONE
        </div>
        <div className="font-pixel text-orange-400 text-xs border-2 border-orange-600 bg-orange-950/50 px-4 py-2 animate-pulse">
          SPACE
        </div>
      </div>
    </div>
  );
};

export default GameControls;
