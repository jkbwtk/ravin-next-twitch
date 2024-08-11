import { ChannelThread } from '#bot/ChannelThread';
import { CustomCommand } from '#bot/handlers/CustomCommand';
import { CommandController } from '#database/controllers/CommandController';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { Command, Message } from '#types/database/tables';


export class CommandHandler implements AutoWirable {
  private channelThread: ChannelThread;

  public customCommands: ExtendedMap<string, CustomCommand> = new ExtendedMap();

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.loadAll();

    this.registerSignalHandlers();
  }

  public destroy(): void {
    this.unregisterSignalHandlers();

    this.removeAll();
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

  public add = (command: Command | null): void => {
    if (command === null) return;
    if (command.enabled === false) return;

    this.customCommands.set(command.command, new CustomCommand(this, command));
  };

  public remove = (command: Command | null): void => {
    if (command === null) return;
    this.customCommands.delete(command.command);
  };

  public update = (command: Command | null): void => {
    if (command === null) return;

    this.remove(command);
    this.add(command);
  };

  public removeAll(): void {
    this.customCommands.forEach((command) => this.remove(command.command));
  }

  public async loadAll(): Promise<void> {
    const commands = await CommandController.getByUserId(this.channelThread.channel.userId);

    this.removeAll();
    commands.forEach(this.add);
  }

  public loadList(commands: Command[]): void {
    this.removeAll();
    commands.forEach(this.add);
  }

  private registerSignalHandlers(): void {
    CommandController.$signals.registerAfter('create', this.add);
    CommandController.$signals.registerAfter('update', this.update);
    CommandController.$signals.registerAfter('delete', this.remove);
  }

  private unregisterSignalHandlers(): void {
    CommandController.$signals.unregisterAfter('create', this.add);
    CommandController.$signals.unregisterAfter('update', this.update);
    CommandController.$signals.unregisterAfter('delete', this.remove);
  }
}
