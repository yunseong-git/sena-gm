import { CookieOptions } from 'express';

// 환경 변수에 따라 secure 옵션 자동 전환
const isProduction = process.env.NODE_ENV === 'production';

export const REFRESH_COOKIE_OPTION: CookieOptions = {
  httpOnly: true,
  // 배포(prod) 환경이면 true(HTTPS), 개발(dev) 환경이면 false(HTTP)
  secure: isProduction,
  sameSite: 'lax', //외부 링크를 타고 들어와도 GET 요청 등 안전한 요청에는 쿠키를 보냄, strict는 다 차단
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  path: '/', // 모든 경로에서 접근 가능하도록 명시
};

export const ACCESS_COOKIE_OPTION: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60, // 1시간
  path: '/',
};

export const REGISTER_COOKIE_OPTION: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 1000 * 60 * 10, // 10분
  path: '/',
}