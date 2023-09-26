import { ChannelThread } from '#bot/ChannelThread';
import { CustomCommand } from '#bot/CustomCommand';
import { prisma } from '#database/database';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';


export class CommandHandler implements AutoWirable {
  private channelThread: ChannelThread;

  public customCommands: ExtendedMap<string, CustomCommand> = new ExtendedMap();

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.syncCustomCommands();
  }

  public async handleMessage(self: boolean, message: MessageWithUser): Promise<void> {
    const customCommand = this.getUsedCustomCommand(message.content);

    if (customCommand) customCommand.execute(self, message);
  }

  public getUsedCustomCommand(message: string): CustomCommand | null {
    const [commandName] = message.trim().split(' ');

    if (!commandName) return null;
    return this.customCommands.get(commandName) ?? null;
  }

  public async syncCustomCommands(): Promise<void> {
    const commands = await prisma.command.getByChannelId(this.channelThread.channel.user.id);

    this.customCommands.clear();
    for (const command of commands) {
      this.customCommands.set(command.command, new CustomCommand(this, command));
    }
  }
}
