import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(window.location.origin, {
    path: "/socket.io",
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    if (userId) {
      socket.emit("userOnline", userId);
    }
  });

  socket.on("newNotification", (notification) => {
    const event = new CustomEvent("newNotification", { detail: notification });
    window.dispatchEvent(event);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
