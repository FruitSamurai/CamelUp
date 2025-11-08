/**
 * 游戏状态持久化工具
 * 用于保存和恢复游戏状态，支持页面刷新
 *
 * 使用 sessionStorage 而非 localStorage：
 * - 刷新页面时状态保留
 * - 关闭浏览器标签页后状态自动清除
 * - 重新打开浏览器从主菜单开始
 */

const STORAGE_KEYS = {
  GAME_MODE: 'camel_up_game_mode',
  ROOM_ID: 'camel_up_room_id',
  PLAYER_NAME: 'camel_up_player_name',
  IS_HOST: 'camel_up_is_host',
  GAME_STATE: 'camel_up_game_state',
  SELECTED_CHARACTER: 'camel_up_selected_character',
};

export interface PersistedState {
  gameMode: 'menu' | 'single' | 'lobby' | 'room' | 'playing' | null;
  roomId: string | null;
  playerName: string;
  isHost: boolean;
  selectedCharacter: string | null;
}

class GameStateStorage {
  /**
   * 保存游戏模式
   */
  saveGameMode(mode: PersistedState['gameMode']): void {
    if (mode) {
      sessionStorage.setItem(STORAGE_KEYS.GAME_MODE, mode);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.GAME_MODE);
    }
  }

  /**
   * 获取游戏模式
   */
  getGameMode(): PersistedState['gameMode'] {
    const mode = sessionStorage.getItem(STORAGE_KEYS.GAME_MODE);
    return mode as PersistedState['gameMode'];
  }

  /**
   * 保存房间信息
   */
  saveRoomInfo(roomId: string | null, playerName: string, isHost: boolean): void {
    if (roomId) {
      sessionStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
      sessionStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
      sessionStorage.setItem(STORAGE_KEYS.IS_HOST, String(isHost));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ROOM_ID);
      sessionStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
      sessionStorage.removeItem(STORAGE_KEYS.IS_HOST);
    }
  }

  /**
   * 获取房间信息
   */
  getRoomInfo(): { roomId: string | null; playerName: string; isHost: boolean } {
    return {
      roomId: sessionStorage.getItem(STORAGE_KEYS.ROOM_ID),
      playerName: sessionStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '',
      isHost: sessionStorage.getItem(STORAGE_KEYS.IS_HOST) === 'true',
    };
  }

  /**
   * 保存选择的角色
   */
  saveSelectedCharacter(character: string | null): void {
    if (character) {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_CHARACTER, character);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_CHARACTER);
    }
  }

  /**
   * 获取选择的角色
   */
  getSelectedCharacter(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.SELECTED_CHARACTER);
  }

  /**
   * 保存完整状态
   */
  saveState(state: PersistedState): void {
    this.saveGameMode(state.gameMode);
    this.saveRoomInfo(state.roomId, state.playerName, state.isHost);
    this.saveSelectedCharacter(state.selectedCharacter);
  }

  /**
   * 获取完整状态
   */
  getState(): PersistedState {
    const roomInfo = this.getRoomInfo();
    return {
      gameMode: this.getGameMode(),
      roomId: roomInfo.roomId,
      playerName: roomInfo.playerName,
      isHost: roomInfo.isHost,
      selectedCharacter: this.getSelectedCharacter(),
    };
  }

  /**
   * 清除所有状态
   */
  clearState(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * 检查是否有保存的状态
   */
  hasPersistedState(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.GAME_MODE) !== null;
  }

  /**
   * 仅清除房间状态（用于离开房间但保留玩家名）
   */
  clearRoomState(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    sessionStorage.removeItem(STORAGE_KEYS.IS_HOST);
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_CHARACTER);
  }
}

export const gameStateStorage = new GameStateStorage();
