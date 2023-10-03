import { ChannelThread } from '#bot/ChannelThread';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedCron } from '#lib/ExtendedCron';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { UserLevel } from '#shared/types/api/commands';
import { CommandTimer as PrismaCommandTimer } from '@prisma/client';
import { Client } from 'tmi.js';


export class CommandTimer implements AutoWirable {
  private messageCounter = 0;
  private lastUsed = 0;

  private job: ExtendedCron;

  private client: Client;
  private channelThread: ChannelThread;

  constructor(public __parent: ClassInstance, private timer: PrismaCommandTimer) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);

    this.job = this.createJob();
  }

  private createJob(): ExtendedCron {
    return new ExtendedCron(this.timer.cron, {
      name: `CommandTimer:${this.channelThread.channel.user.login}:${this.timer.name}`,
    }, this.processTimer);
  }

  private processTimer = async (self: ExtendedCron): Promise<void> => {
    if (this.messageCounter < this.timer.lines) {
      self.pause('Not enough messages');
      return;
    }

    await this.execute();
    this.messageCounter = 0;
  };

  public async execute(): Promise<void> {
    await this.client.say(`#${this.channelThread.channel.user.login}`, this.timer.response);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processMessage(self: boolean, message: MessageWithUser): void {
    if (self) return;

    if (
      message.content.toLowerCase() === this.timer.alias.toLowerCase() &&
      (Date.now() - this.lastUsed >= this.timer.cooldown * 1000 ||
      message.getUserLevel() >= UserLevel.Moderator)
    ) {
      this.execute();

      this.lastUsed = Date.now();
      this.messageCounter = 0;

      return;
    }

    this.messageCounter += 1;

    if (!this.job.isRunning() && this.messageCounter >= this.timer.lines) {
      this.job.resume('Message count reached');
    }
  }

  public destroy(): void {
    this.job.stop();
  }
}
