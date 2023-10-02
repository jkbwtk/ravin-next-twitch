import { ChannelThread } from '#bot/ChannelThread';
import { CommandTimer } from '#bot/CommandTimer';
import { prisma } from '#database/database';
import { MessageWithUser } from '#database/extensions/message';
import { ExtendedMap } from '#lib/ExtendedMap';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';


export class CommandTimerHandler implements AutoWirable {
  private commandTimers: ExtendedMap<string, CommandTimer> = new ExtendedMap();

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

  public async processMessage(self: boolean, message: MessageWithUser): Promise<void> {
    for (const commandTimer of this.commandTimers.values()) {
      commandTimer.processMessage(self, message);
    }
  }

  public async syncCommandTimers(): Promise<void> {
    const timers = await prisma.commandTimer.getByUserId(this.channelThread.channel.user.id);

    this.clearCommandTimers();
    for (const timer of timers) {
      if (timer.enabled === false) continue;

      this.commandTimers.set(timer.name, new CommandTimer(this, timer));
    }
  }

  public clearCommandTimers(): void {
    for (const commandTimer of this.commandTimers.values()) {
      commandTimer.destroy();
    }

    this.commandTimers.clear();
  }
}
