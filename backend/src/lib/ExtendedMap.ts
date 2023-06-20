export class ExtendedMap<K, V> extends Map<K, V> {
  constructor(initial?: ConstructorParameters<typeof Map<K, V>>[0]) {
    super(initial);
  }

  public find(finder: (value: V) => boolean): [K, V] | undefined {
    for (const [key, value] of this) {
      if (finder(value)) return [key, value];
    }


    return undefined;
  }

  public first(): [K, V] | undefined {
    const iterator = this.values().next();
    if (iterator.done) return undefined;


    return [this.keys().next().value, iterator.value];
  }

  public map<T>(mapper: (value: V) => T): ExtendedMap<K, T> {
    const map = new ExtendedMap<K, T>();

    for (const [key, value] of this) {
      map.set(key, mapper(value));
    }


    return map;
  }


  public filter(filter: (value: V) => V): ExtendedMap<K, V> {
    const map = new ExtendedMap<K, V>();

    for (const [key, value] of this) {
      if (filter(value)) {
        map.set(key, value);
      }
    }


    return map;
  }
}
