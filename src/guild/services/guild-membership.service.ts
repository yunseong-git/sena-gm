import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Connection } from 'mongoose';
//services
import { JoinGuildDto } from '../dto/req/join-guild.dto';
import { Guild, GUILD_ROLE_ENUM, GuildDocument } from '../schemas/guild.schema';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { RedisService } from '../../redis/redis.service';
import { UserGuildService } from '../../user/services/user-guild.service';
import { UserService } from '../../user/services/user.service';

/**길드 개인별 인원변동 관련 서비스 */
@Injectable()
export class GuildMemberShipService {
    constructor(
        // -- about DB --
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
        @InjectConnection() private readonly connection: Connection,
        // -- outer service --
        private readonly userGuildService: UserGuildService,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
    ) { }

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

            //todo: 멀티디바이스 같은 경우 void this.redisService.safeSet(user.id)

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    /** 유저 탈퇴 */
    async leave(user: UserPayload) {
        // --- strict fail fast ---
        const guild = await this.guildModel.findById(user.guildId, { master: 1, submaster: 1 });

        if (!guild) throw new NotFoundException('길드 정보를 찾을 수 없습니다.');

        // 마스터 탈퇴 방지
        if (guild.master.equals(user.id)) {
            throw new BadRequestException('길드마스터는 길드를 탈퇴할 수 없습니다. 먼저 마스터를 위임해주세요.');
        }

        // 쿼리 구성 Transaction
        const updateQuery: any = {
            $pull: {
                members: user.id,
                managers: user.id // 매니저 아니어도 에러 안 나므로 안전
            }
        };

        // [핵심 수정] 토큰(user.role)이 아니라 DB(guild.submaster)를 보고 판단
        // "지금 DB에 기록된 부마스터가 나라면" -> 삭제
        if (guild.submaster && guild.submaster.equals(user.id)) {
            updateQuery.$unset = { submaster: 1 };
        }
        // --- transaction ---
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // --- feat.guild ---
            await this.guildModel.updateOne(
                { _id: user.guildId },
                updateQuery,
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

            //todo: 멀티디바이스 같은 경우 void this.redisService.safeSet(user.id)

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
            throw new BadRequestException('길드마스터를 추방할 수 없습니다.');

        if (!target.guildId || !target.guildId.equals(actor.guildId)) {
            throw new BadRequestException('해당 길드에 소속된 유저가 아닙니다.');
        }

        const updateQuery: any = {
            $pull: {
                members: targetId,
                managers: targetId
            }
        };

        // [Guild] 서브마스터였다면 필드 제거 ($unset)
        if (target.guildRole === GUILD_ROLE_ENUM.SUBMASTER) {
            updateQuery.$unset = { submaster: 1 };
        }

        // --- transaction ---
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // --- feat.guild ---
            const updateResult = await this.guildModel.updateOne(
                { _id: actor.guildId },
                updateQuery,
                { session }
            );

            if (updateResult.modifiedCount === 0)
                throw new NotFoundException('길드를 찾을 수 없습니다.')

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

            // --- strict redis set ---
            await this.redisService.setOrThrow(targetId);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}