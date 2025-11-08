import type {
  GameState,
  Player,
  SpectatorTile,
  GameConfig,
  ActionResult,
  GameHistoryEntry,
  CharacterType,
  Dice,
} from '../types';
import { GamePhase, CamelColor, SpectatorType } from '../types';
import { PyramidManager } from './PyramidManager';
import { CamelManager } from './CamelManager';
import { BettingManager } from './BettingManager';
import { CharacterSkillManager } from './CharacterSkillManager';
import {
  STARTING_MONEY,
  TRACK_LENGTH,
  DICE_ROLL_REWARD,
  SPECTATOR_TILE_REWARD,
} from '../utils/constants';
import { generateId } from '../utils/helpers';

/**
 * 游戏引擎 - 核心游戏逻辑控制器
 */
export class GameEngine {
  private gameId: string;
  private phase: GamePhase;
  private currentPlayerIndex: number;
  private legNumber: number;
  private players: Player[];
  private history: GameHistoryEntry[];

  private pyramidManager: PyramidManager;
  private camelManager: CamelManager;
  private bettingManager: BettingManager;
  private skillManager: CharacterSkillManager;

  constructor(config: Partial<GameConfig> = {}) {
    this.gameId = generateId();
    this.phase = GamePhase.SETUP;
    this.currentPlayerIndex = 0;
    this.legNumber = 1;
    this.players = [];
    this.history = [];

    this.pyramidManager = new PyramidManager();
    this.camelManager = new CamelManager();
    this.bettingManager = new BettingManager();
    this.skillManager = new CharacterSkillManager();
  }

  /**
   * 初始化游戏
   */
  initializeGame(
    playerNames: string[],
    aiPlayerCount: number = 0,
    playerCharacters?: CharacterType[]
  ): void {
    const totalPlayers = playerNames.length + aiPlayerCount;

    if (totalPlayers < 2 || totalPlayers > 8) {
      throw new Error('Player count must be between 2 and 8');
    }

    // 创建人类玩家
    this.players = playerNames.map((name, index) => ({
      id: generateId(),
      name,
      character: playerCharacters?.[index],
      money: STARTING_MONEY,
      spectatorTile: null,
      hasRolledDice: false,
      isAI: false,
    }));

    // 创建AI玩家
    for (let i = 0; i < aiPlayerCount; i++) {
      this.players.push({
        id: generateId(),
        name: `AI玩家${i + 1} 🤖`,
        character: playerCharacters?.[playerNames.length + i],
        money: STARTING_MONEY,
        spectatorTile: null,
        hasRolledDice: false,
        isAI: true,
      });
    }

    // 初始化骆驼
    this.camelManager.initializeCamels();

    // 设置阶段
    this.phase = GamePhase.PLAYING;

    this.addHistory('game', 'System', '游戏开始！');
  }

  /**
   * 执行玩家动作 - 赛段下注
   */
  placeLegBet(camelColor: CamelColor): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    const betValue = this.bettingManager.placeLegBet(
      currentPlayer.id,
      camelColor
    );

    if (betValue === null) {
      return {
        success: false,
        message: '该颜色的下注牌已用完',
      };
    }

    this.addHistory(
      'bet',
      currentPlayer.name,
      `下注 ${betValue} EP 在 ${camelColor} 骆驼`
    );

    this.nextPlayer();

