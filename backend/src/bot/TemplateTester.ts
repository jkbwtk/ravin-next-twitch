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

  public async dryRun(): Promise<string> {
    const context = this.createMockContext();

    const response = await this.script.run(context, { timeout: 1 });
    context.release();

    return `${response}`;
  }

  public static async test(code: string): Promise<TemplateIssues> {
    const isolate = new Isolate({ memoryLimit: 1 });
    const issues: TemplateIssues = {};

    try {
      const runner = new TemplateTester(isolate, code);

      await runner.dryRun();
    } catch (err) {
      if (err instanceof SyntaxError) {
        issues['SyntaxError'] = err.message;
      }

      if (err instanceof ReferenceError) {
        issues['ReferenceError'] = err.message;
      }
    }


    isolate.dispose();
    return issues;
  }
}
