import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RecordCommandService } from './services/record-command.service';
import { UserPayload } from '../auth/interfaces/token-payload.interface';
import { User } from '../common/decorators/user.decorators';
import { CreateRecordDto } from './dto/req/create-record.dto';
import { Guild_Roles } from '../common/decorators/guild-roles.decorator';
import { GUILD_ROLE_ENUM } from '../guild/schemas/guild.schema';
import { Strict } from '../common/decorators/strict.decorator';
import { GuildGuard } from '../common/guards/guild.guard';
import { RecordResponseDto } from './dto/res/get-record-res.dto';
import { RecordQueryService } from './services/record-query.service';
import { ApiBody, ApiExtraModels, ApiOkResponse, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SearchRecordDto } from './dto/req/search-record.dto';
import { PaginationDto } from './dto/req/pagination.dto';
import { PaginatedResponseDto } from './dto/res/paginated-res.dto';

@UseGuards(GuildGuard) //길드 유무, 길드 권한확인, redis비교
@Controller('record')
@ApiExtraModels(PaginatedResponseDto, RecordResponseDto)
export class RecordController {
  constructor(
    private readonly recordCommandService: RecordCommandService,
    private readonly recordQueryService: RecordQueryService,
  ) { }

  @Post()
  @ApiOperation({ summary: '단일 기록 작성' })
  @ApiBody({ type: CreateRecordDto })
  @ApiResponse({ status: 201, description: '기록 생성완료' })
  async create(
    @User() user: UserPayload,
    @Body() createRecordDto: CreateRecordDto,
  ): Promise<void> {
    return await this.recordCommandService.create(user, createRecordDto);
  }

  @Get('picked') // GET /record/picked
  @ApiOperation({ summary: '고정된 기록(Pick)만 조회', description: '페이지네이션 없음' })
  @ApiResponse({ status: 200, type: [RecordResponseDto] })
  async getPicked(
    @User() user: UserPayload,
  ): Promise<RecordResponseDto[]> {
    return this.recordQueryService.findPickedRecords(user);
  }

  @Get()
  @ApiOperation({ summary: '전체 기록 조회 (최신순)', description: '고정 여부 상관없이 최신순 정렬(페이지네이션 사용)' })
  @ApiOkResponse({
    description: '성공적으로 조회됨',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) }, // 껍데기, 틀 (PaginatedResponseDto)
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(RecordResponseDto) }, // 알맹이 (RecordResponseDto)
            },
          },
        },
      ],
    },
  })
  async getAll(
    @User() user: UserPayload,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<RecordResponseDto>> {
    return this.recordQueryService.findAll(user, paginationDto);
  }

  @Post('search') //Search via POST
  @ApiOperation({ summary: '덱 검색', description: '영웅 3명을 포함한 덱의 전적 검색' })
  @ApiResponse({ status: 200, type: [RecordResponseDto] })
  @HttpCode(200) // POST는 기본이 201인데, 검색은 조회이므로 200으로 명시
  async search(
    @User() user: UserPayload,
    @Body() searchDto: SearchRecordDto,
  ): Promise<RecordResponseDto[]> {
    return this.recordQueryService.search(user, searchDto);
  }


  @Strict()
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER, GUILD_ROLE_ENUM.MANAGER)
  @Patch(':id/pick') // 경로: PATCH /record/{id}/pick
  @ApiOperation({ summary: '기록 고정 (Pick)', description: '특정 기록을 상단 고정(Pick) 상태로 변경' })
  @ApiResponse({ status: 200, description: 'Pick 상태 변경 완료' })
  async pick(
    @User() user: UserPayload,
    @Param('id') recordId: string, // URL 파라미터로 recordId 받음
  ): Promise<void> {
    return this.recordCommandService.pick(user, recordId);
  }


  @Strict()
  @Guild_Roles(GUILD_ROLE_ENUM.MASTER, GUILD_ROLE_ENUM.SUBMASTER, GUILD_ROLE_ENUM.MANAGER)
  @Delete(':id')
  @ApiOperation({ summary: '기록 삭제 (Soft Delete)' })
  async delete(
    @User() user: UserPayload,
    @Param('id') recordId: string,
  ): Promise<void> {
    return await this.recordCommandService.delete(user, recordId);
  }
}
