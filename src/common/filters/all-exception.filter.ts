// src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import axios from 'axios';
import * as process from 'process';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // .env에 저장

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 1. 에러 정보 추출
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const path = httpAdapter.getRequestUrl(request);
    const method = httpAdapter.getRequestMethod(request);
    const user = request.user ? request.user.nickname : 'Anonymous'; // 로그인 정보가 있다면

    // 2. 에러 메시지 구성
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : '';

    // 3. [중요] 500번대 에러(서버 터짐)일 때만 알림 보내기 (400번대 유저 실수 제외)
    if (httpStatus >= 500) {
      this.sendDiscordAlert(method, path, user, errorMessage, stack);
      this.logger.error(`[${method}] ${path} - ${errorMessage}`, stack);
    } else {
      this.logger.warn(`[${method}] ${path} - ${errorMessage}`);
    }

    // 4. 클라이언트에게 응답
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: path,
      message: 'Internal Server Error' // 보안상 상세 에러는 숨김
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  // 디스코드 알림 전송 함수
  private async sendDiscordAlert(method: string, path: string, user: string, error: string, stack: string) {
    if (!this.DISCORD_WEBHOOK_URL) return;

    const content = {
      embeds: [{
        title: ` Sena-gm 서버 에러 발생!`,
        color: 15548997, // 빨강
        fields: [
          { name: 'User', value: user, inline: true },
          { name: 'Path', value: `${method} ${path}`, inline: true },
          { name: 'Error Message', value: `\`\`\`${error}\`\`\`` },
          { name: 'Stack Trace', value: `\`\`\`${stack.slice(0, 1000)}\`\`\`` } // 너무 길면 잘림 주의
        ],
        timestamp: new Date().toISOString(),
      }]
    };

    try {
      await axios.post(this.DISCORD_WEBHOOK_URL, content);
    } catch (e) {
      this.logger.error('Failed to send Discord alert');
    }
  }
}