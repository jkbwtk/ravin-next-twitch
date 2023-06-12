import { Token, User as UserEntity } from '@prisma/client';
import { Database } from '#database/Database';
import { Database as Prisma } from '#database/Prisma';
import { VerifyCallback } from 'passport-oauth2';
import { isDevApi } from '#shared/constants';
import { TwitchUser } from '#shared/types/twitch';
import { revokeTokenUnsafe } from '#lib/twitch';
import { Channel } from '#database/entities/Channel';
import { display } from '#lib/display';
import { Config } from '#lib/Config';


export const authScopes: string[] = [
  'user:read:email',
  'moderation:read',
  'moderator:read:chatters',
];

const createOrUpdateToken = async (accessToken: string, refreshToken: string | null, user: UserEntity): Promise<Token> => {
  const oldToken = await Prisma.getPrismaClient().token.getByUserId(user.id);

  const newToken = {
    id: oldToken?.id,
    userId: user.id,
    accessToken,
    refreshToken: refreshToken,
  };

  return Prisma.getPrismaClient().token.upsert({
    create: newToken,
    update: newToken,
    where: {
      userId: user.id,
    },
  });
};

const createOrUpdateChannel = async (user: UserEntity): Promise<Channel> => {
  const channelRepo = await Database.getRepository(Channel);
  const oldChannel = await Channel.getByUserId(user.id);

  const newChannel = channelRepo.create({
    id: oldChannel?.id,
    user,
  });

  return Channel.createOrUpdate(newChannel);
};

const createOrUpdateUser = async (profile: TwitchUser): Promise<UserEntity> => {
  const newUser = {
    id: profile.id,
    login: profile.login,
    displayName: profile.display_name,
    email: profile.email ?? null,
    profileImageUrl: profile.profile_image_url,
    admin: await Config.get('adminUsername') === profile.login,
  };

  const createdUser = await Prisma.getPrismaClient().user.upsert({
    create: newUser,
    update: newUser,
    where: {
      id: newUser.id,
    },
  });
  await createOrUpdateChannel(createdUser);

  return createdUser;
};

export const verifyCallback = async (accessToken: string, refreshToken: string | null, profile: TwitchUser, done: VerifyCallback): Promise<void> => {
  try {
    await Channel.invalidateCache(profile.id);

    const token = await Prisma.getPrismaClient().token.getByUserId(profile.id);
    const user = await createOrUpdateUser(profile);

    if (token !== null) {
      display.debug.nextLine('auth:verifyCallback', 'Revoking old token for user', token.user.id);
      if (refreshToken !== null && !isDevApi) await revokeTokenUnsafe(user.id);
    }

    await createOrUpdateToken(accessToken, refreshToken, user);

    await Prisma.getPrismaClient().systemNotification.createNotification(
      user.id,
      'Logged in',
      'You have successfully logged in to the dashboard.',
    );

    const updatedUser = await Prisma.getPrismaClient().user.getByIdOrFail(user.id);

    done(null, updatedUser);
  } catch (err) {
    console.error(err);
    done(new Error('Failed to validate callback'));
  }
};
