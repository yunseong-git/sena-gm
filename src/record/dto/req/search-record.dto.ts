import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRecordDto {
  @ApiProperty({
    description: '검색할 영웅 ID 3개 (순서 상관 없음)',
    example: ['hero_kyle', 'hero_evan', 'hero_colt'],
  })
  @IsArray()
  @IsString({ each: true }) // 배열 내부 요소가 string인지 확인
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  heroIds: string[];
}