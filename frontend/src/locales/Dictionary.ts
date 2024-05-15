export class Dictionary<K extends string | number, S> {
  constructor(private readonly defaultValue: (key: K | undefined) => S, private readonly locale: Record<K, S>) {}

  public get(key: K | undefined): S {
    if (key === undefined) return this.defaultValue(undefined);

    const entry = this.locale[key];

    return entry ?? this.defaultValue(key);
  }

  public getCoerced(key: string | undefined): S {
    if (key === undefined) return this.defaultValue(undefined);

    const entry = this.locale[key as K];

    return entry ?? this.defaultValue(key as K);
  }
}
