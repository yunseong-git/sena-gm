import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Guild, GuildDocument, GuildRole } from 'src/guild/schemas/guild.schema';
import { TestUser, TestUserDocument } from 'src/user/schemas/user.schema';
import { CreateGuildDto } from 'src/guild/dto/create-guild.dto';
import { nanoid } from 'nanoid';
import { GuildQueryService } from 'src/guild/services/guild-query.service';
import { guildCode } from '../controllers/guild-public.controller';
import { simpleResponse } from 'src/common/types/response.type';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GuildCommandService {
  constructor(
    //models
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
    //transaction을 위한 mongoose-connection
    @InjectConnection() private readonly connection: Connection,
    //inner-service
    private readonly guildQueryService: GuildQueryService,
    //outer-service
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) { }

  /** 길드 생성 (+reiu)*/
  async createGuild(createGuildDto: CreateGuildDto, user: TestUserDocument) {
    //************ fail-fast ************//
    // 1. 유저 사전 검증
    if (user.guild) {
      throw new ConflictException('이미 가입된 길드가 있습니다.');
    }

    //************ transaction-session ************//
    //랜덤 태그 생성&길드 풀네임 생성
    const randomTag = Math.floor(1000 + Math.random() * 9000); // 1000 ~ 9999
    const guildFullName = `${createGuildDto.name}#${randomTag}`;

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1 .길드생성
      const createdGuild = new this.guildModel({
        name: createGuildDto.name,
        tag: randomTag,
        members: [{ user_Id: user._id, role: GuildRole.MASTER }],
      });
      const savedGuild = await createdGuild.save({ session });

      // 2. 유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: {
            guild: {
              _id: savedGuild._id,
              name: guildFullName,
              role: GuildRole.MASTER, //길드 창설이므로 master가 맞음
            }
          }
        },
        { session },
      );

      await session.commitTransaction();

      //3. 토큰 재발급
      const newAccessToken = await this.authService.issueTokens(user);

      //4. return
      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      await session.abortTransaction(); //에러 시 재시작 없이 트랜잭션 종료
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 해산 (+refresh) */
  async dismissGuild(user: TestUserDocument): Promise<simpleResponse> {
    //************ Fail-Fast ************//
    // 1. 길드원이 존재함
    const guild_Id = user.guild!._id;
    const guild = await this.guildModel.findById(guild_Id);
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    if (guild.members.length > 1) {
      throw new BadRequestException('길드원이 존재합니다. 해산할 수 없습니다.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 길드 도큐먼트에서 길드원 삭제
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

      // 3. 길드 도큐먼트에서 길드 삭제(soft-delete)
      await this.guildModel.updateOne(
        { _id: guild_Id },
        { $set: { isDeleted: true } },
        { session }
      );

      await session.commitTransaction();

      //************ return ************//
      return { success: true }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////members////////////////////////////////

  /** 길드 가입(+refresh) */
  async joinGuild(code: string, user: TestUserDocument): Promise<simpleResponse> {

    //************ fail-fast ************//
    // 1. 유저 사전 검증
    if (user.guild) throw new ConflictException('이미 가입된 길드가 있습니다.');

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
              user_Id: user._id,
              role: GuildRole.MEMBER
            }
          }
        },
        { session }
      );

      //유저 도큐먼트에 반영
      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: {
            guild: {
              _id: guildToJoin._id,
              name: guildFullName,
              role: GuildRole.MEMBER,
            }
          }
        },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();

      //************ return ************//
      return { success: true }
    }
  }

  /** 길드원 추방 (+blacklist) */
  async kickMember(actor: TestUserDocument, target_Id: string): Promise<simpleResponse> {
    //typescript(컴파일시점): null able인데? vs guard(런타임시점): 이미 가드자체에서 검증함 -> !(not-null-assertion)
    const guild_Id = actor.guild!._id;

    //************ Fail-Fast ************//
    // 1. 본인 추방
    if (actor._id.equals(target_Id)) {
      throw new BadRequestException('자기 자신을 추방할 수 없습니다.');
    }

    // 2. 대상이 길드원이 아님
    await this.guildQueryService.targetIsMember(guild_Id.toString(), target_Id);

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 대상 길드원 추방
      await this.guildModel.updateOne(
        { _id: guild_Id },
        { $pull: { members: { user_Id: new Types.ObjectId(target_Id) } } },
        { session }
      );
      await this.userModel.updateOne(
        { _id: target_Id },
        { $unset: { guild: 1 } },
        { session }
      );

      await session.commitTransaction();

      // 3. 길드코드 재발행
      await this.generateGuildCode(guild_Id.toString())

      //************ blacklist ************//
      const tokenExpirySeconds = 900;
      await this.redis.set(
        `blacklist:${target_Id}`,
        'kicked',  //status
        'EX',
        tokenExpirySeconds
      );

      //************ return ************//
      return { success: true }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 탈퇴 (+refresh) */
  async leaveGuild(user: TestUserDocument): Promise<simpleResponse> {
    //************ Fail-Fast ************//
    // 1. 길마가 탈퇴하려함
    if (user.guild!.role === GuildRole.MASTER) {
      throw new BadRequestException('길드 마스터는 길드를 탈퇴할 수 없습니다. 먼저 마스터를 위임해주세요.');
    }

    //************ transaction-session ************//
    const guild_Id = user.guild!._id;
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
      await this.generateGuildCode(guild_Id.toString())

      //************ return ************//
      return { success: true }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////roles////////////////////////////////

  /** 길드 마스터 위임 (+blacklist, +refresh)*/
  async transferMaster(actor: TestUserDocument, target_Id: string): Promise<simpleResponse> {
    const guild_Id = actor.guild!._id;

    //************ Fail-Fast ************//
    //1. 자기 위임
    if (actor._id.equals(target_Id)) {
      throw new BadRequestException('자기 자신에게 마스터를 위임할 수 없습니다.');
    }

    //2. 타겟이 길드원 아님
    await this.guildQueryService.targetIsMember(guild_Id.toString(), target_Id);

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 기존 마스터(actor)를 부마스터로 강등
      await this.guildModel.updateOne(
        { _id: guild_Id, 'members.user_Id': actor._id }, { $set: { 'members.$.role': GuildRole.SUBMASTER } }, { session }
      );
      await this.userModel.updateOne(
        { _id: actor._id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session }
      );

      // 2. 새로운 마스터(target)로 승급
      await this.guildModel.updateOne(
        { _id: guild_Id, 'members.user_Id': target_Id }, { $set: { 'members.$.role': GuildRole.MASTER } }, { session }
      );
      await this.userModel.updateOne(
        { _id: target_Id }, { $set: { 'guild.role': GuildRole.MASTER } }, { session }
      );

      await session.commitTransaction();

      //************ blacklist ************//
      const tokenExpirySeconds = 900;
      await Promise.all([
        this.redis.set(`blacklist:${actor._id.toString()}`, 'role_changed', 'EX', tokenExpirySeconds),
        this.redis.set(`blacklist:${target_Id}`, 'role_changed', 'EX', tokenExpirySeconds)
      ]);

      //************ return ************//
      return { success: true }

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 부마스터 임명 (+blacklist) */
  async appointSubmaster(actor: TestUserDocument, target_Id: string): Promise<simpleResponse> {
    const guild_Id = actor.guild!._id;

    //************ Fail-Fast ************//
    // 1. 자기 임명
    if (actor._id.equals(target_Id)) {
      throw new BadRequestException('자기 자신을 부마스터로 임명할 수 없습니다.');
    }

    // 2. 대상이 길드원인지 확인
    await this.guildQueryService.targetIsMember(guild_Id.toString(), target_Id);

    // 3. 부마스터가 이미 있는지 확인
    const guild = await this.guildModel.findById(guild_Id);
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    const hasSubmaster = guild.members.some(member => member.role === GuildRole.SUBMASTER);
    if (hasSubmaster) {
      throw new ConflictException('부마스터는 한 명만 임명할 수 있습니다. 먼저 기존 부마스터를 해임하거나 위임해주세요.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 대상 유저를 부마스터로 승급
      await this.guildModel.updateOne(
        { _id: guild_Id, 'members.user_Id': target_Id }, { $set: { 'members.$.role': GuildRole.SUBMASTER } }, { session }
      );
      await this.userModel.updateOne(
        { _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session }
      );

      await session.commitTransaction();

      //************ return ************//
      return { success: true }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /** 길드 부마스터 위임 (+blacklist +refresh)*/
  async transferSubmaster(actor: TestUserDocument, target_Id: string): Promise<simpleResponse> {
    const guild_Id = actor.guild!._id;

    //************ Fail-Fast ************//
    // 1. 자기 위임
    if (actor._id.equals(target_Id)) {
      throw new BadRequestException('자기 자신에게 부마스터를 위임할 수 없습니다.');
    }
    // 2. 대상이 길드원 아님
    await this.guildQueryService.targetIsMember(guild_Id.toString(), target_Id);

    // 3. 대상이 마스터임
    await this.guildQueryService.targetIsMaster(guild_Id.toString(), target_Id);

    // 4. 현재 부마스터 없음
    const guild = await this.guildModel.findById(guild_Id);
    if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');

    const currentSubmaster = guild.members.find(member => member.role === GuildRole.SUBMASTER);
    if (!currentSubmaster) {
      throw new NotFoundException('위임할 부마스터가 존재하지 않습니다. 먼저 부마스터를 임명해주세요.');
    }

    //************ transaction-session ************//
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. 기존 부마스터를 일반 멤버로 강등
      await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': currentSubmaster.user_Id }, { $set: { 'members.$.role': GuildRole.MEMBER } }, { session });
      await this.userModel.updateOne({ _id: currentSubmaster.user_Id }, { $set: { 'guild.role': GuildRole.MEMBER } }, { session });

      // 2. 새로운 부마스터(target)로 승급
      await this.guildModel.updateOne({ _id: guild_Id, 'members.user_Id': target_Id }, { $set: { 'members.$.role': GuildRole.SUBMASTER } }, { session });
      await this.userModel.updateOne({ _id: target_Id }, { $set: { 'guild.role': GuildRole.SUBMASTER } }, { session });

      await session.commitTransaction();

      //************ return ************//
      return { success: true }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  ////////////////////////////////guild-code////////////////////////////////

  /** 길드 초대 코드 생성/갱신 */
  async generateGuildCode(guild_Id: string): Promise<guildCode> {
    // 10자리 길이의 URL-friendly 코드를 생성 (예: 'a4V-g8sX_1')
    const newCode = nanoid(10);

    // 길드 코드 업데이트 
    await this.guildModel.updateOne({ _id: guild_Id }, { $set: { code: newCode } });
    return { code: newCode };
  }
}