import { Body, Controller, Post, Res, } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//services
import { GuildLifecycleService } from '../services/guild-lifecycle.service';
import { GuildMemberShipService } from '../services/guild-membership.service';

//decorators, guards
import { User } from '../../common/decorators/user.decorators';
//dtos
import { CreateGuildDto } from '../dto/req/create-guild.dto';
import { JoinGuildDto } from '../dto/req/join-guild.dto';
import type { Response } from 'express';
import { AuthService } from '../../auth/auth.service';
import { AuthResponseDto } from '../../auth/dto/res/auth-res.dto';
import { UserPayload } from '../../auth/interfaces/token-payload.interface';
import { ACCESS_COOKIE_OPTION } from '../../common/constatnts/cookie.constant';
import { UserService } from '../../user/services/user.service';

/**길드 미가입 상태에서도 접근가능한 컨트롤러 */
@ApiTags('Guild - Public')
@Controller('guild')
export class GuildPublicController {
    constructor(
        private readonly guildLifecycleService: GuildLifecycleService,
        private readonly guildMembershipService: GuildMemberShipService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) { }

    //--- for public ---
    @Post()
    @ApiOperation({ summary: '길드 생성', description: '길드를 생성하고, 변경된 권한(Master)이 적용된 새 토큰을 발급.' })
    @ApiBody({ type: CreateGuildDto })
    @ApiResponse({ status: 201, description: '길드 생성 성공', type: AuthResponseDto })
    @ApiResponse({ status: 409, description: '이미 가입된 길드가 있거나 태그 생성 충돌' })
    async create(
        @User() user: UserPayload,
        @Body() dto: CreateGuildDto,
        @Res({ passthrough: true }) res: Response)
        : Promise<AuthResponseDto> {
        await this.guildLifecycleService.create(user, dto);
        const updatedUser = await this.userService.findById(user.id);
        const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

        res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
        return { payload };
    }

    @Post('join')
    @ApiOperation({ summary: '길드 가입', description: '초대 코드를 통해 길드에 가입하고, 변경된 길드정보가 적용된 새 토큰을 발급.' })
    @ApiBody({ type: JoinGuildDto })
    @ApiResponse({ status: 201, description: '가입 성공', type: AuthResponseDto })
    @ApiResponse({ status: 404, description: '존재하지 않는 코드' })
    @ApiResponse({ status: 409, description: '이미 길드 가입됨 / 정원 초과' })
    async join(
        @User() user: UserPayload,
        @Body() dto: JoinGuildDto,
        @Res({ passthrough: true }) res: Response)
        : Promise<AuthResponseDto> {
        await this.guildMembershipService.join(user, dto);

        const updatedUser = await this.userService.findById(user.id);
        const { accessToken, payload } = await this.authService.issueAccessToken(updatedUser);

        res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTION);
        return { payload };
    }
}
