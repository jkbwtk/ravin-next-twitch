/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  InternalServerError,
  InvalidAccessToken,
  InvalidRefreshToken,
  InvalidRequestParameters,
  NotFound,
  NoTokensFile,
  TimedOut,
  TooManyParameters,
} from '#lib/twitchErrors';
import {
  BanUsers,
  GetChatters,
  GetTwitchChannelInformation,
  GetTwitchChatSettings,
  GetTwitchModerators,
  GetTwitchStreams,
  GetTwitchUsers,
  GetUsersOptions,
  PatchTwitchChatSettings,
  RefreshAccessToken,
  TwitchBriefUser,
  TwitchChannelInformation,
  TwitchChatSettings,
  TwitchStream,
  TwitchUser,
} from '#types/twitch';
import { twitchApiUrl } from '#shared/constants';
import { Config } from '#lib/Config';
import { TokenManager } from '#server/TokenManager';
import { arrayFrom, AtLeastOne, sleep } from '#lib/utils';
import { logger } from '#lib/logger';
import { TokenController } from '#database/controllers/TokenController';
import { Token } from '#types/database/tables';


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


async function getTokenOrThrow(userId: string): Promise<Token> {
  const token = await TokenController.getByUserId(userId);

  if (token === null) throw new NoTokensFile(`Token for user [${userId}] not found`);

  return token;
}

export async function validateTokenUnsafe(userId: string): Promise<boolean> {
  try {
    const token = await getTokenOrThrow(userId);

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

export async function refreshTokenUnsafe(userId: string): Promise<Token> {
  try {
    const token = await getTokenOrThrow(userId);

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
    const token = await getTokenOrThrow(userId);

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

    resp.data;
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
        const token = await getTokenOrThrow(userId);
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
    const token = await getTokenOrThrow(userId);

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
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetTwitchModerators>({
      method: 'GET',
      url: 'moderation/moderators',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
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
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetChatters>({
      method: 'GET',
      url: 'chat/chatters',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
        moderator_id: token.channelUserId,
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


export async function deleteChatMessagesUnsafe(userId: string, messageId?: string): Promise<void> {
  try {
    const token = await getTokenOrThrow(userId);

    await twitch.request({
      method: 'DELETE',
      url: 'moderation/chat',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
        moderator_id: token.channelUserId,
        message_id: messageId,
      },
    });
  } catch (error) {
    throw errorConverter(error);
  }
}

export const deleteChatMessages: CloneFunction<typeof deleteChatMessagesUnsafe> = async (...args) => requestGuardian({}, deleteChatMessagesUnsafe, ...args);


export async function banUserUnsafe(userId: string, targetId: string, duration?: number): Promise<BanUsers> {
  try {
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<BanUsers>({
      method: 'POST',
      url: 'moderation/bans',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
        moderator_id: token.channelUserId,
      },
      data: {
        data: {
          user_id: targetId,
          duration,
        },
      },
    });

    return response.data;
  } catch (error) {
    throw errorConverter(error);
  }
}

export const banUser: CloneFunction<typeof banUserUnsafe> = async (...args) => requestGuardian({}, banUserUnsafe, ...args);


export async function getChannelInformationUnsafe(userId: string): Promise<TwitchChannelInformation | null> {
  try {
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetTwitchChannelInformation>({
      method: 'GET',
      url: 'channels',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
      },
    });

    return response.data.data[0] ?? null;
  } catch (error) {
    if (error instanceof NotFound) return null;

    throw errorConverter(error);
  }
};

export const getChannelInformation: CloneFunction<typeof getChannelInformationUnsafe> = async (...args) => requestGuardian(
  {},
  getChannelInformationUnsafe,
  ...args,
);


export async function getStreamsUnsafe(userId: string): Promise<TwitchStream | null> {
  try {
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetTwitchStreams>({
      method: 'GET',
      url: 'streams',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        user_id: token.channelUserId,
      },
    });

    return response.data.data[0] ?? null;
  } catch (error) {
    if (error instanceof NotFound) return null;

    throw errorConverter(error);
  }
}

export const getStreams: CloneFunction<typeof getStreamsUnsafe> = async (...args) => requestGuardian({}, getStreamsUnsafe, ...args);


export async function getChatSettingsUnsafe(userId: string): Promise<TwitchChatSettings> {
  try {
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetTwitchChatSettings>({
      method: 'GET',
      url: 'chat/settings',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
      },
    });

    return response.data.data[0];
  } catch (error) {
    throw errorConverter(error);
  }
}

export const getChatSettings: CloneFunction<typeof getChatSettingsUnsafe> = async (...args) => requestGuardian({}, getChatSettingsUnsafe, ...args);


export async function updateChatSettingsUnsafe(userId: string, settings: Partial<PatchTwitchChatSettings>): Promise<TwitchChatSettings> {
  try {
    const token = await getTokenOrThrow(userId);

    const response = await twitch.request<GetTwitchChatSettings>({
      method: 'PATCH',
      url: 'chat/settings',
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Authorization: `Bearer ${token.accessToken}`,
      },
      params: {
        broadcaster_id: token.channelUserId,
        moderator_id: token.channelUserId,
      },
      data: settings,
    });

    return response.data.data[0];
  } catch (error) {
    throw errorConverter(error);
  }
}

export const updateChatSettings: CloneFunction<typeof updateChatSettingsUnsafe> = async (...args) => requestGuardian({}, updateChatSettingsUnsafe, ...args);
