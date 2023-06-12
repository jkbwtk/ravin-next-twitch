import { User } from '#database/entities/User';
import { IsOptional, IsString } from 'class-validator';
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
}
