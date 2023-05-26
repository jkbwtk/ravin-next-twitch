import 'dotenv/config';
import path from 'path';
import { cwd } from 'process';


export const defaultServerPort = 3000;
export const defaultCallbackUrl = 'http://localhost:3000/api/v1/auth/callback';

export const frontendDevelopmentPath = path.join(cwd(), 'frontend');
export const frontendProductionPath = path.join(cwd(), 'web');

export const developmentPublicPath = path.join(frontendDevelopmentPath, 'public');
export const productionPublicPath = path.join(frontendProductionPath, '');

export const isDevMode = process.env.DEV?.toLowerCase() === 'true';

export const serverPort = (() => {
  if (process.env.PORT === undefined) return defaultServerPort;
  const port = parseInt(process.env.PORT);

  return isNaN(port) ? defaultServerPort : port;
})();

export const publicPath = isDevMode ? developmentPublicPath : productionPublicPath;
export const frontendPath = isDevMode ? frontendDevelopmentPath : frontendProductionPath;

export const callbackUrl = process.env.CALLBACK_URL ?? defaultCallbackUrl;

export const isDevApi = process.env.DEV_API?.toLowerCase() !== 'false' && isDevMode;

export const twitchApiUrl = isDevApi ? 'http://localhost:8080/mock' : 'https://api.twitch.tv/helix';

export const twitchApi = (url: string): string => `${twitchApiUrl}${url}`;
