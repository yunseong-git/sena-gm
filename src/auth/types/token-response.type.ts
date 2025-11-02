import { JwtPayload, UserPayload } from "./payload.type.js";

export type AccessTokenWithPayload = {
  accessToken: string;
  payload: JwtPayload;
}

export type TokensWithPayload = {
  accessToken: string;
  refreshToken: string;
  payload: JwtPayload;
}
