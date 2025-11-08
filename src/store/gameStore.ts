import { create } from 'zustand';
import type {
  GameState,
  ActionResult,
  DiceRollResult,
  CharacterType,
} from '../types';
import { CamelColor, SpectatorType, GamePhase } from '../types';
import { GameEngine } from '../game/GameEngine';
import { AIPlayer } from '../ai/AIPlayer';
import { soundManager } from '../utils/SoundManager';
import { multiplayerManager } from '../multiplayer/MultiplayerManager';

/**
 * 游戏Store接口
 */
interface GameStore extends GameState {
  // 游戏引擎实例
  gameEngine: GameEngine | null;

  // 多人游戏状态
  isMultiplayer: boolean;
  currentPlayerName: string | null;
  setMultiplayerMode: (isMultiplayer: boolean, playerName?: string) => void;

  // 动作
  initializeGame: (
    playerNames: string[],
    aiPlayerCount?: number,
    playerCharacters?: CharacterType[]
  ) => void;
  placeLegBet: (camelColor: CamelColor) => ActionResult;
  rollDice: () => ActionResult;
  placeSpectatorTile: (position: number, type: SpectatorType) => ActionResult;
  placeRaceBet: (camelColor: CamelColor, isWinner: boolean) => ActionResult;
  usePriestOracle: () => ActionResult;
  useSheikhMoveTile: (newPosition: number) => ActionResult;
  continueToNextLeg: () => void;
  executeAITurn: () => void;
  refreshGameState: () => void;
  resetGame: () => void;

  // UI 状态
  selectedAction: 'legBet' | 'rollDice' | 'spectator' | 'raceBet' | null;
  setSelectedAction: (
    action: 'legBet' | 'rollDice' | 'spectator' | 'raceBet' | null
  ) => void;

  selectedCamel: CamelColor | null;
  setSelectedCamel: (color: CamelColor | null) => void;

  selectedSpectatorType: SpectatorType | null;
  setSelectedSpectatorType: (type: SpectatorType | null) => void;

  // 动画状态
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;

  lastDiceRoll: DiceRollResult | null;
  setLastDiceRoll: (result: DiceRollResult | null) => void;
}

/**
 * 创建初始游戏状态
 */
const createInitialState = (): Partial<GameState> => ({
  gameId: '',
  phase: GamePhase.SETUP,
  currentPlayerIndex: 0,
  legNumber: 1,
  camels: [],
  players: [],
  track: [],
  pyramid: {
    dices: [],
    availableDices: [],
  },
  legBets: [],
  raceBets: [],
  history: [],
  legBetStacks: {
    red: [],
    blue: [],
    green: [],
    yellow: [],
    white: [],
  },
});

