import { ApiProperty } from '@nestjs/swagger';
import { JwtPayloadDto } from './payload.dto.js';

export class AuthResponseDto {
  @ApiProperty({ description: '로그인/인증 성공 후 반환되는 유저 정보', type: JwtPayloadDto })
  payload: JwtPayloadDto;
}