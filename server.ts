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

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-game", (username: string) => {
      console.log(`User ${username} joined the game lobby`);
      // Możemy zapisać username w obiekcie socket
      // @ts-ignore
      socket.username = username;
      
      // Powiadomienie zwrotne
      socket.emit("server-message", `Welcome to the game server, ${username}!`);
      
      // Powiadomienie innych (broadcast)
      socket.broadcast.emit("server-message", `User ${username} has joined!`);
    });

    socket.on("ping-server", (data) => {
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
