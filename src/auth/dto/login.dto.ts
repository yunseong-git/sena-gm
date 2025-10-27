import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  testId: string

  @IsString()
  @IsNotEmpty()
  password: string;
}