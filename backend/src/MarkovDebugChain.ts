import ExtendedSet from './ExtendedSet';
import { MarkovNode } from './MarkovNode';


export class MarkovDebugChain {
  public authors: ExtendedSet<string>;

  constructor(
    public query: string,
    public simpleNodesUsed: number,
    public advancedNodesUsed: number,
    public nodes: MarkovNode[],
  ) {
    this.authors = this.processAuthors();
  }

  private processAuthors(): ExtendedSet<string> {
    const authors = new ExtendedSet<string>();

    for (const node of this.nodes) {
      for (const author of node.authors) {
        authors.add(author);
      }
    }

    return authors;
  }

  public get totalNodesUsed(): number {
    return this.simpleNodesUsed + this.advancedNodesUsed;
  }

  public getChain(): string {
    return this.nodes.map((node) => node.words.join()).join(' ');
  }

  public getAdvancedPercentage(): number {
    return (this.advancedNodesUsed / this.totalNodesUsed) * 100;
  }
}
