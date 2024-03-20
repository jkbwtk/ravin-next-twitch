import { logger } from '#lib/logger';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { Context, Isolate, Reference, Script } from 'isolated-vm';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import { Template } from '#database/extensions/template';
import { StateMap } from '#bot/templates/StateMap';

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

  constructor(private isolate: Isolate, private template: Template, options: TemplateRunnerOptions = {}) {
    this.options = mergeOptions(options, TemplateRunner.defaultOptions);

    this.script = isolate.compileScriptSync(`\`${template.template}\``);
  }

  private async createContext(params: Record<string, unknown> = {}): Promise<Context> {
    const context = this.isolate.createContextSync();
    const jail = context.global;

    const states = new StateMap(this.template);
    await states.load();

    jail.setSync('global', jail.derefInto());
    jail.setSync('template', this.template.template);

    jail.setSync('setState', this.setCustomStateFactory(states));
    jail.setSync('getState', this.getCustomStateFactory(states));

    jail.setSync('counter', this.counterFactory(states));
    jail.setSync('time', this.timeFactory(states));

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

  private setCustomStateFactory(states: StateMap) {
    return (value: unknown): boolean => {
      try {
        const stringified = JSON.stringify(value);
        if (stringified.length > this.options.maxCustomStateLength) {
          logger.warn('Custom state is too long, not setting', { label: ['TemplateRunner', this.template.id, 'setCustomState'] });
          return false;
        }

        const state = JSON.parse(stringified);
        states.set('customState', state);

        return true;
      } catch (err) {
        logger.error('Setting custom state failed', { error: err, label: ['TemplateRunner', this.template.id, 'setCustomState'] });
        return false;
      }
    };
  }

  private getCustomStateFactory(states: StateMap) {
    return (): unknown => {
      try {
        let state = states.get('customState');
        if (state === undefined) state = null;

        const stringified = JSON.stringify(state);
        const parsed = JSON.parse(stringified);

        return parsed;
      } catch (err) {
        logger.error('Getting custom state failed', { error: err, label: ['TemplateRunner', this.template.id, 'getCustomState'] });
      }
    };
  }

  private counterFactory(states: StateMap) {
    return (): number => {
      let state = (states.get('counterState') ?? 0) as number;

      if (typeof state !== 'number') {
        logger.warn('Counter state is not a number, resetting to 0', { label: ['TemplateRunner', this.template.id, 'counter'] });
        state = 0;
      }

      state += 1;

      states.set('counterState', state);
      return state;
    };
  }

  private timeFactory(states: StateMap) {
    return (timezone: string, format?: string): string => {
      const date = dayjs();

      if (timezone === undefined || typeof timezone !== 'string') throw new Error('Invalid timezone type');
      if (format !== undefined && typeof format !== 'string') throw new Error('Invalid format type');

      return date.tz(timezone)
        .format(format);
    };
  }

  public async run(params?: Record<string, unknown>): Promise<string | null> {
    try {
      const context = await this.createContext(params);

      const response = await this.script.run(context, { timeout: this.options.executionTimeout });
      context.release();

      return `${response}`;
    } catch (err) {
      logger.error('Template execution failed', { error: err, label: ['TemplateRunner', this.template.id, 'run'] });

      return null;
    }
  }

  public async dryRun(): Promise<string> {
    const context = this.createMockContext();

    const response = await this.script.run(context, { timeout: this.options.executionTimeout });
    context.release();

    return `${response}`;
  }
}
