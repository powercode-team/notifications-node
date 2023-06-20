import { ArithmeticProgressionResendStrategy } from './arithmetic-progression.strategy';

export class GeometryProgressionResendStrategy extends ArithmeticProgressionResendStrategy {
  constructor(
    intervalBase: number, // in seconds
    protected readonly intervalMax: number, // in seconds
    protected readonly maxAttempts?: number,
    protected readonly denominator: number = 2,
  ) {
    super(intervalBase, intervalMax, maxAttempts);

    if (denominator < 2) {
      throw new Error(`Error GeometricProgressionStrategy::denominator: ${ denominator } < 2`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    let delta: number | null;

    delta = this.intervalBase * (this.denominator ** (attempts - 1));

    if (delta > this.intervalMax) {
      delta = this.maxAttempts ? this.intervalMax : null;
    }

    return delta;
  }
}
