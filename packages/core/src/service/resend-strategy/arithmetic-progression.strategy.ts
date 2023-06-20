import { BaseResendStrategy } from './base.strategy';

export class ArithmeticProgressionResendStrategy extends BaseResendStrategy {
  constructor(
    intervalBase: number, // in seconds
    protected readonly intervalMax: number, // in seconds
    protected readonly maxAttempts?: number,
  ) {
    super(intervalBase);

    if (intervalMax == null || intervalMax < intervalBase) {
      throw new Error(`Error: ${ this.constructor.name }::intervalMax < ${ intervalBase }`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    let delta: number | null;

    delta = this.intervalBase * attempts;

    if (delta > this.intervalMax) {
      delta = this.maxAttempts ? this.intervalMax : null;
    }

    return delta;
  }
}
