import { Database } from '#database/Database';
import type { User } from '#database/entities/User';
import { IsBoolean, IsObject, IsOptional, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


export type ChantingSettings = {
  enabled: boolean;
  interval: number;
  length: number;
};
@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @Index()
  @OneToOne('User', { onDelete: 'CASCADE' })
  public user!: User;

  @Column({ type: 'bool', nullable: false, default: false })
  @IsBoolean()
  @IsOptional()
  public joined!: boolean;

  @Column({ type: 'json', default: Channel.defaultChantingSettings })
  @IsObject()
  @IsOptional()
  public chantingSettings!: ChantingSettings;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static defaultChantingSettings: ChantingSettings = {
    enabled: false,
    interval: 60,
    length: 3,
  };

  public static async getByUserId(userId: string): Promise<Channel | null> {
    const repository = await Database.getRepository(Channel);

    return repository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
      },
      cache: {
        id: `channel:${userId}`,
        milliseconds: 3000,
      },
    });
  }

  public static async getByUserIdOrFail(userId: string): Promise<Channel> {
    const channel = await this.getByUserId(userId);
    if (channel === null) {
      throw new Error(`Channel ${userId} not found`);
    }

    return channel;
  }

  public static async invalidateCache(userId: string): Promise<void> {
    await Database.invalidateCache([
      `channel:${userId}`,
      `user:${userId}`,
      `token:${userId}`,
    ]);
  }

  public static async createOrUpdate(channel: Channel): Promise<Channel> {
    const repository = await Database.getRepository(Channel);

    const errors = await validate(channel);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new channel');
    }

    await this.invalidateCache(channel.user.id);
    const existing = await this.getByUserId(channel.user.id);

    if (existing !== null) {
      return repository.save(repository.merge(existing, channel));
    }

    return repository.save(channel);
  }
}