/**
 * 游戏状态管理Store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  ...createInitialState() as GameState,
  gameEngine: null,
  isMultiplayer: false,
  currentPlayerName: null,
  selectedAction: null,
  selectedCamel: null,
  selectedSpectatorType: null,
  isAnimating: false,
  lastDiceRoll: null,

  /**
   * 初始化游戏
   */
  initializeGame: (
    playerNames: string[],
    aiPlayerCount: number = 0,
    playerCharacters?: CharacterType[]
  ) => {
    const engine = new GameEngine();
    engine.initializeGame(playerNames, aiPlayerCount, playerCharacters);

    set({
      gameEngine: engine,
      ...engine.getGameState(),
    });

    // 播放游戏开始音效
    soundManager.playGameStart();

    // 如果第一个玩家是AI，自动执行
    const firstPlayer = engine.getGameState().players[0];
    if (firstPlayer?.isAI) {
      setTimeout(() => {
        get().executeAITurn();
      }, 1000);
    }
  },

  /**
   * 赛段下注
   */
  placeLegBet: (camelColor: CamelColor): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    const result = gameEngine.placeLegBet(camelColor);

    if (result.success) {
      const newState = gameEngine.getGameState();
      set({ ...newState });

      // 多人游戏模式下同步状态给其他玩家
      if (isMultiplayer) {
        multiplayerManager.syncGameState(newState);
      }

      // 播放下注音效
      soundManager.playBet();

      // 检查下一个玩家是否是AI
      const nextPlayer = gameEngine.getCurrentPlayer();
      if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 800);
      }
    }

    return result;
  },

  /**
   * 摇骰子
   */
  rollDice: (): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    // 播放骰子滚动音效
    soundManager.playDiceRoll();

    // 延迟1秒后再移动骆驼
    setTimeout(() => {
      const result = gameEngine.rollDice();

      if (result.success) {
        const newState = gameEngine.getGameState();
        set({
          ...newState,
          lastDiceRoll: result.data,
        });

        // 多人游戏模式下同步状态给其他玩家
        if (isMultiplayer) {
          multiplayerManager.syncGameState(newState);
        }

        // 同时播放骆驼移动音效
        soundManager.playCamelMove();

        // 检查下一个玩家是否是AI
        const nextPlayer = gameEngine.getCurrentPlayer();
        if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
          setTimeout(() => {
            get().executeAITurn();
          }, 1200);
        }
      }
    }, 1000);

    return { success: true, message: '骰子摇动中...' };
  },

  /**
   * 放置观众板块
   */
  placeSpectatorTile: (
    position: number,
    type: SpectatorType
  ): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    const result = gameEngine.placeSpectatorTile(position, type);

    if (result.success) {
      const newState = gameEngine.getGameState();
      set({ ...newState });

      // 多人游戏模式下同步状态给其他玩家
      if (isMultiplayer) {
        multiplayerManager.syncGameState(newState);
      }

      // 播放观众板块放置音效
      soundManager.playSpectatorPlace();

      // 检查下一个玩家是否是AI
      const nextPlayer = gameEngine.getCurrentPlayer();
      if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 800);
      }
    }

    return result;
  },

  /**
   * 比赛下注
   */
  placeRaceBet: (camelColor: CamelColor, isWinner: boolean): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    const result = gameEngine.placeRaceBet(camelColor, isWinner);

    if (result.success) {
      const newState = gameEngine.getGameState();
      set({ ...newState });

      // 多人游戏模式下同步状态给其他玩家
      if (isMultiplayer) {
        multiplayerManager.syncGameState(newState);
      }

      // 播放下注音效
      soundManager.playBet();

      // 检查下一个玩家是否是AI
      const nextPlayer = gameEngine.getCurrentPlayer();
      if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 800);
      }
    }

    return result;
  },

  /**
   * 使用祭司技能 - 神谕
   */
  usePriestOracle: (): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    const result = gameEngine.usePriestOracle();

    if (result.success) {
      const newState = gameEngine.getGameState();
      set({ ...newState });

      // 多人游戏模式下同步状态给其他玩家
      if (isMultiplayer) {
        multiplayerManager.syncGameState(newState);
      }

      // 播放技能音效
      soundManager.playClick();

      // 检查下一个玩家是否是AI
      const nextPlayer = gameEngine.getCurrentPlayer();
      if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 800);
      }
    }

    return result;
  },

  /**
   * 使用酋长技能 - 移动观众板块
   */
  useSheikhMoveTile: (newPosition: number): ActionResult => {
    const state = get();
    const { gameEngine, isMultiplayer, currentPlayerName, players, currentPlayerIndex } = state;
    if (!gameEngine) {
      return { success: false, message: '游戏未初始化' };
    }

    // 多人游戏模式下的权限检查 - 使用store中的状态而不是gameEngine
    if (isMultiplayer) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.name !== currentPlayerName) {
        return { success: false, message: '当前不是你的回合' };
      }
    }

    const result = gameEngine.useSheikhMoveTile(newPosition);

    if (result.success) {
      const newState = gameEngine.getGameState();
      set({ ...newState });

      // 多人游戏模式下同步状态给其他玩家
      if (isMultiplayer) {
        multiplayerManager.syncGameState(newState);
      }

      // 播放技能音效
      soundManager.playSpectatorPlace();

      // 检查下一个玩家是否是AI
      const nextPlayer = gameEngine.getCurrentPlayer();
      if (nextPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 800);
      }
    }

    return result;
  },

  /**
   * 继续到下一赛段
   */
  continueToNextLeg: () => {
    const { gameEngine } = get();
    if (gameEngine) {
      gameEngine.continueToNextLeg();
      set({ ...gameEngine.getGameState() });

      // 检查当前玩家是否是AI
      const currentPlayer = gameEngine.getCurrentPlayer();
      if (currentPlayer?.isAI && gameEngine.getGameState().phase === 'playing') {
        setTimeout(() => {
          get().executeAITurn();
        }, 1000);
      }
    }
  },

  /**
   * 执行AI玩家回合
   */
  executeAITurn: () => {
    const { gameEngine } = get();
    if (!gameEngine) return;

    const gameState = gameEngine.getGameState();
    const currentPlayer = gameEngine.getCurrentPlayer();

    if (!currentPlayer || !currentPlayer.isAI) return;
    if (gameState.phase !== 'playing') return;

    // AI做出决策
    const decision = AIPlayer.makeDecision(gameState, currentPlayer);

    // 执行决策
    let result: ActionResult;
    switch (decision.action) {
      case 'legBet':
        if (decision.camelColor) {
          result = get().placeLegBet(decision.camelColor);
        }
        break;
      case 'rollDice':
        result = get().rollDice();
        break;
      case 'spectator':
        if (decision.spectatorType && decision.position) {
          result = get().placeSpectatorTile(decision.position, decision.spectatorType);
        }
        break;
      case 'raceBet':
        if (decision.camelColor && decision.isWinner !== undefined) {
          result = get().placeRaceBet(decision.camelColor, decision.isWinner);
        }
        break;
    }
  },

  /**
   * 刷新游戏状态
   */
  refreshGameState: () => {
    const { gameEngine } = get();
    if (gameEngine) {
      set({ ...gameEngine.getGameState() });
    }
  },

  /**
   * 重置游戏
   */
  resetGame: () => {
    set({
      ...createInitialState() as GameState,
      gameEngine: null,
      selectedAction: null,
      selectedCamel: null,
      selectedSpectatorType: null,
      isAnimating: false,
      lastDiceRoll: null,
    });
  },

  /**
   * 设置多人游戏模式
   */
  setMultiplayerMode: (isMultiplayer: boolean, playerName?: string) => {
    set({
      isMultiplayer,
      currentPlayerName: playerName || null,
    });
  },

  /**
   * 设置选中的动作
   */
  setSelectedAction: (action) => {
    set({ selectedAction: action });
  },

  /**
   * 设置选中的骆驼
   */
  setSelectedCamel: (color) => {
    set({ selectedCamel: color });
  },

  /**
   * 设置选中的观众板块类型
   */
  setSelectedSpectatorType: (type) => {
    set({ selectedSpectatorType: type });
  },

  /**
   * 设置动画状态
   */
  setIsAnimating: (value) => {
    set({ isAnimating: value });
  },

  /**
   * 设置最后的骰子结果
   */
  setLastDiceRoll: (result) => {
    set({ lastDiceRoll: result });
  },
}));
