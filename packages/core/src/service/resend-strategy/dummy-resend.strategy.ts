import { IResendStrategy } from '../../interface';

export class DummyResendStrategy implements IResendStrategy {
  calcNextSend(attempts: number, baseDate: Date): Date | null {
    return null;
  }
}
