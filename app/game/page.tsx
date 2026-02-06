"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

let socket: Socket;

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing"); // playing, finished
  const [winner, setWinner] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Fetch username from API or check cookie directly if possible without library
    // For simplicity, we can fetch from an endpoint or just assume connection validates
    // But better is to just send a simple request to check session or read cookie from document.cookie
    const getUsername = async () => {
      // Simple hack to get cookie in client
      const match = document.cookie.match(new RegExp("(^| )username=([^;]+)"));
      if (match) {
        setUsername(match[2]);
      } else {
        router.push("/login");
      }
    };
    getUsername();

    // Connect socket
    if (!socket) {
      socket = io();
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to game server");
      if (username) socket.emit("join-game", username);
    });

    socket.on(
      "update-game-state",
      (state: { score: number; status: string }) => {
        setScore(state.score);
        setStatus(state.status);
        if (state.status === "playing") setWinner(null);
      },
    );

    socket.on("game-over", (data: { winner: string }) => {
      setWinner(data.winner);
      setStatus("finished");
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [router, username]);

  const handlePull = (direction: "left" | "right") => {
    if (socket && status === "playing") {
      socket.emit("pull", direction);
    }
  };

  const handleReset = () => {
    if (socket) {
      socket.emit("reset-game");
    }
  };

  // Convert score -100..100 to 0..100% for progress bar
  // 0 score = 50%
  const progressLeft = ((score + 100) / 200) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono">
      <h1 className="text-4xl mb-4 font-bold text-yellow-400">TUG OF PANKO</h1>

      {status === "finished" && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <h2
            className={`text-6xl font-bold mb-4 ${winner === "Blue" ? "text-blue-500" : "text-red-500"}`}
          >
            TEAM {winner && winner.toUpperCase()} WINS!
          </h2>
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition"
          >
            PLAY AGAIN / RESET
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl px-4 md:px-10">
        {/* Score Display */}
        <div className="text-center text-2xl mb-8">
          Current Score:{" "}
          <span
            className={
              score > 0
                ? "text-red-500"
                : score < 0
                  ? "text-blue-500"
                  : "text-white"
            }
          >
            {score}
          </span>
          <div className="text-xs text-gray-400 mt-1">
            (-100 Blue wins | +100 Red wins)
          </div>
        </div>

        {/* Visual Tug of War Rope/Bar */}
        <div className="relative w-full h-16 bg-gray-700 rounded-full overflow-hidden border-4 border-gray-600 mb-12 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Center Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-10 transform -translate-x-1/2 opacity-50"></div>

          {/* Progress Fill (Blue vs Red) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progressLeft}%` }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 bg-red-600 transition-all duration-300 ease-out"
            style={{ width: `${100 - progressLeft}%` }}
          />

          {/* The "Rope Knot" Indicator */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-yellow-400 shadow-[0_0_15px_#fbbf24] z-20 transition-all duration-300 ease-out transform -translate-x-1/2"
            style={{ left: `${progressLeft}%` }}
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-8 w-full">
          <button
            onClick={() => handlePull("left")}
            className="h-32 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-95 transition-all
                                   shadow-[0_4px_0_#1e3a8a] active:shadow-none flex flex-col items-center justify-center group"
          >
            <span className="text-3xl font-black uppercase text-white drop-shadow-md group-hover:scale-110 transition-transform">
              &lt;&lt; BLUE PULL
            </span>
            <span className="text-sm text-blue-200 mt-2">Click fast!</span>
          </button>

          <button
            onClick={() => handlePull("right")}
            className="h-32 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 active:scale-95 transition-all
                                   shadow-[0_4px_0_#991b1b] active:shadow-none flex flex-col items-center justify-center group"
          >
            <span className="text-3xl font-black uppercase text-white drop-shadow-md group-hover:scale-110 transition-transform">
              RED PULL &gt;&gt;
            </span>
            <span className="text-sm text-red-200 mt-2">Click fast!</span>
          </button>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          Logged in as: <span className="text-white">{username}</span>
        </div>
      </div>
    </div>
  );
}
