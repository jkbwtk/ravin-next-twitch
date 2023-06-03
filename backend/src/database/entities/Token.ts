import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { display } from '#lib/display';
import { IsOptional, IsString, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @Index()
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  public user!: User;

  @Column({ unique: true })
  @IsString()
  public accessToken!: string;

  @Column('varchar', { unique: true, nullable: true })
  @IsOptional()
  @IsString()
  public refreshToken!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static async getByUserId(userId: string): Promise<Token | null> {
    const repository = await Database.getRepository(Token);

    return repository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: {
          channel: true,
        },
      },
      cache: {
        id: `token:${userId}`,
        milliseconds: 3000,
      },
    });
  }

  public static async getByUserIdOrFail(userId: string): Promise<Token> {
    const token = await this.getByUserId(userId);

    if (token === null) {
      throw new Error(`Token for user ${userId} not found`);
    }

    return token;
  }

  public static async invalidateCache(userId: string): Promise<void> {
    await Database.invalidateCache([
      `channel:${userId}`,
      `user:${userId}`,
      `token:${userId}`,
    ]);
  }

  public static async createOrUpdate(token: Token): Promise<Token> {
    const repository = await Database.getRepository(Token);

    const errors = await validate(token);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new token');
    }

    if (token?.user?.id) await this.invalidateCache(token.user.id);
    return repository.save(token);
  }

  public static async updateOrFail(token: Token): Promise<Token> {
    const repository = await Database.getRepository(Token);

    const errors = await validate(token);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate updated token');
    }

    const t1 = performance.now();
    await repository.update({ id: token.id }, token);
    display.time('Updating token', t1);

    await this.invalidateCache(token.user.id);
    return repository.findOneOrFail({
      where: { id: token.id },
      relations: {
        user: {
          channel: true,
        },
      },
    });
  }
}
