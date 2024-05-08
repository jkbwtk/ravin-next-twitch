import { ChannelThread } from '#bot/ChannelThread';
import { prisma } from '#database/database';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { logger } from '#lib/logger';
import { banUser, deleteChatMessages } from '#lib/twitch';
import { UserLevel } from '#shared/types/api/commands';
import { Actions, RegExpType } from '#shared/types/api/filters';
import { RegexFilter } from '@prisma/client';
import { Client } from 'tmi.js';


export type RegexMatch = {
  filter: RegexFilter;
  match: string;
};

export class RegexFilterHandler implements AutoWirable {
  private client: Client;

  private channelThread: ChannelThread;

  public filters: ExtendedMap<number, RegexFilter> = new ExtendedMap();

  constructor(public __parent: ClassInstance) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.syncFilters();
  }

  /**
   * Handles a message by checking it against all filters.
   * @param {boolean} self
   * @param {MessageWithUser} message
   * @return {boolean} Returns true if message was handled.
   */
  public async handleMessage(self: boolean, message: MessageWithUser): Promise<boolean> {
    if (self || message.getUserLevel() > UserLevel.Moderator) return false;

    const matches = this.getMatches(message.content).toSorted((a, b) => {
      if (a.filter.action === b.filter.action) return a.filter.actionDuration - b.filter.actionDuration;
      return a.filter.action - b.filter.action;
    });

    const priorityMatch = matches.at(0);
    if (priorityMatch === undefined) return false;

    switch (priorityMatch.filter.action) {
      case Actions.Delete:
        await deleteChatMessages(this.channelThread.channel.user.id, message.uuid);
        break;

      case Actions.Timeout:
        await banUser(this.channelThread.channel.user.id, message.userId, priorityMatch.filter.actionDuration);
        break;

      case Actions.Ban:
        await banUser(this.channelThread.channel.user.id, message.userId);
        break;
    }

    return true;
  }

  private getMatches(message: string): RegexMatch[] {
    const matches: RegexMatch[] = [];

    for (const filter of this.filters.values()) {
      if (!filter.enabled) continue;
      const match = this.matchRegex(message, filter);

      if (match) matches.push(match);
    }

    return matches;
  }

  private matchRegex(message: string, filter: RegexFilter): RegexMatch | null {
    const regex = RegExpType.safeParse(filter.regex);

    if (regex.success === false) {
      logger.warn('Failed to parse regex filter %s in #%s', filter.id, this.channelThread.channel.user.login, {
        label: ['RegexFilterHandler', 'matchRegex'],
        error: regex.error,
      });

      return null;
    }

    const match = message.match(regex.data);

    if (match === null) return null;
    return { filter, match: match[0] };
  }

  public async syncFilters(): Promise<void> {
    const filters = await prisma.regexFilter.getByChannelId(this.channelThread.channel.user.id);

    this.filters.clear();
    for (const filter of filters) {
      this.filters.set(filter.id, filter);
    }
  }

  public updateFilter(filter: RegexFilter): void {
    this.filters.set(filter.id, filter);
  }

  public deleteFilter(filterId: number): void {
    this.filters.delete(filterId);
  }
}
