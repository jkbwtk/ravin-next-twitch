import { ISession } from 'connect-typeorm/out';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint')
  public expiredAt: number;

  @PrimaryColumn('varchar', { length: 255 })
  public id: string;

  @Column('text')
  public json: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public destroyedAt?: Date;
}
