import { randomInt } from 'crypto';
import { AbstractTransport, ConsoleDataProvider, IConsoleData, IResponse, NotificationStatusEnum } from '../..';
import { sleep } from './sleep';

export const TRANSPORT_CONSOLE_TEST = 'console.test';

export class ConsoleTransportTest extends AbstractTransport<IConsoleData> {
  constructor(
    protected readonly errorPercentage: number = 50,
    protected readonly delay: { min: number, max: number } = { min: 0, max: 0 }, // in sec
  ) {
    super(new ConsoleDataProvider());

    if (!this.delay.min || this.delay.min < 0) {
      this.delay.min = 0;
    }
    if (!this.delay.max || this.delay.max < this.delay.min) {
      this.delay.max = this.delay.min;
    }
  }

  async send(data: IConsoleData): Promise<IResponse> {
    let success;
    if (!this.errorPercentage || this.errorPercentage < 1) {
      success = true;
    } else if (this.errorPercentage > 99) {
      success = false;
    } else {
      success = randomInt(1, 100) > this.errorPercentage;
    }

    await sleep(randomInt(this.delay.min, this.delay.max) * 1000);

    console.log(`Notification to: ${data.to}, Status: ${success}\n Data: ${data.text}`);

    return Promise.resolve({
      status: success ? NotificationStatusEnum.SENT : NotificationStatusEnum.ERROR,
      response: { success },
    });
  }
}
