import { User } from '#database/entities/User';
import { IsString } from 'class-validator';
import {
  Column, CreateDateColumn,
  DeleteDateColumn, Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


export type ChannelActionType = 'ban' | 'timeout' | 'delete';

@Entity()
export class ChannelAction {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  public channelUser!: User;

  @Column()
  @Index()
  @IsString()
  public issuerDisplayName!: string;

  @Column()
  @Index()
  @IsString()
  public targetDisplayName!: string;

  @Column({ type: 'varchar' })
  @Index()
  public type!: ChannelActionType;

  @Column({ type: 'varchar' })
  public data!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  public deletedAt!: Date | null;
}
