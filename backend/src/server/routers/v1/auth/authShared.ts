import { prisma } from '#database/database';
import { VerifyCallback } from 'passport-oauth2';
import { isDevApi } from '#shared/constants';
import { TwitchUser } from '#shared/types/twitch';
import { revokeTokenUnsafe } from '#lib/twitch';
import { Config } from '#lib/Config';
import { logger } from '#lib/logger';
import { TokenController } from '#database/controllers/TokenController';
import { UserController } from '#database/controllers/UserController';
import { Token, TokenInsert, User, UserInsert } from '#types/database/tables';


export const authScopes: string[] = [
  'user:read:email',
  'moderation:read',
  'moderator:read:chatters',
  'moderator:manage:chat_messages',
  'moderator:manage:banned_users',
];

const createOrUpdateToken = async (accessToken: string, refreshToken: string | null, user: User): Promise<Token | null> => {
  const oldToken = await TokenController.getByUserId(user.id);

  const token: TokenInsert = {
    ...oldToken,
    userId: user.id,
    accessToken,
    refreshToken,
  };

  return TokenController.upsert(token);
};


const createOrUpdateUser = async (profile: TwitchUser): Promise<User | null> => {
  const user: UserInsert = {
    id: profile.id,
    login: profile.login,
    displayName: profile.display_name,
    email: profile.email ?? null,
    profileImageUrl: profile.profile_image_url,
    admin: await Config.get('adminUsername') === profile.login,
  };

  return UserController.upsert(user);
};

export const verifyCallback = async (accessToken: string, refreshToken: string | null, profile: TwitchUser, done: VerifyCallback): Promise<void> => {
  try {
    const token = await TokenController.getByUserId(profile.id);
    const user = await createOrUpdateUser(profile);

    if (user === null) {
      throw new Error('Failed to create or update user');
    }

    if (token !== null) {
      logger.debug('Revoking old token for user [%s]', token.userId, { label: ['auth', 'verifyCallback'] });
      if (refreshToken !== null && !isDevApi) await revokeTokenUnsafe(user.id);
    }

    await createOrUpdateToken(accessToken, refreshToken, user);

    await prisma.systemNotification.createNotification(
      user.id,
      'Logged in',
      'You have successfully logged in to the dashboard.',
    );

    done(null, user);
  } catch (err) {
    logger.error('Failed to validate callback', { label: ['auth', 'verifyCallback'], error: err });
    done(new Error('Failed to validate callback'));
  }
};
