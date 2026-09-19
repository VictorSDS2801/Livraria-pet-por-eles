export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string = 'DOMAIN_ERROR',
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
