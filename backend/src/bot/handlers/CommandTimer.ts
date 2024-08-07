import { ChannelThread } from '#bot/ChannelThread';
import { TemplateRunner } from '#bot/templates/TemplateRunner';
import { BotActionController } from '#database/controllers/BotActionController';
import { MessageController } from '#database/controllers/MessageController';
import { TemplateController } from '#database/controllers/TemplateController';
import { CommandTimerSerializer } from '#database/serializers/CommandTImerSerializer';
import { ExtendedCron } from '#lib/ExtendedCron';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { logger } from '#lib/logger';
import { SocketServer } from '#server/SocketServer';
import { BotActionType } from '#types/api/botActions';
import { CommandTimerState, UserLevel } from '#types/api/commands';
import { CommandTimer, Message } from '#types/database/tables';
import { Isolate } from 'isolated-vm';
import { Client } from 'tmi.js';


export class CommandTimerInstance implements AutoWirable {
  private messageCounter = 0;
  private lastUsed = 0;
  private lastUsedBy?: string;

  private job: ExtendedCron;

  private client: Client;
  private channelThread: ChannelThread;

  private isolate: Isolate;

  constructor(public __parent: ClassInstance, private timer: CommandTimer) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);

    this.job = this.createJob();

    this.isolate = wire(this, Isolate);
  }

  private createJob(): ExtendedCron {
    return new ExtendedCron(this.timer.cron, {
      name: `CommandTimer:${this.channelThread.channel.user.login}:${this.timer.name}`,
    }, this.processTimer);
  }

  private processTimer = async (self: ExtendedCron): Promise<void> => {
    if (this.messageCounter < this.timer.lines) {
      self.pause('Not enough messages');

      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CommandTimerFailedLines,
        this.timer.name,
        this.messageCounter,
      );

      return;
    }

    await this.execute();

    await BotActionController.createFromType(
      this.channelThread.channel.user.id,
      BotActionType.CommandTimerExecuted,
      this.timer.name,
      this.messageCounter,
    );

    this.messageCounter = 0;
  };

  private async createTemplateRunner(): Promise<TemplateRunner> {
    const template = await TemplateController.getById(this.timer.templateId);

    if (template === null) {
      logger.warn('Failed to find template for command timer %s in #%s', this.timer.name, this.channelThread.channel.user.login, {
        label: ['CommandTimer', 'createTemplateRunner'],
      });

      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CommandTimerFailedError,
        this.timer.name,
        'Failed to find template',
      );

      throw new Error('Failed to find template');
    }

    return new TemplateRunner(this.isolate, template);
  }

  public async execute(): Promise<void> {
    const templateRunner = await this.createTemplateRunner();

    const response = await templateRunner.run({
      channel: this.channelThread.channel.user.displayName,
    });

    if (response === null) {
      logger.warn('Failed to execute template for command timer %s in #%s', this.timer.name, this.channelThread.channel.user.login, {
        label: ['CommandTimer', 'execute'],
      });

      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CommandTimerFailedError,
        this.timer.name,
        'Failed to execute template',
      );

      return;
    }

    await this.client.say(`#${this.channelThread.channel.user.login}`, response);
    SocketServer.emitToUser(this.channelThread.channel.user.id, 'COMMAND_TIMER_EXECUTED', this.getState());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async processMessage(self: boolean, message: Message): Promise<void> {
    if (self) return;

    const userLevel = MessageController.$utils.getUserLevel(message);

    if (
      message.content.toLowerCase() === this.timer.alias.toLowerCase() &&
      (Date.now() - this.lastUsed >= this.timer.cooldown * 1000 ||
      userLevel >= UserLevel.Moderator)
    ) {
      this.lastUsed = Date.now();
      this.lastUsedBy = message.displayName ?? 'Chat Member';
      this.messageCounter = 0;

      await this.execute();

      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CommandTimerExecutedCommand,
        this.timer.name,
        this.messageCounter,
        message.displayName,
      );

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
      timer: CommandTimerSerializer(this.timer),
    };
  }
}
