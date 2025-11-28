import { Hero, HERO_TYPE_ENUM } from "./schemas/hero.schema.js";
import { HERO_SKILL_ENUM } from "./schemas/hero.schema.js";
import { HERO_RANK_ENUM } from "./schemas/hero.schema.js";

export const HeroesData = [
    {
        name: '루디',
        type: HERO_TYPE_ENUM.DEFENSE,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(버프많은단일) 1타, 기절, 3턴감',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(아군전체) 3턴링크, 디벞1개해제, cc면역',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시방증\n(자신) 상시감쇄',
            },
        },
    },
    {
        name: "아일린",
        type: HERO_TYPE_ENUM.ALLROUND,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(단일) 관통3타, 감전',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(5인) 관통2타, 감전',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 감전시 추딜',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시물공증\n(자신) 부활',
            },
        }
    },
    {
        name: "레이첼",
        type: HERO_TYPE_ENUM.ALLROUND,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "델론즈",
        type: HERO_TYPE_ENUM.ATTACK,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(5인) 1타, 침묵',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(단일) 5타, 처치연속발동',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 침묵',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시물피증\n(자신) 4무효화, 아군 사망시 물공증, 무효화 리필',
            },
        }
    },
    {
        name: "스파이크",
        type: HERO_TYPE_ENUM.ALLROUND,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(단일) 1타, 빙결\n(같은열적군) 1타, 빙결\n(자신) 힐',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(5인) 2타, 빙결\n(자신) 힐',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타\n(아군1명) 2회 발동 시 디벞1개해제',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시효저증\n(자신) 회복권능, 상시효적증, 체력 비례 공증',
            },
        }
    },
    {
        name: "제이브",
        type: HERO_TYPE_ENUM.ALLROUND,
        rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(5인) 1타, 기절, 대상수 비례 뎀증',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(5인) 관통2타, 화상, 대상수 비례 뎀증',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(자신) 반격, 3턴cc면역, 공격력 비례 방증',
            },
        }
    },
    {
        name: "크리스", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SSR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(5인) 1타, 기절, 대상수 비례 뎀증',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(5인) 관통2타, 화상, 대상수 비례 뎀증',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(자신) 반격, 3턴cc면역, 공격력 비례 방증',
            },
        }
    },
    {
        name: "쥬리", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.UR,
        skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "멜키르", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "콜트", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "플라튼", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "에이스", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "린", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "태오", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "연희", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "카르마", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "카일", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "타카", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "오를리", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "아킬라", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "클라한", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "카구라", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "미호", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "아멜리아", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "키리엘", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "에반", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "카린", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "유리", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "리", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "유이", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "아리엘", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "쥬피", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "스니퍼", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "헬레니아", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "헤브니아", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "카론", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "빅토리아", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "루시", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "벨리카", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "실비아", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "조커", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "룩", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "챈슬러", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "메이", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "엘리스", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "아라곤", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.SR, skills: [
            {
                skillIndex: HERO_SKILL_ENUM.SKILL_1,
                description: '(5인) 1타, 기절, 대상수 비례 뎀증',
            },
            {
                skillIndex: HERO_SKILL_ENUM.BASIC,
                description: '(단일) 1타, 화상',
            },
            {
                skillIndex: HERO_SKILL_ENUM.PASSIVE,
                description: '(자신) 반격, 3턴cc면역, 공격력 비례 방증',
            },
        ]
    },
    {
        name: "노호", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "클로에", type: HERO_TYPE_ENUM.SUPPORT, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "비스킷", type: HERO_TYPE_ENUM.DEFENSE, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "루리", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "니아", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "에스파다", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "세인", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "지크", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "제인", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "블랙로즈", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "세라", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.R, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "발리스타", type: HERO_TYPE_ENUM.ATTACK, rank: HERO_RANK_ENUM.SR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "실베스타", type: HERO_TYPE_ENUM.MAGIC, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    },
    {
        name: "엘리시아", type: HERO_TYPE_ENUM.ALLROUND, rank: HERO_RANK_ENUM.SSR, skills: {
            [HERO_SKILL_ENUM.SKILL_1]: {
                description: '(3인) 2타, 모공감, 피감, 화상',
            },
            [HERO_SKILL_ENUM.SKILL_2]: {
                description: '(3인) 1타, 방깎, 물취',
            },
            [HERO_SKILL_ENUM.BASIC]: {
                description: '(단일) 1타, 화상',
            },
            [HERO_SKILL_ENUM.PASSIVE]: {
                description: '(아군전체) 상시약확증\n(자신) 부활.',
            },
        }
    }

]