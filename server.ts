import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  // Stan gry
  let gameState = {
    score: 0, // -100 (Team Blue wins) ... 0 ... 100 (Team Red wins)
    status: 'playing', // 'playing', 'finished'
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Wyślij aktualny stan gry nowemu graczowi
    socket.emit("update-game-state", gameState);

    socket.on("join-game", (username: string) => {
      console.log(`User ${username} joined the game lobby`);
      // ...existing code...
      // @ts-ignore
      socket.username = username;
      
      socket.emit("server-message", `Welcome to the game server, ${username}!`);
      socket.broadcast.emit("server-message", `User ${username} has joined!`);
    });

    socket.on("pull", (direction: "left" | "right") => {
      if (gameState.status !== 'playing') return;

      if (direction === "left") {
        gameState.score -= 1; // Niebiescy / Lewo
      } else {
        gameState.score += 1; // Czerwoni / Prawo
      }

      // Sprawdź warunki zwycięstwa
      if (gameState.score <= -100) {
        gameState.status = 'finished';
        io.emit("game-over", { winner: 'Blue' });
      } else if (gameState.score >= 100) {
        gameState.status = 'finished';
        io.emit("game-over", { winner: 'Red' });
      }

      // Rozgłoś aktualizację do wszystkich
      io.emit("update-game-state", gameState);
    });

    socket.on("reset-game", () => {
        gameState = { score: 0, status: 'playing' };
        io.emit("update-game-state", gameState);
        io.emit("server-message", "Game has been reset!");
    });

    socket.on("ping-server", (data) => {
        // ...existing code...
        console.log("Ping received:", data);
        io.emit("server-message", `Server pong! Someone pinged at ${data.date}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 
