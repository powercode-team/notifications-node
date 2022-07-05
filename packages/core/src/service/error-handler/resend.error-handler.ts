import { IErrorHandler, IQueueEntity, IResendStrategy, IResponse, ITransport } from '../../interface';

export class ResendErrorHandler implements IErrorHandler {
  constructor(
    protected readonly resendStrategy: IResendStrategy,
  ) {}

  handleError(entity: IQueueEntity, transport: ITransport, response: IResponse): Promise<IQueueEntity> {
    const nextSend = this.calcNextSend(entity.sentAttempts, entity.sentAt ?? undefined);

    if (nextSend) {
      entity.nextSend = nextSend;
    }

    return Promise.resolve(entity);
  }

  calcNextSend(attempts: number, baseDate: Date = new Date()): Date | null {
    const delta = this.resendStrategy.calcResendDelta(attempts);
    if (delta == null || delta < 0) {
      return null;
    }

    const round = delta < 600 ? 1 : 60;

    return new Date(Math.floor((baseDate.getTime() / 1000 + delta) / round) * round * 1000);
  }
}
