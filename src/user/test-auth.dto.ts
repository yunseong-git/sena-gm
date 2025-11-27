import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestUserDto {
  @ApiProperty({ description: '닉네임', example: '테스터1' })
  @IsString()
  @Length(2, 10)
  nickname: string;

  @ApiProperty({ description: '비밀번호 (단순 문자열)', example: '1234' })
  @IsString()
  password: string;
}

export class LoginTestUserDto {
  @ApiProperty({ description: '닉네임', example: '테스터1' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '비밀번호', example: '1234' })
  @IsString()
  password: string;
}