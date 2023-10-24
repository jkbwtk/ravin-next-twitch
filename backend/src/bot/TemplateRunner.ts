import { logger } from '#lib/logger';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { Context, Isolate, Reference, Script } from 'isolated-vm';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import { Template } from '#database/extensions/template';
import { StateMap } from '#bot/StateMap';


dayjs.extend(utc);
dayjs.extend(timezone);

export type GlobalReference = Reference<Record<string | number | symbol, unknown>>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DefaultStates = 'customState' | 'counterState' | (string & {});

export type StatesObject = Partial<Record<DefaultStates, unknown>>;

export type TemplateRunnerOptions = {
  /**
   * Maximum allowed length of stringified custom state
   */
  maxCustomStateLength?: number;

  /**
   * Maximum allowed execution time of the template runner
   */
  executionTimeout?: number;
};

export class TemplateRunner {
  private script: Script;

  private options: Required<TemplateRunnerOptions>;

  private static defaultOptions: RequiredDefaults<TemplateRunnerOptions> = {
    maxCustomStateLength: 2048,
    executionTimeout: 1000,
  };

  public states: StateMap;

  constructor(private isolate: Isolate, private template: Template, options: TemplateRunnerOptions = {}) {
    this.options = mergeOptions(options, TemplateRunner.defaultOptions);

    this.script = isolate.compileScriptSync(`\`${template.template}\``);
    this.states = new StateMap(template);
  }

  private createContext(params: Record<string, unknown> = {}): Context {
    const context = this.isolate.createContextSync();
    const jail = context.global;

    jail.setSync('global', jail.derefInto());
    jail.setSync('template', this.template.template);

    jail.setSync('setState', this.setCustomState);
    jail.setSync('getState', this.getCustomState);

    jail.setSync('counter', this.counter);
    jail.setSync('time', this.time);

    for (const [key, value] of Object.entries(params)) {
      jail.setSync(key, value);
    }

    return context;
  }

  private createMockContext(): Context {
    const context = this.isolate.createContextSync();
    const jail = context.global;

    jail.setSync('global', jail.derefInto());
    jail.setSync('template', this.template.template);

    jail.setSync('setState', () => undefined);
    jail.setSync('getState', () => null);

    jail.setSync('counter', () => 0);
    jail.setSync('time', () => '1970-01-01T00:00:00.000Z');

    return context;
  }

  private setCustomState = (value: unknown): boolean => {
    try {
      const stringified = JSON.stringify(value);
      if (stringified.length > this.options.maxCustomStateLength) {
        logger.warn('Custom state is too long, not setting', { label: ['TemplateRunner', this.template.id, 'setCustomState'] });
        return false;
      }

      const state = JSON.parse(stringified);
      this.states.set('customState', state);

      return true;
    } catch (err) {
      logger.error('Setting custom state failed', { error: err, label: ['TemplateRunner', this.template.id, 'setCustomState'] });
      return false;
    }
  };

  private getCustomState = (): unknown => {
    try {
      let state = this.states.get('customState');
      if (state === undefined) state = null;

      const stringified = JSON.stringify(state);
      const parsed = JSON.parse(stringified);

      return parsed;
    } catch (err) {
      logger.error('Getting custom state failed', { error: err, label: ['TemplateRunner', this.template.id, 'getCustomState'] });
    }
  };

  private counter = (): number => {
    let state = (this.states.get('counterState') ?? 0) as number;

    if (typeof state !== 'number') {
      logger.warn('Counter state is not a number, resetting to 0', { label: ['TemplateRunner', this.template.id, 'counter'] });
      state = 0;
    }

    state += 1;

    this.states.set('counterState', state);
    return state;
  };

  private time = (timezone: string, format?: string): string => {
    const date = dayjs();

    if (timezone === undefined || typeof timezone !== 'string') throw new Error('Invalid timezone type');
    if (format !== undefined && typeof format !== 'string') throw new Error('Invalid format type');

    return date.tz(timezone)
      .format(format);
  };

  public async run(params?: Record<string, unknown>): Promise<string> {
    const context = this.createContext(params);

    const response = await this.script.run(context, { timeout: this.options.executionTimeout });
    context.release();

    return `${response}`;
  }

  public async dryRun(): Promise<string> {
    const context = this.createMockContext();

    const response = await this.script.run(context, { timeout: this.options.executionTimeout });
    context.release();

    return `${response}`;
  }
}
