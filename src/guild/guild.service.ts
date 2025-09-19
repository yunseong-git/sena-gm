import { Injectable } from '@nestjs/common';
import { Guild, GuildDocument } from './schemas/guild.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GuildService {
  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
  ) {}

  async createGuild() {
    const createdGuild = new this.guildModel();
    return createdGuild.save();
    //유저id로 생성가능
    //유저가 이미 길드가 존재하거나, 중복된 길드명으로 생성하려는 경우 에러발생
    //생성한 유저가 master, managers, members에 모두 반영된다.
    //유저model에 guild_id에도 반영해준다.
    //생성당시에는 길드 코드가 발행이 되지않는다.
  }

  //길드 있는지 여부 확인
  async findGuildByName(name: string) {
    return this.guildModel.findOne({ name }).exec();
  }

  //나중엔 데코레이터로 할 예정이지만 지금은 그냥 직접 입력받음
  async createCode(guild_id: string, user_Id: string) {
    await this.isMaster(guild_id, user_Id);
    //완료시 생성한 코드 발급(코드는 uuid형식으로 보안이 필요함)
  }

  async isMaster(guild_id: string, user_Id: string) {
    //나중엔 이 역할을 데코레이터가 할예정
  }

  async validateCode(code: string) {
    return this.guildModel.findOne({ code }).exec();
  }

  async updateCode(guild_id: string, user_Id: string) {
    await this.isMaster(guild_id, user_Id);
    //완료시 생성한 코드 발급
  }

  async registerGuild(code: string, user_Id: string) {
    //유저가 길드가입했는지 확인필요 userService로
    this.validateCode(code); //코드가 유효한지 검증
    //확인되면 해당 길드의 member배열에 추가됨
    //user의 guild_id에도 추가필요
  }

  //길드 상세 정보 확인용(나중에는 데코레이터로 검증예정)
  async findGuildDetail(guild_id: string) {
    return this.guildModel.findById(guild_id).exec();
  }

  async updateManager(guild_id: string, user_Id: string, targets: string[]) {
    await this.isMaster(guild_id, user_Id);
    //targets 그대로 mangers업데이트
  }

  async updateMaster(guild_id: string, user_Id: string, target_Id: string) {
    await this.isMaster(guild_id, user_Id);
    //master 업데이트만 하면 끝, 이미 member에는 둘다 있음
  }

  async deleteMember(guild_id: string, user_Id: string, target_Id: string) {
    await this.isMaster(guild_id, user_Id);
    //member배열에서 제거
    //나중에 해당 유저가 길드 최신화(유저서비스) 직접 누르면, 그때 해당유저 길드id수정됨
    //관리로그에서 제외
    //코드 업데이트.
  }
}
