import { User } from '#database/entities/User';
import { IsBoolean, IsDate, IsNumberString, IsString, IsUUID } from 'class-validator';
import { BadgeInfo } from 'tmi.js';
import { Badges, ChatUserstate } from 'tmi.js';
import {
  Column, CreateDateColumn,
  DeleteDateColumn, Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'uuid' })
  @Index()
  @IsUUID()
  public uuid!: string;

  @Column()
  @Index()
  @IsString()
  public channelName!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  public channelUser!: User;

  @Column()
  @Index()
  @IsString()
  public username!: string;

  @Column()
  @IsString()
  public displayName!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  public color!: string | null;

  @Column()
  @Index()
  @IsNumberString()
  public userId!: string;

  @Column()
  @IsString()
  public content!: string;

  @Column({ type: 'jsonb', nullable: true })
  public emotes!: { [id: string]: string[] } | null;

  @Column({ type: 'timestamptz' })
  @IsDate()
  public timestamp!: Date;

  @Column({ type: 'jsonb', nullable: true })
  public badgeInfo!: BadgeInfo | null;

  @Column({ type: 'jsonb', nullable: true })
  public badges!: Badges | null;

  @Column({ type: 'varchar', nullable: true })
  public flags!: string | null;

  @Column({ type: 'varchar' })
  @IsString()
  public messageType!: Exclude<ChatUserstate['message-type'], undefined>;

  @Column()
  @IsBoolean()
  public firstMessage!: boolean;

  @Column()
  @IsBoolean()
  public mod!: boolean;

  @Column()
  @IsBoolean()
  public subscriber!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  public deletedAt!: Date | null;

  public static fromChatUserState(channel: string, userState: ChatUserstate, content: string): Message {
    const message = new Message();

    message.uuid = this.definedOrFail(userState.id, 'id');
    message.channelName = channel;

    message.channelUser = new User();
    message.channelUser.id = this.definedOrFail(userState['room-id'], 'room-id');

    message.username = this.definedOrFail(userState.username, 'username');
    message.displayName = this.definedOrFail(userState['display-name'], 'display-name');
    message.color = userState.color ?? null;
    message.userId = this.definedOrFail(userState['user-id'], 'user-id');

    message.content = content;

    message.emotes = userState.emotes ?? null;
    message.timestamp = userState['tmi-sent-ts'] ? new Date(parseInt(userState['tmi-sent-ts'], 10)) : new Date();

    message.badgeInfo = userState.badgeInfo ?? null;
    message.badges = userState.badges ?? null;
    message.flags = userState.flags ?? null;

    message.messageType = this.definedOrFail(userState['message-type'], 'message-type');
    message.firstMessage = userState['first-msg'] ?? false;
    message.mod = userState.mod ?? false;
    message.subscriber = userState.subscriber ?? false;


    return message;
  }

  private static definedOrFail<T>(value: T | undefined, name: string): T {
    if (value === undefined) {
      throw new Error(`${name} is undefined`);
    }

    return value;
  }
}
