const { Server } = require("socket.io");

const allowedOrigins = [
  "http://localhost:4200",
  "https://erp-tracker-sigma.vercel.app",
  "https://work-tracker-ten-omega.vercel.app",
];

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};
