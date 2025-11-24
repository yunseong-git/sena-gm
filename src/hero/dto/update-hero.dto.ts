import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroDto } from './create-hero.dto';

// CreateHeroDto의 모든 필드를 선택적(optional)으로 변경
export class UpdateHeroDto extends PartialType(CreateHeroDto) { }