import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UpdateRoleDto {
    @ApiProperty({ description: '대상 유저 ID', example: '60d5ec...' })
    @IsMongoId({ message: '유효하지 않은 대상 ID 형식입니다.' })
    targetId: string;
}