import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guild, GuildDocument, GuildRole } from 'src/guild/schemas/guild.schema';
import { guildCode } from '../controllers/guild-public.controller';
import { simpleGuildInfo } from '../types/guild.type';

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
  async findGuildCode(guild_Id: string): Promise<guildCode> {
    const result = await this.guildModel
      .findById(guild_Id)
      .select('code -_id')
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

  /**타겟이 길드원인지, 길드원이 아니면 조회오류 */
  async targetIsMember(guild_Id: string, target_Id: string) {
    const targetIsMember = await this.guildModel.exists({ _id: guild_Id, 'members.user_Id': target_Id });
    if (!targetIsMember) {
      throw new NotFoundException('대상이 길드에 소속되어 있지 않습니다.');
    }
  }

  /**타겟이 길드마스터인지, 길드마스터면 권한오류 */
  async targetIsMaster(guild_Id: string, target_Id: string): Promise<void> {
    const targetIsMaster = await this.guildModel.exists({
      _id: guild_Id,
      members: {
        $elemMatch: { user_Id: target_Id, role: GuildRole.MASTER }
      }
    });
    if (targetIsMaster) {
      throw new BadRequestException('권한이 없습니다.');
    }
  }
}