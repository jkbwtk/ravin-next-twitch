import { createServer, ViteDevServer } from 'vite';
import express, { Express, RequestHandler } from 'express';
import { accessControl, invalidRoute, logger, notConfigured } from './middlewares';
import { apiRouter } from '#routers/apiRouter';
import compression, { CompressionOptions } from 'compression';
import { frontendPath, frontendProductionPath, isDevMode, serverPort } from '#shared/constants';
import chalk from 'chalk';
import path from 'path';
import { Config } from '#lib/Config';
import { createOnboardingRouter } from '#server/routers/onboarding';
import { Database } from '#database/Database';
import session from 'express-session';
import passport from 'passport';
import { User as UserEntity } from '#database/entities/User';
import { randomAlphanumeric } from '#lib/utils';
import RedisStore from 'connect-redis';
import { TokenManager } from '#server/TokenManager';
import { Bot } from '#bot/Bot';


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserEntity {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

export class Server {
  public readonly app: Express;
  public vite?: ViteDevServer;

  private static readonly compressionOptions: CompressionOptions = {
    level: 7,
  };

  constructor(private readonly port = serverPort) {
    this.app = express();
  }

  private async setupVite() {
    this.vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    this.app.use(this.vite.middlewares);
  }

  private static async generateSessionSecret() {
    const secret = randomAlphanumeric(12);

    await Config.set('sessionSecret', secret);

    return secret;
  }

  private async setupSession() {
    const secret = await Config.get('sessionSecret') ?? await Server.generateSessionSecret();

    this.app.use(session({
      secret,
      resave: false,
      saveUninitialized: false,
      name: 'ravin-auth',
      rolling: true,
      cookie: {
        signed: true,
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
      },
      store: new RedisStore({
        client: await Database.getRedisClient(),
        prefix: 'session_store:',
      }),
      // store: new TypeormStore({
      //   cleanupLimit: 2,
      //   ttl: 86400,
      // }).connect(sessionRepository),
    }));

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.app.all('/', (req, res, next) => {
      if (req.isAuthenticated()) res.redirect('/dashboard');
      else next();
    });
  }

  private async registerRoutes() {
    this.app.use(accessControl);

    this.app.use(logger);
    this.app.use(compression(Server.compressionOptions));

    await this.setupSession();

    if (await this.isConfigured()) {
      this.app.use('/api', await apiRouter());

      if (!isDevMode) { // allow access to onboarding view in dev mode
        this.app.use('/onboarding', (req, res) => res.redirect('/'));
      }
    } else {
      this.app.use('/api', notConfigured);
      this.app.use('/onboarding', createOnboardingRouter(this.port));
    }

    if (isDevMode) {
      await this.setupVite();
    } else {
      this.app.use(express.static(frontendProductionPath));

      this.app.get('*', this.serveIndexHtml);
    }

    this.app.use(invalidRoute);
  }

  private serveIndexHtml: RequestHandler = (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  };

  private async isConfigured(): Promise<boolean> {
    const config = await Config.getConfig();

    if ((process.env.RECONFIGURE_SERVER ?? 'FALSE').toUpperCase() === 'TRUE') return false;

    return (
      config.has('botLogin') &&
      config.has('botToken') &&
      config.has('twitchClientId') &&
      config.has('twitchClientSecret') &&
      config.has('sessionSecret')
    );
  }

  public async start(): Promise<void> {
    await TokenManager.processAll();
    await TokenManager.start();

    if (await this.isConfigured()) {
      await Bot.start();
    }

    await this.registerRoutes();

    this.app.listen(this.port, () => {
      console.log(`${isDevMode ? 'Development server' : 'Server'} started on port ${chalk.green.bold(this.port)}`);
    });
  }
}

