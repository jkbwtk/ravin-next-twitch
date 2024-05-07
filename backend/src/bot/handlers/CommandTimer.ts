import { ChannelThread } from '#bot/ChannelThread';
import { TemplateRunner } from '#bot/templates/TemplateRunner';
import { CommandTimerWithUser } from '#database/extensions/commandTimer';
import { MessageWithUser } from '#database/extensions/message';
import { Template } from '#database/extensions/template';
import { ExtendedCron } from '#lib/ExtendedCron';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { logger } from '#lib/logger';
import { SocketServer } from '#server/SocketServer';
import { CommandTimerState, UserLevel } from '#shared/types/api/commands';
import { Isolate } from 'isolated-vm';
import { Client } from 'tmi.js';


export class CommandTimer implements AutoWirable {
  private messageCounter = 0;
  private lastUsed = 0;
  private lastUsedBy?: string;

  private job: ExtendedCron;

  private client: Client;
  private channelThread: ChannelThread;

  private templateRunner: TemplateRunner;

  constructor(public __parent: ClassInstance, private timer: CommandTimerWithUser) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);

    this.job = this.createJob();

    const isolate = wire(this, Isolate);
    this.templateRunner = new TemplateRunner(isolate, this.timer.template as Template);
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
    const response = await this.templateRunner.run({
      channel: this.channelThread.channel.user.displayName,
    });

    if (response === null) {
      logger.warn('Failed to execute template for command timer %s in #%s', this.timer.name, this.timer.user.login, {
        label: ['CustomCommand', 'execute'],
      });

      return;
    }

    await this.client.say(`#${this.channelThread.channel.user.login}`, response);
    SocketServer.emitToUser(this.channelThread.channel.user.id, 'COMMAND_TIMER_EXECUTED', this.getState());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processMessage(self: boolean, message: MessageWithUser): void {
    if (self) return;

    if (
      message.content.toLowerCase() === this.timer.alias.toLowerCase() &&
      (Date.now() - this.lastUsed >= this.timer.cooldown * 1000 ||
      message.getUserLevel() >= UserLevel.Moderator)
    ) {
      this.lastUsed = Date.now();
      this.lastUsedBy = message.displayName ?? 'Chat Member';
      this.messageCounter = 0;

      this.execute();

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

  public getState(): CommandTimerState {
    const jobStatus = this.job.serialize();

    return {
      lastUsed: this.lastUsed,
      lastUsedBy: undefined,
      lastRun: jobStatus.lastRun,
      nextRun: jobStatus.nextRun,
      status: jobStatus.isRunning ? 'running' : 'paused',
      pausedReason: jobStatus.pausedReason,
      timer: this.timer.serialize(),
    };
  }
}
