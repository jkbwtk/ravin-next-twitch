/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  InternalServerError,
  InvalidAccessToken,
  InvalidRefreshToken,
  InvalidRequestParameters,
  NotFound,
  TimedOut,
  TooManyParameters,
} from '#lib/twitchErrors';
import {
  GetChatters,
  GetTwitchModerators,
  GetTwitchUsers,
  GetUsersOptions,
  RefreshAccessToken,
  TwitchBriefUser,
  TwitchUser,
} from '#types/twitch';
import { twitchApiUrl } from '#shared/constants';
import { Config } from '#lib/Config';
import { prisma } from '#database/database';
import { TokenManager } from '#server/TokenManager';
import { arrayFrom, AtLeastOne, sleep } from '#lib/utils';
import { TokenWithUserAndChannel } from '#database/extensions/token';
import { logger } from '#lib/logger';


const apiSettings = {
  baseUrl: twitchApiUrl,
  maxParams: 100,
  timeout: 3000,
};

const twitch = axios.create({
  baseURL: apiSettings.baseUrl,
  timeout: apiSettings.timeout,
});

const moduleID = (f: (...args: never) => unknown) => `TwitchAPI:${f.name}`;

type CloneFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => ReturnType<T>;

function errorConverter(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error?.response?.status === 400) return new InvalidRequestParameters('Invalid login names, emails or IDs in request');
    if (error?.response?.status === 401) return new InvalidAccessToken('Access token is invalid');
    if (error?.response?.status === 404) return new NotFound('No response from server');
    if (error?.response?.status === 500) return new InternalServerError('Failed to get information');

    if (error?.code === 'ECONNABORTED') return new TimedOut('Connection timed out');
    if (error?.code === 'ENOTFOUND') return new TimedOut('DNS error');
  }

  return error;
}


export async function validateTokenUnsafe(userId: string): Promise<boolean> {
  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    await twitch.request({
      method: 'GET',
      baseURL: 'https://id.twitch.tv',
      url: '/oauth2/validate',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });


    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error?.response?.status === 401) return false;
    }

    throw errorConverter(error);
  }
}

export async function refreshTokenUnsafe(userId: string): Promise<TokenWithUserAndChannel> {
  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    const response = await twitch.request<RefreshAccessToken>({
      method: 'POST',
      baseURL: 'https://id.twitch.tv',
      url: '/oauth2/token',
      data: {
        client_id: await Config.getOrFail('twitchClientId'),
        refresh_token: token.refreshToken,
        client_secret: await Config.getOrFail('twitchClientSecret'),
        grant_type: 'refresh_token',
      },
    });

    const clonedToken = structuredClone(token);

    clonedToken.accessToken = response.data.access_token;
    clonedToken.refreshToken = response.data.refresh_token;

    return clonedToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error?.response?.status === 400) throw new InvalidRefreshToken('Refresh token is invalid');
      if (error?.response?.status === 401) throw new InvalidRefreshToken('Refresh token is invalid');
    }

    throw errorConverter(error);
  }
}

export const revokeTokenUnsafe = async (userId: string): Promise<void> => {
  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    const resp = await axios.post(
      'https://id.twitch.tv/oauth2/revoke',
      {
        client_id: await Config.getOrFail('twitchClientId'),
        token: token.accessToken,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

    console.log(resp.data);
  } catch (err) {
    console.error(err);
  }
};


export interface GuardianSettings {
  timeouts: number;
  networkErrors: number;
  backoff: number;
}

export const defaultGuardianSettings: GuardianSettings = {
  timeouts: 3,
  networkErrors: 5,
  backoff: 1,
};

type RequestGuardian = <T extends (
  userId: string,
  ...args: any[]
) => any>(settings: Partial<GuardianSettings>, func: T, ...args: Parameters<T>) => Promise<ReturnType<T>>;

const requestGuardian: RequestGuardian = async (settings, func, userId, ...args) => {
  let localSettings = { ...defaultGuardianSettings, ...settings };

  let remainingTimeouts = localSettings.timeouts;
  let remainingNetworkErrors = localSettings.networkErrors;
  let backoff = localSettings.backoff;

  while (true) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await func(userId, ...args);
    } catch (err) {
      if (err instanceof Error) {
        logger.warn({
          label: moduleID(func),
          message: err.message,
        });
      }

      if (remainingNetworkErrors <= 0 || remainingTimeouts <= 0) throw err;

      if (err instanceof InvalidAccessToken) {
        const token = await prisma.token.getByUserIdOrFail(userId);
        if (token.refreshToken === null) throw new InvalidRefreshToken('Refresh token is null. Token possibly owned by local user');
        await TokenManager.refresh(userId);

        continue;
      }

      if (err instanceof TimedOut) {
        await sleep(localSettings.backoff * 1000);

        remainingTimeouts -= 1;

        continue;
      }

      if (err instanceof NotFound) {
        await sleep(backoff * 1000);

        remainingNetworkErrors -= 1;
        remainingTimeouts = localSettings.timeouts;
        backoff *= 2;

        continue;
      }

      throw err;
    }
  }
};


export const validateToken: CloneFunction<typeof validateTokenUnsafe> = async (...args) => requestGuardian({}, validateTokenUnsafe, ...args);

export const refreshToken: CloneFunction<typeof refreshTokenUnsafe> = async (...args) => requestGuardian({}, refreshTokenUnsafe, ...args);

// export const revokeToken: CloneFunction<typeof revokeTokenUnsafe> = async (...args) => requestGuardian({}, revokeTokenUnsafe, ...args);


export async function getUsersUnsafe(userId: string, params: AtLeastOne<GetUsersOptions>): Promise<TwitchUser[]> {
  const idLength = params.id ? (Array.isArray(params.id) ? params.id.length : 1) : 0;
  const loginLength = params.login ? (Array.isArray(params.login) ? params.login.length : 1) : 0;

  if (idLength + loginLength > apiSettings.maxParams) {
    throw new TooManyParameters(`Total number of parameters exceeds ${apiSettings.maxParams}`);
  }


  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    const response = await twitch.request<GetTwitchUsers>({
      method: 'GET',
      url: 'users',
      params,
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    return arrayFrom(response.data.data);
  } catch (error) {
    throw errorConverter(error);
  }
}

export const getUsers: CloneFunction<typeof getUsersUnsafe> = async (...args) => requestGuardian({}, getUsersUnsafe, ...args);


export async function getModeratorsUnsafe(userId: string): Promise<TwitchBriefUser[]> {
  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    const response = await twitch.request<GetTwitchModerators>({
      method: 'GET',
      url: 'moderation/moderators',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.user.id,
      },
    });

    return arrayFrom(response.data.data);
  } catch (error) {
    throw errorConverter(error);
  }
}

export const getModerators: CloneFunction<typeof getModeratorsUnsafe> = async (...args) => requestGuardian({}, getModeratorsUnsafe, ...args);


export async function getChattersUnsafe(userId: string, first?: number, after?: string): Promise<{
  users: TwitchBriefUser[];
  cursor: string;
  total: number;
}> {
  try {
    const token = await prisma.token.getByUserIdOrFail(userId);

    const response = await twitch.request<GetChatters>({
      method: 'GET',
      url: 'chat/chatters',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.user.id,
        moderator_id: token.user.id,
        first,
        after,
      },
    });

    return {
      users: response.data.data,
      cursor: response.data.pagination.cursor,
      total: response.data.total,
    };
  } catch (error) {
    throw errorConverter(error);
  }
}

export const getChatters: CloneFunction<typeof getChattersUnsafe> = async (...args) => requestGuardian({}, getChattersUnsafe, ...args);
