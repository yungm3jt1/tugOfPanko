import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  interface Player {
    id: string;
    username: string;
    team: 'blue' | 'red';
  }

  interface RoomState {
    roomId: string;
    hostId: string;
    score: number;
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    winner: 'blue' | 'red' | 'aborted' | null;
  }

  const rooms = new Map<string, RoomState>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 1. TWORZENIE POKOJU
    socket.on("create-room", (username: string, callback) => {
        const roomId = Math.floor(1000 + Math.random() * 9000).toString();
        const newRoom: RoomState = {
            roomId,
            hostId: socket.id,
            score: 0,
            status: 'waiting',
            players: [],
            winner: null
        };
        rooms.set(roomId, newRoom);
        callback({ success: true, roomId });
    });

    // 2. DOŁĄCZANIE DO POKOJU
    socket.on("join-room", ({ roomId, username, team }: { roomId: string, username: string, team: 'blue' | 'red' }) => {
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit("error-message", "Room not found!");
            return;
        }

        socket.join(roomId);
        
        const player: Player = { id: socket.id, username, team };
        room.players.push(player);

        // @ts-ignore
        socket.roomId = roomId;

        io.to(roomId).emit("update-game-state", room);
    });

    // Start Game (Host only)
    socket.on("start-game", () => {
         // @ts-ignore
         const roomId = socket.roomId;
         const room = rooms.get(roomId);
         if (!room) return;
         
         if (room.hostId !== socket.id) return;
         
         if (room.players.length >= 2) {
             room.status = 'playing';
             room.score = 0;
             room.winner = null;
             io.to(roomId).emit("update-game-state", room);
         }
    });

    socket.on("leave-room", () => {
        // @ts-ignore
        const roomId = socket.roomId;
        if (!roomId) return;
        
        handleDisconnect(socket, roomId);
        socket.leave(roomId);
        // @ts-ignore
        socket.roomId = null;
    });

    // 3. LOGIKA GRY (Pull)
    socket.on("pull", () => {
        // @ts-ignore
        const roomId = socket.roomId;
        // @ts-ignore
        const room = rooms.get(roomId);

        if (!room || room.status !== 'playing') return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        if (player.team === 'blue') {
             room.score -= 1;
        } else {
             room.score += 1;
        }

        if (room.score <= -50) {
            room.status = 'finished';
            room.winner = 'blue';
        } else if (room.score >= 50) {
            room.status = 'finished';
            room.winner = 'red';
        }

        io.to(roomId).emit("update-game-state", room);
    });

    socket.on("reset-game", () => {
         // @ts-ignore
         const roomId = socket.roomId;
         const room = rooms.get(roomId);
         if(room) {
             room.score = 0;
             room.status = 'playing';
             room.winner = null;
             io.to(roomId).emit("update-game-state", room);
         }
    });

    socket.on("disconnect", () => {
      // @ts-ignore
      const roomId = socket.roomId;
      if (roomId) handleDisconnect(socket, roomId);
      console.log("Client disconnected:", socket.id);
    });

    function handleDisconnect(socket: any, roomId: string) {
      if (rooms.has(roomId)) {
          const room = rooms.get(roomId)!;
          room.players = room.players.filter(p => p.id !== socket.id);
          
          if (room.players.length === 0) {
              rooms.delete(roomId);
          } else {
              // If game was playing and players dropped < 2, end it
              if (room.status === 'playing' && room.players.length < 2) {
                  room.status = 'finished';
                  room.winner = 'aborted'; // Special state or just 'aborted'
              }
              // If host left, assign new host? For now, just keep room
              if (room.hostId === socket.id && room.players.length > 0) {
                  room.hostId = room.players[0].id; // Promote next player
              }

              io.to(roomId).emit("update-game-state", room);
          }
      }
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 
