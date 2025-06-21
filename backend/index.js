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
const paymentRoutes = require("./src/routes/paymentRoutes");

const app = express();
const server = http.createServer(app);

// Dynamic CORS origins based on environment
const getAllowedOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://handy-eta.vercel.app"
  ];
  
  // Add environment-specific origins
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  return origins;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Socket.IO with proper CORS
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io/' // Explicitly set the path
});

app.set("io", io);

// Apply CORS middleware
app.use(cors(corsOptions));



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    socketio: 'enabled'
  });
});

// Socket.IO health check
app.get('/socket.io/health', (req, res) => {
  res.status(200).json({ 
    message: 'Socket.IO is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/v1/consumers", consumerRoutes.router);
app.use("/api/v1/offers", offerRoutes.router);
app.use("/api/v1/requests", requestRoutes.router);
app.use("/api/v1/providers", providerRoutes.router);
app.use("/api/v1/pairedJobs", pairedJobsRoutes.router);
app.use("/api/v1/users", userRouter.router);
app.use("/api/v1/payment", paymentRoutes.router);

console.log('All routes registered successfully');

// Socket.IO connection handling with better logging
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });
  
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('WebSocket server ready for connections');
  console.log(`CORS enabled for origins: ${getAllowedOrigins().join(', ')}`);
  console.log(`Health check available at: http://localhost:${port}/api/v1/health`);
  console.log(`Socket.IO health check at: http://localhost:${port}/socket.io/health`);
});
