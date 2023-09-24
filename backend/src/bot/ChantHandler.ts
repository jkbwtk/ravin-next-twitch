import type { ChannelThread } from '#bot/ChannelThread';
import { MessageWithUser } from '#database/extensions/message';
import ExtendedSet from '#lib/ExtendedSet';
import { logger } from '#lib/logger';
import { mergeOptions, RequiredDefaults } from '#shared/utils';


export type ChantHandlerOptions = {
  /**
   * Chant is case insensitive
   */
  caseSensitive?: boolean;

  /**
   * Bot will be counted towards the chant
   */
  includeSelf?: boolean;

  /**
   * Messages send by bot won't break the chant
   * @default
   */
  ignoreSelf?: boolean;

  /**
   * List of usernames that won't be counted towards the chant
   */
  ignoredUsernames?: string[];
};

export class ChantHandler {
  private chantParticipants: ExtendedSet<string> = new ExtendedSet();
  private lastChantTimestamp = 0;
  private chantResponded = false;

  private options: Required<ChantHandlerOptions>;

  private static defaultOptions: RequiredDefaults<ChantHandlerOptions> = {
    caseSensitive: false,
    includeSelf: false,
    ignoreSelf: false,
    ignoredUsernames: [],
  };

  constructor(private channelThread: ChannelThread, options: ChantHandlerOptions = {}) {
    this.options = mergeOptions(options, ChantHandler.defaultOptions);
  }

  public async handleMessage(self: boolean, message: MessageWithUser): Promise<void> {
    // filter out ignored users
    if (this.options.ignoredUsernames.includes(message.username.toLowerCase())) return;

    // filter out bot messages
    if (self && this.options.includeSelf === false) return;

    const chantingSettings = this.channelThread.channel.chantingSettings;
    const lastMessage = this.channelThread.messages.at(-1);
    const timestamp = Date.now();

    if (this.areEqual(lastMessage, message.content) === false) {
      // don't reset chant if ignoreSelf is true
      if (self && this.options.ignoreSelf) {} else this.resetChant();
    }

    if (!this.chantParticipants.has(message.userId)) {
      this.chantParticipants.add(message.userId);
    }

    if (
      !chantingSettings.enabled ||
      this.chantResponded ||
      this.lastChantTimestamp + chantingSettings.interval * 1000 > timestamp ||
      this.chantParticipants.size < chantingSettings.length
    ) return;


    try {
      this.chantResponded = true;
      this.lastChantTimestamp = timestamp;

      await this.channelThread.client.say(
        message.channelName,
        message.content,
      );
    } catch (err) {
      logger.error('Failed to send chant response', {
        label: ['ChantThread', 'sendChantResponse'],
        error: err,
      });
    }
  }

  private areEqual(a: string | undefined, b: string | undefined): boolean {
    if (a === undefined && b !== undefined) return false;
    if (a !== undefined && b === undefined) return false;
    if (a === undefined || b === undefined) return true; // should be && but || is used for type checking

    if (this.options.caseSensitive) return a === b;
    return a.toLowerCase() === b.toLowerCase();
  }

  private resetChant(): void {
    this.chantParticipants.clear();
    this.chantResponded = false;
  }
}
