import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: '사용할 닉네임 (2~10자, 특수문자 제외)',
    example: '짱세나',
    minLength: 2,
    maxLength: 10
  })
  @IsString()
  @Length(2, 10, { message: '2~10자리의 닉네임을 입력해주세요' })
  @Matches(/^[가-힣a-zA-Z0-9]+$/, { message: '특수문자는 허용되지 않습니다.' })
  nickname: string;
}