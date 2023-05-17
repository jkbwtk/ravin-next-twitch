import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { IsString } from 'class-validator';
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

    return await repository.save(notification);
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
}
