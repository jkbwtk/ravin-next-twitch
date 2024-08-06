import { serializer } from '#lib/serializer';
import { CustomCommandApi } from '#types/api/commands';
import { Command } from '#types/database/tables';


export const CustomCommandSerializer = serializer<Command, CustomCommandApi>((command) => ({
  id: command.id,
  channelUserId: command.channelUserId,
  command: command.command,
  templateId: command.templateId,
  userLevel: command.userLevel,
  cooldown: command.cooldown,
  enabled: command.enabled,
}));
