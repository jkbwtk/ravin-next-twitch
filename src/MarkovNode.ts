import { ExtendedMap } from './ExtendedMap';
import ExtendedSet from './ExtendedSet';
import { arrayFrom } from './utils';


export class MarkovNode {
  public words: string[];
  public weight: number;

  public authors: ExtendedSet<string> = new ExtendedSet();
  public next: ExtendedMap<string, MarkovNode> = new ExtendedMap();

  public static startToken = '◄START►';
  public static endToken = '◄END►';
  public static defaultAuthor = '◄Unknown►';

  constructor(words: string | string[] = MarkovNode.startToken, author = MarkovNode.defaultAuthor) {
    this.words = arrayFrom(words);
    this.weight = 1;

    this.authors = new ExtendedSet([author]);
  }

  public isStartNode(): boolean {
    return this.words.includes(MarkovNode.startToken);
  }

  public isEndNode(): boolean {
    return this.words.includes(MarkovNode.endToken);
  }

  private addOccurrence(author: string): void {
    this.weight += 1;
    this.authors.add(author);
  }

  public get joinedWords(): string {
    return this.words.join(' ').toLowerCase();
  }

  public addNext(words: string | string[], author: string): void {
    words = arrayFrom(words);
    const nextNode = this.next.get(words.join(' ').toLowerCase());

    if (nextNode === undefined) {
      this.next.set(words.join(' ').toLowerCase(), new MarkovNode(words, author));
    } else {
      nextNode.addOccurrence(author);
    }
  }

  public getFirstWord(): string {
    const word = this.words[0];
    if (word === undefined) throw new Error('No words in node');

    return word;
  }

  public getLastWord(): string {
    const word = this.words[this.words.length - 1];
    if (word === undefined) throw new Error('No words in node');

    return word;
  }
}
