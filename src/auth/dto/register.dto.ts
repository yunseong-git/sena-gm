import { IsString, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  testId: string;
  nickname: string;
  password: string;
}