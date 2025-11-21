import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Connection } from 'mongoose';
import { nanoid } from 'nanoid';
import { simpleResponse } from '#src/common/types/response.type.js';
import { RedisService } from '#src/redis/redis.service.js';
import { guildCode } from '../types/guild.type.js';
import { CreateGuildDto } from '../dto/create-guild.dto.js';
import { Guild, GuildDocument, GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { GuildQueryService } from './guild-query.service.js';
import { TokensWithPayload, UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { UserService } from '#src/user/services/user.service.js';
import { UserGuildService } from '#src/user/services/user-guild.service.js';
import { Counter, CounterDocument } from '#src/common/schemas/counter.schema.js';
import { JoinGuildDto } from '../dto/req/join-guild.dto.js';
import { Type } from 'class-transformer';
import { equals, Equals } from 'class-validator';

@Injectable()
export class GuildCommandService {
  constructor(
    // -- about DB --
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    @InjectConnection() private readonly connection: Connection, //for-transaction-session
    // -- inner service --
    private readonly guildQueryService: GuildQueryService,
    // -- outer service --
    private readonly redisService: RedisService,
    private readonly userGuildService: UserGuildService,
    private readonly userService: UserService
  ) { }

  /** 길드 생성(not throw logic, 이중 fail-fast용 쿼리 필요) */
  async create(user: UserPayload, dto: CreateGuildDto): Promise<GuildDocument> {
    // --- fail fast --- 
    const userinfo = await this.userService.findById(user.id);
    if (userinfo.guildId) throw new ConflictException('이미 길드정보가 존재합니다. 탈퇴 또는 해산 후 다시 시도해주세요.');

    // --- counter ---
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'guild_tag' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tag = counter.seq;

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild ---
      const newGuild = new this.guildModel({
        ...dto,
        tag,
        master: user.id,
        members: [user.id],
        managers: [],
      });

      const savedGuild = await newGuild.save({ session });

      // --- feat.user ---
      await this.userGuildService.updateGuildInfo(
        user.id,
        {
          guildId: savedGuild._id,
          guildRole: GUILD_ROLE_ENUM.MASTER,
        },
        session,
      );
      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(user.id);

      return savedGuild;
    } catch (error) {
      await session.abortTransaction();
      // 여기서 실패해도 카운터는 이미 올라갔으므로 '번호 구멍'이 생김 (노상관)
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 가입(not throw logic, 이중 fail-fast용 쿼리 필요) */
  async join(user: UserPayload, dto: JoinGuildDto) {
    // --- fail fast ---
    const dbUser = await this.userService.findById(user.id);
    if (dbUser.guildId) {
      throw new ConflictException('이미 길드정보가 존재합니다. 탈퇴 또는 해산 후 다시 시도해주세요.');
    }

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild ---
      // findOneAndUpdate를 사용하여 "조건 확인 + 업데이트"를 한방에 처리
      const updatedGuild = await this.guildModel.findOneAndUpdate(
        {
          code: dto.code, // 코드가 일치하고
          $expr: { $lt: [{ $size: '$members' }, 30] }, // 멤버가 30명 미만인 경우에만
        },
        {
          $addToSet: { members: user.id }, // 중복 없이 추가
        },
        { session, new: true },
      );

      // 실패 원인 분석 (업데이트가 안 됐다면 왜 안 되었냐?)
      if (!updatedGuild) {
        // 코드가 틀렸거나 OR 정원이 꽉 찼거나 둘 중 하나
        const guild = await this.guildModel.findOne({ code: dto.code }).session(session);

        if (!guild) {
          throw new NotFoundException('유효하지 않은 초대 코드입니다.');
        }
        if (guild.members.length >= 30) {
          throw new ConflictException('길드 정원이 가득 찼습니다.');
        }
        // 여기까지 올 일은 거의 없지만 최종 방어 코드
        throw new InternalServerErrorException('길드 가입에 실패했습니다.');
      }

      // --- feat.user ---
      await this.userGuildService.updateGuildInfo(
        user.id,
        {
          guildId: updatedGuild._id,
          guildRole: GUILD_ROLE_ENUM.MEMBER, // 일반 멤버로 시작
        },
        session,
      );

      await session.commitTransaction();

      // --- fire forget ---
      void this.redisService.safeSet(user.id);

      return updatedGuild;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 해산(throw logic, 이중 fail-fast 쿼리 필요 없음) */
  async dismiss(user: UserPayload) {
    // --- fail fast ---
    //본인만 남은 상태인지 확인
    const hasOtherMembers = await this.guildModel.exists({
      _id: user.guildId,
      'members.1': { $exists: true },
    });

    if (hasOtherMembers) {
      throw new BadRequestException('마스터 외에 다른 길드원이 존재하여 해산할 수 없습니다.');
    }

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild ---
      const updateResult = await this.guildModel.updateOne({
        _id: user.guildId,
        master: user.id,
      },
        {
          $set: { isDeleted: true }, //soft-delete
        },
        { session },
      )

      if (updateResult.modifiedCount === 0) {
        throw new NotFoundException('길드를 찾을 수 없거나 권한이 없습니다.');
      }

      // --- feat.user ---
      await this.userGuildService.updateGuildInfo(
        user.id,
        {
          guildId: null,
          guildRole: null,
        },
        session,
      )

      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(user.id);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 유저 탈퇴(throw logic, 이중 fail-fast 쿼리 필요 없음) */
  async leave(user: UserPayload) {
    // --- fail fast ---
    if (user.guildRole === GUILD_ROLE_ENUM.MASTER)
      throw new BadRequestException('길드마스터는 길드를 탈퇴할 수 없습니다. 먼저 마스터를 위임해주세요.');

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild ---
      await this.guildModel.updateOne(
        { _id: user.guildId },
        { $pull: { members: user.id } },
        { session }
      );

      // --- feat.user ---
      await this.userGuildService.updateGuildInfo(
        user.id,
        {
          guildId: null,
          guildRole: null,
        },
        session,
      )

      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(user.id);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 유저 추방(throw logic, 이중 fail-fast 쿼리 필요 없음) */
  async kickMember(actor: UserPayload, targetId: Types.ObjectId) {
    // --- fail fast ---
    if (actor.id.equals(targetId))
      throw new BadRequestException('자기 자신을 추방할 수 없습니다.')

    const target = await this.userService.findById(targetId)
    if (target.guildRole === GUILD_ROLE_ENUM.MASTER) //최종 보루
      throw new BadRequestException('길드마스터는 추방할 수 없습니다.');

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild ---
      const updateResult = await this.guildModel.updateOne(
        { _id: actor.guildId },
        { $pull: { members: targetId } },
        { session }
      );

      if (updateResult.modifiedCount === 0)
        throw new NotFoundException('길드를 찾을 수 없거나. 해당 유저가 길드에 소속되어있지 않습니다')

      // --- feat.user ---
      await this.userGuildService.updateGuildInfo(
        targetId,
        {
          guildId: null,
          guildRole: null,
        },
        session,
      )
      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(targetId);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 마스터 위임 (throw logic, 이중 fail-fast 쿼리 필요 없음), 부마스터에게만 가능 */
  async transferMaster(actor: UserPayload, targetId: Types.ObjectId) {
    // --- fail fast ---
    if (actor.id.equals(targetId)) {
      throw new BadRequestException('자기 자신에게 마스터를 위임할 수 없습니다.');
    }

    //타겟 검사
    const target = await this.userService.findById(targetId)

    if (target.guildId !== actor.guildId || target.guildRole !== GUILD_ROLE_ENUM.SUBMASTER)
      throw new BadRequestException('대상이 동일길드가 아니거나 부마스터가 아닙니다.');

    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // --- feat.guild: 마스터 필드 변경 ---
      await this.guildModel.updateOne(
        { _id: actor.guildId }, { $set: { master: targetId } }, { session }
      );

      // --- feat.user: 유저 길드 필드 변경(행위자, 타겟) ---
      await this.userGuildService.updateGuildInfo(
        actor.id,
        {
          guildId: actor.guildId,
          guildRole: GUILD_ROLE_ENUM.SUBMASTER,
        },
        session,
      )

      await this.userGuildService.updateGuildInfo(
        targetId,
        {
          guildId: target.guildId,
          guildRole: GUILD_ROLE_ENUM.MASTER,
        },
        session,
      )
      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(targetId);
      void this.redisService.safeSet(actor.id);

      //************ return ************//

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async setManager(actor: UserPayload, targetId: Types.ObjectId) {
    // --- fail fast ---
    const target = await this.userService.findById(targetId)
    if (target.guildId !== actor.guildId) {
      throw new BadRequestException('대상이 동일길드가 아닙니다.');
    }
    if (target.guildRole === GUILD_ROLE_ENUM.MASTER || target.guildRole === GUILD_ROLE_ENUM.SUBMASTER || target.guildRole === GUILD_ROLE_ENUM.MANAGER) {
      throw new BadRequestException('대상을 매니저로 지정할 수 없습니다')
    }
    // --- transaction ---
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // --- feat.guild: manger 배열필드에 추가 --- 
      const updateResult = await this.guildModel.updateOne(
        {
          _id: actor.guildId,
          $expr: { $lt: [{ $size: '$managers' }, 3] }
        },
        { $addToSet: { managers: targetId } },
        { session }
      );

      if (updateResult.modifiedCount === 0)
        throw new NotFoundException('길드를 찾을 수 없거나, 매니저가 이미 3명입니다.')

      // --- feat.user: guild 필드 수정 ---
      await this.userGuildService.updateGuildInfo(
        targetId,
        {
          guildId: target.guildId,
          guildRole: GUILD_ROLE_ENUM.MANAGER,
        },
        session,
      )

      await session.commitTransaction();

      // --- fire-forget ---
      void this.redisService.safeSet(targetId);

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 부마스터 위임 (분리된 로직) */
  async setSubmaster(actor: UserPayload, targetId: Types.ObjectId) {
    //************ Fail-Fast ************//
    if (actor.id.equals(targetId)) {
      throw new BadRequestException('자기 자신에게 위임할 수 없습니다.');
    }

    const target = await this.userService.findById(targetId)

    if (target.guildId !== actor.guildId) {
      throw new BadRequestException('대상이 동일길드가 아닙니다.');
    }
    if (target.guildRole !== GUILD_ROLE_ENUM.MANAGER) {
      throw new BadRequestException('대상이 매니저가 아닙니다.');
    }

    if (actor.guildRole === GUILD_ROLE_ENUM.MASTER) {
      return await this._handleSubmasterTransferByMaster(guildId, targetId, guildInfo.submaster);
      //타겟이 길드원인지, 타겟이 길드인지, 타겟이 서
    } else if (actor.guildRole === GUILD_ROLE_ENUM.SUBMASTER) {
      return await this._handleSubmasterTransferBySubmaster(actor, targetId);
      //타겟이 길드원인지, 타겟이 마스터인지, 서브마스터가-매니져한테 하는지, 멤버한테 하는지
    } else {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  /** [Private] 마스터가 부마스터를 위임 */
  private async _handleSubmasterTransferByMaster(guildId: Types.ObjectId, target_Id: Types.ObjectId, currentSubmaster: Types.ObjectId | null | undefined) {

    // --- trasn
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Guild: submaster 변경
      await this.guildModel.updateOne({ _id: guildId }, { $set: { submaster: target_Id } }, { session });

      // 2. User: 기존 submaster 존재시 변경
      if (currentSubmaster) {
        await this.userModel.updateOne({ _id: currentSubmaster }, { $set: { 'guild.role': GUILD_ROLE_ENUM.MEMBER } }, { session });
      }
      // 3. User: 타겟 guild role 변경
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GUILD_ROLE_ENUM.SUBMASTER } }, { session });

      await session.commitTransaction();

      //************ stateless ************//
      if (currentSubmaster) {
        await this.redisService.safeSet(currentSubmaster);
      }
      await this.redisService.safeSet(target_Id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** [Private] 부마스터가 다른 멤버에게 부마스터를 위임 (자신은 멤버로 강등) */
  private async _handleSubmasterTransferBySubmaster(actor: UserPayload, targetId: Types.ObjectId): Promise<TokensWithPayload> {
    const guildId = actor.guildId!

    if (targetId)

      const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Guild: submaster 변경
      await this.guildModel.updateOne({ _id: guildId }, { $set: { submaster: target_Id } }, { session });
      // 2. User: actor GUILD_ROLE_ENUM 변경
      await this.userModel.updateOne({ _id: actor.id }, { $set: { 'guild.role': GUILD_ROLE_ENUM.MEMBER } }, { session });
      // 3. User: target GUILD_ROLE_ENUM 변경
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GUILD_ROLE_ENUM.SUBMASTER } }, { session });

      await session.commitTransaction();

      //************ stateless ************//
      //1. target은 StatePatchList
      await this.redisService.safeSet(target_Id);
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

  // --- invite ---

  /** 길드 초대 코드 생성/갱신 */
  async generateGuildCode(guildId: Types.ObjectId) {
    // 9자리 길이의 URL-friendly 코드를 생성 (예: 'a4V-g8sX_1')
    const newCode = nanoid(9);

    // 길드 코드 업데이트 
    await this.guildModel.updateOne({ _id: guildId }, { $set: { code: newCode } });

    return { code: newCode };
  }

  async createInviteUrl(code: string) {

  }


}