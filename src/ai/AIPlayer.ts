import type { GameState, Camel, CamelColor, SpectatorType, Player } from '../types';
import { CAMEL_COLORS, TRACK_LENGTH } from '../utils/constants';

/**
 * AI决策类型
 */
export interface AIDecision {
  action: 'legBet' | 'rollDice' | 'spectator' | 'raceBet';
  camelColor?: CamelColor;
  spectatorType?: SpectatorType;
  position?: number;
  isWinner?: boolean;
}

/**
 * AI玩家决策引擎
 */
export class AIPlayer {
  /**
   * 分析当前局面并做出决策
   */
  static makeDecision(gameState: GameState, player: Player): AIDecision {
    const { camels, pyramid, legBetStacks, track, raceBets } = gameState;

    // 分析骆驼排名
    const rankings = this.analyzeCamelRankings(camels);
    const leadingCamel = rankings[0];
    const secondCamel = rankings[1];

    // 评估各种动作的价值
    const legBetValue = this.evaluateLegBet(leadingCamel, secondCamel, legBetStacks);
    const rollDiceValue = this.evaluateRollDice(pyramid);
    const spectatorValue = this.evaluateSpectator(player, camels, track);
    const raceBetValue = this.evaluateRaceBet(camels, raceBets, gameState.legNumber);

    // 选择价值最高的动作
    const actions = [
      { type: 'legBet' as const, value: legBetValue },
      { type: 'rollDice' as const, value: rollDiceValue },
      { type: 'spectator' as const, value: spectatorValue },
      { type: 'raceBet' as const, value: raceBetValue },
    ];

    const bestAction = actions.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );

