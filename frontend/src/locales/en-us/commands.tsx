import { Dictionary } from '#locales/Dictionary';
import { UserLevel } from '#shared/types/api/commands';


export const userLevels = new Dictionary<UserLevel, string>(
  (key) => `Unknown User Level: ${key}`.trim(),
  {
    [UserLevel.Everyone]: 'Everyone',
    [UserLevel.Subscriber]: 'Subscriber',
    [UserLevel.VIP]: 'VIP',
    [UserLevel.Moderator]: 'Moderator',
    [UserLevel.Owner]: 'Owner',
  });
