import { serializer } from '#lib/serializer';
import { CommandTimerApi } from '#types/api/commands';
import { CommandTimer } from '#types/database/tables';


export const CommandTimerSerializer = serializer<CommandTimer, CommandTimerApi>((timer) => ({
  id: timer.id,
  channelUserId: timer.channelUserId,
  name: timer.name,
  alias: timer.alias,
  cooldown: timer.cooldown,
  templateId: timer.templateId,
  cron: timer.cron,
  enabled: timer.enabled,
  lines: timer.lines,
}));
