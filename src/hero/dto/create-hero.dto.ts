import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
import { HERO_SKILL_ENUM } from '../schemas/hero.schema.js';

export class SkillDto {
    @IsEnum(HERO_SKILL_ENUM)
    skillIndex: HERO_SKILL_ENUM;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class CreateHeroDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    rank: string; // (예: 전설)

    @IsString()
    @IsNotEmpty()
    type: string; // (예: HERO_TYPE_ENUM.DEFENSE)

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkillDto) // 👈 중첩된 클래스(배열) 유효성 검사
    skills: SkillDto[];
}