import type {
  LegBet,
  RaceBet,
  Player,
  Camel,
} from '../types';
import { CamelColor } from '../types';
import {
  LEG_BET_VALUES,
  LEG_BET_REWARDS,
  RACE_BET_REWARDS,
  CAMEL_COLORS,
} from '../utils/constants';

/**
 * 下注管理器 - 负责管理赛段下注和比赛下注
 */
export class BettingManager {
  private legBets: LegBet[];
  private raceBets: RaceBet[];
  private legBetStacks: { [key in CamelColor]: number[] };

  constructor() {
    this.legBets = [];
    this.raceBets = [];
    this.legBetStacks = this.initializeLegBetStacks();
  }

  /**
   * 初始化赛段下注牌堆
   */
  private initializeLegBetStacks(): { [key in CamelColor]: number[] } {
    const stacks = {} as { [key in CamelColor]: number[] };

    CAMEL_COLORS.forEach((color) => {
      stacks[color] = [...LEG_BET_VALUES];
    });

    return stacks;
  }

  /**
   * 放置赛段下注
   */
  placeLegBet(playerId: string, camelColor: CamelColor): number | null {
    const stack = this.legBetStacks[camelColor];

    if (stack.length === 0) {
      return null; // 没有可用的下注牌了
    }

    // 取出牌堆顶的牌
    const betValue = stack.shift()!;

    // 记录下注
    const bet: LegBet = {
      playerId,
      camelColor,
      value: betValue,
      order: this.legBets.filter((b) => b.camelColor === camelColor).length,
    };

    this.legBets.push(bet);

    return betValue;
  }

  /**
   * 放置比赛下注
   */
  placeRaceBet(
    playerId: string,
    camelColor: CamelColor,
    isWinner: boolean
  ): void {
    const existingBetsCount = this.raceBets.filter(
      (b) => b.isWinner === isWinner
    ).length;

    const bet: RaceBet = {
      playerId,
      camelColor,
      isWinner,
      order: existingBetsCount,
    };

    this.raceBets.push(bet);
  }

  /**
   * 结算赛段下注
   */
  settleLegBets(
    players: Player[],
    firstPlaceCamel: Camel | null,
    secondPlaceCamel: Camel | null,
    skillManager?: any
  ): { princessBonusPlayers: string[] } {
    const princessBonusPlayers: string[] = [];

    if (!firstPlaceCamel) return { princessBonusPlayers };

    // 结算第一名下注
    const firstPlaceBets = this.legBets.filter(
      (bet) => bet.camelColor === firstPlaceCamel.color
    );

    firstPlaceBets.forEach((bet) => {
      const player = players.find((p) => p.id === bet.playerId);
      if (!player) return;

      const reward = LEG_BET_REWARDS.first[bet.order] || 1;
      player.money += reward;

      // 应用公主技能：赛段下注第一名时额外获得2 EP
      if (skillManager) {
        const princessBonus = skillManager.getPrincessBonusReward(
          player,
          firstPlaceCamel.color,
          bet.camelColor
        );
        if (princessBonus > 0) {
          player.money += princessBonus;
          princessBonusPlayers.push(player.name);
        }
      }
    });

    // 结算第二名下注
    if (secondPlaceCamel) {
      const secondPlaceBets = this.legBets.filter(
        (bet) => bet.camelColor === secondPlaceCamel.color
      );

      secondPlaceBets.forEach((bet) => {
        const player = players.find((p) => p.id === bet.playerId);
        if (!player) return;

        const reward = LEG_BET_REWARDS.second[bet.order] || 1;
        player.money += reward;
      });
    }

    // 惩罚错误下注
    const wrongBets = this.legBets.filter(
      (bet) =>
        bet.camelColor !== firstPlaceCamel.color &&
        bet.camelColor !== secondPlaceCamel?.color
    );

    wrongBets.forEach((bet) => {
      const player = players.find((p) => p.id === bet.playerId);
      if (player) {
        player.money += LEG_BET_REWARDS.wrong; // -1
      }
    });

    return { princessBonusPlayers };
  }

