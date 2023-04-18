import { Database } from '#database/Database';
import { IsEmail, IsString, IsUrl, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class User {
  @PrimaryColumn()
  public id: string;

  @Column({ unique: true })
  @IsString()
  public login: string;

  @Column({ unique: true })
  @IsString()
  public displayName: string;

  @Column('varchar', { nullable: true })
  @IsEmail()
  public email: string | null;

  @Column()
  @IsUrl()
  public profileImageUrl: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  public static async getUserById(id: string): Promise<User | null> {
    const repository = await Database.getRepository(User);

    return repository.findOne({
      where: { id },
      cache: {
        id: `user:${id}`,
        milliseconds: 3000,
      },
    });
  }

  public static async invalidateCache(id: string): Promise<void> {
    await Database.invalidateCache([`user:${id}`]);
  }

  public static async createOrUpdateUser(user: User): Promise<void> {
    const repository = await Database.getRepository(User);

    const errors = await validate(user);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new user');
    }

    await this.invalidateCache(user.id);
    await repository.save(user);
  }
}
