import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { IsBoolean, IsString, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @Index()
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  public user!: User;

  @Column({ type: 'bool', nullable: false })
  @IsBoolean()
  public joined = false;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static async getChannelByUserId(userId: string): Promise<Channel | null> {
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

  public static async invalidateCache(id: string): Promise<void> {
    await Database.invalidateCache([`channel:${id}`]);
  }

  public static async createOrUpdate(channel: Channel): Promise<Channel> {
    const repository = await Database.getRepository(Channel);

    const errors = await validate(channel);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new channel');
    }

    await this.invalidateCache(channel.user.id);
    return repository.save(channel);
  }
}
