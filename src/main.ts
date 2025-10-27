import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 파이프로 ValidationPipe 등록
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //DTO에 정의되지 않은 속성을 자동으로 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청을 거부
    transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 자동 변환
  }));

  app.enableCors({
    // 1. 프론트엔드 주소(3001번)를 명시적으로 허용
    origin: 'http://localhost:3001', 
    
    // 2. 쿠키(refreshToken)를 주고받으려면 필수
    credentials: true, 
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
