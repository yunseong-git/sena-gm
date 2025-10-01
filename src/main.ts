import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 파이프로 ValidationPipe 등록
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //DTO에 정의되지 않은 속성을 자동으로 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청을 거부
    transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 자동 변환
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
