import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGuildNoticeDto {
  @ApiProperty({
    description: '공지사항',
    example: '매너 지향 길드입니다.'
  })
  @IsString()
  @Length(0, 200)
  notice: string;
}