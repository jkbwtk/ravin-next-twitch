import { Database } from '#database/Database';
import { User } from '#database/entities/User';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { DeleteCustomCommandRequest, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#types/api/commands';
import { IsBoolean, IsDivisibleBy, IsEnum, IsInt, isNumber, IsString, Length, Max, min, Min, validate } from 'class-validator';
import { display } from '#lib/display';


@Entity()
@Unique(['channelUser', 'command'])
export class Command {
  @PrimaryGeneratedColumn()
  @IsInt({ groups: ['update'] })
  @Min(1, { groups: ['update'] })
  public id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  public channelUser!: User;

  @Column()
  @IsString({ always: true })
  @Length(1, 64, { always: true })
  public command!: string;

  @Column()
  @IsString({ always: true })
  @Length(1, 512, { always: true })
  public response!: string;

  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.Everyone })
  @IsEnum(UserLevel, { always: true })
  public userLevel!: UserLevel;

  @Column({ type: 'integer', default: 10 })
  @IsInt({ always: true })
  @IsDivisibleBy(5, { always: true })
  @Min(0, { always: true })
  @Max(86400, { always: true })
  public cooldown!: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean({ always: true })
  public enabled!: boolean;

  @Column({ type: 'integer', default: 0 })
  // @IsInt({ always: true })
  // @Min(0, { always: true })
  public usage!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  public destroyedAt?: Date;

  public static async getByChannelId(channelId: string): Promise<Command[]> {
    const repository = await Database.getRepository(Command);

    return repository.find({
      where: { channelUser: { id: channelId } },
      relations: {
        channelUser: true,
      },
    });
  }

  public static async createOrUpdate(command: Command): Promise<Command> {
    const repository = await Database.getRepository(Command);

    return repository.save(command);
  }

  public static async createFromApi(request: PostCustomCommandRequest): Promise<Command> {
    const command = new Command();

    command.channelUser = new User();
    command.channelUser.id = request.channelId;

    command.command = request.command;
    command.response = request.response;
    command.userLevel = request.userLevel;
    command.cooldown = request.cooldown;
    command.enabled = request.enabled;

    const commandErrors = await validate(command, {
      groups: ['create'],
    });
    const userErrors = await validate(command.channelUser, {
      groups: ['relation'],
    });
    if (
      commandErrors.length > 0 ||
      userErrors.length > 0
    ) {
      console.error(commandErrors, userErrors);
      throw new Error('Failed to validate new custom command');
    }


    return this.createOrUpdate(command);
  }

  public static async updateFromApi(request: Partial<PatchCustomCommandRequest>): Promise<Command> {
    const command = new Command();

    if (
      !isNumber(request.id) ||
      !min(request.id, 1)
    ) {
      throw new Error('Invalid command id');
    }

    command.command = request.command as string;
    command.response = request.response as string;
    command.userLevel = request.userLevel as UserLevel;
    command.cooldown = request.cooldown as number;
    command.enabled = request.enabled as boolean;

    const commandErrors = await validate(command, {
      groups: ['update_but_there_is_no_group_for_this_so_it_doesnt_matter'],
      skipUndefinedProperties: true,
    });
    if (commandErrors.length > 0) {
      console.error(commandErrors);
      throw new Error('Failed to validate updated custom command');
    }

    const repository = await Database.getRepository(Command);

    repository.update(request.id, {
      command: command.command,
      response: command.response,
      userLevel: command.userLevel,
      cooldown: command.cooldown,
      enabled: command.enabled,
    });

    return repository.findOneOrFail({
      where: { id: request.id },
    });
  }

  public static async deleteFromApi(request: Partial<DeleteCustomCommandRequest>): Promise<void> {
    if (
      !isNumber(request.id) ||
      !min(request.id, 1)
    ) {
      throw new Error('Invalid command id');
    }

    await this.deleteById(request.id);
  }

  public static async deleteById(id: number): Promise<void> {
    const repository = await Database.getRepository(Command);

    await repository.delete(id);
  }

  public static async incrementUsage(id: number): Promise<void> {
    const repository = await Database.getRepository(Command);

    await repository.increment({ id }, 'usage', 1);
  }

  public static async getTopCommand(channelId: string): Promise<Command | null> {
    try {
      const t1 = performance.now();
      const repository = await Database.getRepository(Command);

      const result = repository.findOne({ where: { channelUser: { id: channelId } } });

      display.time('Getting top command', t1);

      return result;
    } catch (err) {
      display.error.nextLine('Command:getTopCommand', err);

      return null;
    }
  }
}
