import { IResendStrategy } from '../../../interface';

export class LinerStrategy implements IResendStrategy {
  constructor(
    protected readonly attempts: number,
    protected readonly intervalBase: number, // in seconds
  ) {
    if (intervalBase < 1) {
      throw new Error(`Error LinerStrategy::intervalBase: ${intervalBase} < 1`);
    }
  }

  calcResendDelta(attempts: number): number | null {
    if (attempts >= (this.attempts ?? -1)) {
      return null;
    }

    return this.intervalBase;
  }
}