  /**
   * 结算比赛下注
   */
  settleRaceBets(
    players: Player[],
    winnerCamel: Camel | null,
    loserCamel: Camel | null,
    skillManager?: any
  ): { scholarBonusPlayers: string[] } {
    const scholarBonusPlayers: string[] = [];

    if (!winnerCamel || !loserCamel) return { scholarBonusPlayers };

    // 结算冠军下注
    const winnerBets = this.raceBets.filter((bet) => bet.isWinner);

    winnerBets.forEach((bet) => {
      const player = players.find((p) => p.id === bet.playerId);
      if (!player) return;

      if (bet.camelColor === winnerCamel.color) {
        // 猜对了
        const reward = RACE_BET_REWARDS.winner[bet.order] || 1;
        player.money += reward;

        // 应用学者技能：比赛下注正确时额外获得3 EP
        if (skillManager) {
          const scholarBonus = skillManager.getScholarRaceBetBonus(player);
          if (scholarBonus > 0) {
            player.money += scholarBonus;
            scholarBonusPlayers.push(player.name);
          }
        }
      } else {
        // 猜错了
        player.money += RACE_BET_REWARDS.wrong;
      }
    });

    // 结算垫底下注
    const loserBets = this.raceBets.filter((bet) => !bet.isWinner);

    loserBets.forEach((bet) => {
      const player = players.find((p) => p.id === bet.playerId);
      if (!player) return;

      if (bet.camelColor === loserCamel.color) {
        // 猜对了
        const reward = RACE_BET_REWARDS.loser[bet.order] || 1;
        player.money += reward;

        // 应用学者技能：比赛下注正确时额外获得3 EP
        if (skillManager) {
          const scholarBonus = skillManager.getScholarRaceBetBonus(player);
          if (scholarBonus > 0) {
            player.money += scholarBonus;
            // 避免重复添加
            if (!scholarBonusPlayers.includes(player.name)) {
              scholarBonusPlayers.push(player.name);
            }
          }
        }
      } else {
        // 猜错了
        player.money += RACE_BET_REWARDS.wrong;
      }
    });

    return { scholarBonusPlayers };
  }

  /**
   * 重置赛段下注（新赛段开始时）
   */
  resetLegBets(): void {
    this.legBets = [];
    this.legBetStacks = this.initializeLegBetStacks();
  }

  /**
   * 获取所有赛段下注
   */
  getLegBets(): LegBet[] {
    return [...this.legBets];
  }

  /**
   * 获取所有比赛下注
   */
  getRaceBets(): RaceBet[] {
    return [...this.raceBets];
  }

  /**
   * 获取赛段下注牌堆
   */
  getLegBetStacks(): { [key in CamelColor]: number[] } {
    return { ...this.legBetStacks };
  }

  /**
   * 获取某个颜色的可用下注牌
   */
  getAvailableBetValue(camelColor: CamelColor): number | null {
    const stack = this.legBetStacks[camelColor];
    return stack.length > 0 ? stack[0] : null;
  }

  /**
   * 获取玩家的下注数量
   */
  getPlayerBetCount(playerId: string): {
    legBets: number;
    raceBets: number;
  } {
    return {
      legBets: this.legBets.filter((b) => b.playerId === playerId).length,
      raceBets: this.raceBets.filter((b) => b.playerId === playerId).length,
    };
  }

  /**
   * 设置状态（用于多人游戏状态同步）
   */
  setState(
    legBets: LegBet[],
    raceBets: RaceBet[],
    legBetStacks: { [key in CamelColor]: number[] }
  ): void {
    this.legBets = legBets;
    this.raceBets = raceBets;
    this.legBetStacks = legBetStacks;
  }
}
