import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException, InternalServerErrorException, ImATeapotException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Connection } from 'mongoose';
import { nanoid } from 'nanoid';
import { Guild, GuildDocument, GUILD_ROLE_ENUM } from '../schemas/guild.schema.js';
import { GuildQueryService } from './guild-query.service.js';
import { Counter, CounterDocument } from '#src/common/schemas/counter.schema.js';

//길드 
@Injectable()
export class GuildResourceService {
    constructor(
        // -- about DB --
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
        @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
        @InjectConnection() private readonly connection: Connection, //for-transaction-session
        // -- inner service --
        private readonly guildQueryService: GuildQueryService,
    ) { }


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