import { IsString, IsNotEmpty } from 'class-validator';
export class CreateGuildDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}