import { createServer, ViteDevServer } from 'vite';
import express, { Express, RequestHandler } from 'express';
import { accessControl, invalidRoute, logger, notConfigured } from './middlewares';
import { apiRouter } from './routers/apiRouter';
import compression, { CompressionOptions } from 'compression';
import { frontendPath, frontendProductionPath, isDevMode, serverPort } from '#shared/constants';
import chalk from 'chalk';
import path from 'path';
import { Config } from '#lib/Config';
import { faker } from '@faker-js/faker';
import { display } from '#lib/display';
import { createOnboardingRouter } from '#server/routers/onboarding';


export class Server {
  public readonly app: Express;
  public vite?: ViteDevServer;

  private static readonly compressionOptions: CompressionOptions = {
    level: 7,
  };

  constructor(private readonly port = serverPort, private readonly devMode = isDevMode) {
    this.app = express();
  }

  private async setupVite() {
    this.vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    this.app.use(this.vite.middlewares);
  }

  private async registerRoutes() {
    this.app.use(accessControl);

    this.app.use(logger);
    this.app.use(compression(Server.compressionOptions));

    if (await this.isConfigured()) {
      this.app.use('/api', apiRouter);

      if (!this.devMode) { // allow access to onboarding view in dev mode
        this.app.use('/onboarding', (req, res) => res.redirect('/'));
      }
    } else {
      this.app.use('/api', notConfigured);
      this.app.use('/onboarding', createOnboardingRouter(this.port));
    }

    if (this.devMode) {
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
    await this.registerRoutes();

    this.app.listen(this.port, () => {
      console.log(`${this.devMode ? 'Development server' : 'Server'} started on port ${chalk.green.bold(this.port)}`);
    });
  }
}

