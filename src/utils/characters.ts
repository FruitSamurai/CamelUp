import type { Character } from '../types';
import { CharacterType } from '../types';

/**
 * 所有可选角色列表
 * 每个角色都有独特的埃及/沙漠主题和技能
 */
export const CHARACTERS: Record<CharacterType, Character> = {
  [CharacterType.PHARAOH]: {
    type: CharacterType.PHARAOH,
    name: '法老',
    nameEn: 'Pharaoh',
    color: '#FFD700',
    icon: '👑',
    description: '埃及的统治者，拥有至高无上的权力',
    skill: {
      name: '皇家赏赐',
      description: '回合开始时，如果你的金钱最少，获得1 EP。法老不会让臣民挨饿。',
      type: 'passive',
    },
  },
  [CharacterType.MERCHANT]: {
    type: CharacterType.MERCHANT,
    name: '商人',
    nameEn: 'Merchant',
    color: '#8B4513',
    icon: '💰',
    description: '精明的商人，熟知沙漠贸易之道',
    skill: {
      name: '精明交易',
      description: '摇骰子时获得2 EP而非1 EP。商人总能从交易中获利更多。',
      type: 'passive',
    },
  },
  [CharacterType.PRIEST]: {
    type: CharacterType.PRIEST,
    name: '祭司',
    nameEn: 'Priest',
    color: '#4169E1',
    icon: '🔮',
    description: '神秘的祭司，能预见骆驼的未来',
    skill: {
      name: '神谕',
      description: '每个赛段开始时，可以查看金字塔中的一个随机骰子。预知让你占据先机。',
      type: 'active',
    },
  },
  [CharacterType.EXPLORER]: {
    type: CharacterType.EXPLORER,
    name: '探险家',
    nameEn: 'Explorer',
    color: '#228B22',
    icon: '🗺️',
    description: '勇敢的探险家，征服沙漠的勇士',
    skill: {
      name: '勇者之路',
      description: '放置观众板块时额外获得1 EP。探索总有回报。',
      type: 'passive',
    },
  },
  [CharacterType.PRINCESS]: {
    type: CharacterType.PRINCESS,
    name: '公主',
    nameEn: 'Princess',
    color: '#FF69B4',
    icon: '👸',
    description: '美丽的公主，热爱骆驼竞赛',
    skill: {
      name: '皇室幸运',
      description: '赛段下注时，如果你的下注骆驼获得第一名，额外获得2 EP。幸运女神的眷顾。',
      type: 'passive',
    },
  },
  [CharacterType.SHEIKH]: {
    type: CharacterType.SHEIKH,
    name: '酋长',
    nameEn: 'Sheikh',
    color: '#DC143C',
    icon: '🧔',
    description: '部落的领袖，沙漠的守护者',
    skill: {
      name: '部落智慧',
      description: '每个赛段可以移动一次你已放置的观众板块。战术调整是领袖的艺术。',
      type: 'active',
    },
  },
  [CharacterType.NOMAD]: {
    type: CharacterType.NOMAD,
    name: '游牧民',
    nameEn: 'Nomad',
    color: '#DEB887',
    icon: '🏜️',
    description: '自由的游牧民，与骆驼共生',
    skill: {
      name: '沙漠之子',
      description: '你的观众板块被触发时获得2 EP而非1 EP。沙漠地形了如指掌。',
      type: 'passive',
    },
  },
  [CharacterType.SCHOLAR]: {
    type: CharacterType.SCHOLAR,
    name: '学者',
    nameEn: 'Scholar',
    color: '#9370DB',
    icon: '📚',
    description: '博学的学者，研究古老的智慧',
    skill: {
      name: '博学多才',
      description: '比赛下注正确时，额外获得3 EP。知识就是财富。',
      type: 'passive',
    },
  },
};

/**
 * 获取角色信息
 */
export function getCharacter(type: CharacterType): Character {
  return CHARACTERS[type];
}

/**
 * 获取所有角色列表
 */
export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS);
}

/**
 * 根据索引获取默认角色
 */
export function getDefaultCharacter(index: number): CharacterType {
  const types = Object.values(CharacterType);
  return types[index % types.length];
}
