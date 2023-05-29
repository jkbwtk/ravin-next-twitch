import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { SocketServer } from '#server/SocketServer';
import { createAction } from '#server/routers/v1/dashboard';
import { IsString, validate } from 'class-validator';
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

  public static async createAction(action: ChannelAction): Promise<ChannelAction> {
    const repository = await Database.getRepository(this);

    const errors = await validate(action);
    if (errors.length > 0) {
      console.error(errors);
      throw new Error('Failed to validate ChannelAction');
    }

    const createdAction = await repository.save(action);
    SocketServer.emitToUser(action.channelUser.id, 'NEW_RECENT_ACTION', createAction(action));

    return createdAction;
  }
}
