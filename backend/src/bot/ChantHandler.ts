import type { ChannelThread } from '#bot/ChannelThread';
import ExtendedSet from '#lib/ExtendedSet';
import { logger } from '#lib/logger';
import { Message } from '@prisma/client';


export class ChantHandler {
  private chantParticipants: ExtendedSet<string> = new ExtendedSet();
  private lastChantTimestamp = 0;
  private chantResponded = false;

  constructor(private channelThread: ChannelThread) {}

  public async handleMessage(message: Message): Promise<void> {
    const chantingSettings = this.channelThread.channel.chantingSettings;
    const lastMessage = this.channelThread.messages.at(-1);
    const timestamp = Date.now();

    if (this.compareMessages(lastMessage, message.content)) this.resetChant();

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

  private compareMessages(a: string | undefined, b: string | undefined): boolean {
    if (a === undefined && b !== undefined) return false;
    if (a !== undefined && b === undefined) return false;
    if (a === undefined || b === undefined) return true; // should be && but || is used for type checking

    return a.toLowerCase() === b.toLowerCase();
  }

  private resetChant(): void {
    this.chantParticipants.clear();
    this.chantResponded = false;
  }
}
