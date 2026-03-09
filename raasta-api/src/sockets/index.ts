import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export const initSockets = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // JWT Middleware for Socket.io
  io.use((socket: any, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    console.log(`User connected to socket: ${socket.user?.id}`);

    // Join a group ride session
    socket.on('join-group', (sessionId: string) => {
      socket.join(`group-${sessionId}`);
      console.log(`User ${socket.user?.id} joined group ${sessionId}`);
    });

    // Leave a group ride session
    socket.on('leave-group', (sessionId: string) => {
      socket.leave(`group-${sessionId}`);
      console.log(`User ${socket.user?.id} left group ${sessionId}`);
    });

    // Broadcast location update to the group
    socket.on('location-update', (data: { sessionId: string; location: [number, number] }) => {
      // In production, this data would also update Redis/MongoDB periodically
      io.to(`group-${data.sessionId}`).emit('group-location-update', {
        userId: socket.user?.id,
        location: data.location,
        timestamp: new Date(),
      });
    });

    // Broadcast SOS alert to the group
    socket.on('sos-alert', (data: { sessionId: string; location: [number, number] }) => {
      io.to(`group-${data.sessionId}`).emit('group-sos', {
        userId: socket.user?.id,
        location: data.location,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.id}`);
    });
  });

  return io;
};
