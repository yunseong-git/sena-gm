import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGuildNoticeDto {
  @ApiProperty({ description: '공지사항', example: '매너 지향 길드입니다.' })
  @IsString()
  @Length(0, 200)
  notice: string;
}

export class UpdateGuildTagDto {
  @ApiProperty({ description: '길드 태그, 자유롭게 생성', example: 'ㄹㅇ', type: String, })
  @IsString()
  @Length(1, 8)
  @Matches(/^[가-힣a-zA-Z0-9]+$/, { message: '특수문자는 사용할 수 없습니다.' })
  tag: string;
}