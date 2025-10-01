import { IsString, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @Length(2, 20, { message: '닉네임은 2자에서 20자 사이여야 합니다.' })
  nickname: string;

  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @Length(6, 30, { message: '비밀번호는 6자에서 30자 사이여야 합니다.' })
  password: string;
}