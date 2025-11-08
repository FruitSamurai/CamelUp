import type { Player, CamelColor } from '../types';
import { CharacterType } from '../types';

/**
 * 角色技能管理器
 * 处理所有角色技能的触发和效果
 */
export class CharacterSkillManager {
  /**
   * 法老技能：回合开始时，如果金钱最少，获得1 EP
   */
  applyPharaohSkill(player: Player, allPlayers: Player[]): number {
    if (player.character !== CharacterType.PHARAOH) return 0;

    const minMoney = Math.min(...allPlayers.map(p => p.money));
    if (player.money === minMoney) {
      return 1;
    }
    return 0;
  }

  /**
   * 商人技能：摇骰子获得2 EP而非1 EP
   */
  getMerchantDiceReward(player: Player): number {
    if (player.character === CharacterType.MERCHANT) {
      return 2;
    }
    return 1;
  }

  /**
   * 探险家技能：放置观众板块时额外获得1 EP
   */
  getExplorerSpectatorReward(player: Player): number {
    if (player.character === CharacterType.EXPLORER) {
      return 1;
    }
    return 0;
  }

  /**
   * 公主技能：赛段下注猜对第一名时额外获得2 EP
   */
  getPrincessBonusReward(player: Player, winningColor: CamelColor, playerBetColor: CamelColor): number {
    if (player.character === CharacterType.PRINCESS && winningColor === playerBetColor) {
      return 2;
    }
    return 0;
  }

  /**
   * 游牧民技能：观众板块被触发时获得2 EP而非1 EP
   */
  getNomadSpectatorReward(player: Player): number {
    if (player.character === CharacterType.NOMAD) {
      return 2;
    }
    return 1;
  }

  /**
   * 学者技能：比赛下注正确时额外获得3 EP
   */
  getScholarRaceBetBonus(player: Player): number {
    if (player.character === CharacterType.SCHOLAR) {
      return 3;
    }
    return 0;
  }

  /**
   * 检查祭司是否可以使用神谕技能
   */
  canPriestUseOracle(player: Player): boolean {
    return player.character === CharacterType.PRIEST && !player.priestRevealedDice;
  }

  /**
   * 检查酋长是否可以移动观众板块
   */
  canSheikhMoveTile(player: Player): boolean {
    return player.character === CharacterType.SHEIKH &&
           !player.sheikhMovedTile &&
           player.spectatorTile !== null &&
           player.spectatorTile.position !== null;
  }

  /**
   * 重置赛段技能状态
   */
  resetLegSkills(players: Player[]): void {
    players.forEach(player => {
      player.priestRevealedDice = false;
      player.sheikhMovedTile = false;
    });
  }
}
