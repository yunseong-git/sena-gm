import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection } from 'mongoose';
import { CreateGuildDto } from '../dto/req/create-guild.dto';
import { Guild, GuildDocument, GUILD_ROLE_ENUM } from '../schemas/guild.schema';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { Counter, CounterDocument } from '../../common/schemas/counter.schema';
import { RedisService } from '../../redis/redis.service';
import { UserGuildService } from '../../user/services/user-guild.service';
import { UserService } from '../../user/services/user.service';

/**길드 생성 및 삭제에 관여하는 서비스 */
@Injectable()
export class GuildLifecycleService {
    constructor(
        // -- about DB --
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
        @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
        @InjectConnection() private readonly connection: Connection, //for-transaction-session
        // -- outer service --
        private readonly userGuildService: UserGuildService,
        private readonly userService: UserService,
        private readonly redisService: RedisService
    ) { }

    /** 길드 생성(not throw logic, 이중 fail-fast용 쿼리 필요) */
    async create(user: UserPayload, dto: CreateGuildDto) {
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

            //todo: 멀티디바이스 같은 경우 void this.redisService.safeSet(user.id)

        } catch (error) {
            if (error.code === 11000)
                await session.abortTransaction();
            // 여기서 실패해도 카운터는 이미 올라갔으므로 '번호 구멍'이 생김 (노상관)
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

            //todo: 멀티디바이스 같은 경우 void this.redisService.safeSet(user.id)

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}