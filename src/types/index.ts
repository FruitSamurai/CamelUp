/**
 * 骆驼颜色枚举
 */
export enum CamelColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  WHITE = 'white',
}

/**
 * 游戏阶段
 */
export enum GamePhase {
  SETUP = 'setup',          // 游戏准备
  PLAYING = 'playing',      // 游戏进行中
  LEG_END = 'legEnd',       // 赛段结束
  GAME_END = 'gameEnd',     // 游戏结束
}

/**
 * 玩家动作类型
 */
export enum PlayerAction {
  LEG_BET = 'legBet',                 // 赛段下注
  PLACE_SPECTATOR = 'placeSpectator', // 放置观众板块
  ROLL_DICE = 'rollDice',             // 摇骰子
  RACE_BET = 'raceBet',               // 比赛下注
}

/**
 * 观众板块类型
 */
export enum SpectatorType {
  OASIS = 'oasis',   // 绿洲（向前）
  MIRAGE = 'mirage', // 海市蜃楼（向后）
}

/**
 * 玩家角色类型
 */
export enum CharacterType {
  PHARAOH = 'pharaoh',           // 法老
  MERCHANT = 'merchant',         // 商人
  PRIEST = 'priest',             // 祭司
  EXPLORER = 'explorer',         // 探险家
  PRINCESS = 'princess',         // 公主
  SHEIKH = 'sheikh',             // 酋长
  NOMAD = 'nomad',               // 游牧民
  SCHOLAR = 'scholar',           // 学者
}

/**
 * 角色技能类型
 */
export type CharacterSkillType = 'passive' | 'active';

/**
 * 角色技能接口
 */
export interface CharacterSkill {
  name: string;           // 技能名称
  description: string;    // 技能描述
  type: CharacterSkillType;  // 技能类型（被动/主动）
}

/**
 * 角色信息接口
 */
export interface Character {
  type: CharacterType;
  name: string;          // 角色名称
  nameEn: string;        // 英文名称
  color: string;         // 主题颜色
  icon: string;          // emoji图标
  description: string;   // 角色描述
  skill: CharacterSkill; // 角色技能
}


/**
 * 骆驼接口
 */
export interface Camel {
  id: string;
  color: CamelColor;
  position: number;        // 赛道位置 (0-16)
  stackPosition: number;   // 叠加位置（0=底部，1=第二层，etc）
}

/**
 * 玩家接口
 */
export interface Player {
  id: string;
  name: string;
  character?: CharacterType;             // 玩家角色
  money: number;                         // 埃及镑
  spectatorTile: SpectatorTile | null;   // 观众板块
  hasRolledDice: boolean;                // 本赛段是否摇过骰子
  isAI: boolean;                         // 是否为AI玩家
  skillUsedThisLeg?: boolean;            // 本赛段是否使用过主动技能
  priestRevealedDice?: boolean;          // 祭司是否已查看骰子（本赛段）
  sheikhMovedTile?: boolean;             // 酋长是否已移动板块（本赛段）
}

/**
 * 观众板块接口
 */
export interface SpectatorTile {
  playerId: string;
  type: SpectatorType;
  position: number | null; // null表示未放置
}

/**
 * 赛段下注接口
 */
export interface LegBet {
  playerId: string;
  camelColor: CamelColor;
  value: number;           // 下注牌的价值（5, 3, 2）
  order: number;           // 下注顺序（决定奖励）
}

/**
 * 比赛下注接口
 */
export interface RaceBet {
  playerId: string;
  camelColor: CamelColor;
  isWinner: boolean;       // true=冠军，false=垫底
  order: number;           // 下注顺序
}

/**
 * 骰子接口
 */
export interface Dice {
  color: CamelColor;
  value: number;           // 1, 2, 或 3
  rolled: boolean;         // 本赛段是否已掷出
}

/**
 * 金字塔接口
 */
export interface Pyramid {
  dices: Dice[];
  availableDices: CamelColor[]; // 未掷出的骰子颜色
}

/**
 * 赛道格子接口
 */
export interface TrackSpace {
  position: number;
  camels: string[];        // 骆驼ID列表（底部到顶部）
  spectatorTile: SpectatorTile | null;
}

/**
 * 游戏历史记录
 */
export interface GameHistoryEntry {
  type: 'roll' | 'bet' | 'spectator' | 'skill' | 'leg' | 'game';
  playerId: string;
  playerName: string;
  timestamp: number;
  details: string;
}

/**
 * 游戏状态接口
 */
export interface GameState {
  // 基础信息
  gameId: string;
  phase: GamePhase;
  currentPlayerIndex: number;
  legNumber: number;        // 当前赛段编号

  // 游戏实体
  camels: Camel[];
  players: Player[];
  track: TrackSpace[];      // 16个格子的赛道
  pyramid: Pyramid;

  // 下注
  legBets: LegBet[];
  raceBets: RaceBet[];

  // 历史记录
  history: GameHistoryEntry[];

  // 赛段下注牌堆
  legBetStacks: {
    [key in CamelColor]: number[]; // 每个颜色的剩余下注牌价值
  };
}

/**
 * 游戏配置
 */
export interface GameConfig {
  trackLength: number;      // 赛道长度（默认16）
  playerCount: number;      // 玩家数量
  startingMoney: number;    // 起始金钱（默认3）
  diceRollReward: number;   // 摇骰子奖励（默认1）
}

/**
 * 动作结果
 */
export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 骰子摇动结果
 */
export interface DiceRollResult {
  camelColor: CamelColor;
  diceValue: number;
  oldPosition: number;
  newPosition: number;
  carriedCamels: string[];  // 被带动的骆驼
  hitSpectator: boolean;
  spectatorEffect?: {
    type: SpectatorType;
    playerId: string;
  };
}
