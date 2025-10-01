import { IsNotEmpty, IsString, IsNumber, IsMongoId, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @description 단일 영웅 정보를 담는 DTO,
 * 'myHeroes' 배열의 각 요소에 대한 유효성 검증 규칙을 정의
 */
export class AcquiredHeroDto {
  @IsNotEmpty({ message: '영웅 ID는 필수입니다.' })
  @IsMongoId({ message: '유효한 MongoDB ID 형식이 아닙니다.' })
  hero_Id: string;

  @IsNotEmpty({ message: '영웅 이름은 필수입니다.' })
  @IsString({ message: '영웅 이름은 문자열이어야 합니다.' })
  name: string;

  @IsNotEmpty({ message: '영웅 타입은 필수입니다.' })
  @IsString({ message: '영웅 타입은 문자열이어야 합니다.' })
  type: string;

  @IsNotEmpty({ message: '초월 정보는 필수입니다.' })
  @IsNumber({}, { message: '초월 정보는 숫자여야 합니다.' })
  @Min(0, { message: '초월 정보는 0 이상이어야 합니다.' }) //숫자라서 length 사용안됨
  @Max(12, { message: '초월 정보는 12 이하여야 합니다.' })
  evolution: number;
}

/**
 * @description 영웅 목록을 추가하거나 덮어쓸 때 사용하는 DTO,
 * 클라이언트가 배열로 전송하는 전체 영웅 목록에 대한 유효성을 검증
 */
export class AddOrUpdateHeroesDto {
  @IsNotEmpty({ message: '영웅 목록 배열은 비어있을 수 없습니다.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcquiredHeroDto)
  myHeroes: AcquiredHeroDto[];
}

/**
 * @description 단일 영웅의 초월(evolution) 정보를 업데이트할 때 사용하는 DTO,
 * 특정 영웅의 hero_id와 evolution 필드만 검증
 */
export class UpdateHeroEvoDto {
  @IsNotEmpty({ message: '영웅 ID는 필수입니다.' })
  @IsMongoId({ message: '유효한 MongoDB ID 형식이 아닙니다.' })
  hero_Id: string;

  @IsNotEmpty({ message: '초월 정보는 필수입니다.' })
  @IsNumber({}, { message: '초월 정보는 숫자여야 합니다.' })
  @Min(0, { message: '초월 정보는 0 이상이어야 합니다.' })
  @Max(12, { message: '초월 정보는 12 이하여야 합니다.' })
  evolution: number;
}

//my heroes관련 로직들
//1. 최초입력 -> getAllHeroes 호출로 다가져오고 유저가 입력하면 -> id, name, type, evolution 모두 추가
//2. 영웅추가 -> getSomeHeroes에 user가 보유중인 hero_id배열 보내서 그거 제외해서 보여줌 -> id, name, type, evolution 모두 추가
//3. 영웅초월변경 -> hero모듈 필요없음 -> 그냥 기존 유저 정보에서 evolution 만 수정
//4. 영웅제거 -> hero모듈 필요없음 -> 그냥 기존 유저 정보에서 해당 id 기반 삭제