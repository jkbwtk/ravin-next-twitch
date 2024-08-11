import { ChannelThread } from '#bot/ChannelThread';
import { CommandTimerInstance } from '#bot/handlers/CommandTimer';
import { CommandTimerController } from '#database/controllers/CommandTImerController';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { CommandTimer, Message } from '#types/database/tables';


export class CommandTimerHandler implements AutoWirable {
  public commandTimers: ExtendedMap<string, CommandTimerInstance> = new ExtendedMap();

  private channelThread: ChannelThread;

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

  public async processMessage(self: boolean, message: Message): Promise<void> {
    for (const commandTimer of this.commandTimers.values()) {
      await commandTimer.processMessage(self, message);
    }
  }

  public add = (timer: CommandTimer | null): void => {
    if (timer === null) return;
    if (timer.enabled === false) return;

    this.commandTimers.set(timer.name, new CommandTimerInstance(this, timer));
  };

  public remove = (timer: CommandTimer | null): void => {
    if (timer === null) return;

    const commandTimer = this.commandTimers.get(timer.name);

    if (commandTimer) {
      commandTimer.destroy();
    }

    this.commandTimers.delete(timer.name);
  };

  public update = (timer: CommandTimer | null): void => {
    if (timer === null) return;

    this.remove(timer);
    this.add(timer);
  };

  public removeAll(): void {
    this.commandTimers.forEach((commandTimer) => this.remove(commandTimer.timer));
  }

  public async loadAll(): Promise<void> {
    const timers = await CommandTimerController.getByUserId(this.channelThread.channel.user.id);

    this.removeAll();
    timers.forEach(this.add);
  }

  public loadList(timers: CommandTimer[]): void {
    this.removeAll();
    timers.forEach(this.add);
  }

  private registerSignalHandlers(): void {
    CommandTimerController.$signals.registerAfter('create', this.add);
    CommandTimerController.$signals.registerAfter('update', this.update);
    CommandTimerController.$signals.registerAfter('delete', this.remove);
  }

  private unregisterSignalHandlers(): void {
    CommandTimerController.$signals.unregisterAfter('create', this.add);
    CommandTimerController.$signals.unregisterAfter('update', this.update);
    CommandTimerController.$signals.unregisterAfter('delete', this.remove);
  }
}
