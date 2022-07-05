export interface IResendStrategy {
  /** Calculate delta of next try to resend */
  calcResendDelta(attempts: number): number | null;
}
