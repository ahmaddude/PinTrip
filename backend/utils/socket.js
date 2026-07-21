// utils/socket.js
import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Store user as online
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const [key, value] of onlineUsers) {
        if (value === socket.id) onlineUsers.delete(key);
      }
    });
  });

  return io;
};

export const getIo = () => io;
export { onlineUsers };
