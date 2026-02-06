"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import GameBackground from "@/components/game/GameBackground";
import GameHeader from "@/components/game/GameHeader";
import GameScene from "@/components/game/GameScene";
import GameControls from "@/components/game/GameControls";
import GameOverScreen from "@/components/game/GameOverScreen";
import UserProfile from "@/components/game/UserProfile";

let socket: Socket;

interface Player {
  id: string;
  username: string;
  team: "blue" | "red";
}

interface GameState {
  roomId: string;
  hostId: string;
  score: number;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  winner: "blue" | "red" | "aborted" | null;
}

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Lobby UI state
  const [view, setView] = useState<"setup" | "game">("setup");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"blue" | "red">("blue");

  useEffect(() => {
    // Check login
    const getUsername = async () => {
      const match = document.cookie.match(new RegExp("(^| )username=([^;]+)"));
      if (match) {
        setUsername(match[2]);
      } else {
        router.push("/login");
      }
    };
    getUsername();

    if (!socket) {
      socket = io();
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to game server");
    });

    socket.on("update-game-state", (state: GameState) => {
      setGameState(state);
      if (view === "setup" && state.status !== "finished") setView("game");

      // If finished, delay showing the game over screen to allow animation
      if (state.status === "finished") {
        setTimeout(() => {
          setShowGameOver(true);
        }, 2500); // 2.5s delay for falling animation
      } else {
        setShowGameOver(false);
      }
    });

    socket.on("error-message", (msg) => {
      alert(msg);
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("update-game-state");
        socket.off("error-message");
      }
    };
  }, [router, username, view]);

  const getSocket = () => {
    if (!socket) {
      socket = io();
    }
    return socket;
  };

  const handleCreateRoom = () => {
    if (!username) {
      console.error("No username found");
      return;
    }
    const s = getSocket();
    if (!s.connected) s.connect();

    s.emit("create-room", username, (response: any) => {
      if (response && response.success) {
        joinRoom(response.roomId);
      } else {
        console.error("Failed to create room", response);
      }
    });
  };

  const joinRoom = (roomId: string) => {
    if (!username) return;
    const s = getSocket();
    if (!s.connected) s.connect();

    s.emit("join-room", { roomId, username, team: selectedTeam });
  };

  const handlePull = (direction: "left" | "right") => {
    // Only send pull, direction logic is now unified server-side based on team
    // But GameControls passes left/right. We just emit "pull" trigger since server knows team.
    if (gameState?.status === "playing") {
      getSocket().emit("pull");
    }
  };

  const handleLeaveGame = () => {
    if (socket) {
      socket.emit("leave-room");
    }
    setView("setup");
    setGameState(null);
  };

  const handleStartGame = () => {
    getSocket().emit("start-game");
  };

  if (view === "setup") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 font-pixel text-white">
        <h1 className="text-3xl mb-2 text-orange-400 tracking-wider">
          TUG OF PANKO
        </h1>
        <p className="text-[10px] text-orange-600 mb-8">
          ⚔ MULTIPLAYER CHICKEN WARFARE ⚔
        </p>

        <div className="bg-black border-4 border-orange-500 p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(234,88,12,0.2)]">
          {username && (
            <p className="mb-6 text-center text-orange-300 text-xs">
              ⚔ {username}
            </p>
          )}

          {/* Team Select */}
          <div className="mb-6">
            <p className="text-[10px] text-orange-500 mb-2">SELECT TEAM:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTeam("blue")}
                className={`flex-1 py-2 border-2 text-xs active:translate-y-0.5 transition-all ${selectedTeam === "blue" ? "bg-blue-700 border-blue-400 text-white" : "bg-transparent border-gray-700 text-gray-500"}`}
              >
                BLUE
              </button>
              <button
                onClick={() => setSelectedTeam("red")}
                className={`flex-1 py-2 border-2 text-xs active:translate-y-0.5 transition-all ${selectedTeam === "red" ? "bg-red-700 border-red-400 text-white" : "bg-transparent border-gray-700 text-gray-500"}`}
              >
                RED
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleCreateRoom}
              className="bg-orange-600 hover:bg-orange-500 text-black font-bold py-3 px-6 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 text-sm transition-all"
            >
              ▶ CREATE ROOM
            </button>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-[2px] bg-orange-800"></div>
              <span className="text-[10px] text-orange-700">OR</span>
              <div className="flex-1 h-[2px] bg-orange-800"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CODE"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="bg-gray-900 border-2 border-gray-700 text-orange-400 px-3 py-2 w-24 text-center text-base font-bold placeholder-gray-700 focus:border-orange-500 outline-none"
                maxLength={4}
              />
              <button
                onClick={() => joinRoom(joinRoomId)}
                className="bg-orange-600 hover:bg-orange-500 text-black font-bold py-2 px-4 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 flex-1 text-xs transition-all"
              >
                JOIN ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#87CEEB] overflow-hidden font-mono relative selection:bg-none">
      <GameBackground />

      <GameHeader score={gameState?.score || 0} />

      {/* Show Room ID & Exit Button */}
      <div className="absolute top-2 left-2 z-50 flex gap-2 font-pixel text-[10px]">
        <div className="text-orange-400 bg-black/80 px-3 py-1.5 border-2 border-orange-500">
          ROOM: {gameState?.roomId}
        </div>
        <button
          onClick={handleLeaveGame}
          className="bg-red-800 text-red-200 px-3 py-1.5 border-2 border-red-500 hover:bg-red-600 active:translate-y-0.5 transition-all"
        >
          ✕ EXIT
        </button>
      </div>

      <GameScene
        score={gameState?.score || 0}
        players={gameState?.players || []}
        winner={gameState?.winner === "aborted" ? null : gameState?.winner}
      />

      {gameState?.status === "playing" && (
        <GameControls
          onPull={handlePull}
          team={
            gameState?.players.find((p) => p.id === socket.id)?.team === "blue"
              ? "left"
              : "right"
          }
        />
      )}

      {showGameOver && gameState?.winner && (
        <GameOverScreen
          winner={
            gameState.winner === "blue"
              ? "Blue Team"
              : gameState.winner === "red"
                ? "Red Team"
                : "GAME ABORTED"
          }
          onReset={handleLeaveGame}
        />
      )}

      {gameState?.status === "waiting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-40 backdrop-blur-sm">
          <div className="text-white font-pixel text-center bg-black border-4 border-orange-500 p-8 max-w-lg w-full mx-4 shadow-[0_0_40px_rgba(234,88,12,0.3)]">
            <h2 className="text-xl mb-2 text-orange-400 tracking-wider">
              ⚔ LOBBY ⚔
            </h2>
            <p className="mb-6 text-orange-300 text-xs">
              CODE:{" "}
              <span className="text-white text-base ml-2 bg-orange-900/50 px-3 py-1 border border-orange-500">
                {gameState.roomId}
              </span>
            </p>

            <div className="flex flex-col gap-1 mb-6">
              <div className="text-[10px] text-orange-500 mb-1 text-left">
                PLAYERS:
              </div>
              {gameState.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-3 py-2 border-2 text-xs ${p.team === "blue" ? "border-blue-600 bg-blue-950/50 text-blue-300" : "border-red-600 bg-red-950/50 text-red-300"}`}
                >
                  <span>{p.username}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70">
                      {p.team.toUpperCase()}
                    </span>
                    {p.id === gameState.hostId && <span>👑</span>}
                  </span>
                </div>
              ))}
            </div>

            {socket && gameState.hostId === socket.id ? (
              <button
                onClick={handleStartGame}
                disabled={gameState.players.length < 2}
                className="font-pixel bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-700 disabled:cursor-not-allowed text-black px-8 py-3 text-sm border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 block mx-auto transition-all w-full"
              >
                {gameState.players.length < 2
                  ? "NEED 2+ PLAYERS"
                  : "▶ START GAME"}
              </button>
            ) : (
              <div className="text-[10px] text-gray-500 animate-pulse">
                WAITING FOR HOST TO START...
              </div>
            )}
          </div>
        </div>
      )}

      <UserProfile username={username} />
    </div>
  );
}
