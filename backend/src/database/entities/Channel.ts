import type { User } from '#database/entities/User';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChantingSettings } from '#types/api/channel';


@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @Index()
  @OneToOne('User', { onDelete: 'CASCADE' })
  public user!: User;

  @Column({ type: 'bool', nullable: false, default: false })
  @IsBoolean()
  @IsOptional()
  public joined!: boolean;

  @Column({ type: 'json', default: Channel.defaultChantingSettings })
  @IsObject()
  @IsOptional()
  public chantingSettings!: ChantingSettings;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  public static defaultChantingSettings: ChantingSettings = {
    enabled: false,
    interval: 60,
    length: 3,
  };
}
