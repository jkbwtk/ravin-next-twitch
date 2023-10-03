import { ChannelThread } from '#bot/ChannelThread';
import { prisma } from '#database/database';
import { CommandWithUser } from '#database/extensions/command';
import { MessageWithUser } from '#database/extensions/message';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { SocketServer } from '#server/SocketServer';
import { CustomCommandState } from '#shared/types/api/commands';
import { Client } from 'tmi.js';


export class CustomCommand implements AutoWirable {
  private client: Client;
  private channelThread: ChannelThread;

  private lastUsed = 0;
  private lastUsedBy?: string;

  constructor(public __parent: ClassInstance, private command: CommandWithUser) {
    this.client = wire(this, Client);
    this.channelThread = wire(this, ChannelThread);
  }

  public async execute(self: boolean, message: MessageWithUser): Promise<void> {
    if (self) return;

    if (
      this.command.enabled &&
      Date.now() - this.lastUsed >= this.command.cooldown * 1000 &&
      message.getUserLevel() >= this.command.userLevel
    ) {
      await this.client.say(message.channelName, this.command.response);
      await prisma.channelStats.incrementCommands(this.channelThread.channel.user.id);
      await prisma.command.incrementUsage(this.command.id);

      this.lastUsed = Date.now();
      this.lastUsedBy = message.displayName ?? 'Chat Member';

      SocketServer.emitToUser(this.channelThread.channel.user.id, 'COMMAND_EXECUTED', {
        command: this.command.serialize(),
        lastUsed: this.lastUsed,
        lastUsedBy: this.lastUsedBy,
      });
    }
  }

  public getState(): CustomCommandState {
    return {
      lastUsed: this.lastUsed,
      lastUsedBy: this.lastUsedBy,
      command: this.command.serialize(),
    };
  }
}
