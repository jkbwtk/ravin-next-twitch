import { ChannelThread } from '#bot/ChannelThread';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedCron } from '#lib/ExtendedCron';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { sleep } from '#lib/utils';
import { CommandTimer as PrismaCommandTimer } from '@prisma/client';
import { Client } from 'tmi.js';


export class CommandTimer implements AutoWirable {
  private messageCounter = 0;

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

  private processTimer = (self: ExtendedCron): void => {
    if (this.messageCounter < this.timer.lines) {
      self.pause('Not enough messages');
      return;
    }

    this.client.say(`#${this.channelThread.channel.user.login}`, this.timer.response);

    this.messageCounter = 0;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processMessage(self: boolean, message: MessageWithUser): void {
    if (self) return;

    this.messageCounter += 1;

    if (!this.job.isRunning() && this.messageCounter >= this.timer.lines) {
      this.job.resume('Message count reached');
    }
  }

  public destroy(): void {
    this.job.stop();
  }
}
