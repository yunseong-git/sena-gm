import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { nanoid } from 'nanoid';
import { AuthService } from '#src/auth/auth.service.js';
import { Tokens } from '#src/auth/types/token-response.type.js';
import { simpleResponse } from '#src/common/types/response.type.js';
import { RedisService } from '#src/redis/redis.service.js';
import { User } from '#src/user/schemas/user.schema.js';
import { guildCode } from '../controllers/guild-public.controller.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { Guild, GuildDocument, GuildRole } from '../schemas/guild.schema.js';
import { GuildQueryService } from './guild-query.service.js';
import { UserPayload } from '#src/auth/types/payload.type.js';

@Injectable()
export class GuildCommandService {
  constructor(
    //mongoose
    @InjectModel(Guild.name) private guildModel: mongoose.Model<GuildDocument>,
    @InjectModel(User.name) private userModel: mongoose.Model<UserPayload>,
    @InjectConnection() private readonly connection: mongoose.Connection, //for-transaction-session

    //inner-service
    private readonly guildQueryService: GuildQueryService,

    //outer-service
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) { }

  /** 길드 생성 (+토큰 재발행)*/
  async createGuild(createGuildDto: CreateGuildDto, user: UserPayload): Promise<Tokens> {
    //************ fail-fast ************//
    // 1. 유저 사전 검증
    if (user.guildId) {
      throw new ConflictException('이미 가입된 길드가 있습니다.');
    }

    //랜덤 태그 생성&길드 풀네임 생성
    const randomTag = Math.floor(1000 + Math.random() * 9000); // 1000 ~ 9999
    const guildFullName = `${createGuildDto.name}#${randomTag}`;

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1 .길드생성
      const createdGuild = new this.guildModel({
        name: createGuildDto.name,
        tag: randomTag,
        members: [{ user_Id: user.sub, role: GuildRole.MASTER }],
      });
      const savedGuild = await createdGuild.save({ session });

      // 2. 유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user.sub },
        {
          $set: {
            guild: {
              guildId: savedGuild._id,
              name: guildFullName,
              role: GuildRole.MASTER, //길드 창설이므로 master가 맞음
            }
          }
        },
        { session },
      );

      await session.commitTransaction();

