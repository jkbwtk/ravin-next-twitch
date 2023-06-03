import { Database } from '#database/Database';
import { Token } from '#database/entities/Token';
import Deferred from '#lib/Deferred';
import { ExtendedMap } from '#lib/ExtendedMap';
import { display } from '#lib/display';
import { refreshTokenUnsafe, validateTokenUnsafe } from '#lib/twitch';
import { isDevApi } from '#shared/constants';
import { IsNull, Not, Repository } from 'typeorm';


export class TokenManager {
  private static instance: TokenManager;

  private repository!: Repository<Token>;
  private intervalHandle: NodeJS.Timer | null = null;

  private refreshQueue: ExtendedMap<string, Deferred<Token>> = new ExtendedMap();

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

  private async _refresh(userId: string): Promise<Token> {
    try {
      if (isDevApi) {
        const token = await Token.getByUserIdOrFail(userId);
        display.debug.nextLine('TokenManager', 'Skipping token refresh because dev api is enabled');
        return token;
      }

      const request = this.refreshQueue.get(userId);
      if (request) {
        display.debug.nextLine('TokenManager', 'Joining refresh queue for user', userId);
        return request.promise;
      }

      const deferred = new Deferred<Token>();
      this.refreshQueue.set(userId, deferred);

      display.debug.nextLine('TokenManager', 'Refreshing token for user', userId);
      const resp = await refreshTokenUnsafe(userId);
      display.debug.nextLine('TokenManager', 'Token', resp.id, 'refreshed');

      const newToken = await Token.updateOrFail(resp);
      display.debug.nextLine('TokenManager', 'Token', newToken.id, 'updated');

      this.refreshQueue.delete(userId);
      deferred.resolve(newToken);

      return newToken;
    } catch (err) {
      const request = this.refreshQueue.get(userId);

      if (request) {
        request.reject(err as undefined);
        this.refreshQueue.delete(userId);
      }

      display.debug.nextLine('TokenManager', 'Failed to refresh token for user', userId);
      display.warning.nextLine('TokenManager', err);
    }

    throw new Error('Failed to refresh token');
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
      await this._processPartial(partialToken);
    }
  };

  private async _processPartial(partialToken: Token): Promise<void> {
    try {
      display.debug.nextLine('TokenManager', 'Processing token', partialToken.id);
      const token = await Token.getByUserIdOrFail(partialToken.user.id);

      if (token === undefined) {
        display.error.nextLine('TokenManager', 'Failed to preload token', partialToken.id);
        return;
      }

      if (token.refreshToken === null) {
        display.debug.nextLine('TokenManager', 'Skipping token', token.id, 'because it has no refresh token');
        return;
      }

      if (await validateTokenUnsafe(token.user.id)) {
        display.debug.nextLine('TokenManager', 'Token', token.id, 'is valid');
        return;
      }

      display.debug.nextLine('TokenManager', 'Token', token.id, 'is invalid, refreshing...');
      await this._refresh(token.user.id);
    } catch (err) {
      const error = typeof err === 'object' && err !== null && 'message' in err ? err.message : err;

      display.debug.nextLine('TokenManager', 'Failed to process token', partialToken.id);
      display.warning.nextLine('TokenManager', error);
    }
  }

  public static async refresh(userId: string): Promise<Token> {
    const instance = await TokenManager.getInstance();

    return instance._refresh(userId);
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
