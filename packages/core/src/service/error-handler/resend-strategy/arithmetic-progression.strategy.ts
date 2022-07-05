import { IResendStrategy } from '../../../interface';

export class ArithmeticProgressionStrategy implements IResendStrategy {
  constructor(
    protected readonly attempts: number,
    protected readonly intervalBase: number, // in seconds
    protected readonly intervalMax: number, // in seconds
  ) {
    if (intervalBase < 1) {
      throw new Error(`Error ArithmeticProgressionStrategy::intervalBase: ${intervalBase} < 1`);
    }
    if (intervalMax < intervalBase) {
      throw new Error(`Error ArithmeticProgressionStrategy::intervalMax: ${intervalMax} < ${intervalBase}`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    if (attempts >= (this.attempts ?? -1)) {
      return null;
    }

    const delta = this.intervalBase * attempts;

    return delta < this.intervalMax ? delta : this.intervalMax;
  }
}
