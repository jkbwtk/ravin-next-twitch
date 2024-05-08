import { ChannelThread } from '#bot/ChannelThread';
import { prisma } from '#database/database';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { banUser, deleteChatMessages } from '#lib/twitch';
import { UserLevel } from '#shared/types/api/commands';
import { Actions } from '#shared/types/api/filters';
import { PhraseFilter } from '@prisma/client';
import { Client } from 'tmi.js';


export type PhraseMatch = {
  filter: PhraseFilter;
  match: string;
  similarity: number;
};

export class PhraseFilterHandler implements AutoWirable {
  private client: Client;

  private channelThread: ChannelThread;

  public filters: ExtendedMap<number, PhraseFilter> = new ExtendedMap();

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

    console.log(`Matched phrase filter: ${priorityMatch.filter.phrase} (${priorityMatch.similarity})`);
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

  private getMatches(message: string): PhraseMatch[] {
    const matches: PhraseMatch[] = [];

    for (const filter of this.filters.values()) {
      if (!filter.enabled) continue;
      const match = this.matchPhrases(message, filter);

      if (match) matches.push(match);
    }

    return matches;
  }

  private matchPhrases(message: string, filter: PhraseFilter): PhraseMatch | null {
    const phrase = filter.caseSensitive ? message : message.toLowerCase();
    const filterPhrase = filter.caseSensitive ? filter.phrase : filter.phrase.toLowerCase();

    if (filter.similarity === 100) {
      return phrase.includes(filterPhrase) ? { filter, match: filterPhrase, similarity: 100 } : null;
    }

    const similarity = this.getSimilarity(phrase, filterPhrase);

    if (similarity >= filter.similarity) {
      return { filter, match: filterPhrase, similarity };
    }

    return null;
  }

  // temporary implementation
  private getSimilarity(phrase: string, filter: string): number {
    return phrase.includes(filter) ? 100 : 0;
  }

  public async syncFilters(): Promise<void> {
    const filters = await prisma.phraseFilter.getByChannelId(this.channelThread.channel.user.id);

    this.filters.clear();
    for (const filter of filters) {
      this.filters.set(filter.id, filter);
    }
  }

  updateFilter(filter: PhraseFilter): void {
    this.filters.set(filter.id, filter);
  }

  deleteFilter(filterId: number): void {
    this.filters.delete(filterId);
  }
}
