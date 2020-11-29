import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule).then(
    async appContext => {
      const appService = appContext.get(AppService);
    },
  );
}
bootstrap();
