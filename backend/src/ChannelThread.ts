export interface ChannelThreadOptions {
  bufferLength?: number;
}

export class ChannelThread {
  private options: Required<ChannelThreadOptions>;

  private messages: string[] = [];
  private lastMessageTimestamp = 0;
  private chantParticipants: Set<string> = new Set();
  private chantCounter = 0;
  public chantResponded = false;

  private static defaultOptions: Required<ChannelThreadOptions> = {
    bufferLength: 100,
  };

  constructor(options: ChannelThreadOptions = {}) {
    this.options = { ...ChannelThread.defaultOptions, ...options };
  }

  public addMessage(message: string, author: string): void {
    this.lastMessageTimestamp = Date.now();

    const lastMessage = this.messages[this.messages.length - 1];

    if (lastMessage !== message) {
      this.resetChantLength();
    }

    if (!this.chantParticipants.has(author)) {
      this.chantCounter += 1;
      this.chantParticipants.add(author);
    }

    this.messages.push(message);

    if (this.messages.length > this.options.bufferLength) {
      this.messages.shift();
    }
  }

  public getTimeSinceLastMessage(): number {
    return Date.now() - this.lastMessageTimestamp;
  }

  public getChantLength(): number {
    return this.chantCounter;
  }

  public resetChantLength(): void {
    this.chantCounter = 0;
    this.chantParticipants.clear();
  }

  public updateConfig(options: ChannelThreadOptions): void {
    this.options = { ...this.options, ...options };
  }
}
