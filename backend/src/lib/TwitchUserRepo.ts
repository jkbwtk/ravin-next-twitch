import { ExtendedMap } from '#lib/ExtendedMap';
import { display } from '#lib/display';
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
      display.debug.nextLine('TwitchUserRepo:get', 'Getting user', id);

      const cached = this.getCached(id);
      if (cached !== null) {
        display.debug.nextLine('TwitchUserRepo:get', 'User found in cache', id);
        return cached;
      }


      const fetched = await getUsers(userId, { id });
      const user = fetched[0];

      if (user === undefined) {
        display.warning.nextLine('TwitchUserRepo:get', 'No user found for id', id);
        return null;
      }

      this.cacheUser(user);
      display.debug.nextLine('TwitchUserRepo:get', 'User cached', id);

      return user;
    } catch (err) {
      display.error.nextLine('TwitchUserRepo:get', err);
      return null;
    }
  }

  public static async getByLogin(userId: string, login: string): Promise<TwitchUser | null> {
    const id = this.idMap.get(login);

    if (id !== undefined) {
      return this.get(userId, id);
    }

    try {
      display.debug.nextLine('TwitchUserRepo:getByLogin', 'Getting user', login);

      const fetched = await getUsers(userId, { login });
      const user = fetched[0];

      if (user === undefined) {
        display.warning.nextLine('TwitchUserRepo:getByLogin', 'No user found for login', login);
        return null;
      }

      this.cacheUser(user);
      display.debug.nextLine('TwitchUserRepo:getByLogin', 'User cached', login);

      return user;
    } catch (err) {
      display.error.nextLine('TwitchUserRepo:getByLogin', err);
      return null;
    }
  }

  public static async getAll(userId: string, ids: string[]): Promise<TwitchUser[]> {
    try {
      display.debug.nextLine('TwitchUserRepo:getAll', 'Getting users', ids);

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
        display.debug.nextLine('TwitchUserRepo:getAll', 'All users found in cache', ids);
        return cached;
      }

      const fetched = await getUsers(userId, { id: uncached });

      for (const user of fetched) {
        this.cacheUser(user);
      }

      display.debug.nextLine('TwitchUserRepo:getAll', 'Users cached', ids);

      return [...cached, ...fetched];
    } catch (err) {
      display.error.nextLine('TwitchUserRepo:getAll', err);
      return [];
    }
  }

  public static async getAllByLogin(userId: string, logins: string[]): Promise<TwitchUser[]> {
    try {
      display.debug.nextLine('TwitchUserRepo:getAllByLogin', 'Getting users', logins);

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
        display.debug.nextLine('TwitchUserRepo:getAllByLogin', 'All users found in cache', logins);
        return cached;
      }

      const fetched = await getUsers(userId, { login: uncached });

      for (const user of fetched) {
        this.cacheUser(user);
      }

      display.debug.nextLine('TwitchUserRepo:getAllByLogin', 'Users cached', logins);

      return [...cached, ...fetched];
    } catch (err) {
      display.error.nextLine('TwitchUserRepo:getAllByLogin', err);
      return [];
    }
  }
}
