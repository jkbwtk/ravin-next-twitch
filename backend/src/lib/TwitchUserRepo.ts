import { ExtendedMap } from '#lib/ExtendedMap';
import { logger } from '#lib/logger';
import { getUsers } from '#lib/twitch';
import { TwitchUser } from '#shared/types/twitch';


export interface CachedTwitchUser {
  user: TwitchUser;
  lastUpdated: number;
}

export class TwitchUserRepo {
  private static readonly settings = {
    cacheTime: (1000 * 60) * 60, // 1 hour
  };

  private static readonly cache: Map<string, CachedTwitchUser> = new ExtendedMap();
  private static readonly idMap: Map<string, string> = new ExtendedMap();

  private static cacheUser(user: TwitchUser): void {
    this.idMap.set(user.login, user.id);

    this.cache.set(
      user.id,
      {
        user,
        lastUpdated: Date.now(),
      },
    );
  }

  private static getCached(id: string): TwitchUser | null {
    const cached = this.cache.get(id);

    if (cached && Date.now() - cached.lastUpdated < this.settings.cacheTime) {
      return cached.user;
    }

    return null;
  }

  public static async get(userId: string, id: string): Promise<TwitchUser | null> {
    try {
      logger.debug('Getting user [%s]', id, { label: ['TwitchUserRepo', 'get'] });

      const cached = this.getCached(id);
      if (cached !== null) {
        logger.debug('User [%s] found in cache', id, { label: ['TwitchUserRepo', 'get'] });
        return cached;
      }


      const fetched = await getUsers(userId, { id });
      const user = fetched[0];

      if (user === undefined) {
        logger.warn('No user found for id [%s]', id, { label: ['TwitchUserRepo', 'get'] });
        return null;
      }

      this.cacheUser(user);
      logger.debug('User [%s] cached', id, { label: ['TwitchUserRepo', 'get'] });

      return user;
    } catch (err) {
      logger.error('Failed to get user [%s]', id, { label: ['TwitchUserRepo', 'get'], error: err });
      return null;
    }
  }

  public static async getByLogin(userId: string, login: string): Promise<TwitchUser | null> {
    const id = this.idMap.get(login);

    if (id !== undefined) {
      return this.get(userId, id);
    }

    try {
      logger.debug('Getting user [%s]', login, { label: ['TwitchUserRepo', 'getByLogin'] });

      const fetched = await getUsers(userId, { login });
      const user = fetched[0];

      if (user === undefined) {
        logger.warn('No user found for login [%s]', login, { label: ['TwitchUserRepo', 'getByLogin'] });
        return null;
      }

      this.cacheUser(user);
      logger.debug('User [%s] cached', login, { label: ['TwitchUserRepo', 'getByLogin'] });

      return user;
    } catch (err) {
      logger.error('Failed to get user [%s]', login, { label: ['TwitchUserRepo', 'getByLogin'], error: err });
      return null;
    }
  }

  public static async getAll(userId: string, ids: string[]): Promise<TwitchUser[]> {
    try {
      logger.debug('Getting users [%o]', ids, { label: ['TwitchUserRepo', 'getAll'] });

      const cached: TwitchUser[] = [];
      const uncached: string[] = [];
      let tmpUser: TwitchUser | null;

      for (const id of ids) {
        tmpUser = this.getCached(id);
        if (tmpUser !== null) {
          cached.push(tmpUser);
        } else {
          uncached.push(id);
        }
      }

      if (uncached.length === 0) {
        logger.debug('All users found in cache [%o]', ids, { label: ['TwitchUserRepo', 'getAll'] });
        return cached;
      }

      const fetched = await getUsers(userId, { id: uncached });

      for (const user of fetched) {
        this.cacheUser(user);
      }

      logger.debug('Users cached [%o]', ids, { label: ['TwitchUserRepo', 'getAll'] });

      return [...cached, ...fetched];
    } catch (err) {
      logger.error('Failed to get users [%o]', ids, { label: ['TwitchUserRepo', 'getAll'], error: err });
      return [];
    }
  }

  public static async getAllByLogin(userId: string, logins: string[]): Promise<TwitchUser[]> {
    try {
      logger.debug('Getting users [%o]', logins, { label: ['TwitchUserRepo', 'getAllByLogin'] });

      const cached: TwitchUser[] = [];
      const uncached: string[] = [];
      let tmpId: string | undefined;
      let tmpUser: TwitchUser | null;

      for (const login of logins) {
        tmpId = this.idMap.get(login);

        if (tmpId !== undefined) {
          tmpUser = this.getCached(tmpId);

          if (tmpUser !== null) {
            cached.push(tmpUser);
            continue;
          }
        }

        uncached.push(login);
      }

      if (uncached.length === 0) {
        logger.debug('All users found in cache [%o]', logins, { label: ['TwitchUserRepo', 'getAllByLogin'] });
        return cached;
      }

      const fetched = await getUsers(userId, { login: uncached });

      for (const user of fetched) {
        this.cacheUser(user);
      }

      logger.debug('Users cached [%o]', logins, { label: ['TwitchUserRepo', 'getAllByLogin'] });

      return [...cached, ...fetched];
    } catch (err) {
      logger.error('Failed to get users [%o]', logins, { label: ['TwitchUserRepo', 'getAllByLogin'], error: err });
      return [];
    }
  }
}
