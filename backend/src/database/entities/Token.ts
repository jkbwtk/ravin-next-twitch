import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { IsOptional, IsString, validate } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  @Index()
  @IsString()
  public userId: string;

  @JoinColumn()
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @Column({ unique: true })
  @IsString()
  public accessToken: string;

  @Column('varchar', { unique: true, nullable: true })
  @IsOptional()
  @IsString()
  public refreshToken: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt: Date;

  public static async getTokenByUserId(userId: string): Promise<Token | null> {
    const repository = await Database.getRepository(Token);

    return repository.findOne({
      where: { userId },
      cache: {
        id: `token:${userId}`,
        milliseconds: 3000,
      },
    });
  }

  public static async invalidateCache(userId: string): Promise<void> {
    await Database.invalidateCache([`token:${userId}`]);
  }

  public static async createOrUpdate(token: Token): Promise<Token> {
    const repository = await Database.getRepository(Token);

    const errors = await validate(token);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate new token');
    }

    await this.invalidateCache(token.userId);
    return repository.save(token);
  }

  public static async updateOrFail(token: Token): Promise<Token> {
    const repository = await Database.getRepository(Token);

    const errors = await validate(token);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate updated token');
    }

    await this.invalidateCache(token.userId);
    await repository.findOneOrFail({ where: { id: token.id } });
    return repository.save(token);
  }
}
