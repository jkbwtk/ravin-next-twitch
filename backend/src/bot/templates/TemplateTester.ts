import { TemplateIssues } from '#bot/templates/TemplateIssues';
import { EnvironmentProvider, testEnvironments } from '#bot/templates/templateEnvironments';
import { TemplateEnvironments } from '#shared/types/api/templates';
import { Context, Isolate, Script } from 'isolated-vm';


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


  public static async test(code: string): Promise<TemplateIssues> {
    const isolate = new Isolate({ memoryLimit: 8 });
    const issues = new TemplateIssues();

    for (const [environment, environmentProvider] of Object.entries(testEnvironments) as [TemplateEnvironments, EnvironmentProvider][]) {
      try {
        const runner = new TemplateTester(isolate, code);

        await runner.dryRun(environmentProvider);
        issues.setNull(environment);
      } catch (err) {
        issues.setIssue(environment, err);
      }
    }


    isolate.dispose();
    return issues;
  }
}
