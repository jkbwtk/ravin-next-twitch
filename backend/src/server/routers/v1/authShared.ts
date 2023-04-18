import { User as UserEntity } from '#database/entities/User';
import { Database } from '#database/Database';
import { TwitchUser } from '#shared/types/api/auth';
import { VerifyCallback } from 'passport-oauth2';
import { Token } from '#database/entities/Token';
import { validate } from 'class-validator';
import axios from 'axios';
import { Config } from '#lib/Config';


export const authScopes: string[] = [
  'user:read:email',
  'moderation:read',
];

export const revokeToken = async (token: Token): Promise<void> => {
  console.log('Revoking token for user', token.userId);

  try {
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

const createToken = async (accessToken: string, refreshToken: string | null, user: UserEntity): Promise<Token> => {
  const tokenRepo = await Database.getRepository(Token);

  const newToken = tokenRepo.create({
    userId: user.id,
    accessToken,
    refreshToken: refreshToken,
  });

  const errors = await validate(newToken);
  if (errors.length > 0) {
    console.error(errors);
    throw new Error('Failed to validate new token');
  }

  return await tokenRepo.save(newToken);
};

const createUser = async (profile: TwitchUser, token: Token | null): Promise<UserEntity> => {
  const userRepo = await Database.getRepository(UserEntity);
  const tokenRepo = await Database.getRepository(Token);

  const newUser = userRepo.create({
    id: profile.id,
    login: profile.login,
    displayName: profile.display_name,
    email: profile.email ?? null,
    profileImageUrl: profile.profile_image_url,
  });

  await UserEntity.createOrUpdateUser(newUser);

  // remove old token if it exists
  if (token !== null) await tokenRepo.remove(token);

  return await userRepo.save(newUser);
};

export const verifyCallback = async (accessToken: string, refreshToken: string | null, profile: TwitchUser, done: VerifyCallback): Promise<void> => {
  try {
    await Token.invalidateCache(profile.id);
    await UserEntity.invalidateCache(profile.id);

    const token = await Token.getTokenByUserId(profile.id);
    const user = await UserEntity.getUserById(profile.id) ?? await createUser(profile, token);

    if (token === null) {
      await createToken(accessToken, refreshToken, user);
    } else {
      // revoke old token if it exists and server is using OAuth ACGF
      if (refreshToken !== null) await revokeToken(token);

      token.accessToken = accessToken;
      token.refreshToken = refreshToken;

      await Token.createOrUpdateToken(token);
    }

    // update users avatar if it has changed
    if (user.profileImageUrl !== profile.profile_image_url) {
      user.profileImageUrl = profile.profile_image_url;
      await UserEntity.createOrUpdateUser(user);
    }

    done(null, user);
  } catch (err) {
    console.error(err);
    done(new Error('Failed to validate callback'));
  }
};
