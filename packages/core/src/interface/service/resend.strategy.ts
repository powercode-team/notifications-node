export interface IResendStrategy {
  calcNextSend(attempts: number, baseDate: Date): Date | null;
}
