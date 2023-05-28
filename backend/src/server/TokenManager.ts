import { Database } from '#database/Database';
import { Token } from '#database/entities/Token';
import { display } from '#lib/display';
import { refreshTokenUnsafe, validateTokenUnsafe } from '#lib/twitch';
import { isDevApi } from '#shared/constants';
import { IsNull, Not, Repository } from 'typeorm';


export class TokenManager {
  private static instance: TokenManager;

  private repository!: Repository<Token>;
  private intervalHandle: NodeJS.Timer | null = null;

  private options = {
    interval: 1000 * 60 * 60, // 1 hour
  };

  private async init(): Promise<void> {
    this.repository = await Database.getRepository(Token);
  }

  public static async getInstance(): Promise<TokenManager> {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
      await TokenManager.instance.init();
    }

    return TokenManager.instance;
  }

  private async _refresh(token: Token): Promise<Token> {
    if (isDevApi) {
      display.debug.nextLine('TokenManager', 'Skipping token refresh because dev api is enabled');
      return token;
    }

    display.debug.nextLine('TokenManager', 'Refreshing token', token.id);
    const resp = await refreshTokenUnsafe(token);
    display.debug.nextLine('TokenManager', 'Token', token.id, 'refreshed');

    token.accessToken = resp.accessToken;
    token.refreshToken = resp.refreshToken;

    const newToken = await Token.updateOrFail(token);
    display.debug.nextLine('TokenManager', 'Token', token.id, 'updated');

    return newToken;
  }

  private _processAll = async (): Promise<void> => {
    if (isDevApi) {
      display.debug.nextLine('TokenManager', 'Skipping token processing because dev api is enabled');
      return;
    }

    display.debug.nextLine('TokenManager', 'Beginning token processing...');
    const tokens = await this.repository.find({
      where: {
        refreshToken: Not(IsNull()),
      },
      relations: {
        user: true,
      },
      select: ['id'],
    });
    display.debug.nextLine('TokenManager', 'Found', tokens.length, 'tokens');

    for (let partialToken of tokens) {
      try {
        display.debug.nextLine('TokenManager', 'Processing token', partialToken.id);
        const token = await this.repository.preload(partialToken);

        if (token === undefined) {
          display.error.nextLine('TokenManager', 'Failed to preload token', partialToken.id);
          continue;
        }

        if (token.refreshToken === null) {
          display.debug.nextLine('TokenManager', 'Skipping token', token.id, 'because it has no refresh token');
          continue;
        }

        if (await validateTokenUnsafe(token)) {
          display.debug.nextLine('TokenManager', 'Token', token.id, 'is valid');
          continue;
        }

        display.debug.nextLine('TokenManager', 'Token', token.id, 'is invalid, refreshing...');
        await this._refresh(token);
      } catch (err) {
        const error = typeof err === 'object' && err !== null && 'message' in err ? err.message : err;
        const stack = typeof err === 'object' && err !== null && 'stack' in err ? err.stack : '';

        display.debug.nextLine('TokenManager', 'Failed to process token', partialToken.id);
        display.warning.nextLine('TokenManager', error);
        display.debug.nextLine('TokenManager', stack);

        continue;
      }
    }
  };

  public static async refresh(token: Token): Promise<Token> {
    const instance = await TokenManager.getInstance();

    return instance._refresh(token);
  }

  public static async processAll(): Promise<void> {
    const instance = await TokenManager.getInstance();

    await instance._processAll();
  }

  public static async start(): Promise<void> {
    const instance = await TokenManager.getInstance();

    await TokenManager.stop();
    instance.intervalHandle = setInterval(instance._processAll, instance.options.interval);
  }

  public static async stop(): Promise<void> {
    const instance = await TokenManager.getInstance();

    if (instance.intervalHandle !== null) {
      clearInterval(instance.intervalHandle);
    }
  }
}
