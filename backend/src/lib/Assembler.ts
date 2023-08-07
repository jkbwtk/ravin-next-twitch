export type Maybe<T> = T | null;

export class Assembler<InputType, ContextType = void, V = InputType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformers: ((value: any, context: ContextType) => any)[] = [];

  private failed = false;

  private value: Maybe<V> = null;

  public assemble(value: InputType, context: ContextType): Maybe<V> {
    this.failed = false;
    this.value = null;

    try {
      for (const transformer of this.transformers) {
        value = transformer(value as InputType, context);
      }

      this.value = value as Maybe<V>;
      return this.value;
    } catch (err) {
      this.failed = true;
      return null;
    }
  }

  public chain<R>(func: (value: V, context: ContextType) => R): Assembler<InputType, ContextType, R> {
    this.transformers.push(func);

    return this as unknown as Assembler<InputType, ContextType, R>;
  }

  public didFail(): boolean {
    return this.failed;
  }

  public copy(): Assembler<InputType, ContextType, V> {
    const assembler = new Assembler<InputType, ContextType, V>();

    assembler.transformers = [...this.transformers];

    return assembler;
  }
}
