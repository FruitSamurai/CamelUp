import { CamelColor } from '../types';

/**
 * 游戏常量配置
 */

// 赛道配置
export const TRACK_LENGTH = 16;
export const FINISH_LINE = 16;

// 骆驼配置
export const CAMEL_COLORS: CamelColor[] = [
  CamelColor.RED,
  CamelColor.BLUE,
  CamelColor.GREEN,
  CamelColor.YELLOW,
  CamelColor.WHITE,
];

// 骆驼颜色对应的十六进制值
export const CAMEL_COLOR_HEX: Record<CamelColor, string> = {
  [CamelColor.RED]: '#E74C3C',
  [CamelColor.BLUE]: '#3498DB',
  [CamelColor.GREEN]: '#2ECC71',
  [CamelColor.YELLOW]: '#F1C40F',
  [CamelColor.WHITE]: '#ECF0F1',
};

// 玩家配置
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const STARTING_MONEY = 3;

// 奖励配置
export const DICE_ROLL_REWARD = 1;
export const SPECTATOR_TILE_REWARD = 1;

// 赛段下注配置
export const LEG_BET_VALUES = [5, 3, 2, 2, 1, 1]; // 每个颜色的下注牌价值

// 赛段下注奖励表
export const LEG_BET_REWARDS = {
  first: [5, 3, 2, 1], // 第1名的前4个下注者奖励
  second: [3, 2, 1, 1], // 第2名的前4个下注者奖励
  wrong: -1, // 错误下注惩罚
};

// 比赛下注奖励表（根据下注顺序）
export const RACE_BET_REWARDS = {
  winner: [8, 5, 3, 2, 1], // 猜中冠军的奖励
  loser: [8, 5, 3, 2, 1],  // 猜中垫底的奖励
  wrong: -1, // 错误下注惩罚
};

// 骰子配置
export const DICE_VALUES = [1, 2, 3];

// UI配置
export const ANIMATION_DURATION = {
  camelMove: 800,      // 骆驼移动动画时长（毫秒）
  diceRoll: 1200,      // 骰子滚动动画时长
  betPlace: 400,       // 放置下注牌动画时长
  stackMove: 600,      // 骆驼堆叠移动时长
};

// 游戏板配置
export const CANVAS_CONFIG = {
  width: 1000,
  height: 1000,
  backgroundColor: 0xf5e6d3, // 沙漠色背景
};

// 圆形赛道渲染配置（不规则环形）
export const TRACK_CONFIG = {
  centerX: 500,        // 圆心X坐标
  centerY: 500,        // 圆心Y坐标
  radius: 320,         // 赛道半径
  spaceSize: 55,       // 格子大小
  spaceWidth: 50,      // 格子宽度
  spaceHeight: 65,     // 格子高度
  startAngle: -90,     // 起始角度（12点钟方向）
  startX: 100,         // 旧线性布局的起始X（保留以兼容）
  startY: 450,         // 旧线性布局的起始Y（保留以兼容）
  spacing: 5,          // 格子间距（保留以兼容）
  irregularOffsets: [  // 不规则偏移量，让赛道更自然
    { radiusOffset: 0, angleOffset: 0 },
    { radiusOffset: 15, angleOffset: 2 },
    { radiusOffset: -10, angleOffset: -3 },
    { radiusOffset: 20, angleOffset: 1 },
    { radiusOffset: -15, angleOffset: 2 },
    { radiusOffset: 10, angleOffset: -2 },
    { radiusOffset: 0, angleOffset: 3 },
    { radiusOffset: -20, angleOffset: -1 },
    { radiusOffset: 5, angleOffset: 2 },
    { radiusOffset: 15, angleOffset: -3 },
    { radiusOffset: -10, angleOffset: 1 },
    { radiusOffset: 10, angleOffset: -2 },
    { radiusOffset: -5, angleOffset: 3 },
    { radiusOffset: 20, angleOffset: 0 },
    { radiusOffset: -15, angleOffset: 2 },
    { radiusOffset: 0, angleOffset: -1 },
  ],
};

// 骆驼渲染配置
export const CAMEL_CONFIG = {
  width: 40,
  height: 50,
  stackOffset: 12, // 叠加时的径向偏移
};

// 金字塔渲染配置（在圆圈中央）
export const PYRAMID_CONFIG = {
  x: 500,
  y: 480,
  baseWidth: 140,
  height: 120,
};

// 帐篷配置
export const TENT_CONFIG = {
  positions: [
    { x: 420, y: 540 },
    { x: 560, y: 520 },
    { x: 500, y: 580 },
  ],
  width: 50,
  height: 45,
};

// 装饰元素配置
export const DECORATION_CONFIG = {
  palmTreeCount: 6,    // 棕榈树数量
  sandDuneCount: 5,    // 沙丘数量
  palmTreePositions: [ // 棕榈树具体位置
    { x: 150, y: 200, scale: 1.2 },
    { x: 850, y: 250, scale: 1.0 },
    { x: 200, y: 700, scale: 1.1 },
    { x: 800, y: 750, scale: 0.9 },
    { x: 120, y: 450, scale: 1.0 },
    { x: 880, y: 500, scale: 1.1 },
  ],
  sandDunePositions: [ // 沙丘具体位置
    { x: 100, y: 350, width: 150, height: 60 },
    { x: 750, y: 150, width: 180, height: 70 },
    { x: 80, y: 600, width: 140, height: 55 },
    { x: 820, y: 680, width: 160, height: 65 },
    { x: 450, y: 100, width: 170, height: 60 },
  ],
};
