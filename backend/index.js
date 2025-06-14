const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 5000;

const consumerRoutes = require("./src/routes/consumerRoutes");
const offerRoutes = require("./src/routes/offerRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const pairedJobsRoutes = require("./src/routes/pairedJobsRoutes");
const userRouter = require("./src/routes/userRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

app.set("io", io);

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

app.use("/api/v1/consumers", consumerRoutes.router);
app.use("/api/v1/offers", offerRoutes.router);
app.use("/api/v1/requests", requestRoutes.router);
app.use("/api/v1/providers", providerRoutes.router);
app.use("/api/v1/pairedJobs", pairedJobsRoutes.router);
app.use("/api/v1/users", userRouter.router);

console.log('All routes registered successfully');

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Test the server at: http://localhost:${port}/api/v1/health`);
  console.log('WebSocket server ready for connections');
});
