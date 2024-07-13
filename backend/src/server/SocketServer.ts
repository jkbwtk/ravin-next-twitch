import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Request } from 'express';
import { ClientToServerEvents, ServerToClientEvents, SocketRoom } from '#types/api/socket';
import { logger } from '#lib/logger';
import { mapOptionsToArray } from '#lib/utils';
import { ExtendedCron } from '#lib/ExtendedCron';
import passport from 'passport';
import { getSessionMiddleware } from '#server/sessionMiddleware';
import { SystemNotificationController } from '#database/controllers/SystemNotificationController';
import { CommandController } from '#database/controllers/CommandController';


export class SocketServer {
  private static instance: SocketServer;

  public readonly io: Server<ClientToServerEvents, ServerToClientEvents>;

  public static async createInstance(httpServer: HTTPServer): Promise<SocketServer> {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
      await SocketServer.instance.registerRoutes();

      SocketServer.instance.registerSignalHandlers();

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

  private constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer);
  }

  private async registerRoutes() {
    this.io.engine.use(await getSessionMiddleware());
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

  private registerSignalHandlers() {
    ExtendedCron.registerEffect('create', (self) => {
      SocketServer.emitToRoom('admin', 'NEW_CRON_JOB', self.serialize());
    });

    ExtendedCron.registerEffect('start', (self) => {
      SocketServer.emitToRoom('admin', 'UPD_CRON_JOB', self.serialize());
    });

    ExtendedCron.registerEffect('finish', (self) => {
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

    SystemNotificationController.$signals.registerAfter('create', (notification) => {
      if (notification === null) return;
      SocketServer.emitToUser(notification.userId, 'NEW_SYSTEM_NOTIFICATION', SystemNotificationController.$utils.serialize(notification));
    });

    SystemNotificationController.$signals.registerAfter('broadcast', (notifications) => {
      for (const notification of notifications) {
        SocketServer.emitToUser(notification.userId, 'NEW_SYSTEM_NOTIFICATION', SystemNotificationController.$utils.serialize(notification));
      }
    });

    SystemNotificationController.$signals.registerAfter('markAsReadById', (notifications) => {
      const aggregated: Map<string, number[]> = new Map();

      for (const notification of notifications) {
        const list = aggregated.get(notification.userId);

        if (list === undefined) {
          aggregated.set(notification.userId, [notification.id]);
          continue;
        }

        list.push(notification.id);
      }

      for (const [userId, ids] of aggregated) {
        SocketServer.emitToUser(userId, 'RAD_SYSTEM_NOTIFICATION', ids);
      }
    });

    CommandController.$signals.registerAfter('create', (command) => {
      if (command === null) return;
      SocketServer.emitToUser(command.channelUserId, 'NEW_CUSTOM_COMMAND', CommandController.$utils.serialize(command));
    });

    CommandController.$signals.registerAfter('update', (command) => {
      if (command === null) return;
      SocketServer.emitToUser(command.channelUserId, 'UPD_CUSTOM_COMMAND', CommandController.$utils.serialize(command));
    });

    CommandController.$signals.registerAfter('delete', (command) => {
      if (command === null) return;
      SocketServer.emitToUser(command.channelUserId, 'DEL_CUSTOM_COMMAND', command.id);
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
