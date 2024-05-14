import { Dictionary } from '#locales/Dictionary';
import { UserLevel } from '#shared/types/api/commands';


export const userLevels = new Dictionary<UserLevel, string>('Unknown User Level', {
  [UserLevel.Everyone]: 'Everyone',
  [UserLevel.Subscriber]: 'Subscriber',
  [UserLevel.VIP]: 'VIP',
  [UserLevel.Moderator]: 'Moderator',
  [UserLevel.Owner]: 'Owner',
});
