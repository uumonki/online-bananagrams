import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupWebSocket } from 'websocket';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // change this to frontend origin for production
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  }
});

// Apply any middleware here
app.use(cors());
app.use(express.json());

// health check route
app.get('/', (req, res) => {
  res.send('Bananagrams server running!');
});

// WS handlers
setupWebSocket(io);

// start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});