import { Channel } from '#database/entities/Channel';
import { IsBoolean, IsEmail, IsNumberString, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class User {
  @PrimaryColumn()
  @IsString({ groups: ['relation'] })
  @IsNumberString({}, { groups: ['relation'] })
  public id!: string;

  @Column({ unique: true })
  @Index()
  @IsString()
  public login!: string;

  @Column({ unique: true })
  @IsString()
  public displayName!: string;

  @Column('varchar', { nullable: true })
  @IsEmail()
  public email!: string | null;

  @Column()
  @IsUrl()
  public profileImageUrl!: string;

  @OneToOne(() => Channel, (channel) => channel.user, { onDelete: 'CASCADE' })
  public channel!: Channel;

  @Column({ default: false })
  @IsBoolean()
  public admin!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;
}
