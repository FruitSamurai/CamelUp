import type { Dice, Pyramid } from '../types';
import { CamelColor } from '../types';
import { CAMEL_COLORS, DICE_VALUES } from '../utils/constants';
import { randomChoice } from '../utils/helpers';

/**
 * 金字塔管理器 - 负责管理骰子的摇动和重置
 */
export class PyramidManager {
  private pyramid: Pyramid;

  constructor() {
    this.pyramid = this.createPyramid();
  }

  /**
   * 创建金字塔（初始化所有骰子）
   * 注意：骰子的点数在创建时就已确定，只是还未揭示
   */
  private createPyramid(): Pyramid {
    const dices: Dice[] = CAMEL_COLORS.map((color) => ({
      color,
      value: randomChoice(DICE_VALUES), // 预先确定骰子点数
      rolled: false,
    }));

    return {
      dices,
      availableDices: [...CAMEL_COLORS],
    };
  }

  /**
   * 摇骰子 - 随机选择一个未摇的骰子并掷出
   * 注意：骰子的点数已经在创建时确定，这里只是"揭示"结果
   */
  rollDice(): { color: CamelColor; value: number } | null {
    const { availableDices } = this.pyramid;

    if (availableDices.length === 0) {
      return null; // 所有骰子都已摇出
    }

    // 随机选择一个颜色
    const randomIndex = Math.floor(Math.random() * availableDices.length);
    const selectedColor = availableDices[randomIndex];

    // 找到对应的骰子（点数已预先确定）
    const dice = this.pyramid.dices.find((d) => d.color === selectedColor);
    if (!dice) {
      return null;
    }

    // 标记为已掷出
    dice.rolled = true;

    // 从可用列表中移除
    this.pyramid.availableDices = availableDices.filter(
      (color) => color !== selectedColor
    );

    return {
      color: selectedColor,
      value: dice.value, // 返回预先确定的点数
    };
  }

  /**
   * 重置金字塔（新赛段开始时）
   * 重新随机分配所有骰子的点数
   */
  resetPyramid(): void {
    this.pyramid.dices.forEach((dice) => {
      dice.value = randomChoice(DICE_VALUES); // 重新确定骰子点数
      dice.rolled = false;
    });
    this.pyramid.availableDices = [...CAMEL_COLORS];
  }

  /**
   * 检查是否所有骰子都已摇出（赛段是否结束）
   */
  isLegFinished(): boolean {
    return this.pyramid.availableDices.length === 0;
  }

  /**
   * 获取金字塔状态
   */
  getPyramid(): Pyramid {
    return { ...this.pyramid };
  }

  /**
   * 获取剩余骰子数量
   */
  getRemainingDiceCount(): number {
    return this.pyramid.availableDices.length;
  }

  /**
   * 获取已摇出的骰子
   */
  getRolledDices(): Dice[] {
    return this.pyramid.dices.filter((d) => d.rolled);
  }

  /**
   * 设置状态（用于多人游戏状态同步）
   */
  setState(pyramid: Pyramid): void {
    this.pyramid = pyramid;
  }
}
