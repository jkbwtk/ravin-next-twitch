import { createServer, ViteDevServer } from 'vite';
import express, { Express, RequestHandler } from 'express';
import { accessControl, invalidRoute, logger } from './middlewares';
import { apiRouter } from './routers/apiRouter';
import compression, { CompressionOptions } from 'compression';
import { frontendPath, frontendProductionPath } from './constants';
import chalk from 'chalk';
import path from 'path';


export class Server {
  public readonly app: Express;
  public vite?: ViteDevServer;

  private static readonly compressionOptions: CompressionOptions = {
    level: 7,
  };

  constructor(private readonly port: number, private readonly devMode: boolean) {
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
    this.app.use('/api', apiRouter);

    if (this.devMode) {
      await this.setupVite();
    } else {
      this.app.use(compression(Server.compressionOptions));
      this.app.use(express.static(frontendProductionPath));

      this.app.get('*', this.serveIndexHtml);
    }

    this.app.use(invalidRoute);
  }

  private serveIndexHtml: RequestHandler = (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  };

  public async start(): Promise<void> {
    await this.registerRoutes();

    this.app.listen(this.port, () => {
      console.log(`${this.devMode ? 'Development server' : 'Server'} started on port ${chalk.green.bold(this.port)}`);
    });
  }
}

