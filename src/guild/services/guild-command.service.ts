import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { AuthService } from '#src/auth/auth.service.js';
import { simpleResponse } from '#src/common/types/response.type.js';
import { RedisService } from '#src/redis/redis.service.js';
import { User, UserDocument } from '#src/user/profile/schemas/user.schema.js';
import { guildCode } from '../types/guild.type.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { Guild, GuildDocument, GuildRole } from '../schemas/guild.schema.js';
import { GuildQueryService } from './guild-query.service.js';
import { UserPayload } from '#src/auth/types/payload.type.js';
import { TokensWithPayload } from '#src/auth/types/token-response.type.js';

@Injectable()
export class GuildCommandService {
  constructor(
    //mongoose
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection, //for-transaction-session

    //inner-service
    private readonly guildQueryService: GuildQueryService,

    //outer-service
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) { }

  /** 길드 생성 (+토큰 재발행)*/
  async createGuild(createGuildDto: CreateGuildDto, user: UserPayload): Promise<TokensWithPayload> {
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
        members: [{ user_Id: user.id, role: GuildRole.MASTER }],
      });
      const savedGuild = await createdGuild.save({ session });

      // 2. 유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user.id },
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
      const newTokensWithPayload = await this.authService.issueTokens(user);
      return newTokensWithPayload
    } catch (error) {
      await session.abortTransaction(); //에러 시 재시작 없이 트랜잭션 종료
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 해산 (+토큰 재발행) */
  async dismissGuild(user: UserPayload): Promise<TokensWithPayload> {

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
        { _id: user.id },
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
      const newTokensWithPayload = await this.authService.issueTokens(user);

      return newTokensWithPayload;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////members////////////////////////////////

  /** 길드 가입(+토큰 재발행) */
  async joinGuild(code: string, user: UserPayload): Promise<TokensWithPayload> {
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
            members: user.id
          }
        },
        { session }
      );

      //유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user.id },
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
      const newTokensWithPayload = await this.authService.issueTokens(user);
      return newTokensWithPayload;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드원 추방 (+blacklist) */
  async kickMember(actor: UserPayload, target_Id: string): Promise<simpleResponse> {
    const guildId = actor.guildId!
    const target = new Types.ObjectId(target_Id); //objectId로 변환

    //************ Fail-Fast ************//
    // 1. 자기 추방
    if (actor.id.equals(target)) {
      throw new BadRequestException('자기 자신을 추방할 수 없습니다.');
    }

    const guildInfo = await this.guildModel.findById(guildId).select('master submaster members').lean().exec();

    if (!guildInfo) {
      throw new NotFoundException('길드를 찾을 수 없습니다.');
    }

    // 2. 대상이 멤버 배열에 있는지 확인
    const targetIsMember = guildInfo.members.some(memberId => memberId.equals(target));
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }

    // 3. 대상이 마스터인지 확인
    if (guildInfo.master.equals(target)) {
      throw new BadRequestException('길드마스터는 추방할 수 없습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.guildModel.updateOne(
        { _id: guildId },
        { $pull: { members: target } },
        { session }
      );
      await this.userModel.updateOne(
        { _id: target },
        { $unset: { guild: 1 } },
        { session }
      );
      await session.commitTransaction();

      //************ stateless ************//
      await this.generateGuildCode(guildId);
      await this.redisService.setRefreshList(target);

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


  /** 길드 탈퇴 (+refresh) */
  async leaveGuild(user: UserPayload): Promise<TokensWithPayload> {
    //************ Fail-Fast ************//
    // 1. 길마가 탈퇴하려함
    if (user.guildRole === GuildRole.MASTER) {
      throw new BadRequestException('길드 마스터는 길드를 탈퇴할 수 없습니다. 먼저 마스터를 위임해주세요.');
    }

    //************ transaction-session ************//
    const guildId = user.guildId!
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 길드 도큐먼트에서 멤버 삭제(updateOne - $pull)
      await this.guildModel.updateOne(
        { _id: guildId },
        { $pull: { members: user.id } },
        { session }
      );

      // 2. 유저 도큐먼트에 길드 정보 초기화
      await this.userModel.updateOne(
        { _id: user.id },
        { $unset: { guild: 1 } },
        { session }
      );

      await session.commitTransaction();

      // 3. 길드 코드 재발행
      await this.generateGuildCode(guildId)
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
  async transferMaster(actor: UserPayload, target_Id: string): Promise<TokensWithPayload> {
    const guildId = actor.guildId!
    const target = new Types.ObjectId(target_Id);
    //************ Fail-Fast ************//
    //1. 자기 위임
    if (actor.id.equals(target)) {
      throw new BadRequestException('자기 자신에게 마스터를 위임할 수 없습니다.');
    }

    //2. 타겟이 길드원 아님
    const targetIsMember = await this.guildQueryService.targetIsMember(guildId, target);
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Guild: master 필드 변경
      await this.guildModel.updateOne(
        { _id: guildId }, { $set: { master: target } }, { session }
      );

      // 2. User: 각각 길드 역할 변경
      await this.userModel.updateOne(
        { _id: actor.id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session }
      );
      await this.userModel.updateOne(
        { _id: target }, { $set: { 'guild.role': GuildRole.MASTER } }, { session }
      );

      await session.commitTransaction();

      //************ stateless ************//
      await this.redisService.setRefreshList(target);
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
  async setSubmaster(actor: UserPayload, target_Id: string) {
    const guildId = actor.guildId!
    const target = new Types.ObjectId(target_Id);

    //************ Fail-Fast ************//
    //1. 자기 위임
    if (actor.id.equals(target)) {
      throw new BadRequestException('자기 자신에게 부마스터를 위임할 수 없습니다.');
    }
    const guildInfo = await this.guildModel.findById(guildId).select('master submaster members').lean().exec();

    if (!guildInfo) {
      throw new NotFoundException('길드를 찾을 수 없습니다.');
    }

    // 2. 대상이 멤버 배열에 있는지 확인
    const targetIsMember = guildInfo.members.some(memberId => memberId.equals(target));
    if (!targetIsMember) {
      throw new BadRequestException('대상이 길드에 소속되어 있지 않습니다.');
    }

    // 3. 대상이 마스터인지 확인
    if (guildInfo.master.equals(target)) {
      throw new BadRequestException('길드마스터는 추방할 수 없습니다.');
    }

    //************ call helper ************//
    if (actor.guildRole === GuildRole.MASTER) {
      return await this._handleSubmasterTransferByMaster(guildId, target, guildInfo.submaster);
    } else if (actor.guildRole === GuildRole.SUBMASTER) {
      return await this._handleSubmasterTransferBySubmaster(actor, target);
    } else {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  /** [Private] 마스터가 부마스터를 위임 */
  private async _handleSubmasterTransferByMaster(guildId: Types.ObjectId, target_Id: Types.ObjectId, currentSubmaster: Types.ObjectId | null | undefined) {

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Guild: submaster 변경
      await this.guildModel.updateOne({ _id: guildId }, { $set: { submaster: target_Id } }, { session });

      // 2. User: 기존 submaster 존재시 변경
      if (currentSubmaster) {
        await this.userModel.updateOne({ _id: currentSubmaster }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session });
      }
      // 3. User: 타겟 guild role 변경
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session });

      await session.commitTransaction();

      //************ stateless ************//
      if (currentSubmaster) {
        await this.redisService.setRefreshList(currentSubmaster);
      }
      await this.redisService.setRefreshList(target_Id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** [Private] 부마스터가 다른 멤버에게 부마스터를 위임 (자신은 멤버로 강등) */
  private async _handleSubmasterTransferBySubmaster(actor: UserPayload, target_Id: Types.ObjectId): Promise<TokensWithPayload> {
    const guildId = actor.guildId!

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Guild: submaster 변경
      await this.guildModel.updateOne({ _id: guildId }, { $set: { submaster: target_Id } }, { session });
      // 2. User: actor guildRole 변경
      await this.userModel.updateOne({ _id: actor.id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session });
      // 3. User: target guildRole 변경
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session });

      await session.commitTransaction();

      //************ stateless ************//
      //1. target은 RefreshList
      await this.redisService.setRefreshList(target_Id);
      //2. actor는 토큰 재발행
      const newTokensWithPayload = await this.authService.issueTokens(actor);

      return newTokensWithPayload;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////guild-code////////////////////////////////

  /** 길드 초대 코드 생성/갱신 */
  async generateGuildCode(guildId: Types.ObjectId): Promise<guildCode> {
    // 10자리 길이의 URL-friendly 코드를 생성 (예: 'a4V-g8sX_1')
    const newCode = nanoid(10);

    // 길드 코드 업데이트 
    await this.guildModel.updateOne({ _id: guildId }, { $set: { code: newCode } });

    return { code: newCode };
  }
}