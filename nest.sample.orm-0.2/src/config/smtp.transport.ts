import { registerAs } from '@nestjs/config';
import { configSmtp } from '@node-notifications/transport-mailer';

export const configTransportSmtp = registerAs('transport.smtp', () => configSmtp);
