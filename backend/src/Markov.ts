import { appendFileSync, readFileSync } from 'fs';
import { parse, stringify } from 'csv/sync';
import { ExtendedMap } from './ExtendedMap';
import { randomInt } from 'crypto';
import { MarkovNode } from './MarkovNode';
import { display } from './display';
import { enumerate } from './utils';
import { MarkovDebugChain } from './MarkovDebugChain';


interface Entry {
  username: string;
  flags: string;
  emotes: string;
  channel: string;
  content: string;
}

export interface MarkovOptions {
  minLength?: number;
  maxLength?: number;

  safetyFilter?: boolean;
  duplicates?: boolean;
  charFilter?: boolean;
  bannableFilter?: boolean;

  ignoredUsers?: string[];
}


export class Markov {
  private legalChars = 'abcdefghijklmnopqrstuvwxyz ąęśżźół `1234567890-= ~!@#$%^&*()_+ [];\'\\,. {}:"|<>?';

  private nodes: ExtendedMap<string, MarkovNode> = new ExtendedMap();
  private advancedNodes: ExtendedMap<string, MarkovNode> = new ExtendedMap();

  private path: string;

  public lastChain: MarkovDebugChain | null = null;

  private options: Required<MarkovOptions>;

  private static defaultOptions: Required<MarkovOptions> = {
    minLength: 5,
    maxLength: 25,
    safetyFilter: false,
    duplicates: false,
    charFilter: true,
    bannableFilter: true,
    ignoredUsers: [],
  };

  constructor(trainingDataPath: string, options: MarkovOptions = {}) {
    this.options = { ...Markov.defaultOptions, ...options };

    this.path = trainingDataPath;

    this.readData();
  }

  private readData() {
    const file = readFileSync(this.path, { encoding: 'utf-8' })
      .replaceAll('\r', '')
      .trim();


    const lines = parse(file, {
      columns: true,
      delimiter: ',',
      skip_empty_lines: true,
    }) as Entry[];


    for (const line of lines) {
      this.learn(line);
    }
  }

  private validChars(word: string): boolean {
    if (!this.options.charFilter) return true;
    if (word.includes(MarkovNode.startToken) || word.includes(MarkovNode.endToken)) return true;

    const chars = word.toLowerCase().split('');

    for (const char of chars) {
      if (!this.legalChars.includes(char)) return false;
    }


    return true;
  }

  private learn(entry: Entry): boolean {
    if (this.options.ignoredUsers.includes((entry.username ?? '').toLowerCase())) {
      return false;
    }

    if (this.options.safetyFilter) {
      if (entry.flags !== 'NULL') return false;
    }

    if (this.options.bannableFilter) {
      if (entry.flags.includes('I.7')) return false;
    }


    const words = entry.content
      .trim()
      .split(' ');

    words.unshift(MarkovNode.startToken);
    words.push(MarkovNode.endToken);

    const pairs = this.createPairs(words);

    for (const [word, next] of pairs) {
      if (!this.validChars(word) || !this.validChars(next)) continue;

      const username = entry.username ?? '';
      let node = this.nodes.get(word);

      if (node === undefined) {
        node = new MarkovNode(word, username);
        this.nodes.set(word, node);
      }

      node.addNext(next, username);
    }

    const advancedPairs = this.createAdvancedPairs(words);

    for (const [word, next] of advancedPairs) {
      if (!this.validChars(word) || !this.validChars(next)) continue;

      const username = entry.username ?? '';
      let node = this.advancedNodes.get(word);

      if (node === undefined) {
        node = new MarkovNode(word.split(' '), username);
        this.advancedNodes.set(word.toLowerCase(), node);
      }

      node.addNext(next, username);
    }


    return true;
  }

  private createPairs(words: string[]): [string, string][] {
    const pairs: [string, string][] = [];

    for (const [index, word] of enumerate(words)) {
      const next = words[index + 1];

      if (next === undefined || word === undefined) break;
      pairs.push([word, next]);
    }

    return pairs;
  }

  private createAdvancedPairs(words: string[]): [string, string][] {
    const pairs: [string, string][] = [];

    for (const [index, word] of enumerate(words)) {
      const neighbor = words[index + 1];
      const next = words[index + 2];

      if (next === undefined || neighbor === undefined || word === undefined) break;
      pairs.push([`${word} ${neighbor}`, next]);
    }

    return pairs;
  }

