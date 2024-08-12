import { UserLevel } from './commands';
import { PaginatedResponse } from '../pagination';
import { z } from 'zod';
import { Actions } from './filters';
import { createSelectSchema } from 'drizzle-zod';
import { botActionsTable } from '../../schema/schema';


export enum BotActionType {
  Unknown = -1,

  ChannelJoined = 0,
  ChannelLeft = 1,

  CustomCommandExecuted = 100,

  CustomCommandFailedError = 101,
  CustomCommandFailedCooldown = 102,
  CustomCommandFailedUserLevel = 103,
  CustomCommandFailedDisabled = 104,

  ChantingDetected = 200,

  FilteredPhrase = 300,
  FilteredRegex = 301,

  CommandTimerExecuted = 400,
  CommandTimerExecutedCommand = 401,
  CommandTimerFailedError = 402,
  CommandTimerFailedLines = 403,

  BehaviorProfileActivatedCategory = 500,
  BehaviorProfileActivatedTitle = 501,
  BehaviorProfileDeactivated = 502,
};


export const BotActionTypes = z.nativeEnum(BotActionType);

export type BotActionTypes = z.infer<typeof BotActionTypes>;


export type BotActionTypeParams = {
  [BotActionType.Unknown]: (...data: Array<string | number>) => void;

  [BotActionType.ChannelJoined]: (userDisplayName: string) => void;
  [BotActionType.ChannelLeft]: (userDisplayName: string) => void;

  [BotActionType.CustomCommandExecuted]: (command: string, userDisplayName: string) => void;

  [BotActionType.CustomCommandFailedError]: (command: string, userDisplayName: string, error: string) => void;
  [BotActionType.CustomCommandFailedCooldown]: (command: string, userDisplayName: string) => void;
  [BotActionType.CustomCommandFailedUserLevel]: (command: string, userDisplayName: string, userLevel: UserLevel) => void;
  [BotActionType.CustomCommandFailedDisabled]: (command: string, userDisplayName: string) => void;

  [BotActionType.ChantingDetected]: (chant: string, length: number) => void;

  [BotActionType.FilteredPhrase]: (phrase: string, match: string, similarity: number, userDisplayName: string, action: Actions) => void;
  [BotActionType.FilteredRegex]: (regex: string, match: string, userDisplayName: string, action: Actions) => void;

  [BotActionType.CommandTimerExecuted]: (timer: string, lines: number) => void;
  [BotActionType.CommandTimerExecutedCommand]: (timer: string, lines: number, userDisplayName: string) => void;
  [BotActionType.CommandTimerFailedError]: (timer: string, error: string) => void;
  [BotActionType.CommandTimerFailedLines]: (timer: string, lines: number) => void;

  [BotActionType.BehaviorProfileActivatedCategory]: (profile: string, category: string) => void;
  [BotActionType.BehaviorProfileActivatedTitle]: (profile: string, title: string) => void;
  [BotActionType.BehaviorProfileDeactivated]: (profile: string) => void;
};

export const BotActionData = z.array(z.coerce.string()).default([]);

export type BotActionData = z.infer<typeof BotActionData>;


export const BotActionApi = createSelectSchema(botActionsTable, {
  id: (schema) => schema.id.positive().int(),
  type: () => BotActionTypes,
  data: () => BotActionData,
}).pick({
  id: true,
  type: true,
  data: true,
}).merge(z.object({
  timestamp: z.number().nonnegative(),
}));

export type BotActionApi = z.infer<typeof BotActionApi>;


export const GetBotActionsResponse = z.object({
  data: z.array(BotActionApi),
});

export type GetBotActionsResponse = z.infer<typeof GetBotActionsResponse>;


export const GetBotActionsPaginatedResponse = PaginatedResponse(GetBotActionsResponse);

export type GetBotActionsPaginatedResponse = z.infer<typeof GetBotActionsPaginatedResponse>;
