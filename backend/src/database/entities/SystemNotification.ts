import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { IsString } from 'class-validator';
import { SystemNotification as SystemNotificationClient } from '#types/api/systemNotifications';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  IsNull,
  JoinColumn,
  ManyToOne,
  Not,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocketServer } from '#server/SocketServer';


@Entity()
export class SystemNotification {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user!: User;

  @Column()
  @IsString()
  public title!: string;

  @Column()
  @IsString()
  public content!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  public deletedAt!: Date | null;

  public static async createNotification(userId: string, title: string, content: string): Promise<SystemNotification> {
    const repository = await Database.getRepository(this);

    const notification = repository.create({
      user: { id: userId },
      title,
      content,
    });

    const createdNotification = await repository.save(notification);

    const clientNotification: SystemNotificationClient = {
      id: createdNotification.id,
      userId: createdNotification.user.id,
      title: createdNotification.title,
      content: createdNotification.content,
      read: false,
      createdAt: createdNotification.createdAt,
    };

    SocketServer.emitToUser(userId, 'NEW_SYSTEM_NOTIFICATION', clientNotification);
    return createdNotification;
  }

  public static async broadcastNotification(title: string, content: string): Promise<void> {
    const repository = await Database.getRepository(this);
    const userRepository = await Database.getRepository(User);

    const users = await userRepository.find({});

    const notifications = users.map((user) => repository.create({
      user,
      title,
      content,
    }));

    const createdNotifications = await repository.save(notifications);

    for (const notification of createdNotifications) {
      SocketServer.emitToUser(notification.user.id, 'NEW_SYSTEM_NOTIFICATION', notification.serialize());
    }
  }

  public static async getNotificationsByUserId(userId: string, limit = 100): Promise<SystemNotification[]> {
    const repository = await Database.getRepository(this);

    return await repository.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      relations: {
        user: true,
      },
      withDeleted: true,
    });
  }

  public static async getNotificationById(id: number): Promise<SystemNotification | null> {
    const repository = await Database.getRepository(this);

    return await repository.findOne({
      where: { id },
    });
  }

  public static async deleteNotificationById(id: number | number[]): Promise<void> {
    const repository = await Database.getRepository(this);

    await repository.softDelete(id);
  }

  public static async deleteNotification(notification: SystemNotification): Promise<void> {
    const repository = await Database.getRepository(this);

    await repository.remove(notification);
  }

  public static async deleteAllNotificationsByUserId(userId: string): Promise<void> {
    const repository = await Database.getRepository(this);

    await repository.softDelete({
      user: { id: userId },
    });
  }

  public static async getDeletedNotificationsByUserId(userId: string, limit = 100): Promise<SystemNotification[]> {
    const repository = await Database.getRepository(this);

    return await repository.find({
      where: {
        user: { id: userId },
        deletedAt: Not(IsNull()),
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      relations: {
        user: true,
      },
      withDeleted: true,
    });
  }

  public serialize(): SystemNotificationClient {
    return {
      id: this.id,
      userId: this.user.id,
      title: this.title,
      content: this.content,
      read: this.deletedAt !== null,
      createdAt: this.createdAt,
    };
  }
}
