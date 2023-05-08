import axios from 'axios';
import { Strategy as CustomStrategy, VerifyCallback } from 'passport-custom';
import { AccessToken, GetMockApp, MockApp } from '#types/api/auth';
import { authScopes, verifyCallback as sharedCallback } from '#server/routers/v1/authShared';
import { GetTwitchUsers, TwitchUser } from '#shared/types/twitch';
import { Config } from '#lib/Config';


const getClient = async (): Promise<MockApp> => {
  const resp = await axios.get<GetMockApp>('http://localhost:8080/units/clients');

  return resp.data.data[0]!;
};


const getRandomUser = async (): Promise<TwitchUser> => {
  const resp = await axios.get<GetTwitchUsers>('http://localhost:8080/units/users');

  const randomIndex = Math.floor(Math.random() * resp.data.data.length);
  return resp.data.data[randomIndex]!;
};

const getAccessToken = async (userId?: string): Promise<AccessToken> => {
  if (!userId) userId = (await getRandomUser()).id;

  const resp = await axios.post<AccessToken>('http://localhost:8080/auth/authorize', null, {
    params: {
      client_id: await Config.getOrFail('twitchClientId'),
      client_secret: await Config.getOrFail('twitchClientSecret'),
      grant_type: 'user_token',
      user_id: userId,
      scope: authScopes.join(' '),
    },
  });

  return resp.data;
};

const verifyCallback: VerifyCallback = async (req, done) => {
  try {
    const accessToken = await getAccessToken();
    const resp = await axios.get<GetTwitchUsers>('http://localhost:8080/mock/users', {
      headers: {
        'Client-ID': await Config.getOrFail('twitchClientId'),
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: 'Bearer ' + accessToken.access_token,
      },
    });

    const user = resp.data.data[0];
    if (user === undefined) throw new Error('User not found');

    sharedCallback(accessToken.access_token, null, user, done);
  } catch (err) {
    console.error(err);
    done(new Error('Failed to fetch user profile'));
  }
};

export const createDevAuthStrategy = async (): Promise<CustomStrategy> => {
  const strategy = new CustomStrategy(verifyCallback);

  // set up mock app credentials
  const client = await getClient();

  await Config.shadowBatchSet([
    ['twitchClientId', client.ID],
    ['twitchClientSecret', client.Secret],
  ]);

  return strategy;
};
