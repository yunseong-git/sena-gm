import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel, } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Guild, GuildDocument, } from '../schemas/guild.schema';
import { UpdateGuildNoticeDto, UpdateGuildTagDto } from '../dto/req/update-guild.dto';
import { checkGuildTagResDto, GuildCodeResDto } from '../dto/res/update-guild-res.dto';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';

/**길드 기본 리소스 관리 서비스 */
@Injectable()
export class GuildResourceService {
    constructor(
        // -- about DB --
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    ) { }

    /**공지 수정*/
    async updateNotice(user: UserPayload, dto: UpdateGuildNoticeDto): Promise<void> {
        const updateResult = await this.guildModel.updateOne(
            { _id: user.guildId },
            { $set: { notice: dto.notice } }
        );

        if (updateResult.matchedCount === 0) {
            throw new NotFoundException('길드 정보를 찾을 수 없습니다.');
        }
    }

    /** 태그 변경 (중복 체크 포함) */
    async updateTag(user: UserPayload, dto: UpdateGuildTagDto): Promise<void> {
        const isDuplicated = await this.checkTagDuplicate(user, dto.tag);
        if (isDuplicated) throw new ConflictException('이미 존재하는 태그입니다. 다시 시도해주세요.');
        try {
            await this.guildModel.updateOne(
                { _id: user.guildId },
                { $set: { tag: dto.tag } }
            );
        } catch (error) {
            // [Fail-Safe] 아주 희박한 확률로 동시성 충돌 시
            if (error.code === 11000) {
                throw new ConflictException('이미 존재하는 태그입니다. 다시 시도해주세요.');
            }
            throw error;
        }
    }

    /** 태그 중복체크 */
    async checkTagDuplicate(user: UserPayload, tag: string): Promise<checkGuildTagResDto> {
        const guild = await this.guildModel.findById(user.guildId).select('name tag');
        if (!guild) {
            throw new NotFoundException('길드 정보를 찾을 수 없습니다.');
        }

        // 2. 변경 사항이 없으면 바로 리턴 (DB 낭비 방지)
        if (guild.tag === tag) {
            throw new BadRequestException('기존과 동일한 태그입니다.');
        }
        const exists = await this.guildModel.exists({
            name: guild.name,
            tag: tag,
        });

        return { isExist: !!exists }
    }

    /** 길드 코드 조회*/
    async getCode(user: UserPayload): Promise<GuildCodeResDto> {
        const result = await this.guildModel.findOne({ _id: user.guildId }, { code: 1, _id: 0 });

        if (!result || !result.code) throw new NotFoundException('길드가 존재하지 않거나, 길드코드 생성전입니다.')

        return { code: result.code };
    }

    /** 길드 초대 코드 생성/갱신 */
    async updateCode(user: UserPayload): Promise<GuildCodeResDto> {
        let retryCount = 0;
        const MAX_RETRIES = 3; //3번동안 겹치면 로또사자

        while (retryCount < MAX_RETRIES) {
            try {
                // 1. URL-friendly 코드 생성 (9자리)
                const newCode = nanoid(9);

                // 2. 업데이트 시도
                const updateResult = await this.guildModel.updateOne(
                    { _id: user.guildId },
                    { $set: { code: newCode } }
                );

                // 업데이트된 문서가 없다면? (길드가 삭제되었거나 ID가 틀림)
                // (Guard를 통과했으므로 거의 없겠지만 방어 코드)
                if (updateResult.modifiedCount === 0) {
                    // 이미 같은 코드였을 수도 있고, 길드가 없을 수도 있음.
                    // 안전하게 넘어감 (혹은 NotFoundException)
                }

                // 3. 성공 시 반환
                return { code: newCode };

            } catch (error) {
                // 4. 중복 에러(E11000)인 경우에만 재시도
                if (error.code === 11000) {
                    retryCount++;
                    continue;
                }
                throw error; // 다른 에러는 던짐
            }
        }

        throw new ConflictException('초대 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }
}