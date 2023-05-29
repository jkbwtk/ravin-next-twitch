import { User as UserEntity } from '#database/entities/User';
import { Database } from '#database/Database';
import { VerifyCallback } from 'passport-oauth2';
import { Token } from '#database/entities/Token';
import { isDevApi } from '#shared/constants';
import { TwitchUser } from '#shared/types/twitch';
import { revokeTokenUnsafe } from '#lib/twitch';
import { Channel } from '#database/entities/Channel';
import { SystemNotification } from '#database/entities/SystemNotification';
import { display } from '#lib/display';


export const authScopes: string[] = [
  'user:read:email',
  'moderation:read',
  'moderator:read:chatters',
];

const createOrUpdateToken = async (accessToken: string, refreshToken: string | null, user: UserEntity): Promise<Token> => {
  const tokenRepo = await Database.getRepository(Token);

  const newToken = tokenRepo.create({
    user,
    accessToken,
    refreshToken: refreshToken,
  });

  return Token.createOrUpdate(newToken);
};

const createOrUpdateChannel = async (user: UserEntity): Promise<Channel> => {
  const channelRepo = await Database.getRepository(Channel);

  const newChannel = channelRepo.create({
    user,
  });

  return Channel.createOrUpdate(newChannel);
};

const createOrUpdateUser = async (profile: TwitchUser): Promise<UserEntity> => {
  const userRepo = await Database.getRepository(UserEntity);

  const newUser = userRepo.create({
    id: profile.id,
    login: profile.login,
    displayName: profile.display_name,
    email: profile.email ?? null,
    profileImageUrl: profile.profile_image_url,
  });

  const createdUser = await UserEntity.createOrUpdateUser(newUser);
  console.log('createdOrUpdatedUser');
  await createOrUpdateChannel(createdUser);

  return createdUser;
};

export const verifyCallback = async (accessToken: string, refreshToken: string | null, profile: TwitchUser, done: VerifyCallback): Promise<void> => {
  try {
    await Token.invalidateCache(profile.id);
    await UserEntity.invalidateCache(profile.id);
    await Channel.invalidateCache(profile.id);

    const tokenRepo = await Database.getRepository(Token);
    const token = await Token.getByUserId(profile.id);
    const user = await createOrUpdateUser(profile);

    if (token === null) {
      await createOrUpdateToken(accessToken, refreshToken, user);
    } else {
      // revoke received token if it's not a dev api
      display.debug.nextLine('auth:verifyCallback', 'Revoking new token for user', token.user.id);

      const newToken = tokenRepo.create({
        user,
        accessToken,
        refreshToken: refreshToken,
      });

      if (refreshToken !== null && !isDevApi) await revokeTokenUnsafe(newToken);
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
