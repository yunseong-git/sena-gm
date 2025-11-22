import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, InternalServerErrorException, ImATeapotException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Connection } from 'mongoose';
import { Guild, GuildDocument, GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { RedisService } from '#src/redis/redis.service.js';
import { UserPayload } from '#src/auth/interfaces/token-payload.interface.js';
import { UserService } from '#src/user/services/user.service.js';
import { UserGuildService } from '#src/user/services/user-guild.service.js';

//길드 
@Injectable()
export class GuildRoleService {
    constructor(
        // -- about DB --
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
        @InjectConnection() private readonly connection: Connection, //for-transaction-session
        // -- outer service --
        private readonly userGuildService: UserGuildService,
        private readonly userService: UserService,
        private readonly redisService: RedisService
    ) { }

    /** 길드 마스터 위임 (throw logic, 이중 fail-fast 쿼리 필요 없음), 부마스터에게만 가능 */
    async setMaster(actor: UserPayload, targetId: Types.ObjectId) {
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

            // --- strict set ---
            await this.redisService.setOrThrow(targetId)
            //todo: 멀티디바이스 -> void this.redisService.safeSet(actor.id)

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
            // --- strict redis set ---
            await this.redisService.setOrThrow(targetId)

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /** 길드 부마스터 위임 (target = 매니저만 가능) */
    async setSubmaster(actor: UserPayload, targetId: Types.ObjectId) {
        // --- fail fast : 자기위임, 매니저만가능 ---
        if (actor.id.equals(targetId)) { // actor.id -> actor.userId (Payload 타입 확인 필요)
            throw new BadRequestException('자기 자신에게 위임할 수 없습니다.');
        }
        const guild = await this.guildModel.findById(actor.guildId);
        if (!guild) throw new NotFoundException('길드를 찾을 수 없습니다.');


        const isTargetManager = guild.managers.some(id => id.equals(targetId));
        if (!isTargetManager) {
            throw new BadRequestException('부마스터 위임은 매니저에게만 가능합니다.');
        }

        // --- case action ---
        if (actor.guildRole === GUILD_ROLE_ENUM.MASTER) {
            return await this._handleSubmasterTransferByMaster(guild, targetId);
        } else if (actor.guildRole === GUILD_ROLE_ENUM.SUBMASTER) {
            return await this._handleSubmasterTransferBySubmaster(actor, targetId);
        } else {
            throw new ForbiddenException('권한이 없습니다.');
        }
    }

    /** [Private] 마스터가 부마스터를 교체/임명 */
    private async _handleSubmasterTransferByMaster(guild: GuildDocument, targetId: Types.ObjectId) {
        const oldSubmasterId = guild.submaster; // 기존 부마스터 ID (없을 수도 있음)

        // --- transaction ---
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // --- feat.guild: submaster change && manager handle
            const updateQuery: any = {
                $set: { submaster: targetId }, // 신규 임명
                $pull: { managers: targetId }, // 신규 임명자 매니저 목록에서 제거
            };
            if (oldSubmasterId) {
                updateQuery.$push = { managers: oldSubmasterId };
            }
            await this.guildModel.updateOne({ _id: guild._id }, updateQuery, { session });

            // --- feat.user: submaster <-> manager ---
            await this.userGuildService.updateGuildInfo(
                targetId,
                { guildId: guild._id, guildRole: GUILD_ROLE_ENUM.SUBMASTER },
                session,
            );

            if (oldSubmasterId) {
                await this.userGuildService.updateGuildInfo(
                    oldSubmasterId,
                    { guildId: guild._id, guildRole: GUILD_ROLE_ENUM.MANAGER },
                    session,
                );
            }
            await session.commitTransaction();

            // --- strict redis set ---
            const targetsToUpdate: (Types.ObjectId)[] = [targetId];
            if (oldSubmasterId) {
                targetsToUpdate.push(oldSubmasterId);
            }

            await this.redisService.setManyOrThrow(targetsToUpdate);

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {

            session.endSession();
        }
    }

    /** [Private] 부마스터가 타인에게 위임 (자신은 매니저로 강등) */
    private async _handleSubmasterTransferBySubmaster(actor: UserPayload, targetId: Types.ObjectId) {
        const session = await this.connection.startSession();
        session.startTransaction();
        // --- transaction ---
        try {
            // 1. [Guild] Swap
            await this.guildModel.updateOne(
                { _id: actor.guildId },
                {
                    $set: { submaster: targetId },     // 타겟 -> 부마스터
                    $pull: { managers: targetId },     // 타겟(매니저) 목록 제거
                    $push: { managers: actor.id },  // 나(구 부마스터) -> 매니저 추가
                },
                { session }
            );

            // 2. [User] 나 (Submaster -> Manager)
            await this.userGuildService.updateGuildInfo(
                actor.id,
                { guildId: actor.guildId, guildRole: GUILD_ROLE_ENUM.MANAGER },
                session,
            );

            // 3. [User] 타겟 (Manager -> Submaster)
            await this.userGuildService.updateGuildInfo(
                targetId,
                { guildId: actor.guildId, guildRole: GUILD_ROLE_ENUM.SUBMASTER },
                session,
            );

            await session.commitTransaction();

            // --- strict redis set ---
            await this.redisService.setOrThrow(targetId)
            //todo: 멀티디바이스 -> void this.redisService.safeSet(actor.id)


        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}