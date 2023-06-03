import { Database } from '#database/Database';
import type { User } from '#database/entities/User';
import { IsBoolean, IsObject, IsOptional, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChantingSettings, PostChantingSettingsRequest } from '#types/api/channel';
import { display } from '#lib/display';
import { Bot } from '#bot/Bot';


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

      `channel:${userId}-pagination`,
      `user:${userId}-pagination`,
      `token:${userId}-pagination`,
    ]);
  }

  public static async createOrUpdate(channel: Channel): Promise<Channel> {
    const repository = await Database.getRepository(Channel);

    const errors = await validate(channel);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new channel');
    }

    if (channel?.user?.id) await this.invalidateCache(channel.user.id);
    return repository.save(channel);
  }

  public static async updateByUserId(userId: string, channel: Channel): Promise<Channel> {
    const repository = await Database.getRepository(Channel);

    const errors = await validate(channel);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new channel');
    }

    const t1 = performance.now();
    await repository.update({ user: { id: userId } }, channel);
    display.time('Updating channel', t1);

    await this.invalidateCache(userId);
    return this.getByUserIdOrFail(userId);
  }

  private static validateChantingSettings(request: unknown): request is PostChantingSettingsRequest {
    if (typeof request !== 'object') return false;
    if (request === null) return false;

    const { enabled, interval, length } = request as PostChantingSettingsRequest;

    if (typeof enabled !== 'boolean') return false;
    if (typeof interval !== 'number') return false;
    if (typeof length !== 'number') return false;

    if (interval < 0) return false;
    if (length < 2) return false;

    if (interval > 300) return false;
    if (length > 100) return false;

    if (interval % 5 !== 0) return false;
    if (length % 1 !== 0) return false;

    return true;
  }

  public static async updateChantingFromApi(userId: string, request: PostChantingSettingsRequest): Promise<Channel> {
    const channel = await this.getByUserIdOrFail(userId);
    console.log(request);

    if (!this.validateChantingSettings(request)) {
      throw new Error('Invalid chanting settings');
    }

    channel.chantingSettings = request;

    const updatedChannel = await this.updateByUserId(userId, channel);
    await Bot.reloadChannelChannel(userId);

    return updatedChannel;
  }
}
