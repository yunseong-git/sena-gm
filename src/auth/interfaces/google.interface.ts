import { TokensWithPayload } from "./token-payload.interface.js";

/** 로그인 성공 시 반환 타입 (기존 TokensWithPayload 확장) */
export interface GoogleLoginResult extends TokensWithPayload {
  type: 'login';
}

/** 회원가입 필요 시 반환 타입*/
export interface GoogleRegisterResult {
  type: 'register';
  registerToken: string;
}

/** 서비스 함수의 반환 타입 (Union Type) */
export type GoogleAuthResult = GoogleLoginResult | GoogleRegisterResult;