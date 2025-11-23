import { ApiProperty } from '@nestjs/swagger';

export class GuildCodeResDto {
  @ApiProperty({ description: '길드코드, 초대url 조합용' })
  code: string;
}

export class checkGuildTagResDto {
  @ApiProperty({ description: '중복여부: 1이면 중복, 0이면 사용가능' })
  isExist: boolean;
}