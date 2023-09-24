import { ChannelThread } from '#bot/ChannelThread';
import { prisma } from '#database/database';
import { CommandWithUser } from '#database/extensions/command';
import { MessageWithUser } from '#database/extensions/message';
import { SocketServer } from '#server/SocketServer';
import { CustomCommand as CustomCommandApi } from '#shared/types/api/commands';


export type CustomCommandState = {
  lastUsed: number;
  lastUsedBy?: string;
  command: CustomCommandApi;
};

export class CustomCommand {
  private lastUsed = 0;
  private lastUsedBy?: string;

  constructor(private command: CommandWithUser, private channelThread: ChannelThread) { }

  public async execute(self: boolean, message: MessageWithUser): Promise<void> {
    if (self) return;

    if (
      this.command.enabled &&
      Date.now() - this.lastUsed >= this.command.cooldown * 1000 &&
      message.getUserLevel() >= this.command.userLevel
    ) {
      await this.channelThread.client.say(message.channelName, this.command.response);
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
