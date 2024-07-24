import { ChannelThread } from '#bot/ChannelThread';
import { TemplateRunner } from '#bot/templates/TemplateRunner';
import { BotActionController } from '#database/controllers/BotActionController';
import { ChannelStatsController } from '#database/controllers/ChannelStatsController';
import { CommandController } from '#database/controllers/CommandController';
import { TemplateController } from '#database/controllers/TemplateController';
import { MessageWithUser } from '#database/extensions/message';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { logger } from '#lib/logger';
import { SocketServer } from '#server/SocketServer';
import { BotActionType } from '#types/api/botActions';
import { CustomCommandState } from '#types/api/commands';
import { Command } from '#types/database/tables';
import { Isolate } from 'isolated-vm';
import { Client } from 'tmi.js';


export class CustomCommand implements AutoWirable {
  private client: Client;
  private channelThread: ChannelThread;

  private isolate: Isolate;

  private lastUsed = 0;
  private lastUsedBy?: string;

  constructor(public __parent: ClassInstance, private command: Command) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);

    this.isolate = wire(this, Isolate);
  }

  private async createTemplateRunner(): Promise<TemplateRunner> {
    const template = await TemplateController.getById(this.command.templateId);

    if (template === null) {
      logger.warn('Failed to find template for command %s in #%s', this.command.command, this.channelThread.channel.user.login, {
        label: ['CustomCommand', 'createTemplateRunner'],
      });


      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedError,
        this.command.command,
        this.channelThread.channel.user.displayName,
        'Failed to find template',
      );

      throw new Error('Failed to find template');
    }

    return new TemplateRunner(this.isolate, template);
  }

  public async execute(self: boolean, message: MessageWithUser): Promise<void> {
    if (self) return;

    if (!this.command.enabled) {
      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedDisabled,
        this.command.command,
        message.displayName,
      );

      return;
    }

    if (message.getUserLevel() < this.command.userLevel) {
      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedUserLevel,
        this.command.command,
        message.displayName,
        message.getUserLevel(),
      );

      return;
    }

    if (Date.now() - this.lastUsed < this.command.cooldown * 1000) {
      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedCooldown,
        this.command.command,
        message.displayName,
      );

      return;
    }

    const templateRunner = await this.createTemplateRunner();
    const response = await templateRunner.run({
      channel: this.channelThread.channel.user.displayName,
      args: message.content.replace(this.command.command, '').trim(),
      user: message.displayName,
      username: message.username,
    });

    if (response === null) {
      logger.warn('Failed to execute template for command %s in #%s', this.command.command, this.channelThread.channel.user.login, {
        label: ['CustomCommand', 'execute'],
      });

      await BotActionController.createFromType(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedError,
        this.command.command,
        message.displayName,
        'Failed to execute template',
      );

      return;
    }

    await this.client.say(message.channelName, response);
    await ChannelStatsController.incrementCommands(this.channelThread.channel.user.id);
    await CommandController.incrementUsage(this.command.id);

    this.lastUsed = Date.now();
    this.lastUsedBy = message.displayName;

    SocketServer.emitToUser(this.channelThread.channel.user.id, 'COMMAND_EXECUTED', {
      command: CommandController.$utils.serialize(this.command),
      lastUsed: this.lastUsed,
      lastUsedBy: this.lastUsedBy,
    });

    await BotActionController.createFromType(
      this.channelThread.channel.user.id,
      BotActionType.CustomCommandExecuted,
      this.command.command,
      message.displayName,
    );
  }

  public getState(): CustomCommandState {
    return {
      lastUsed: this.lastUsed,
      lastUsedBy: this.lastUsedBy,
      command: CommandController.$utils.serialize(this.command),
    };
  }
}
