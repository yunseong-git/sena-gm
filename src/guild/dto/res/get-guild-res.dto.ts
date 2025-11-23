import { GuildDocument } from '#src/guild/schemas/guild.schema.js';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleGuildResDto {
  @ApiProperty({ description: '길드 풀네임(이름+태그)', example: 'True#1234' })
  fullName: string;

  @ApiProperty({ description: '길드 공지사항', example: '길드전 아카이브 작성전 중복데이터가 있는지 잘 확인해주세요.' })
  notice: string;

  static from(guild: GuildDocument): SimpleGuildResDto {
    return {
      fullName: guild.fullName,
      notice: guild.notice,
    };
  }
}