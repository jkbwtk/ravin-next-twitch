export class Dictionary<K extends string | number, S> {
  constructor(private readonly defaultValue: S, private readonly locale: Record<K, S>) {}

  get(key: K | undefined): S {
    if (key === undefined) return this.defaultValue;

    const entry = this.locale[key];

    return entry ?? this.defaultValue;
  }

  getCoerced(key: string | undefined): S {
    if (key === undefined) return this.defaultValue;

    const entry = this.locale[key as K];

    return entry ?? this.defaultValue;
  }
}
