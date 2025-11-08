import type { Camel, TrackSpace } from '../types';
import { CamelColor } from '../types';

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 洗牌算法（Fisher-Yates）
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 获取随机整数 [min, max]
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 从数组中随机选择一个元素
 */
export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 格式化金钱显示
 */
export const formatMoney = (amount: number): string => {
  return `${amount} EP`; // EP = Egyptian Pounds
};

/**
 * 获取骆驼在某个位置的堆叠信息
 */
export const getCamelsAtPosition = (
  camels: Camel[],
  position: number
): Camel[] => {
  return camels
    .filter((camel) => camel.position === position)
    .sort((a, b) => a.stackPosition - b.stackPosition);
};

/**
 * 获取骆驼及其上方所有骆驼
 */
export const getCamelAndAbove = (
  camels: Camel[],
  camelId: string
): Camel[] => {
  const camel = camels.find((c) => c.id === camelId);
  if (!camel) return [];

  const camelsAtPosition = getCamelsAtPosition(camels, camel.position);
  const camelIndex = camelsAtPosition.findIndex((c) => c.id === camelId);

  return camelsAtPosition.slice(camelIndex);
};

/**
 * 获取赛道上第一名的骆驼
 */
export const getLeadingCamel = (camels: Camel[]): Camel | null => {
  if (camels.length === 0) return null;

  const maxPosition = Math.max(...camels.map((c) => c.position));
  const camelsAtMax = getCamelsAtPosition(camels, maxPosition);

  // 返回最上面的骆驼
  return camelsAtMax[camelsAtMax.length - 1] || null;
};

/**
 * 获取赛道上第二名的骆驼
 */
export const getSecondPlaceCamel = (camels: Camel[]): Camel | null => {
  const leadingCamel = getLeadingCamel(camels);
  if (!leadingCamel) return null;

  const maxPosition = Math.max(...camels.map((c) => c.position));
  const camelsAtMax = getCamelsAtPosition(camels, maxPosition);

  // 如果最前位置有多只骆驼，第二名是倒数第二只
  if (camelsAtMax.length > 1) {
    return camelsAtMax[camelsAtMax.length - 2];
  }

  // 否则找次大位置
  const otherCamels = camels.filter((c) => c.position < maxPosition);
  if (otherCamels.length === 0) return null;

  const secondMaxPosition = Math.max(...otherCamels.map((c) => c.position));
  const camelsAtSecond = getCamelsAtPosition(camels, secondMaxPosition);

  return camelsAtSecond[camelsAtSecond.length - 1] || null;
};

/**
 * 获取最后一名的骆驼
 */
export const getLastCamel = (camels: Camel[]): Camel | null => {
  if (camels.length === 0) return null;

  const minPosition = Math.min(...camels.map((c) => c.position));
  const camelsAtMin = getCamelsAtPosition(camels, minPosition);

  // 返回最下面的骆驼
  return camelsAtMin[0] || null;
};

/**
 * 检查游戏是否结束（有骆驼越过终点）
 */
export const isGameFinished = (camels: Camel[], finishLine: number): boolean => {
  return camels.some((camel) => camel.position >= finishLine);
};

/**
 * 颜色名称映射（用于显示）
 */
export const CAMEL_COLOR_NAMES: Record<CamelColor, string> = {
  [CamelColor.RED]: '红色',
  [CamelColor.BLUE]: '蓝色',
  [CamelColor.GREEN]: '绿色',
  [CamelColor.YELLOW]: '黄色',
  [CamelColor.WHITE]: '白色',
};

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 深拷贝对象
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
