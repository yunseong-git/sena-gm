import { IsArray, IsEnum, IsNumber, IsString, ValidateNested, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ARMOR_MAIN_ENUM, EQUIP_SET_ENUM, EQUIP_SUB_ENUM, RING_ENUM, WEAPON_MAIN_ENUM, } from '../../../common/constatnts/ring.constant';


// 1. 스킬 예약 객체
export class SkillReservationDto {
  @IsNumber()
  @Min(0) @Max(2)
  heroIndex: number;

  @IsString()
  @IsEnum(['S1', 'S2']) // 스킬 타입 제한
  skillType: 'S1' | 'S2';
}

// 2. 영웅 세팅 (1명)
export class HeroSetDto {
  @IsString()
  heroId: string;

  @IsString()
  heroName: string;

  @IsEnum(EQUIP_SET_ENUM)
  setOption: EQUIP_SET_ENUM;

  @IsEnum(RING_ENUM)
  ringOption: RING_ENUM;

  // 배열 길이 검증 등을 추가할 수 있음
  @IsArray()
  @IsEnum(WEAPON_MAIN_ENUM, { each: true })
  weaponOptions: WEAPON_MAIN_ENUM[];

  @IsArray()
  @IsEnum(ARMOR_MAIN_ENUM, { each: true })
  armorOptions: ARMOR_MAIN_ENUM[];

  @IsArray()
  @IsEnum(EQUIP_SUB_ENUM, { each: true })
  subOptions: EQUIP_SUB_ENUM[];
}

// 3. 덱 세팅 (1개 덱)
export class DeckSetDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(3) @ArrayMaxSize(3)
  @Type(() => HeroSetDto)
  heroSets: HeroSetDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillReservationDto)
  skillReservation: SkillReservationDto[];

  @IsString()
  concept?: string;
}

// 4. 최종 요청 Body (전적 생성)
export class CreateRecordDto {
  @ValidateNested()
  @Type(() => DeckSetDto)
  firstDeck: DeckSetDto;

  @ValidateNested()
  @Type(() => DeckSetDto)
  secondDeck: DeckSetDto;

  @IsNumber()
  @Min(1) @Max(2)
  fastSkill: number; // 1 or 2

  @IsNumber()
  @Min(1) @Max(2)
  winner: number; // 1 or 2
}