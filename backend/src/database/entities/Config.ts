import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Config {
  @PrimaryColumn('varchar', { length: 32 })
  public key: string;

  @Column('text')
  public value: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public destroyedAt?: Date;
}
