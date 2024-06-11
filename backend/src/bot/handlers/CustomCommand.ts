import { ChannelThread } from '#bot/ChannelThread';
import { TemplateRunner } from '#bot/templates/TemplateRunner';
import { prisma } from '#database/database';
import { CommandWithUserAndTemplate } from '#database/extensions/command';
import { MessageWithUser } from '#database/extensions/message';
import { Template } from '#database/extensions/template';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { logger } from '#lib/logger';
import { SocketServer } from '#server/SocketServer';
import { BotActionType } from '#types/api/botActions';
import { CustomCommandState } from '#types/api/commands';
import { Isolate } from 'isolated-vm';
import { Client } from 'tmi.js';


export class CustomCommand implements AutoWirable {
  private client: Client;
  private channelThread: ChannelThread;

  private templateRunner: TemplateRunner;

  private lastUsed = 0;
  private lastUsedBy?: string;

  constructor(public __parent: ClassInstance, private command: CommandWithUserAndTemplate) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);

    const isolate = wire(this, Isolate);
    this.templateRunner = new TemplateRunner(isolate, this.command.template as Template);
  }

  public async execute(self: boolean, message: MessageWithUser): Promise<void> {
    if (self) return;

    if (!this.command.enabled) {
      await prisma.botAction.createAndEmit(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedDisabled,
        this.command.command,
        message.displayName,
      );

      return;
    }

    if (message.getUserLevel() < this.command.userLevel) {
      await prisma.botAction.createAndEmit(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedUserLevel,
        this.command.command,
        message.displayName,
        message.getUserLevel(),
      );

      return;
    }

    if (Date.now() - this.lastUsed < this.command.cooldown * 1000) {
      await prisma.botAction.createAndEmit(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedCooldown,
        this.command.command,
        message.displayName,
      );

      return;
    }

    const response = await this.templateRunner.run({
      channel: this.channelThread.channel.user.displayName,
      args: message.content.replace(this.command.command, '').trim(),
      user: message.displayName,
      username: message.username,
    });

    if (response === null) {
      logger.warn('Failed to execute template for command %s in #%s', this.command.command, this.command.user.login, {
        label: ['CustomCommand', 'execute'],
      });

      await prisma.botAction.createAndEmit(
        this.channelThread.channel.user.id,
        BotActionType.CustomCommandFailedError,
        this.command.command,
        message.displayName,
        'Failed to execute template',
      );

      return;
    }

    await this.client.say(message.channelName, response);
    await prisma.channelStats.incrementCommands(this.channelThread.channel.user.id);
    await prisma.command.incrementUsage(this.command.id);

    this.lastUsed = Date.now();
    this.lastUsedBy = message.displayName;

    SocketServer.emitToUser(this.channelThread.channel.user.id, 'COMMAND_EXECUTED', {
      command: this.command.serialize(),
      lastUsed: this.lastUsed,
      lastUsedBy: this.lastUsedBy,
    });

    await prisma.botAction.createAndEmit(
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
      command: this.command.serialize(),
    };
  }
}
