import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // userId -> socketId
  private readonly recentDisconnections = new Map<string, number>(); // socketId -> timestamp

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    setInterval(() => {
      const now = Date.now();
      for (const [socketId, timestamp] of this.recentDisconnections.entries()) {
        if (now - timestamp > 120000) { // 2 minutes
          this.recentDisconnections.delete(socketId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  async handleConnection(client: Socket) {

    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('No token provided for WebSocket connection');
        client.disconnect();
        return;
      }

      const tokenHash = this.hashToken(token);
      const now = Date.now();
      const lastRejection = this.recentDisconnections.get(tokenHash);
      if (lastRejection && now - lastRejection < 60000) {
        this.logger.debug('Token recently rejected, disconnecting');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('app.jwt.secret')
      });
      const userId = payload.sub;

      if (!userId) {
        this.logger.error('No user ID in token payload');
        client.disconnect();
        return;
      }

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      console.log(`User ${userId} connected with socket ${client.id}`);
      console.log('Total connected users:', this.connectedUsers.size);

      client.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    } catch (error) {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      const tokenHash = this.hashToken(token);
      const now = Date.now();

      if ((error as any).name === 'TokenExpiredError') {
        this.logger.debug('Token expired for WebSocket connection');
        // Record token rejection time
        this.recentDisconnections.set(tokenHash, now);
      } else {
        this.logger.warn('Invalid token for WebSocket connection:', (error as any).message);
      }

      client.disconnect();
    }
  }

  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`Socket ${client.id} joined room ${data.room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Socket ${client.id} left room ${data.room}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId}`);
  }

  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event} to all users`);
  }

  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    this.logger.log(`Sent ${event} to room ${room}`);
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

