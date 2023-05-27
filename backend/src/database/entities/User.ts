import { Database } from '#database/Database';
import { Channel } from '#database/entities/Channel';
import { IsEmail, IsString, IsUrl, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class User {
  @PrimaryColumn()
  public id!: string;

  @Column({ unique: true })
  @IsString()
  public login!: string;

  @Column({ unique: true })
  @IsString()
  public displayName!: string;

  @Column('varchar', { nullable: true })
  @IsEmail()
  public email!: string | null;

  @Column()
  @IsUrl()
  public profileImageUrl!: string;

  @OneToOne(() => Channel, (channel) => channel.user, { onDelete: 'CASCADE' })
  public channel!: Channel;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static async getById(id: string): Promise<User | null> {
    const repository = await Database.getRepository(User);

    return repository.findOne({
      where: { id },
      relations: {
        channel: true,
      },
      cache: {
        id: `user:${id}`,
        milliseconds: 3000,
      },
    });
  }

  public static async invalidateCache(id: string): Promise<void> {
    await Database.invalidateCache([`user:${id}`]);
  }

  public static async createOrUpdateUser(user: User): Promise<User> {
    const repository = await Database.getRepository(User);

    const errors = await validate(user);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new user');
    }

    await this.invalidateCache(user.id);
    return repository.save(user);
  }
}
