import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 파이프로 ValidationPipe 등록
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //DTO에 정의되지 않은 속성을 자동으로 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청을 거부
    transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 자동 변환
  }));

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3001',
    credentials: true, //쿠키
  });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('SenaGM API')
    .setDescription('SenaGM API 문서입니다.')
    .setVersion('1.0')
    .addCookieAuth('accessToken') // (선택) JWT 인증을 테스트하려면 추가 (쿠키 기반이라 UI에서 직접 입력은 안 되지만 표시는 됨)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 'api' 경로에 Swagger UI를 띄움 (http://localhost:3000/api)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 해도 인증 유지
      withCredentials: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
