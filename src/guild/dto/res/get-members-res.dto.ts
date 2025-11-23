import { ApiProperty } from '@nestjs/swagger';
import { GUILD_ROLE_ENUM, GuildDocument } from '../../schemas/guild.schema.js';
import { PopulatedMember } from '#src/guild/interfaces/members.interface.js';

export class GuildMemberResDto {
  @ApiProperty({ description: '유저 object id' })
  userId: string;

  @ApiProperty({ description: '유저 닉네임', example: '쥬리단' })
  nickname: string;

  @ApiProperty({ description: '유저 태그', example: '1234' })
  tag: string;

  @ApiProperty({ description: '유저 풀네임(이름+태그)', example: '쥬리단#1234' })
  fullName: string;

  @ApiProperty({ description: '유저 길드 역할', example: 'MASTER', enum: GUILD_ROLE_ENUM })
  role: GUILD_ROLE_ENUM;

  // factory method: mapping logic
  static from(member: PopulatedMember, guild: GuildDocument): GuildMemberResDto {
    const memberId = member._id.toString();
    let role = GUILD_ROLE_ENUM.MEMBER;

    // 역할 판단 로직 (서비스에서 가져옴)
    if (memberId === guild.master.toString()) {
      role = GUILD_ROLE_ENUM.MASTER;
    } else if (guild.submaster && memberId === guild.submaster.toString()) {
      role = GUILD_ROLE_ENUM.SUBMASTER;
    } else if (guild.managers.some((m) => m.toString() === memberId)) {
      role = GUILD_ROLE_ENUM.MANAGER;
    }

    return {
      userId: memberId,
      nickname: member.nickname,
      tag: member.tag,
      fullName: member.fullName, // Virtual Field
      role,
    };
  }
}