import { BaseResendStrategy } from './base.strategy';

export class StaticResendStrategy extends BaseResendStrategy {
  constructor(
    intervalBase: number, // in seconds
    protected readonly maxAttempts: number,
  ) {
    super(intervalBase);

    if (maxAttempts == null || maxAttempts < 1) {
      throw new Error(`Undefined required parameter: ${ this.constructor.name }::maxAttempts`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    return this.intervalBase;
  }
}
