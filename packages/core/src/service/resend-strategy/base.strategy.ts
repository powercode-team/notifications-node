import { IResendStrategy } from '../../interface';

export abstract class BaseResendStrategy implements IResendStrategy {
  protected intervalMax?: number; // in seconds
  protected maxAttempts?: number;

  protected constructor(
    protected readonly intervalBase: number,
  ) {
    if (intervalBase < 1) {
      throw new Error(`Error ${ this.constructor.name }::intervalBase < 1`);
    }

    if (this.intervalMax != null && this.intervalMax < 1) {
      throw new Error(`Error ${ this.constructor.name }::intervalMax < 1`);
    }
    if (this.maxAttempts != null && this.maxAttempts < 1) {
      throw new Error(`Error ${ this.constructor.name }::maxAttempts < 1`);
    }
    if (this.intervalMax == null && this.maxAttempts == null) {
      throw new Error(
        `It is necessary to define one of the limits: ${ this.constructor.name }::intervalMax or ${ this.constructor.name }::maxAttempts`,
      );
    }
  }

  /** Calculate delta of next try to resend */
  abstract calcResendDelta(attempts: number): number | null;

  calcNextSend(attempts: number, baseDate: Date): Date | null {
    if (this.maxAttempts && attempts >= this.maxAttempts) {
      return null;
    }

    const delta = this.calcResendDelta(attempts);
    if (!delta || delta < 1) {
      return null;
    }

    const round = delta < 600 ? 1 : 60;

    return new Date(Math.floor((baseDate.getTime() / 1000 + delta) / round) * round * 1000);
  }
}