    // 根据最佳动作类型生成决策
    switch (bestAction.type) {
      case 'legBet':
        return this.decideLegBet(leadingCamel, secondCamel, legBetStacks);
      case 'rollDice':
        return { action: 'rollDice' };
      case 'spectator':
        return this.decideSpectator(camels, track);
      case 'raceBet':
        return this.decideRaceBet(camels, gameState.legNumber);
      default:
        return { action: 'rollDice' };
    }
  }

  /**
   * 分析骆驼排名（按位置和堆叠位置排序）
   */
  private static analyzeCamelRankings(camels: Camel[]): Camel[] {
    return [...camels].sort((a, b) => {
      if (a.position !== b.position) {
        return b.position - a.position; // 位置高的在前
      }
      return b.stackPosition - a.stackPosition; // 堆叠高的在前
    });
  }

  /**
   * 评估赛段下注价值
   */
  private static evaluateLegBet(
    leadingCamel: Camel,
    secondCamel: Camel,
    legBetStacks: GameState['legBetStacks']
  ): number {
    // 检查领先骆驼的下注牌是否还有高价值的
    const leadingStack = legBetStacks[leadingCamel.color];
    const secondStack = legBetStacks[secondCamel.color];

    if (leadingStack.length === 0 && secondStack.length === 0) {
      return 0; // 没有可下注的牌
    }

    // 领先骆驼的下注价值更高
    const leadingValue = leadingStack.length > 0 ? leadingStack[0] * 1.5 : 0;
    const secondValue = secondStack.length > 0 ? secondStack[0] * 1.2 : 0;

    return Math.max(leadingValue, secondValue);
  }

  /**
   * 评估摇骰子价值
   */
  private static evaluateRollDice(pyramid: GameState['pyramid']): number {
    // 摇骰子是稳定收益（+1 EP）
    // 剩余骰子越多，价值稍高（有更多选择）
    const diceRemaining = pyramid.availableDices.length;
    return 1 + diceRemaining * 0.1;
  }

  /**
   * 评估放置观众板块价值
   */
  private static evaluateSpectator(
    player: Player,
    camels: Camel[],
    track: GameState['track']
  ): number {
    // 如果已经放置了观众板块，价值为0
    if (player.spectatorTile && player.spectatorTile.position !== null) {
      return 0;
    }

    // 根据骆驼位置评估放置价值
    const rankings = this.analyzeCamelRankings(camels);
    const leadingCamel = rankings[0];

    // 如果领先骆驼离终点很近，价值降低
    if (leadingCamel.position > TRACK_LENGTH - 4) {
      return 0.5;
    }

    // 中等价值，可以影响比赛结果
    return 2.0;
  }

  /**
   * 评估比赛下注价值
   */
  private static evaluateRaceBet(
    camels: Camel[],
    existingBets: GameState['raceBets'],
    legNumber: number
  ): number {
    // 早期下注比赛结果价值更高（奖励更大）
    const earlyGameBonus = legNumber <= 2 ? 1.5 : 1.0;

    // 如果已经有很多比赛下注了，价值降低
    const betCount = existingBets.length;
    if (betCount > 8) {
      return 0.5 * earlyGameBonus;
    }

    // 根据骆驼位置判断
    const rankings = this.analyzeCamelRankings(camels);
    const leadingPosition = rankings[0].position;

    // 如果比赛还在早期，比赛下注价值高
    if (leadingPosition < TRACK_LENGTH / 2) {
      return 2.5 * earlyGameBonus;
    }

    return 1.0 * earlyGameBonus;
  }

  /**
   * 决定赛段下注
   */
  private static decideLegBet(
    leadingCamel: Camel,
    secondCamel: Camel,
    legBetStacks: GameState['legBetStacks']
  ): AIDecision {
    const leadingStack = legBetStacks[leadingCamel.color];
    const secondStack = legBetStacks[secondCamel.color];

    // 优先押注领先的骆驼，除非第二名的下注牌价值明显更高
    if (leadingStack.length > 0) {
      const leadingValue = leadingStack[0];
      const secondValue = secondStack.length > 0 ? secondStack[0] : 0;

      if (secondValue > leadingValue + 2) {
        return { action: 'legBet', camelColor: secondCamel.color };
      }

      return { action: 'legBet', camelColor: leadingCamel.color };
    }

    if (secondStack.length > 0) {
      return { action: 'legBet', camelColor: secondCamel.color };
    }

    // 如果两个都没有，选择其他有牌的骆驼
    for (const color of CAMEL_COLORS) {
      if (legBetStacks[color].length > 0) {
        return { action: 'legBet', camelColor: color };
      }
    }

    // 没有可下注的牌，改为摇骰子
    return { action: 'rollDice' };
  }

  /**
   * 决定放置观众板块
   */
  private static decideSpectator(
    camels: Camel[],
    track: GameState['track']
  ): AIDecision {
    const rankings = this.analyzeCamelRankings(camels);
    const leadingCamel = rankings[0];
    const trailingCamel = rankings[rankings.length - 1];

    // 策略：在领先骆驼前方放置绿洲，或在落后骆驼位置放海市蜃楼
    const useOasis = Math.random() > 0.3; // 70%概率用绿洲

    if (useOasis) {
      // 在领先骆驼前方2-4格放置绿洲
      const targetPosition = Math.min(
        leadingCamel.position + Math.floor(Math.random() * 3) + 2,
        TRACK_LENGTH - 2
      );

      // 检查该位置是否可用
      const space = track[targetPosition];
      if (space && space.camels.length === 0 && !space.spectatorTile) {
        return {
          action: 'spectator',
          spectatorType: 'oasis' as SpectatorType,
          position: targetPosition,
        };
      }
    }

    // 备用策略：找一个空位置
    for (let i = 1; i < TRACK_LENGTH - 1; i++) {
      const space = track[i];
      if (space.camels.length === 0 && !space.spectatorTile) {
        return {
          action: 'spectator',
          spectatorType: useOasis ? ('oasis' as SpectatorType) : ('mirage' as SpectatorType),
          position: i,
        };
      }
    }

    // 如果找不到合适位置，改为摇骰子
    return { action: 'rollDice' };
  }

  /**
   * 决定比赛下注
   */
  private static decideRaceBet(camels: Camel[], legNumber: number): AIDecision {
    const rankings = this.analyzeCamelRankings(camels);
    const leadingCamel = rankings[0];
    const trailingCamel = rankings[rankings.length - 1];

    // 80%概率押注冠军，20%概率押注垫底
    const betOnWinner = Math.random() > 0.2;

    if (betOnWinner) {
      // 押注领先的骆驼为冠军
      return {
        action: 'raceBet',
        camelColor: leadingCamel.color,
        isWinner: true,
      };
    } else {
      // 押注落后的骆驼为垫底
      return {
        action: 'raceBet',
        camelColor: trailingCamel.color,
        isWinner: false,
      };
    }
  }

  /**
   * 生成AI玩家名称
   */
  static generateAIName(index: number): string {
    const names = [
      '智能骆驼🤖',
      'AI法老👑',
      '电子贝都因人💻',
      '机器商人🎯',
      '沙漠算法🏜️',
      '赛博预言家🔮',
      '量子赌徒⚛️',
      '数字游牧者🌟',
    ];
    return names[index % names.length];
  }
}