    return {
      success: true,
      message: `下注成功！下注牌价值: ${betValue} EP`,
      data: { betValue },
    };
  }

  /**
   * 执行玩家动作 - 摇骰子
   */
  rollDice(): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    const diceResult = this.pyramidManager.rollDice();
    if (!diceResult) {
      return {
        success: false,
        message: '所有骰子都已摇出，赛段已结束',
      };
    }

    // 移动骆驼
    const spectatorTiles = this.getActiveSpectatorTiles();
    const moveResult = this.camelManager.moveCamel(
      diceResult.color,
      diceResult.value,
      spectatorTiles
    );

    // 奖励玩家 - 应用商人技能
    const diceReward = this.skillManager.getMerchantDiceReward(currentPlayer);
    currentPlayer.money += diceReward;
    currentPlayer.hasRolledDice = true;

    // 如果踩到观众板块，奖励板块拥有者 - 应用游牧民技能
    if (moveResult.hitSpectator && moveResult.spectatorEffect) {
      const tileOwner = this.players.find(
        (p) => p.id === moveResult.spectatorEffect!.playerId
      );
      if (tileOwner) {
        const spectatorReward = this.skillManager.getNomadSpectatorReward(tileOwner);
        tileOwner.money += spectatorReward;
        // 移除观众板块
        const tile = spectatorTiles.find(
          (t) => t.playerId === tileOwner.id
        );
        if (tile && tile.position !== null) {
          this.camelManager.removeSpectatorTile(tile.position);
          tileOwner.spectatorTile = null;
        }
      }
    }

    this.addHistory(
      'roll',
      currentPlayer.name,
      `摇出 ${diceResult.color} 骆驼，移动 ${diceResult.value} 格`
    );

    // 检查赛段是否结束
    if (this.pyramidManager.isLegFinished()) {
      this.endLeg();
    }

    // 检查游戏是否结束
    if (this.camelManager.isGameFinished()) {
      this.endGame();
    }

    this.nextPlayer();

    return {
      success: true,
      message: `摇出 ${diceResult.color} 骆驼，移动 ${diceResult.value} 格`,
      data: moveResult,
    };
  }

  /**
   * 执行玩家动作 - 放置观众板块
   */
  placeSpectatorTile(
    position: number,
    type: SpectatorType
  ): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    if (currentPlayer.spectatorTile && currentPlayer.spectatorTile.position !== null) {
      return {
        success: false,
        message: '你的观众板块已经在赛道上了',
      };
    }

    const tile: SpectatorTile = {
      playerId: currentPlayer.id,
      type,
      position,
    };

    const success = this.camelManager.placeSpectatorTile(position, tile);

    if (!success) {
      return {
        success: false,
        message: '无法在此位置放置观众板块（位置无效或已有板块/骆驼）',
      };
    }

    currentPlayer.spectatorTile = tile;

    // 应用探险家技能
    const explorerBonus = this.skillManager.getExplorerSpectatorReward(currentPlayer);
    if (explorerBonus > 0) {
      currentPlayer.money += explorerBonus;
    }

    this.addHistory(
      'spectator',
      currentPlayer.name,
      `在位置 ${position} 放置 ${type === SpectatorType.OASIS ? '绿洲' : '海市蜃楼'} 板块`
    );

    this.nextPlayer();

    return {
      success: true,
      message: '观众板块放置成功',
    };
  }

  /**
   * 执行玩家动作 - 比赛下注
   */
  placeRaceBet(camelColor: CamelColor, isWinner: boolean): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    this.bettingManager.placeRaceBet(
      currentPlayer.id,
      camelColor,
      isWinner
    );

    this.addHistory(
      'bet',
      currentPlayer.name,
      `下注 ${camelColor} 骆驼会${isWinner ? '冠军' : '垫底'}`
    );

    this.nextPlayer();

    return {
      success: true,
      message: `已下注 ${camelColor} 骆驼${isWinner ? '冠军' : '垫底'}`,
    };
  }

  /**
   * 使用祭司技能 - 查看金字塔中的随机骰子
   * 预知一个尚未摇出的骰子的颜色和点数
   */
  usePriestOracle(): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    if (!this.skillManager.canPriestUseOracle(currentPlayer)) {
      return {
        success: false,
        message: '你不是祭司，或本赛段已使用过神谕技能',
      };
    }

    const pyramid = this.pyramidManager.getPyramid();
    const availableColors = pyramid.availableDices;

    if (availableColors.length === 0) {
      return {
        success: false,
        message: '金字塔中已无可用骰子',
      };
    }

    // 随机选择一个未掷出的骰子颜色
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const selectedColor = availableColors[randomIndex];

    // 找到对应的骰子，获取其预先确定的点数
    const dice = pyramid.dices.find((d) => d.color === selectedColor);
    if (!dice) {
      return { success: false, message: '未找到对应骰子' };
    }

    const diceValue = dice.value; // 获取预先确定的点数（真正的预知）

    currentPlayer.priestRevealedDice = true;

    this.addHistory(
      'skill',
      currentPlayer.name,
      `使用神谕：预知到 ${selectedColor} 骆驼将移动 ${diceValue} 格`
    );

    this.nextPlayer();

    return {
      success: true,
      message: `神谕显示：${selectedColor} 骆驼将移动 ${diceValue} 格`,
      data: {
        revealedDice: {
          color: selectedColor,
          value: diceValue
        }
      },
    };
  }

  /**
   * 使用酋长技能 - 移动观众板块
   */
  useSheikhMoveTile(newPosition: number): ActionResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, message: '无效的玩家' };
    }

    if (!this.skillManager.canSheikhMoveTile(currentPlayer)) {
      return {
        success: false,
        message: '你不是酋长，或本赛段已移动过板块，或没有已放置的板块',
      };
    }

    const oldPosition = currentPlayer.spectatorTile!.position!;

    // 移除旧板块
    this.camelManager.removeSpectatorTile(oldPosition);

    // 尝试放置新板块
    const newTile: SpectatorTile = {
      ...currentPlayer.spectatorTile!,
      position: newPosition,
    };

    const success = this.camelManager.placeSpectatorTile(newPosition, newTile);

    if (!success) {
      // 放置失败，恢复旧位置
      this.camelManager.placeSpectatorTile(oldPosition, currentPlayer.spectatorTile!);
      return {
        success: false,
        message: '无法移动到该位置（位置无效或已有板块/骆驼）',
      };
    }

    currentPlayer.spectatorTile = newTile;
    currentPlayer.sheikhMovedTile = true;

    this.addHistory(
      'skill',
      currentPlayer.name,
      `使用部落智慧：将观众板块从位置 ${oldPosition} 移动到位置 ${newPosition}`
    );

    this.nextPlayer();

    return {
      success: true,
      message: `板块已从位置 ${oldPosition} 移动到位置 ${newPosition}`,
    };
  }

  /**
   * 结束赛段
   */
  private endLeg(): void {
    const firstPlace = this.camelManager.getLeadingCamel();
    const secondPlace = this.camelManager.getSecondPlaceCamel();

    // 结算赛段下注 - 传递skillManager以应用公主技能
    const settlementResult = this.bettingManager.settleLegBets(
      this.players,
      firstPlace,
      secondPlace,
      this.skillManager
    );

    // 为触发公主技能的玩家添加历史记录
    settlementResult.princessBonusPlayers.forEach((playerName) => {
      this.addHistory(
        'skill',
        playerName,
        '公主技能触发：赛段下注第一名，额外获得2 EP'
      );
    });

    this.addHistory(
      'leg',
      'System',
      `赛段 ${this.legNumber} 结束！第1名: ${firstPlace?.color || '无'}, 第2名: ${secondPlace?.color || '无'}`
    );

    // 重置赛段
    this.pyramidManager.resetPyramid();
    this.bettingManager.resetLegBets();
    this.players.forEach((p) => (p.hasRolledDice = false));
    this.skillManager.resetLegSkills(this.players);
    this.legNumber++;

    // 临时设置为赛段结束阶段，用于显示结算信息
    this.phase = GamePhase.LEG_END;
  }

  /**
   * 继续到下一赛段
   */
  continueToNextLeg(): void {
    if (this.phase === GamePhase.LEG_END) {
      this.phase = GamePhase.PLAYING;
      this.addHistory(
        'leg',
        'System',
        `赛段 ${this.legNumber} 开始！`
      );
    }
  }

  /**
   * 结束游戏
   */
  private endGame(): void {
    const winner = this.camelManager.getLeadingCamel();
    const loser = this.getLastCamel();

    // 结算比赛下注 - 传递skillManager以应用学者技能
    const settlementResult = this.bettingManager.settleRaceBets(
      this.players,
      winner,
      loser,
      this.skillManager
    );

    // 为触发学者技能的玩家添加历史记录
    settlementResult.scholarBonusPlayers.forEach((playerName) => {
      this.addHistory(
        'skill',
        playerName,
        '学者技能触发：比赛下注正确，额外获得3 EP'
      );
    });

    this.phase = GamePhase.GAME_END;

    this.addHistory('game', 'System', '游戏结束！');
  }

  /**
   * 切换到下一个玩家
   */
  private nextPlayer(): void {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;

    // 应用法老技能：回合开始时，如果金钱最少，获得1 EP
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      const pharaohBonus = this.skillManager.applyPharaohSkill(currentPlayer, this.players);
      if (pharaohBonus > 0) {
        currentPlayer.money += pharaohBonus;
        this.addHistory(
          'skill',
          currentPlayer.name,
          '法老技能触发：获得1 EP（回合开始时金钱最少）'
        );
      }
    }
  }

  /**
   * 获取当前玩家
   */
  getCurrentPlayer(): Player | null {
    return this.players[this.currentPlayerIndex] || null;
  }

  /**
   * 获取最后一名的骆驼
   */
  private getLastCamel() {
    const camels = this.camelManager.getCamels();
    const minPosition = Math.min(...camels.map((c) => c.position));
    const camelsAtMin = camels.filter((c) => c.position === minPosition);
    return camelsAtMin[0] || null;
  }

  /**
   * 获取活动的观众板块
   */
  private getActiveSpectatorTiles(): SpectatorTile[] {
    return this.players
      .map((p) => p.spectatorTile)
      .filter((tile): tile is SpectatorTile => tile !== null && tile.position !== null);
  }

  /**
   * 添加历史记录
   */
  private addHistory(
    type: GameHistoryEntry['type'],
    playerName: string,
    details: string
  ): void {
    this.history.push({
      type,
      playerId: '',
      playerName,
      timestamp: Date.now(),
      details,
    });
  }

  /**
   * 获取游戏状态
   */
  getGameState(): GameState {
    return {
      gameId: this.gameId,
      phase: this.phase,
      currentPlayerIndex: this.currentPlayerIndex,
      legNumber: this.legNumber,
      camels: this.camelManager.getCamels(),
      players: this.players,
      track: this.camelManager.getTrack(),
      pyramid: this.pyramidManager.getPyramid(),
      legBets: this.bettingManager.getLegBets(),
      raceBets: this.bettingManager.getRaceBets(),
      history: this.history,
      legBetStacks: this.bettingManager.getLegBetStacks(),
    };
  }

  /**
   * 设置游戏状态（用于多人游戏状态同步）
   */
  setGameState(state: GameState): void {
    this.gameId = state.gameId;
    this.phase = state.phase;
    this.currentPlayerIndex = state.currentPlayerIndex;
    this.legNumber = state.legNumber;
    this.players = state.players;
    this.history = state.history;

    // 更新子管理器的状态
    this.camelManager.setState(state.camels, state.track);
    this.pyramidManager.setState(state.pyramid);
    this.bettingManager.setState(state.legBets, state.raceBets, state.legBetStacks);
  }

  /**
   * 获取获胜者
   */
  getWinner(): Player | null {
    if (this.phase !== GamePhase.GAME_END) return null;

    return this.players.reduce((prev, current) =>
      prev.money > current.money ? prev : current
    );
  }
}
