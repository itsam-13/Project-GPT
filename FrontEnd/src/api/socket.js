import { io } from "socket.io-client";
import { API_BASE_URL } from "./axios";

let socketInstance = null;

export const initSocket = () => {
  const token = localStorage.getItem("token");

  if (socketInstance) {
    if (socketInstance.connected) {
      return socketInstance;
    }
    socketInstance.disconnect();
  }

  socketInstance = io(API_BASE_URL, {
    withCredentials: true,
    auth: {
      token: token || "",
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.on("connect", () => {
    console.log("Connected to Socket.IO server:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.warn("Socket.IO connection error:", err.message);
  });

  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance) {
    return initSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
