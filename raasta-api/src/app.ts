import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import ridesRoutes from './routes/rides.routes';
import { initSockets } from './sockets';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize WebSockets
const io = initSockets(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Raasta API is running' });
});

// Database connection
connectDB();

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app, httpServer };
