require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { init: initSocket } = require("./socket");

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 WorkTrack API running locally on port ${PORT}`);
  });
});