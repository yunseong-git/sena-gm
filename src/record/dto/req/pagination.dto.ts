import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: '페이지 번호 (기본값: 1)', default: 1 })
  @IsOptional()
  @Type(() => Number) // URL 쿼리스트링은 string으로 오므로 숫자로 변환
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: '페이지당 개수 (기본값: 20)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 20;
}