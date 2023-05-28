import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as AppServer } from '#server/Server';
import passport from 'passport';
import { Request } from 'express';
import { display } from '#lib/display';


export class SocketServer {
  private static instance: SocketServer;

  public readonly io: Server;

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
      console.log('socket middleware', req.isAuthenticated());
      if (req.isUnauthenticated()) next(new Error('Unauthenticated'));

      next();
    });

    this.io.on('connection', async (socket) => {
      const req = socket.request as Request;


      if (req.isUnauthenticated() || req.user === undefined) {
        display.error.nextLine('SocketServer', 'Unauthenticated user connected');
        return socket.disconnect(true);
      }

      await socket.join(req.user.id);

      display.debug.nextLine('SocketServer', 'User connected', req.user.login);
      socket.on('disconnect', () => {
        display.debug.nextLine('SocketServer', 'User disconnected', req.user?.login ?? '');
      });
    });
  }

  public static disconnectUser(userId: string): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).disconnectSockets(true);
  }

  public static emitToUser(userId: string, event: string, ...args: unknown[]): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).emit(event, ...args);
  }
}
