import { EnvironmentProvider, testEnvironments } from '#bot/templates/templateEnvironments';
import { TemplateEnvironments } from '#shared/types/api/templates';
import { Context, Isolate, Script } from 'isolated-vm';


export type TemplateIssues = {
  SyntaxError?: string;
  ReferenceError?: string;
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

  public async dryRun(contextProvider?: EnvironmentProvider): Promise<string> {
    const context = this.createMockContext();

    if (contextProvider) {
      contextProvider(context);
    }

    const response = await this.script.run(context, { timeout: 1 });
    context.release();

    return `${response}`;
  }

  private static sanitizeErrorMessage(message: string): string {
    return message.replace('<isolated-vm>', 'template');
  }

  public static async test(code: string): Promise<Map<TemplateEnvironments, TemplateIssues | null>> {
    const isolate = new Isolate({ memoryLimit: 8 });
    const issues: Map<TemplateEnvironments, TemplateIssues | null> = new Map();

    for (const [name, environmentProvider] of Object.entries(testEnvironments) as [TemplateEnvironments, EnvironmentProvider][]) {
      try {
        const runner = new TemplateTester(isolate, code);

        await runner.dryRun(environmentProvider);
        issues.set(name, null);
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

  public static async getSupportedEnvironments(code: string): Promise<TemplateEnvironments[]> {
    const issues = await this.test(code);

    return Array.from(issues.entries())
      .filter(([, value]) => value === null)
      .map(([key]) => key);
  }
}
