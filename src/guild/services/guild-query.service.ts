import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Guild, GuildDocument, GuildRole } from '#src/guild/schemas/guild.schema.js';
import { guildCode } from '../controllers/guild-public.controller.js';
import { simpleGuildInfo } from '../types/guild.type.js';

@Injectable()
export class GuildQueryService {
  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
  ) { }

  /** 길드 일반정보 조회 로직(길드 멤버확인 등 일반적 데이터) */
  async findGuildById(guild_Id: string): Promise<GuildDocument> {
    const guild = await this.guildModel.findById(guild_Id).lean().exec();
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');
    return guild;
  }

  ////////////////////////////////guild-code////////////////////////////////

  /**길드 코드 조회 로직(길드 코드 확인용) */
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

  ////////////////////////////////for-fail-fast////////////////////////////////

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

  /** 타겟이 길드마스터면 true, 아니면 false */
  async targetIsMaster(guild_Id: Types.ObjectId, target_Id: Types.ObjectId): Promise<boolean> {
    const result = await this.guildModel.exists({
      _id: guild_Id,
      members: {
        $elemMatch: { user_Id: target_Id, role: GuildRole.MASTER }
      }
    });
    return !!result;
  }
}