import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { display } from '#lib/display';
import { UserLevel } from '#types/api/commands';
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


export type EmotesRaw = {
  [id: string]: string[]
};

export type EmotesUsed = {
  [id: string]: {
    name: string;
    count: number;
    positions: string[];
  };
};

export type DatabaseEmote = {
  id: string;
  name: string;
  count: number;
};

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
  public emotes!: EmotesUsed | null;

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

  public getUserLevel(): UserLevel {
    if (this.badges?.broadcaster) return UserLevel.Owner;
    if (this.mod) return UserLevel.Moderator;
    if (this.badges?.vip) return UserLevel.VIP;
    if (this.subscriber) return UserLevel.Subscriber;

    return UserLevel.Everyone;
  }

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

    message.emotes = this.getEmotesUsed(content, userState.emotes ?? null);

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

  public static async createFromChatUserState(channel: string, userState: ChatUserstate, content: string): Promise<Message> {
    const repository = await Database.getRepository(Message);
    const message = Message.fromChatUserState(channel, userState, content);

    return repository.save(message);
  }

  private static getEmotesUsed(message: string, emotes: EmotesRaw| null): EmotesUsed | null {
    if (emotes === null) return null;
    const result: EmotesUsed = {};

    for (const [id, positions] of Object.entries(emotes)) {
      const position = positions[0];
      if (position === undefined) return null;

      const [start, end] = position.split('-').map((x) => parseInt(x, 10));
      if (start === undefined || end === undefined) return null;

      const name = message.substring(start, end + 1);
      if (name.length === 0) return null;

      result[id] = {
        name,
        count: positions.length,
        positions,
      };
    }

    return result;
  }

  public static async getTopChatter(channelId: string): Promise<string | null> {
    try {
      const t1 = performance.now();
      const repository = await Database.getRepository(Message);

      const result: {
        userId: string;
        count: string;
      }[] = await repository.query(`--sql
        SELECT "userId", COUNT(*) AS "count"
        FROM message
        WHERE "channelUserId" = $1
        GROUP BY "userId"
        ORDER BY "count" DESC
        LIMIT 1
        `, [channelId]);

      display.time('Getting top chatter', t1);

      return result[0]?.userId ?? null;
    } catch (err) {
      display.error.nextLine('Message:getTopChatter', err);

      return null;
    }
  }

  public static async getTopEmote(channelId: string): Promise<DatabaseEmote | null> {
    try {
      const t1 = performance.now();
      const repository = await Database.getRepository(Message);

      const result: DatabaseEmote[] = await repository.query(`--sql
      SELECT "id", "name", SUM("count") AS "count"
      FROM (SELECT "emote".key AS "id", "name", "count"::INTEGER
            FROM message
                     CROSS JOIN LATERAL JSONB_EACH(message."emotes") AS "emote"
                     CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'name') AS "name"
                     CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'count') AS "count"
            WHERE "channelUserId" = $1
              AND MESSAGE."emotes" IS NOT NULL) AS "emotes"
      GROUP BY "id", NAME
      ORDER BY "count" DESC
      LIMIT 1;
      `, [channelId]);

      display.time('Getting top emote', t1);

      return result[0] ?? null;
    } catch (err) {
      display.error.nextLine('Message:getTopEmote', err);

      return null;
    }
  }
}
