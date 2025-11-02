import { UserHero } from '../schemas/user-heroes.schema.js';

export class AddOrUpdateHeroesDto {
  heroes: UserHero[]; // 70+개 영웅 객체가 담긴 '전체' 배열
}

export class AddOrUpdateRingsDto {
  // 예: { "ring_6s_immortal": 1, "ring_6s_immortal_opt_power_5s": -1 }
  // "6성 불사" 1개 추가, "6성 불사 (5성 권능)" 1개 감소
  updates: { [key: string]: number };
}
