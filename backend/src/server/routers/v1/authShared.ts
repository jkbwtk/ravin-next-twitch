import { User as UserEntity } from '#database/entities/User';
import { Database } from '#database/Database';
import { VerifyCallback } from 'passport-oauth2';
import { Token } from '#database/entities/Token';
import { validate } from 'class-validator';
import { isDevApi } from '#shared/constants';
import { TwitchUser } from '#shared/types/twitch';
import { revokeTokenUnsafe } from '#lib/twitch';
import { Channel } from '#database/entities/Channel';
import { SystemNotification } from '#database/entities/SystemNotification';


export const authScopes: string[] = [
  'user:read:email',
  'moderation:read',
];

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

const createChannel = async (user: UserEntity): Promise<Channel> => {
  const channelRepo = await Database.getRepository(Channel);

  const newChannel = channelRepo.create({
    user,
  });

  return await Channel.createOrUpdate(newChannel);
};

const createUser = async (profile: TwitchUser, token: Token | null): Promise<UserEntity> => {
  const userRepo = await Database.getRepository(UserEntity);
  const tokenRepo = await Database.getRepository(Token);
  const channelRepo = await Database.getRepository(Channel);

  const newUser = userRepo.create({
    id: profile.id,
    login: profile.login,
    displayName: profile.display_name,
    email: profile.email ?? null,
    profileImageUrl: profile.profile_image_url,
  });

  const createdUser = await UserEntity.createOrUpdateUser(newUser);

  // remove old token if it exists
  if (token !== null) await tokenRepo.remove(token);

  // create channel for user
  await createChannel(createdUser);

  return createdUser;
};

export const verifyCallback = async (accessToken: string, refreshToken: string | null, profile: TwitchUser, done: VerifyCallback): Promise<void> => {
  try {
    await Token.invalidateCache(profile.id);
    await UserEntity.invalidateCache(profile.id);
    await Channel.invalidateCache(profile.id);

    const token = await Token.getTokenByUserId(profile.id);
    const user = await UserEntity.getById(profile.id) ?? await createUser(profile, token);
    const channel = await Channel.getChannelByUserId(profile.id) ?? await createChannel(user);

    if (token === null) {
      await createToken(accessToken, refreshToken, user);
    } else {
      // revoke old token if it exists and server is using OAuth ACGF
      console.log('Revoking token for user', token.userId);
      if (refreshToken !== null && !isDevApi) await revokeTokenUnsafe(token);

      token.accessToken = accessToken;
      token.refreshToken = refreshToken;

      await Token.createOrUpdate(token);
    }

    // update users avatar if it has changed
    if (user.profileImageUrl !== profile.profile_image_url) {
      user.profileImageUrl = profile.profile_image_url;
      await UserEntity.createOrUpdateUser(user);
    }

    await SystemNotification.createNotification(
      user.id,
      'Logged in',
      'You have successfully logged in to the dashboard.',
    );

    done(null, user);
  } catch (err) {
    console.error(err);
    done(new Error('Failed to validate callback'));
  }
};
