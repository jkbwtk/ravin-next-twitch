import OAuth2Strategy from 'passport-oauth2';
import { Config } from '#lib/Config';
import axios from 'axios';
import { callbackUrl } from '#shared/constants';
import { verifyCallback } from '#server/routers/v1/authShared';


export const createProdAuthStrategy = async (): Promise<OAuth2Strategy> => {
  const strategy = new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: await Config.getOrFail('twitchClientId'),
    clientSecret: await Config.getOrFail('twitchClientSecret'),
    callbackURL: callbackUrl,
    state: false,
  }, verifyCallback,
  );

  strategy.userProfile = async (accessToken, done) => {
    try {
      const resp = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Client-ID': await Config.getOrFail('twitchClientId'),
          Accept: 'application/vnd.twitchtv.v5+json',
          Authorization: 'Bearer ' + accessToken,
        },
      });

      done(null, resp.data.data[0]);
    } catch (err) {
      done(new Error('Failed to fetch user profile'));
    }
  };

  return strategy;
};
