import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuildMemberResDto } from '../dto/res/get-members-res.dto';
import { SimpleGuildResDto } from '../dto/res/get-guild-res.dto';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { User } from '../../user/schemas/user.schema';
import { PopulatedMember } from '../interfaces/members.interface';
import { Guild, GuildDocument, GUILD_ROLE_ENUM } from '../schemas/guild.schema';

/**길드 조회 서비스 */
@Injectable()
export class GuildQueryService {
  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
  ) { }

  // --- basic query ---

  /**기본 길드정보 조회 */
  async getById(user: UserPayload): Promise<SimpleGuildResDto> {
    const guild = await this.guildModel.findById(user.guildId).select('notice name tag').lean().exec();
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    return SimpleGuildResDto.from(guild);
  }

  /** 길드원 목록 조회 (Populate + Mapping) */
  async getMembers(user: UserPayload): Promise<GuildMemberResDto[]> {
    const guild = await this.guildModel.findById(user.guildId)
      .select('master submaster managers members') // 역할 판단에 필요한 필드
      .populate({
        path: 'members',
        select: 'nickname tag role',
        model: User.name,
      })
      .lean().exec();

    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    const members = guild.members as unknown as PopulatedMember[];

    const result = members.map(member => GuildMemberResDto.from(member, guild));
    return this._sortMembersByRole(result);
  }

  /** (Helper) 역할별 정렬 */
  private _sortMembersByRole(members: any[]) {
    const rolePriority = {
      [GUILD_ROLE_ENUM.MASTER]: 0,
      [GUILD_ROLE_ENUM.SUBMASTER]: 1,
      [GUILD_ROLE_ENUM.MANAGER]: 2,
      [GUILD_ROLE_ENUM.MEMBER]: 3,
    };

    return members.sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  }
}