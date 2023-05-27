import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { ExtendedMap } from '#lib/ExtendedMap';
import {
  Between,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';


@Entity()
@Unique(['user', 'frameId'])
export class ChannelStats {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  public user!: User;

  @Column({ type: 'integer' })
  @Index()
  public frameId!: number;

  @Column({ type: 'integer', default: 0 })
  public messages!: number;

  @Column({ type: 'integer', default: 0 })
  public timeouts!: number;

  @Column({ type: 'integer', default: 0 })
  public bans!: number;

  @Column({ type: 'integer', default: 0 })
  public deleted!: number;

  @Column({ type: 'integer', default: 0 })
  public commands!: number;

  public static frameDuration = 60 * 1000;

  @Column({ type: 'integer', name: 'frameDuration', default: ChannelStats.frameDuration })
  private _frameDuration!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static async getFrames(userId: string, limit = 60): Promise<ChannelStats[]> {
    const repository = await Database.getRepository(ChannelStats);

    return repository.find({
      where: { user: { id: userId } },
      order: { frameId: 'DESC' },
      take: limit,
      relations: {
        user: true,
      },
    });
  }

  public static mapFrames(frames: ChannelStats[]): ExtendedMap<number, ChannelStats> {
    const map = new ExtendedMap<number, ChannelStats>();
    for (const frame of frames) {
      map.set(frame.frameId, frame);
    }

    return map;
  }

  public static async getFrame(userId: string, frameId: number): Promise<ChannelStats | null> {
    const repository = await Database.getRepository(ChannelStats);

    return repository.findOne({
      where: { user: { id: userId }, frameId },
      relations: {
        user: true,
      },
    });
  }

  public static async getLatestFrame(userId: string): Promise<ChannelStats | null> {
    const repository = await Database.getRepository(ChannelStats);

    return repository.findOne({
      where: { user: { id: userId } },
      order: { frameId: 'DESC' },
      relations: {
        user: true,
      },
    });
  }

  public static async getFramesBetween(userId: string, start: Date | number, end: Date | number = new Date()): Promise<ChannelStats[]> {
    const repository = await Database.getRepository(ChannelStats);
    const startFrameId = typeof start === 'number' ? start : this.frameIdFromDate(start);
    const endFrameId = typeof end === 'number' ? end : this.frameIdFromDate(end);

    return repository.find({
      where: {
        user: { id: userId },
        frameId: Between(startFrameId, endFrameId),
      },
    });
  }

  public static frameIdFromDate(date = new Date()): number {
    return Math.floor(date.getTime() / this.frameDuration);
  }

  public static dateFromFrameId(frameId: number): Date {
    return new Date(frameId * this.frameDuration);
  }

  public static async incrementMessages(userId: string): Promise<void> {
    const repository = await Database.getRepository(ChannelStats);
    const frameId = this.frameIdFromDate();

    await repository.query(`--sql
      INSERT INTO channel_stats ("userId", "frameId", "messages") 
      VALUES ($1, $2, 1)
      ON CONFLICT ("userId", "frameId") DO UPDATE SET "messages" = channel_stats.messages + 1;
    `, [userId, frameId]);
  }

  public static async incrementTimeouts(userId: string): Promise<void> {
    const repository = await Database.getRepository(ChannelStats);
    const frameId = this.frameIdFromDate();

    await repository.query(`--sql
      INSERT INTO channel_stats ("userId", "frameId", "timeouts")
      VALUES ($1, $2, 1)
      ON CONFLICT ("userId", "frameId") DO UPDATE SET "timeouts" = channel_stats.timeouts + 1;
    `, [userId, frameId]);
  }

  public static async incrementBans(userId: string): Promise<void> {
    const repository = await Database.getRepository(ChannelStats);
    const frameId = this.frameIdFromDate();

    await repository.query(`--sql
      INSERT INTO channel_stats ("userId", "frameId", "bans")
      VALUES ($1, $2, 1)
      ON CONFLICT ("userId", "frameId") DO UPDATE SET "bans" = channel_stats.bans + 1;
    `, [userId, frameId]);
  }

  public static async incrementDeleted(userId: string): Promise<void> {
    const repository = await Database.getRepository(ChannelStats);
    const frameId = this.frameIdFromDate();

    await repository.query(`--sql
      INSERT INTO channel_stats ("userId", "frameId", "deleted")
      VALUES ($1, $2, 1)
      ON CONFLICT ("userId", "frameId") DO UPDATE SET "deleted" = channel_stats.deleted + 1;
    `, [userId, frameId]);
  }

  public static async incrementCommands(userId: string): Promise<void> {
    const repository = await Database.getRepository(ChannelStats);
    const frameId = this.frameIdFromDate();

    await repository.query(`--sql
      INSERT INTO channel_stats ("userId", "frameId", "commands")
      VALUES ($1, $2, 1)
      ON CONFLICT ("userId", "frameId") DO UPDATE SET "commands" = channel_stats.commands + 1;
    `, [userId, frameId]);
  }

  public getDate(): Date {
    return ChannelStats.dateFromFrameId(this.frameId);
  }
}
