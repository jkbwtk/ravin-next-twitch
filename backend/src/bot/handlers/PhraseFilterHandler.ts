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
    let phrase = filter.caseSensitive ? message : message.toLowerCase();
    let filterPhrase = filter.caseSensitive ? filter.phrase : filter.phrase.toLowerCase();

    if (filter.ignoreWhitespace) {
      phrase = phrase.replace(/\s+/g, '');
      filterPhrase = filterPhrase.replace(/\s+/g, '');
    }

    if (filter.similarity === 100) {
      return phrase.includes(filterPhrase) ? { filter, match: filterPhrase, similarity: 100 } : null;
    }

    let bestMatch: PhraseMatch | null = null;
    let head = 0;
    let fragment = '';

    while (head + filterPhrase.length <= phrase.length) {
      fragment = phrase.slice(head, head + filterPhrase.length);
      const similarity = this.getSimilarity(fragment, filterPhrase);
      console.log(fragment, filterPhrase, similarity);

      if (similarity >= filter.similarity && similarity > (bestMatch?.similarity ?? 0)) {
        bestMatch = { filter, match: fragment, similarity };
      }

      head += 1;
    }

    return bestMatch;
  }

  private getSimilarity(phrase: string, filter: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= phrase.length; i += 1) {
      const row: number[] = [];

      for (let j = 0; j <= filter.length; j += 1) {
        if (i === 0) {
          row.push(j);
        } else if (j === 0) {
          row.push(i);
        } else {
          row.push(0);
        }
      }

      matrix.push(row);
    }

    for (let i = 0; i < phrase.length; i += 1) {
      for (let j = 0; j < filter.length; j += 1) {
        if (phrase[i] === filter[j]) {
          matrix[i + 1]![j + 1] = matrix[i]![j]!;
        } else {
          matrix[i + 1]![j + 1] = Math.min(
            matrix[i]![j]!,
            matrix[i]![j + 1]!,
            matrix[i + 1]![j]!,
          ) + 1;
        }
      }
    }

    const length = (matrix[phrase.length] ?? [])[filter.length];

    if (length === undefined) return 0;
    return 100 * Math.max(0, filter.length - length) / filter.length;
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
