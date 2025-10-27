import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GuildQueryService } from '../services/guild-query.service.js';
import { GuildCommandService } from '../services/guild-command.service.js';
import { GuildGuard } from '../guards/guild.guard.js';
import { GuildRoles } from '../decorators/guild-roles.decorator.js';
import { Guild, GuildRole } from '../schemas/guild.schema.js';
import { User } from '#src/common/decorators/user.decorators.js';
import { guildCode } from './guild-public.controller.js';
import { simpleResponse } from '#src/common/types/response.type.js';
import { RefreshListGuard } from '#src/auth/guards/refresh-list.guard.js';
import { ParseObjectIdPipe } from '#src/common/pipes/parse-object-id.pipe.js';
import { Types } from 'mongoose';
import { Response } from 'express';
import { AccessToken, Tokens } from '#src/auth/types/token-response.type.js';
import { TargetIdDto } from '../dto/target-id.dto.js';
import { UserPayload } from '#src/auth/types/payload.type.js';

@Controller('guild/manager')
@UseGuards(RefreshListGuard, GuildGuard) // 컨트롤러 전체에 BlackListGuard와 GuildGuard 적용
export class GuildMangerController {
    constructor(
        private readonly guildQueryService: GuildQueryService,
        private readonly guildCommandService: GuildCommandService,
    ) { }
    // ==================== 길드 관리 ====================

    @Get()
    @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
    async getGuildPower(@User() user: UserPayload): Promise<Guild> {
        return this.guildQueryService.getMemberDetails();
    }

    @Post('kick')
    @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
    @HttpCode(HttpStatus.OK)
    async kickMember(@User() user: UserPayload, @Body() dto: TargetIdDto,) {
        return await this.guildCommandService.kickMember(user, dto.targetId);
    }

    @Delete()
    @GuildRoles(GuildRole.MASTER)
    @HttpCode(HttpStatus.OK)
    async dismissGuild(@User() user: UserPayload, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
        const { accessToken, refreshToken } = await this.guildCommandService.dismissGuild(user);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
            sameSite: 'strict', // CSRF 방어
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
        });
        return { accessToken }
    }
    // ==================== 권한 변경 ====================


    @Post('master/transfer')
    @GuildRoles(GuildRole.MASTER)
    async transferMaster(@User() user: UserPayload, @Body() dto: TargetIdDto, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
        const { accessToken, refreshToken } = await this.guildCommandService.transferMaster(user, dto.targetId);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: false, // ❗ 로컬(http) 테스트 시 false. 배포(https) 시 true로 변경!
            sameSite: 'strict', // CSRF 방어
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 (밀리초 단위)
        });
        return { accessToken }
    }

    @Post('submaster')
    @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
    async setSubmaster(@User() user: UserPayload, @Body() dto: TargetIdDto, @Res({ passthrough: true }) res: Response) {
        const actorRole = user.guild!.role;
        const result = await this.guildCommandService.setSubmaster(user, dto.targetId);

        //액터가 submaster면 토큰 재발행
        if (actorRole === GuildRole.SUBMASTER) {
            const { accessToken, refreshToken } = result as Tokens;

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // 로컬 개발 환경
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            return { accessToken };
        } else {
            //actor 가 마스터면 변경사항 없음
            return result as simpleResponse;
        }
    }

    // ==================== 초대 코드 관리 ====================

    @Patch('code')
    @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
    async generateCode(@User() user: UserPayload): Promise<guildCode> {
        return this.guildCommandService.generateGuildCode(user.guild!.guildId);
    }

    @Get('code')
    @GuildRoles(GuildRole.MASTER, GuildRole.SUBMASTER)
    async findGuildCode(@User() user: UserPayload): Promise<guildCode> {
        return this.guildQueryService.findGuildCode(user.guild!.guildId);
    }
}