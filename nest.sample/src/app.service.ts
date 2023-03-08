import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello from Notification System!!<br><a href="/mail">Mail</a>`;
  }
}
