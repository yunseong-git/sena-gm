import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuildDto {
  @ApiProperty({ description: '길드 이름 (2~12자, 한글/영문/숫자)', example: '전설의기사단', })
  @IsString()
  @Length(2, 12)
  @Matches(/^[가-힣a-zA-Z0-9]+$/, { message: '특수문자는 사용할 수 없습니다.' })
  name: string;
}