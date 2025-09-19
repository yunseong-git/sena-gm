export const heroesData = [
  {
    name: '파이',
    type: '공격형',
    rank: '구세나',
    skills: [
      {
        type: '패시브',
        name: '솟구치는 불꽃',
        description:
          '<모든적군> 물리 취약 [상시], <자신> 화상 적군 공격시 추가피해, 생명력 80% 부활, 부활 시 공격력 비례 3턴 보호막',
        upgrade: '물리 취약 수치 증가, 생명력 100% 부활',
      },
      {
        type: '기본공격',
        description: '<단일> 1회 피해, <3인> 2턴 화상 [35%]',
        upgrade: '데미지 증가',
      },
      {
        type: '1스킬',
        name: '아그니아의 창',
        description: '<5인> 2회 피해, 2턴 화상 [60%] ',
        upgrade: '화상 확률 증가, 3턴 방깎 [100%]',
      },
      {
        type: '2스킬',
        name: '염룡의 연주',
        description:
          '<단일> 1회 생명력 비례 피해, 조건부 처형 (생명력 24%), 3개 버프해제 [100%], 3턴 화상 [100%], <대상 및 동일열> 1회 생명력 비례 피해, 2턴 화상 [60%]',
        upgrade: '데미지 증가',
        first_evolution: '처형 조건 생명력 30%',
        second_evolution: '처형 대상 동일 열 전체',
      },
    ],
  },
  {
    name: '쥬리',
    type: '마법형',
    rank: '구세나',
    skills: [
      {
        type: '패시브',
        name: '신의 저울',
        description: '3인 협공 [25%], <자신> 무효화 [2회], 불사 [2턴]',
        upgrade: '불사 [3턴], 협공 데미지 증가',
        first_evolution: '협공 확률 35%',
        second_evolution: '불사 시 행동제어면역',
      },
      {
        type: '기본공격',
        description: '<2인> 1회 피해',
        upgrade: '데미지증가',
      },
      {
        type: '1스킬',
        name: '천상의 심판',
        description: '<5인> 2회 피해, 3턴 방깎[100%]',
        upgrade: '데미지, 방깎 수치 증가',
      },
      {
        type: '2스킬',
        name: '최고 판결',
        description: '<5인> 2회 피해, 2턴 영멸 [60%]',
        upgrade: '데미지, 영멸 확률 증가',
      },
    ],
  },
  {
    name: '로지',
    type: '만능형',
    rank: '구세나',
    skills: [
      {
        type: '패시브',
        name: '망자의 축복',
        description:
          '<자신> 생명력 비례 방어력 증가, 체력 50% 도달 시 2턴 피해면역, <아군 방어형,만능형> 효과 적용 확률 증가 [상시]',
        upgrade: '피해면역 턴수 3턴',
        first_evolution: '효과 적용 확률 수치 증가',
      },
      {
        type: '기본공격',
        description: '<2인> 1회 피해',
        upgrade: '2턴 효과저항 감소 [100%]',
      },
      {
        type: '1스킬',
        name: '달빛의 심판',
        description: '<5인> 2회 생명력 비례 피해, 3턴 즉사 [25%]',
        upgrade: '데미지, 즉사 확률 증가',
      },
      {
        type: '2스킬',
        name: '성령의 기도',
        description: '2인 부활, <모든적군> 2턴감 [100%]',
        upgrade: '부활시 생명력 증가 및 2턴 권능',
        second_evolution: '부활 대상 아군 전체',
      },
    ],
  },
  {
    name: '태오',
    type: '공격형',
    rank: '찐스',
    skills: [
      {
        type: '패시브',
        name: '까마귀 눈동자',
        description: '<자신> 무효화 [3회], 불사 [2턴]',
        upgrade: '불사 발동 시 공격력 증가',
        first_evolution: '불사 발동 시 스킬 쿨타임 초기화',
      },
      {
        type: '기본공격',
        description: '<단일> 1회 피해',
        upgrade: '데미지 증가',
      },
      {
        type: '1스킬',
        name: '흑풍참',
        description: '<5인> 1회 관통 피해 [치확 30% 추가 적용]',
        upgrade: '데미지 증가',
        second_evolution: '치확 100%',
      },
      {
        type: '2스킬',
        name: '흑익만월참',
        description: '<5인> 2회 피해 [치확 30% 추가 적용], 2턴감 [100%]',
        upgrade: '데미지 증가',
        second_evolution: '치확 100%',
      },
    ],
  },
  {
    name: '연희',
    type: '마법형',
    rank: '찐스',
    skills: [
      {
        type: '패시브',
        name: '혜안',
        description:
          '<모든아군> 마법 공격력 증가 [상시], <자신> 무효화 [3회]',
        upgrade: '마법 공격력 수치 증가, 무효화 1회 추가',
        second_evolution: '마법 피해량 증가 [3턴]',
      },
      {
        type: '기본공격',
        description: '<단일> 1회 피해, 1턴 수면 [40%]',
        upgrade: '데미지 증가',
        first_evolution: '2인 공격',
      },
      {
        type: '1스킬',
        name: '파괴의 손짓',
        description: '<3인> 3회 체력 비례 피해',
        upgrade: '데미지 증가',
      },
      {
        type: '2스킬',
        name: '종말의 영면',
        description: '<5인> 3회 방어 무시 피해, 2턴 수면 [50%]',
        upgrade: '데미지 증가',
      },
    ],
  },
  {
    name: '루디',
    type: '방어형',
    rank: '찐스',
    skills: [
      {
        type: '패시브',
        name: '견고한 방패',
        description:
          '<모든아군> 방어력 증가 [상시], <자신> 받피감 [상시]',
        upgrade: '방어력, 받피감 수치 증가',
      },
      {
        type: '기본공격',
        description: '<단일> 1회 피해',
        upgrade: '데미지 증가',
      },
      {
        type: '1스킬',
        name: '돌격',
        description: '<단일> 1회 피해, 3턴감 [100%], 3턴기절 [85%]',
        upgrade: '데미지 증가, 기절 확률 100%',
      },
      {
        type: '2스킬',
        name: '방어준비',
        description: '<모든아군> 2턴 링크, 1개 디버프 해제',
        upgrade: '링크 감소율 증가',
        first_evolution: '3턴 링크',
        second_evolution: '<모든아군> 2턴 행동 제어 면역',
      },
    ],
  },
  {
    name: '리나',
    type: '지원형',
    rank: '짭스',
    skills: [
      {
        type: '패시브',
        name: '불협화음',
        description:
          '<모든아군> 효과 저항 증가 [상시], <자신> 체력 비례 보호막 [3턴]',
        upgrade: '효과 저항, 보호막 수치 증가',
        first_evolution: '<모든아군> 치명타 피해량 증가 [상시]',
      },
      {
        type: '기본공격',
        description: '<단일> 1회 피해',
        upgrade: '데미지 증가, <최저생명력 아군(자신제외)> 생명력 회복',
      },
      {
        type: '1스킬',
        name: '행진가',
        description: '<모든아군> 즉시 및 2턴 생명력 회복',
        upgrade: '회복량 증가',
      },
      {
        type: '2스킬',
        name: '따뜻한 울림',
        description:
          '<모든아군> 3턴 피해량 증가, <적군전열> 3턴 방깎 [100%]',
        upgrade: '피해량, 방깎 수치 증가',
        second_evolution: '방깎 대상 적군 전체',
      },
    ],
  },
];