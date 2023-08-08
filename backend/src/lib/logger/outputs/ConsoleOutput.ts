import { LoggerOutput } from '#lib/logger/outputs/LoggerOutput';
import { LoggerOptions, OutputOptions, TransformableEntry } from '#lib/logger/types';


type ConsoleOutputOptions = OutputOptions;

export class ConsoleOutput extends LoggerOutput {
  constructor(protected options: ConsoleOutputOptions) {
    super();
  }

  public log(context: LoggerOptions, entry: TransformableEntry): void {
    if (!this.canLog(context, entry)) return;

    const copy = { ...entry };
    const result = this.options.format.assemble(copy, context);

    if (result === null) return;

    console.log(result);
  }

  public close(): void {
    // Nothing to do here
  }
}
