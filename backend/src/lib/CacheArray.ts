export class CacheFIFO<T> {
  public array: T[] = [];

  constructor(private maxLength: number) {}

  public setMaxLength(maxLength: number): void {
    this.maxLength = maxLength;
    this.trim();
  }

  public at(index: number): T | undefined {
    return this.array.at(index);
  }

  public get length(): number {
    return this.array.length;
  }

  public push(...items: T[]): number {
    this.array.push(...items);
    this.trim();

    return this.length;
  }

  private trim(): void {
    if (this.length <= this.maxLength) return;

    this.array.splice(0, this.length - this.maxLength);
  }
}
