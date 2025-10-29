import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Guild, GuildDocument, GuildRole } from '#src/guild/schemas/guild.schema.js';
import { guildCode } from '../types/guild.type.js';
import { simpleGuildInfo } from '../types/guild.type.js';
import { GuildMemberBasicInfo, GuildMemberDetailInfo } from '../types/guild-member.type.js';

@Injectable()
export class GuildQueryService {
  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
  ) { }

  // ==================== 길드 조회 ====================

  /**기본 길드정보 조회 */
  async findMyGuild(guildId: Types.ObjectId): Promise<simpleGuildInfo> {
    const guild = await this.guildModel.findById(guildId, { _id: 1, name: 1, tag: 1 })
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    return guild;
  }

  /** 길드 멤버 목록 조회 (이름, 태그, 역할) */
  async findMyGuildMembers(guildId: Types.ObjectId): Promise<GuildMemberBasicInfo[]> {
    const members = await this._aggregateGuildMembers<GuildMemberBasicInfo>(guildId, { nickname: 1, tag: 1, 'guild.role': 1 });

    return members;
  }

  /** 길드원 상세 전투력 조회 (이름, 태그, 영웅 목록) */
  async getMemberDetails(guildId: Types.ObjectId): Promise<GuildMemberDetailInfo[]> {
    const members = await this._aggregateGuildMembers<GuildMemberDetailInfo>(guildId, { nickname: 1, tag: 1, myHeroes: 1 });

    return members;
  }

  /**
     * [Private Helper] 길드 멤버 정보를 Aggregation으로 조회하는 공통 로직
     * @param guildId 길드 ID
     * @param userProjection Users 컬렉션에서 가져올 필드를 정의하는 $project 객체
     */
  private async _aggregateGuildMembers<T>(guildId: Types.ObjectId, userProjection: Record<string, any>): Promise<T[]> {
    const results = await this.guildModel.aggregate([
      // 1단계: 특정 길드 문서 찾기
      { $match: { _id: guildId } },
      // 2단계: Users 컬렉션과 JOIN 및 필요한 필드만 선택
      {
        $lookup: {
          from: 'Users',
          localField: 'members', // Guild.members 배열 (ObjectId[])
          foreignField: '_id',   // User._id
          pipeline: [
            { $project: { _id: 1, ...userProjection } }
          ],
          as: 'memberDetails'
        }
      },
      // 3단계: memberDetails 배열만 추출
      { $project: { _id: 0, members: '$memberDetails' } },
      // 4단계: 문서 루트를 members 배열로 교체
      { $replaceRoot: { newRoot: "$members" } }
    ]).exec();

    return results as T[];
  }

  // ==================== 길드 관리 ====================

  /**길드 코드 조회*/
  async findGuildCode(guild_Id: Types.ObjectId): Promise<guildCode> {
    const result = await this.guildModel
      .findById(guild_Id)
      .select('+code')
      .lean().exec();

    if (!result || !result.code) {
      throw new NotFoundException('길드를 찾을 수 없거나 해당 길드에 코드가 존재하지 않습니다.');
    }

    return { code: result.code };
  }

  /** 초대 코드로 길드 조회 */
  async findGuildByCode(code: string): Promise<simpleGuildInfo> {
    const guild = await this.guildModel
      .findOne({ code }, { _id: 1, name: 1, tag: 1 })
      .lean().exec();

    if (!guild) {
      throw new NotFoundException('유효하지 않거나 만료된 초대 코드입니다.');
    }

    return guild;
  }

  /**타겟이 길드원이면 true, 아니면 false */
  async targetIsMember(guild_Id: Types.ObjectId, target_Id: Types.ObjectId): Promise<boolean> {
    const result = await this.guildModel.exists({
      _id: guild_Id,
      'members.user_Id': target_Id
    });
    return !!result;
  }
}