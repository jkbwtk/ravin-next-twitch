import Deferred from '#shared/Deferred';
import { ExtendedCron } from '#lib/ExtendedCron';
import { ExtendedMap } from '#lib/ExtendedMap';
import { logger } from '#lib/logger';
import { refreshTokenUnsafe, validateTokenUnsafe } from '#lib/twitch';
import { isDevApi } from '#shared/constants';
import { TokenController } from '#database/controllers/TokenController';
import { UserController } from '#database/controllers/UserController';
import { Token } from '#types/database/tables';


export class TokenManager {
  private static instance: TokenManager;

  private refreshJob = new ExtendedCron('? * * * *', {
    name: 'TokenManager:refreshTokens',
    paused: true,
  }, TokenManager.processAll);

  private refreshQueue: ExtendedMap<string, Deferred<Token>> = new ExtendedMap();

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }

    return TokenManager.instance;
  }

  private async _refresh(userId: string): Promise<Token> {
    try {
      if (isDevApi) {
        const token = await TokenController.getByUserId(userId);
        logger.info('Skipping token refresh because dev api is enabled', { label: ['TokenManager', 'refresh'] });

        if (token === null) {
          throw new Error('Failed to refresh token');
        }

        return token;
      }

      const request = this.refreshQueue.get(userId);
      if (request) {
        logger.debug('Joining refresh queue for user [%s]', userId, { label: ['TokenManager', 'refresh'] });
        return request.promise;
      }

      const deferred = new Deferred<Token>();
      this.refreshQueue.set(userId, deferred);

      logger.debug('Refreshing token for user [%s]', userId, { label: ['TokenManager', 'refresh'] });
      const refreshedToken = await refreshTokenUnsafe(userId);
      logger.debug('Token for user [%s] refreshed', refreshedToken.channelUserId, { label: ['TokenManager', 'refresh'] });

      const createdToken = await TokenController.update(refreshedToken);

      if (createdToken === null) {
        throw new Error('Failed to refresh token');
      }

      logger.debug('Token for user [%s] updated', createdToken.channelUserId, { label: ['TokenManager', 'refresh'] });

      this.refreshQueue.delete(userId);
      deferred.resolve(createdToken);

      return createdToken;
    } catch (err) {
      const request = this.refreshQueue.get(userId);

      if (request) {
        request.reject(err as undefined);
        this.refreshQueue.delete(userId);
      }

      logger.error('Failed to refresh token for user [%s]', userId, { label: ['TokenManager', 'refresh'], error: err });
    }

    throw new Error('Failed to refresh token');
  }

  private _processAll = async (): Promise<void> => {
    if (isDevApi) {
      logger.info('Skipping token processing because dev api is enabled', { label: ['TokenManager', 'processAll'] });
      return;
    }

    logger.info('Beginning token processing...', { label: ['TokenManager', 'processAll'] });
    const userIds = await UserController.getAllIds();

    logger.debug('Found [%o] tokens', userIds.length, { label: ['TokenManager', 'processAll'] });

    for (let id of userIds) {
      await this._processPartial(id);
    }
  };

  private async _processPartial(userId: string): Promise<void> {
    try {
      logger.debug('Processing token for user [%s]', userId, { label: ['TokenManager', 'processPartial'] });
      const token = await TokenController.getByUserId(userId);

      if (token === null) {
        logger.warn('Failed to fetch token for user [%s]', userId, { label: ['TokenManager', 'processPartial'] });
        return;
      }

      if (token.refreshToken === null) {
        logger.debug('Skipping token for user [%s] because it has no refresh token', userId, { label: ['TokenManager', 'processPartial'] });
        return;
      }

      if (await validateTokenUnsafe(userId)) {
        logger.debug('Token for user [%s] is valid', userId, { label: ['TokenManager', 'processPartial'] });
        return;
      }

      logger.debug('Token for user [%s] is invalid, refreshing...', userId, { label: ['TokenManager', 'processPartial'] });
      await this._refresh(userId);
    } catch (err) {
      logger.error('Failed to process token for user [%s]', userId, { label: ['TokenManager', 'processPartial'], error: err });
    }
  }

  public static async refresh(userId: string): Promise<Token> {
    const instance = TokenManager.getInstance();

    return instance._refresh(userId);
  }

  public static async processAll(): Promise<void> {
    const instance = TokenManager.getInstance();

    await instance._processAll();
  }

  public static async start(): Promise<void> {
    const instance = TokenManager.getInstance();

    instance.refreshJob.resume();
    await instance.refreshJob.trigger();
  }

  public static stop(): void {
    const instance = TokenManager.getInstance();

    // TODO: add additional start/stop logic (refreshJob can't be started again after it's stopped)
    instance.refreshJob.stop();
  }
}
