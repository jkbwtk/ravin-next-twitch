import { Context, Isolate, Script } from 'isolated-vm';


export type TemplateIssues = {
  SyntaxError?: string;
  ReferenceError?: string;
};

export type ContextProvider = (context: Context) => void;

export type SupportedEnvironments = keyof typeof TemplateTester['environments'];

const emptyContextProvider: ContextProvider = () => void 0;

const commandContextProvider: ContextProvider = (context) => {
  const jail = context.global;

  jail.setSync('channel', '[CHANNEL]');
  jail.setSync('args', 'arg1 arg2');
  jail.setSync('user', '[USER]');
  jail.setSync('username', '[USERNAME]');
};

export class TemplateTester {
  private script: Script;

  private constructor(private isolate: Isolate, private code: string) {
    this.script = isolate.compileScriptSync(`\`${code}\``);
  }

  private createMockContext(): Context {
    const context = this.isolate.createContextSync();
    const jail = context.global;

    jail.setSync('global', jail.derefInto());
    jail.setSync('template', this.code);

    jail.setSync('setState', () => undefined);
    jail.setSync('getState', () => null);

    jail.setSync('counter', () => 0);
    jail.setSync('time', () => '1970-01-01T00:00:00.000Z');

    return context;
  }

  public async dryRun(contextProvider?: ContextProvider): Promise<string> {
    const context = this.createMockContext();

    if (contextProvider) {
      contextProvider(context);
    }

    const response = await this.script.run(context, { timeout: 1 });
    context.release();

    return `${response}`;
  }

  public static environments = {
    empty: emptyContextProvider,
    customCommand: commandContextProvider,
  } satisfies Record<string, ContextProvider>;

  private static sanitizeErrorMessage(message: string): string {
    return message.replace('<isolated-vm>', 'template');
  }

  public static async test(code: string): Promise<Map<SupportedEnvironments, TemplateIssues>> {
    const isolate = new Isolate({ memoryLimit: 8 });
    const issues: Map<SupportedEnvironments, TemplateIssues> = new Map();

    for (const [name, contextProvider] of Object.entries(TemplateTester.environments) as [SupportedEnvironments, ContextProvider][]) {
      try {
        const runner = new TemplateTester(isolate, code);

        await runner.dryRun(contextProvider);
      } catch (err) {
        if (err instanceof SyntaxError) {
          issues.set(name, { SyntaxError: this.sanitizeErrorMessage(err.message) });
        }

        if (err instanceof ReferenceError) {
          issues.set(name, { ReferenceError: this.sanitizeErrorMessage(err.message) });
        }
      }
    }


    isolate.dispose();
    return issues;
  }
}
