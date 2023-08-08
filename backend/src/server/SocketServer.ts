import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as AppServer } from '#server/Server';
import passport from 'passport';
import { Request } from 'express';
import { ClientToServerEvents, ServerToClientEvents } from '#types/api/socket';
import { logger } from '#lib/logger';


export class SocketServer {
  private static instance: SocketServer;

  public readonly io: Server<ClientToServerEvents, ServerToClientEvents>;

  public static async createInstance(httpServer: HTTPServer): Promise<SocketServer> {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
      await SocketServer.instance.registerRoutes();

      return SocketServer.instance;
    } else {
      throw new Error('SocketServer instance already initialized');
    }
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      throw new Error('SocketServer instance not initialized');
    }

    return SocketServer.instance;
  }

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer);
  }

  private async registerRoutes() {
    const sessionMiddleware = await AppServer.generateSessionMiddleware();

    this.io.engine.use(sessionMiddleware);
    this.io.engine.use(passport.initialize());
    this.io.engine.use(passport.session());


    this.io.use((socket, next) => {
      const req = socket.request as Request;
      if (req.isUnauthenticated()) next(new Error('Unauthenticated'));

      next();
    });

    this.io.on('connection', async (socket) => {
      const req = socket.request as Request;

      if (req.isUnauthenticated() || req.user === undefined) {
        logger.warn('Unauthenticated user connected', { label: 'SocketServer' });
        return socket.disconnect(true);
      }

      await socket.join(req.user.id);

      socket.onAny((event, ...message) => {
        logger.debug('%o %o', event, message, { label: 'SocketServer' });
      });

      logger.debug('User connected [%s]', req.user.id, { label: 'SocketServer' });
      socket.on('disconnect', () => {
        logger.debug('User disconnected [%s]', req.user?.id ?? '', { label: 'SocketServer' });
      });
    });
  }

  public static disconnectUser(userId: string): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).disconnectSockets(true);
  }

  public static emitToUser<T extends keyof ServerToClientEvents>(userId: string, event: T, ...args: Parameters<ServerToClientEvents[T]>): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).emit(event, ...args);
  }

  public static emitToAll<T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.emit(event, ...args);
  }
}
