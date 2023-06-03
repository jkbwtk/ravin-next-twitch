import { Database } from '#database/Database';
import { Channel } from '#database/entities/Channel';
import { IsEmail, IsNumberString, IsString, IsUrl, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class User {
  @PrimaryColumn()
  @IsString({ groups: ['relation'] })
  @IsNumberString({}, { groups: ['relation'] })
  public id!: string;

  @Column({ unique: true })
  @Index()
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

  public static async getByIdOrFail(id: string): Promise<User> {
    const user = await this.getById(id);
    if (user === null) {
      throw new Error(`User ${id} not found`);
    }

    return user;
  }

  public static async getByLogin(login: string): Promise<User | null> {
    const repository = await Database.getRepository(User);

    return repository.findOne({
      where: { login },
      relations: {
        channel: true,
      },
    });
  }

  public static async invalidateCache(id: string): Promise<void> {
    await Database.invalidateCache([
      `channel:${id}`,
      `user:${id}`,
      `token:${id}`,

      `channel:${id}-pagination`,
      `user:${id}-pagination`,
      `token:${id}-pagination`,
    ]);
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
