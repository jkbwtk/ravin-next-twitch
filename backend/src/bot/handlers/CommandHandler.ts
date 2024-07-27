import { ChannelThread } from '#bot/ChannelThread';
import { CustomCommand } from '#bot/handlers/CustomCommand';
import { CommandController } from '#database/controllers/CommandController';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { Message } from '#types/database/tables';


export class CommandHandler implements AutoWirable {
  private channelThread: ChannelThread;

  public customCommands: ExtendedMap<string, CustomCommand> = new ExtendedMap();

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.syncCustomCommands();
  }

  public async handleMessage(self: boolean, message: Message): Promise<void> {
    const customCommand = this.getUsedCustomCommand(message.content);

    if (customCommand) customCommand.execute(self, message);
  }

  public getUsedCustomCommand(message: string): CustomCommand | null {
    const [commandName] = message.trim().split(' ');

    if (!commandName) return null;
    return this.customCommands.get(commandName) ?? null;
  }

  public async syncCustomCommands(): Promise<void> {
    const commands = await CommandController.getByUserId(this.channelThread.channel.userId);

    this.customCommands.clear();
    for (const command of commands) {
      this.customCommands.set(command.command, new CustomCommand(this, command));
    }
  }
}
