import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as AppServer } from '#server/Server';
import passport from 'passport';
import { Request } from 'express';
import { ClientToServerEvents, ServerToClientEvents, SocketRoom } from '#types/api/socket';
import { logger } from '#lib/logger';
import { mapOptionsToArray } from '#lib/utils';
import { ExtendedCron } from '#lib/ExtendedCron';


export class SocketServer {
  private static instance: SocketServer;

  public readonly io: Server<ClientToServerEvents, ServerToClientEvents>;

  public static async createInstance(httpServer: HTTPServer): Promise<SocketServer> {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
      await SocketServer.instance.registerRoutes();

      ExtendedCron.registerEffect('create', (self) => {
        SocketServer.emitToRoom('admin', 'NEW_CRON_JOB', self.serialize());
      });

      ExtendedCron.registerEffect('run', (self) => {
        SocketServer.emitToRoom('admin', 'UPD_CRON_JOB', self.serialize());
      });

      ExtendedCron.registerEffect('resume', (self) => {
        SocketServer.emitToRoom('admin', 'UPD_CRON_JOB', self.serialize());
      });

      ExtendedCron.registerEffect('pause', (self) => {
        SocketServer.emitToRoom('admin', 'UPD_CRON_JOB', self.serialize());
      });

      ExtendedCron.registerEffect('delete', (self) => {
        SocketServer.emitToRoom('admin', 'DEL_CRON_JOB', self.creationTimestamp);
      });

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

      const rooms: SocketRoom[] = mapOptionsToArray<SocketRoom>({
        [req.user.id]: true,
        admin: req.user.admin,
      });

      await socket.join(rooms);

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

  public static emitToRoom<T extends keyof ServerToClientEvents>(room: SocketRoom, event: T, ...args: Parameters<ServerToClientEvents[T]>): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(room).emit(event, ...args);
  }

  public static emitToAll<T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.emit(event, ...args);
  }
}
