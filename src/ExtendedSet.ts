import { clamp } from './utils';


export default class ExtendedSet<T> extends Set<T> {
  constructor(iterable?: Iterable<T>) {
    super(iterable);
  }

  public addAll(iterable: Iterable<T>): void {
    for (const i of iterable) {
      this.add(i);
    }
  }

  public deleteAll(iterable: Iterable<T>): void {
    for (const i of iterable) {
      this.delete(i);
    }
  }

  public first(quantity = 1): ExtendedSet<T> {
    const values = new ExtendedSet<T>();
    let counter = 0;

    for (const value of this) {
      values.add(value);

      counter += 1;
      if (counter >= quantity) break;
    }


    return values;
  }

  public splice(start: number, deleteCount?: number): ExtendedSet<T> {
    start = clamp(0, this.size - 1, start);
    deleteCount = clamp(1, this.size - start, deleteCount ?? 1);

    const head = this.values();
    const values = new ExtendedSet<T>();

    for (let i = 0; i < start; i++) {
      head.next();
    }

    for (let i = 0; i < deleteCount; i++) {
      values.add(head.next().value);
    }


    this.deleteAll(values);
    return values;
  }

  public copy(): ExtendedSet<T> {
    return new ExtendedSet(this);
  }
}
