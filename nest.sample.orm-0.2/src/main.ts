import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IObject } from '@node-notifications/core';
import * as hbs from 'express-handlebars';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Templating
  const views = join(__dirname, 'views');
  app.setBaseViewsDir(views);
  app.engine('hbs', hbs.engine({
    layoutsDir: views,
    defaultLayout: null,
    extname: 'hbs',
    helpers: {
      stringify: (object: IObject) => JSON.stringify(object),
    },
  }));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
