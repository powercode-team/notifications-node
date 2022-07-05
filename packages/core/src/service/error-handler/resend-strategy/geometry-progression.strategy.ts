import { IResendStrategy } from '../../../interface';

export class GeometryProgressionStrategy implements IResendStrategy {
  constructor(
    protected readonly attempts: number,
    protected readonly intervalBase: number, // in seconds
    protected readonly intervalMax: number, // in seconds
    protected readonly denominator: number = 2,
  ) {
    if (intervalBase < 1) {
      throw new Error(`Error GeometricProgressionStrategy::intervalBase: ${intervalBase} < 1`);
    }
    if (intervalMax < intervalBase) {
      throw new Error(`Error GeometricProgressionStrategy::intervalMax: ${intervalMax} < ${intervalBase}`);
    }
    if (denominator < 2) {
      throw new Error(`Error GeometricProgressionStrategy::denominator: ${denominator} < 2`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    if (attempts >= (this.attempts ?? -1)) {
      return null;
    }

    const delta = this.intervalBase * (this.denominator ** (attempts - 1));

    return delta < this.intervalMax ? delta : this.intervalMax;
  }
}
