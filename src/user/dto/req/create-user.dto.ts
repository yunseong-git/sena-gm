import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGoogleUserDto {
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
