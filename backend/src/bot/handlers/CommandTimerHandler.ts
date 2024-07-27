import { ChannelThread } from '#bot/ChannelThread';
import { CommandTimerInstance } from '#bot/handlers/CommandTimer';
import { CommandTimerController } from '#database/controllers/CommandTImerController';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { Message } from '#types/database/tables';


export class CommandTimerHandler implements AutoWirable {
  public commandTimers: ExtendedMap<string, CommandTimerInstance> = new ExtendedMap();

  private channelThread: ChannelThread;

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.syncCommandTimers();
  }

  public destroy(): void {
    this.clearCommandTimers();
  }

  public async processMessage(self: boolean, message: Message): Promise<void> {
    for (const commandTimer of this.commandTimers.values()) {
      await commandTimer.processMessage(self, message);
    }
  }

  public async syncCommandTimers(): Promise<void> {
    const timers = await CommandTimerController.getByUserId(this.channelThread.channel.user.id);

    this.clearCommandTimers();
    for (const timer of timers) {
      if (timer.enabled === false) continue;

      this.commandTimers.set(timer.name, new CommandTimerInstance(this, timer));
    }
  }

  public clearCommandTimers(): void {
    for (const commandTimer of this.commandTimers.values()) {
      commandTimer.destroy();
    }

    this.commandTimers.clear();
  }
}
