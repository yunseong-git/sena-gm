import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinGuildDto {
  @ApiProperty({ description: '초대 코드 (9자리)', example: 'X7Z9A1AX', })
  @IsString()
  @Length(9, 9, { message: '잘못된 코드값 입니다.' })
  code: string;
}