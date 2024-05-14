import { BotActionType } from '#shared/types/api/botActions';


export const botActions = {
  [BotActionType.Unknown]: 'Unknown',

  [BotActionType.ChannelJoined]: 'Channel Joined',
  [BotActionType.ChannelLeft]: 'Channel Left',

  [BotActionType.CustomCommandExecuted]: 'Custom Command Executed',

  [BotActionType.CustomCommandFailedError]: 'Custom Command Failed Error',
  [BotActionType.CustomCommandFailedCooldown]: 'Custom Command Failed Cooldown',
  [BotActionType.CustomCommandFailedUserLevel]: 'Custom Command Failed User Level',
  [BotActionType.CustomCommandFailedDisabled]: 'Custom Command Failed Disabled',

  [BotActionType.ChantingDetected]: 'Chanting Detected',

  [BotActionType.FilteredPhrase]: 'Filtered Phrase',
  [BotActionType.FilteredRegex]: 'Filtered Regex',

  [BotActionType.CommandTimerExecuted]: 'Command Timer Executed',
  [BotActionType.CommandTimerExecutedCommand]: 'Command Timer Executed Command',
  [BotActionType.CommandTimerFailedError]: 'Command Timer Failed Error',
  [BotActionType.CommandTimerFailedLines]: 'Command Timer Failed Lines',
} satisfies Record<BotActionType, string>;
