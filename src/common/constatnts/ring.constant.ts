export enum EQUIP_SET_ENUM {
  SORCERER = '주술사',
  ORCHESTRATOR = '조율자',
  AVENGER = '복수자',
  ASSASSIN = '암살자',
  GATEKEEPER = '수문장',
  GUARDIAN = '수호자',
  PALADIN = '성기사',
  CHASER = '추적자',
  VANGUARD = '선봉장',
}

export enum RING_ENUM {
  AUTHORITY = '권능',
  RESURRECTION = '부활',
  IMMORTALITY = '불사',
  AUTHORITY_RESURRECTION = '권능_부활',
  AUTHORITY_IMMORTALITY = '권능_불사',
  RESURRECTION_IMMORTALITY = '부활_불사',
}

// 무기 메인 옵션 (2개 선택)
// 모공, 치확, 치피, 약공, 생명력, 방어력
export enum WEAPON_MAIN_ENUM {
  ALL_ATK = '모공',
  CRIT_RATE = '치확',
  CRIT_DMG = '치피',
  WEAK_POINT = '약공',
  EFFECT_ACC = '효적',
  HP = '생명력',
  DEF = '방어력',
}

// 방어구 메인 옵션 (2개 선택)
// 받피감, 막기, 효적, 효저, 생명력, 방어력
export enum ARMOR_MAIN_ENUM {
  ALL_ATK = '모공',
  DMG_REDUCTION = '받피감',
  BLOCK = '막기',
  EFFECT_RESIST = '효저',
  HP = '생명력',
  DEF = '방어력',
}

// 서브 옵션 (4개 선택)
export enum EQUIP_SUB_ENUM {
  SPEED_ATK = '속공',
  CRIT_RATE = '치확',
  CRIT_DMG = '치피',
  WEAK_POINT = '약공',
  ALL_ATK = '모공',
  HP = '생명력',
  DEF = '방어력',
  BLOCK = '막기',
  EFFECT_ACC = '효적',
  EFFECT_RESIST = '효저',
}














