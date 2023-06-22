import { prisma } from '#database/database';
import { TokenWithUserAndChannel } from '#database/extensions/token';
import Deferred from '#lib/Deferred';
import { ExtendedMap } from '#lib/ExtendedMap';
import { display } from '#lib/display';
import { refreshTokenUnsafe, validateTokenUnsafe } from '#lib/twitch';
import { isDevApi } from '#shared/constants';


export class TokenManager {
  private static instance: TokenManager;

  private repository = prisma.token;
  private intervalHandle: NodeJS.Timer | null = null;

  private refreshQueue: ExtendedMap<string, Deferred<TokenWithUserAndChannel>> = new ExtendedMap();

  private options = {
    refreshInterval: 1000 * 60 * 60, // 1 hour
  };

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }

    return TokenManager.instance;
  }

  private async _refresh(userId: string): Promise<TokenWithUserAndChannel> {
    try {
      if (isDevApi) {
        const token = await prisma.token.getByUserIdOrFail(userId);
        display.debug.nextLine('TokenManager', 'Skipping token refresh because dev api is enabled');
        return token;
      }

      const request = this.refreshQueue.get(userId);
      if (request) {
        display.debug.nextLine('TokenManager', 'Joining refresh queue for user', userId);
        return request.promise;
      }

      const deferred = new Deferred<TokenWithUserAndChannel>();
      this.refreshQueue.set(userId, deferred);

      display.debug.nextLine('TokenManager', 'Refreshing token for user', userId);
      const refreshedToken = await refreshTokenUnsafe(userId);
      display.debug.nextLine('TokenManager', 'Token for user', refreshedToken.userId, 'refreshed');

      const createdToken = await this.repository.update({
        where: {
          id: refreshedToken.id,
        },
        data: {
          accessToken: refreshedToken.accessToken,
          refreshToken: refreshedToken.refreshToken,
        },
        include: {
          user: {
            include: {
              channel: true,
            },
          },
        },
      });
      display.debug.nextLine('TokenManager', 'Token for user', createdToken.userId, 'updated');

      this.refreshQueue.delete(userId);
      deferred.resolve(createdToken);

      return createdToken;
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
    const users = await prisma.user.findMany({
      // where: {
      //   token: {
      //     refreshToken: {
      //       not: null,
      //     },
      //   },
      // },
      select: {
        id: true,
      },
    });
    display.debug.nextLine('TokenManager', 'Found', users.length, 'tokens');

    for (let user of users) {
      await this._processPartial(user.id);
    }
  };

  private async _processPartial(userId: string): Promise<void> {
    try {
      display.debug.nextLine('TokenManager', 'Processing token for user', userId);
      const token = await this.repository.getByUserId(userId);

      if (token === null) {
        display.error.nextLine('TokenManager', 'Failed to fetch token for user', userId);
        return;
      }

      if (token.refreshToken === null) {
        display.debug.nextLine('TokenManager', 'Skipping token for user', userId, 'because it has no refresh token');
        return;
      }

      if (await validateTokenUnsafe(userId)) {
        display.debug.nextLine('TokenManager', 'Token for user', userId, 'is valid');
        return;
      }

      display.debug.nextLine('TokenManager', 'Token for user', userId, 'is invalid, refreshing...');
      await this._refresh(userId);
    } catch (err) {
      const error = typeof err === 'object' && err !== null && 'message' in err ? err.message : err;

      display.debug.nextLine('TokenManager', 'Failed to process token for user', userId);
      display.warning.nextLine('TokenManager', error);
    }
  }

  public static async refresh(userId: string): Promise<TokenWithUserAndChannel> {
    const instance = TokenManager.getInstance();

    return instance._refresh(userId);
  }

  public static async processAll(): Promise<void> {
    const instance = TokenManager.getInstance();

    await instance._processAll();
  }

  public static start(): void {
    const instance = TokenManager.getInstance();

    TokenManager.stop();
    instance.intervalHandle = setInterval(() => {
      instance._processAll;
    }, instance.options.refreshInterval);
  }

  public static stop(): void {
    const instance = TokenManager.getInstance();

    if (instance.intervalHandle !== null) {
      clearInterval(instance.intervalHandle);
    }
  }
}