      //************ stateless ************//
      const newTokens = await this.authService.issueTokens(user);
      return newTokens
    } catch (error) {
      await session.abortTransaction(); //에러 시 재시작 없이 트랜잭션 종료
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 해산 (+토큰 재발행) */
  async dismissGuild(user: UserPayload): Promise<Tokens> {

    //************ Fail-Fast (Optimized) ************//
    // 1. 다른 길드원이 존재하는지 여부만 '가볍게' 확인
    const hasOtherMembers = await this.guildModel.exists({
      _id: user.guildId,
      'members.1': { $exists: true },
    });

    if (hasOtherMembers) {
      throw new BadRequestException('마스터 외에 다른 길드원이 존재하여 해산할 수 없습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 유저 도큐먼트에 길드 정보 초기화
      await this.userModel.updateOne(
        { _id: user.sub },
        { $unset: { guild: 1 } },
        { session }
      );

      // 2. 길드 도큐먼트 삭제(soft-delete)
      // 어차피 길드 전체가 비활성화되므로, 마지막 남은 멤버를 굳이 $pull 할 필요는 없습니다.
      await this.guildModel.updateOne(
        { _id: user.guildId },
        { $set: { isDeleted: true } },
        { session }
      );
      await session.commitTransaction();

      //************ stateless ************//
      const newTokens = await this.authService.issueTokens(user);

      return newTokens;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////members////////////////////////////////

  /** 길드 가입(+토큰 재발행) */
  async joinGuild(code: string, user: UserPayload): Promise<Tokens> {
    //************ fail-fast ************//
    // 1. 유저 사전 검증
    if (user.guildId) throw new ConflictException('이미 가입된 길드가 있습니다.');

    // 2. 초대 코드로 길드 확인
    const guildToJoin = await this.guildQueryService.findGuildByCode(code);

    //************ transaction-session ************//
    const guildFullName = `${guildToJoin.name}#${guildToJoin.tag}`;
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      //길드에 멤버 추가
      await this.guildModel.updateOne(
        { _id: guildToJoin._id },
        {
          $addToSet: {
            members: {
              user_Id: user.sub,
              role: GuildRole.MEMBER
            }
          }
        },
        { session }
      );

      //유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user.sub },
        {
          $set: {
            guild: {
              guildId: guildToJoin._id,
              name: guildFullName,
              role: GuildRole.MEMBER,
            }
          }
        },
        { session },
      );

      await session.commitTransaction();

      //************ stateless ************//
      const newTokens = await this.authService.issueTokens(user);
      return newTokens;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드원 추방 (+blacklist) */
  async kickMember(actor: UserPayload, target_Id: string): Promise<simpleResponse> {
    const guild_Id = actor.guildId!
    const actor_Id = actor.sub
    const target = new mongoose.Types.ObjectId(target_Id);


    //************ Fail-Fast ************//
    if (actor.sub == target_Id) {
      throw new BadRequestException('자기 자신을 추방할 수 없습니다.');
    }
    const targetIsMember = await this.guildQueryService.targetIsMember(actor.guildId, target); // ObjectId를 그대로 전달
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.guildModel.updateOne(
        { _id: guild_Id },
        { $pull: { members: { user_Id: target } } }, // new Types.ObjectId() 변환 제거
        { session }
      );
      await this.userModel.updateOne(
        { _id: target }, // ObjectId를 그대로 사용
        { $unset: { guild: 1 } },
        { session }
      );
      await session.commitTransaction();

      //************ stateless ************//
      await this.generateGuildCode(actor.guildId);
      await this.redisService.blacklistUser(target);

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


  /** 길드 탈퇴 (+refresh) */
  async leaveGuild(user: UserPayload): Promise<Tokens> {
    //************ Fail-Fast ************//
    // 1. 길마가 탈퇴하려함
    if (user.guild!.role === GuildRole.MASTER) {
      throw new BadRequestException('길드 마스터는 길드를 탈퇴할 수 없습니다. 먼저 마스터를 위임해주세요.');
    }

    //************ transaction-session ************//
    const guild_Id = user.guild!.guildId
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 길드 도큐먼트에서 멤버 삭제(updateOne - $pull)
      await this.guildModel.updateOne(
        { _id: guild_Id },
        { $pull: { members: { user_Id: user._id } } },
        { session }
      );

      // 2. 유저 도큐먼트에 길드 정보 초기화
      await this.userModel.updateOne(
        { _id: user._id },
        { $unset: { guild: 1 } },
        { session }
      );

      await session.commitTransaction();

      // 3. 길드 코드 재발행
      await this.generateGuildCode(guild_Id)

      const tokens = await this.authService.issueTokens(user);

      //************ return ************//
      return tokens
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////roles////////////////////////////////

  /** 길드 마스터 위임 (target = blacklist, actor = 토큰 재발행)*/
  async transferMaster(actor: UserPayload, target_Id: string): Promise<Tokens> {
    const guild_Id = actor.guild!.guildId
    const target = new mongoose.Types.ObjectId(target_Id);
    //************ Fail-Fast ************//
    //1. 자기 위임
    if (actor._id.equals(target)) {
      throw new BadRequestException('자기 자신에게 마스터를 위임할 수 없습니다.');
    }

    //2. 타겟이 길드원 아님
    const targetIsMember = await this.guildQueryService.targetIsMember(guild_Id, target);
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 기존 마스터(actor)를 멤버로 강등
      await this.guildModel.updateOne(
        { _id: guild_Id, 'members.user_Id': actor._id }, { $set: { 'members.$.role': GuildRole.MEMBER } }, { session }
      );
      const updateResultactor = await this.userModel.updateOne(
        { _id: actor._id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session }
      );

      // 2. 새로운 마스터(target)로 승급
      await this.guildModel.updateOne(
        { _id: guild_Id, 'members.user_Id': target }, { $set: { 'members.$.role': GuildRole.MASTER } }, { session }
      );
      const updateResulttarget = await this.userModel.updateOne(
        { _id: target }, { $set: { 'guild.role': GuildRole.MASTER } }, { session }
      );

      await session.commitTransaction();

      //************ stateless ************//
      await this.redisService.blacklistUser(target);
      const tokens = await this.authService.issueTokens(actor);

      //************ return ************//
      return tokens

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


  /** 길드 부마스터 위임 (분리된 로직) */
  async setSubmaster(actor: UserPayload, target_Id: string): Promise<Tokens | simpleResponse> {
    const guild_Id = actor.guild!.guildId
    const target = new mongoose.Types.ObjectId(target_Id);

    // --- 1. 공통 Fail-Fast 검증 ---
    if (actor._id.equals(target)) {
      throw new BadRequestException('자기 자신에게 부마스터를 위임할 수 없습니다.');
    }
    const targetIsMember = await this.guildQueryService.targetIsMember(guild_Id, target);
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }
    const targetIsMaster = await this.guildQueryService.targetIsMaster(guild_Id, target);
    if (targetIsMaster) {
      throw new BadRequestException('길드마스터는 부마스터로 위임할 수 없습니다.');
    }

    // --- 2. 행위자의 역할에 따라 다른 헬퍼 함수 호출 ---
    if (actor.guild!.role === GuildRole.MASTER) {
      return this._handleSubmasterTransferByMaster(guild_Id, target);
    } else if (actor.guild!.role === GuildRole.SUBMASTER) {
      return this._handleSubmasterTransferBySubmaster(actor, target);
    } else {
      throw new ForbiddenException('권한이 없습니다.'); // GuildGuard가 막아주겠지만, 방어 코드로 추가
    }
  }

  /** [Private] 마스터가 부마스터를 위임 */
  private async _handleSubmasterTransferByMaster(guild_Id: mongoose.Types.ObjectId, target_Id: mongoose.Types.ObjectId): Promise<simpleResponse> {
    const guild = await this.guildModel.findById(guild_Id);
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');
    const currentSubmaster = guild.members.find(member => member.role === GuildRole.SUBMASTER);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 기존 부마스터가 있다면 멤버로 강등
      if (currentSubmaster) {
        await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': currentSubmaster.user_Id }, { $set: { 'members.$.role': GuildRole.MEMBER } }, { session });
        await this.userModel.updateOne({ _id: currentSubmaster.user_Id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session });
      }
      // 새 부마스터 임명
      await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': target_Id }, { $set: { 'members.$.role': GuildRole.SUBMASTER } }, { session });
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session });

      await session.commitTransaction();

      // 블랙리스트 처리
      if (currentSubmaster) {
        await this.redisService.blacklistUser(currentSubmaster.user_Id.toString());
      }
      await this.redisService.blacklistUser(target_Id);

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** [Private] 부마스터가 다른 멤버에게 부마스터를 위임 (자신은 멤버로 강등) */
  private async _handleSubmasterTransferBySubmaster(actor: UserPayload, target_Id: mongoose.Types.ObjectId): Promise<Tokens> {
    const guild_Id = actor.guild!.guildId

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 기존 부마스터(actor)를 멤버로 강등
      await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': actor._id }, { $set: { 'members.$.role': GuildRole.MEMBER } }, { session });
      await this.userModel.updateOne({ _id: actor._id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session });

      // 2. 새로운 부마스터(target)로 승급
      await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': target_Id }, { $set: { 'members.$.role': GuildRole.SUBMASTER } }, { session });
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session });
      // actor의 userModel 업데이트는 issueTokens 전에 최신 정보를 불러올 것이므로 여기서 생략 가능

      await session.commitTransaction();
      await this.redisService.blacklistUser(target_Id);

      const newTokens = await this.authService.issueTokens(actor);
      return newTokens;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////guild-code////////////////////////////////

  /** 길드 초대 코드 생성/갱신 */
  async generateGuildCode(guild_Id: mongoose.Types.ObjectId): Promise<guildCode> {
    // 10자리 길이의 URL-friendly 코드를 생성 (예: 'a4V-g8sX_1')
    const newCode = nanoid(10);

    // 길드 코드 업데이트 
    await this.guildModel.updateOne({ _id: guild_Id }, { $set: { code: newCode } });

    return { code: newCode };
  }
}