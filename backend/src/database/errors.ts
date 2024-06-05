export class InsertResultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsertResultError';
  }
}
