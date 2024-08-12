import { Dictionary } from '#locales/Dictionary';
import { userLevels } from '#locales/en-us/commands';
import { actions } from '#locales/en-us/filters';
import { BotActionType } from '#types/api/botActions';
import { JSX } from 'solid-js';


export const botActions = new Dictionary<BotActionType, string>(
  (key) => `Unknown Action: ${key}`.trim(),
  {
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

    [BotActionType.BehaviorProfileActivatedCategory]: 'Behavior Profile Activated (Category)',
    [BotActionType.BehaviorProfileActivatedTitle]: 'Behavior Profile Activated (Title)',
    [BotActionType.BehaviorProfileDeactivated]: 'Behavior Profile Deactivated',
  });


type BotActionsDescriptionsReturnType = (data: string[]) => string | JSX.Element;

export const botActionsDescriptions = new Dictionary<BotActionType, BotActionsDescriptionsReturnType>(
  (key) => (data = []) => (<span>Unknown action performed. Acton id: <code>{key}</code>. Raw data: <code>{data.join(' ')}</code></span>),
  {
    [BotActionType.Unknown]: (data) => (<span>Unknown action performed. Raw data: <code>{data.join(' ')}</code></span>),

    [BotActionType.ChannelJoined]: (data) => (<span>Channel <code>{data.at(0)}</code> joined</span>),
    [BotActionType.ChannelLeft]: (data) => (<span>Channel <code>{data.at(0)}</code> left</span>),

    [BotActionType.CustomCommandExecuted]: (data) => (<span>Custom command <code>{data.at(0)}</code> called by <code>{data.at(1)}</code></span>),

    [BotActionType.CustomCommandFailedError]: (data) => (
      <span>
      Failed to execute custom command <code>{data.at(0)}</code> called by <code>{data.at(1)}</code> due to <code>{data.at(2)}</code>
      </span>
    ),
    [BotActionType.CustomCommandFailedCooldown]: (data) => (
      <span>
      Failed to execute custom command <code>{data.at(0)}</code> called by <code>{data.at(1)}</code> due to cooldown
      </span>
    ),
    [BotActionType.CustomCommandFailedUserLevel]: (data) => (
      <span>
      Failed to execute custom command <code>
          {data.at(0)}
        </code> called by <code>
          {data.at(1)}
        </code> due to insufficient user level. User's level: <code>
          {userLevels.getCoerced(data.at(2))}
        </code>
      </span>
    ),
    [BotActionType.CustomCommandFailedDisabled]: (data) => (
      <span>
      Failed to execute custom command <code>{data.at(0)}</code> called by <code>{data.at(1)}</code> because it is disabled
      </span>
    ),

    [BotActionType.ChantingDetected]: (data) => (
      <span>
      Chanting detected: <code>{data.at(0)}</code> (length: {data.at(1)})
      </span>
    ),

    [BotActionType.FilteredPhrase]: (data) => (
      <span>
      Filtered phrase <code>
          {data.at(1)}
        </code> with <code>
          {Number(data.at(2)).toFixed(0)}%
        </code> similarity to <code>
          {data.at(0)}
        </code> by <code>{data.at(3)}</code>. Action taken: <code>{actions.getCoerced(data.at(4))}</code>
      </span>
    ),

    [BotActionType.FilteredRegex]: (data) => (
      <span>
      Regex <code>
          {data.at(0)}
        </code> matched phrase <code>
          {data.at(1)}
        </code> by <code>{data.at(2)}</code>. Action taken: <code>{actions.getCoerced(data.at(3))}</code>
      </span>
    ),

    [BotActionType.CommandTimerExecuted]: (data) => (
      <span>
      Command timer <code>{data.at(0)}</code> executed
      </span>
    ),
    [BotActionType.CommandTimerExecutedCommand]: (data) => (
      <span>
      Command timer <code>{data.at(0)}</code> called by <code>{data.at(2)}</code>
      </span>
    ),
    [BotActionType.CommandTimerFailedError]: (data) => (
      <span>
      Command timer <code>{data.at(0)}</code> failed due to <code>{data.at(1)}</code>
      </span>
    ),
    [BotActionType.CommandTimerFailedLines]: (data) => (
      <span>
      Command timer <code>{data.at(0)}</code> failed due to insufficient lines between messages. Current lines count: <code>{data.at(1)}</code>
      </span>
    ),

    [BotActionType.BehaviorProfileActivatedCategory]: (data) => (
      <span>
        Behavior profile <code>{data.at(0)}</code> activated. Matched category  <code>{data.at(1)}</code>
      </span>
    ),
    [BotActionType.BehaviorProfileActivatedTitle]: (data) => (
      <span>
      Behavior profile <code>{data.at(0)}</code> activated. Matched title  <code>{data.at(1)}</code>
      </span>
    ),
    [BotActionType.BehaviorProfileDeactivated]: (data) => (
      <span>
        Behavior profile <code>{data.at(0)}</code> deactivated.
      </span>
    ),
  });
