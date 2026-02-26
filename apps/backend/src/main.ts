import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Allow the Next.js frontend to send credentialed requests (cookies)
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `Backend running on http://localhost:${process.env.PORT ?? 3001}/api`,
  );
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