  public generateTypicalMessage(): void {
    let targetNode = this.nodes.get(MarkovNode.startToken);
    let bestNode: MarkovNode | undefined = undefined;

    console.log(targetNode?.words);

    while (true) {
      if (targetNode === undefined) return;

      for (const node of targetNode.next.values()) {
        if (bestNode === undefined) {
          bestNode = node;
          continue;
        }

        if (node.weight > bestNode.weight) bestNode = node;
      }

      if (bestNode === undefined) break;
      console.log(bestNode.words);
      targetNode = this.nodes.get(bestNode.joinedWords.toLowerCase());
      bestNode = undefined;
    }
  }

  public generate(seed = MarkovNode.startToken): string {
    const nodes: MarkovNode[] = [];

    let node = this.nodes.get(seed);
    if (node === undefined) throw new Error('Seed node not found');
    nodes.push(node);

    let next = this.pickRandom(node.next, nodes.length);
    nodes.push(next);
    node = this.nodes.get(next.joinedWords.toLowerCase());

    let simpleNodesCount = 0;
    let advancedNodesCount = 0;

    while (nodes.length < this.options.maxLength && !next.isEndNode()) {
      if (node === undefined) {
        display.warning.nextLine('Markov:generate', 'Node is undefined, picking random node');
        node = this.pickRandom(this.nodes, nodes.length);
      }

      next = this.pickRandomWeighted(node.next, nodes.length);
      if (next.isEndNode()) {
        if (node.getLastWord().length <= 3 && randomInt(10) <= 8) {
          display.debug.nextLine('Markov:generate', 'End node is too short, continuing');
          continue;
        } else {
          nodes.push(next);
          break;
        }
      }
      nodes.push(next);

      node = this.advancedNodes.get(`${node.getLastWord()} ${next.getFirstWord()}`.toLowerCase());
      if (node === undefined) {
        display.debug.nextLine('Markov:generate', 'Advanced node not found, falling back to normal node');
        node = this.nodes.get(next.joinedWords.toLowerCase());
        simpleNodesCount += 1;
      } else {
        display.debug.nextLine('Markov:generate', 'Advanced node found');
        advancedNodesCount += 1;
      }
    }

    this.lastChain = new MarkovDebugChain(seed, simpleNodesCount, advancedNodesCount, nodes);
    display.debug.nextLine('Markov:generate', 'Advanced nodes ratio',
      `${this.lastChain.getAdvancedPercentage().toFixed(0)}%`,
      `(${advancedNodesCount}/${this.lastChain.totalNodesUsed})`,
    );

    display.debug.nextLine('Markov:generate', 'Generated chain:', this.lastChain.getChain());
    display.debug.nextLine('Markov:generate', 'Authors:', Array.from(this.lastChain.authors).join(', '));

    if (seed === MarkovNode.startToken) nodes.shift();
    nodes.pop();

    return nodes.length >= this.options.minLength ? nodes.map((node) => node.words.join(' ')).join(' ') : this.generate(seed);
  }

  private pickRandom(set: ExtendedMap<string, MarkovNode>, sentenceLength = -1): MarkovNode {
    const array = Array.from(set.values());

    const pick = array[randomInt(array.length)];
    if (pick === undefined) throw new Error('Picking random node failed');

    if (pick.isEndNode() && !this.shouldEndSentence(sentenceLength)) {
      return this.pickRandom(set, sentenceLength + 0.1);
    } else return pick;
  }

  private pickRandomWeighted(set: ExtendedMap<string, MarkovNode>, sentenceLength = -1): MarkovNode {
    const array = Array.from(set.values());

    let totalWeight = 0;
    for (const node of array) {
      totalWeight += node.weight;
    }

    let random = randomInt(totalWeight);

    for (const node of array) {
      random -= node.weight;

      if (random <= 0) {
        if (node.isEndNode() && !this.shouldEndSentence(sentenceLength)) {
          return this.pickRandomWeighted(set, sentenceLength + 0.1);
        } else return node;
      }
    }

    debugger;
    throw new Error('Picking random weighted node failed');
  }

  private shouldEndSentence(sentenceLength: number): boolean {
    if (sentenceLength === -1) return true;

    const pick = randomInt(this.options.maxLength);
    const requirement = Math.max(0, this.options.maxLength - sentenceLength);

    return pick > requirement;
  }

  public save(entry: Entry): void {
    this.learn(entry);

    const csv = stringify([entry], {
      quoted: true,
    });
    appendFileSync(this.path, csv, { encoding: 'utf-8' });
  }

  public updateConfig(options: MarkovOptions): void {
    this.options = { ...this.options, ...options };
  }
}
