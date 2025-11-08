import type {
  Camel,
  SpectatorTile,
  TrackSpace,
  DiceRollResult,
} from '../types';
import { CamelColor, SpectatorType } from '../types';
import { CAMEL_COLORS, TRACK_LENGTH, FINISH_LINE } from '../utils/constants';
import { generateId, getCamelsAtPosition, getCamelAndAbove } from '../utils/helpers';

/**
 * 骆驼管理器 - 负责骆驼的创建、移动和堆叠逻辑
 */
export class CamelManager {
  private camels: Camel[];
  private track: TrackSpace[];

  constructor() {
    this.camels = [];
    this.track = this.createTrack();
  }

  /**
   * 创建赛道
   */
  private createTrack(): TrackSpace[] {
    const track: TrackSpace[] = [];
    for (let i = 0; i <= TRACK_LENGTH; i++) {
      track.push({
        position: i,
        camels: [],
        spectatorTile: null,
      });
    }
    return track;
  }

  /**
   * 初始化骆驼（游戏开始时随机放置在1-3格）
   */
  initializeCamels(): void {
    this.camels = CAMEL_COLORS.map((color) => {
      // 随机起始位置 1-3
      const startPosition = Math.floor(Math.random() * 3) + 1;

      const camel: Camel = {
        id: generateId(),
        color,
        position: startPosition,
        stackPosition: 0, // 临时值，稍后更新
      };

      return camel;
    });

    // 更新堆叠位置
    this.updateAllStackPositions();
  }

  /**
   * 移动骆驼
   */
  moveCamel(
    camelColor: CamelColor,
    steps: number,
    spectatorTiles: SpectatorTile[]
  ): DiceRollResult {
    const camel = this.camels.find((c) => c.color === camelColor);
    if (!camel) {
      throw new Error(`Camel ${camelColor} not found`);
    }

    const oldPosition = camel.position;

    // 获取该骆驼及其上方所有骆驼
    const camelsToMove = getCamelAndAbove(this.camels, camel.id);
    const carriedCamelIds = camelsToMove.map((c) => c.id);

    // 移动到新位置
    let newPosition = oldPosition + steps;

    // 移动所有骆驼
    camelsToMove.forEach((c) => {
      c.position = newPosition;
    });

    // 更新堆叠位置
    this.updateAllStackPositions();

    // 检查是否踩到观众板块
    const spectatorTile = spectatorTiles.find(
      (tile) => tile.position === newPosition
    );

    let hitSpectator = false;
    let spectatorEffect: DiceRollResult['spectatorEffect'] = undefined;

    if (spectatorTile) {
      hitSpectator = true;
      spectatorEffect = {
        type: spectatorTile.type,
        playerId: spectatorTile.playerId,
      };

      // 应用观众板块效果
      const extraMove = spectatorTile.type === SpectatorType.OASIS ? 1 : -1;
      newPosition += extraMove;

      // 再次移动所有骆驼
      camelsToMove.forEach((c) => {
        c.position = newPosition;
      });

      // 确保位置不小于0
      if (newPosition < 0) {
        camelsToMove.forEach((c) => {
          c.position = 0;
        });
        newPosition = 0;
      }

      // 更新堆叠位置
      this.updateAllStackPositions();
    }

    return {
      camelColor,
      diceValue: steps,
      oldPosition,
      newPosition,
      carriedCamels: carriedCamelIds,
      hitSpectator,
      spectatorEffect,
    };
  }

  /**
   * 更新所有骆驼的堆叠位置
   */
  private updateAllStackPositions(): void {
    // 按位置分组
    const positionGroups: { [key: number]: Camel[] } = {};

    this.camels.forEach((camel) => {
      if (!positionGroups[camel.position]) {
        positionGroups[camel.position] = [];
      }
      positionGroups[camel.position].push(camel);
    });

    // 为每个位置的骆驼分配堆叠位置
    Object.values(positionGroups).forEach((group) => {
      group.forEach((camel, index) => {
        camel.stackPosition = index;
      });
    });

    // 更新赛道信息
    this.updateTrack();
  }

  /**
   * 更新赛道信息
   */
  private updateTrack(): void {
    // 清空所有格子
    this.track.forEach((space) => {
      space.camels = [];
    });

    // 按位置分组骆驼
    this.camels.forEach((camel) => {
      const space = this.track[camel.position];
      if (space) {
        space.camels.push(camel.id);
      }
    });

    // 对每个格子的骆驼按stackPosition排序
    this.track.forEach((space) => {
      space.camels.sort((a, b) => {
        const camelA = this.camels.find((c) => c.id === a);
        const camelB = this.camels.find((c) => c.id === b);
        return (camelA?.stackPosition || 0) - (camelB?.stackPosition || 0);
      });
    });
  }

  /**
   * 放置观众板块
   */
  placeSpectatorTile(position: number, tile: SpectatorTile): boolean {
    // 检查位置是否有效
    if (position < 1 || position > TRACK_LENGTH) {
      return false;
    }

    const space = this.track[position];

    // 检查该位置是否已有观众板块或骆驼
    if (space.spectatorTile || space.camels.length > 0) {
      return false;
    }

    // 检查相邻位置是否有观众板块
    const prevSpace = this.track[position - 1];
    const nextSpace = this.track[position + 1];

    if (prevSpace?.spectatorTile || nextSpace?.spectatorTile) {
      return false;
    }

    // 放置板块
    space.spectatorTile = tile;
    return true;
  }

  /**
   * 移除观众板块
   */
  removeSpectatorTile(position: number): void {
    const space = this.track[position];
    if (space) {
      space.spectatorTile = null;
    }
  }

  /**
   * 获取所有骆驼
   */
  getCamels(): Camel[] {
    return [...this.camels];
  }

  /**
   * 获取赛道
   */
  getTrack(): TrackSpace[] {
    return [...this.track];
  }

  /**
   * 根据颜色获取骆驼
   */
  getCamelByColor(color: CamelColor): Camel | undefined {
    return this.camels.find((c) => c.color === color);
  }

  /**
   * 获取第一名的骆驼
   */
  getLeadingCamel(): Camel | null {
    const maxPosition = Math.max(...this.camels.map((c) => c.position));
    const camelsAtMax = getCamelsAtPosition(this.camels, maxPosition);
    return camelsAtMax[camelsAtMax.length - 1] || null;
  }

  /**
   * 获取第二名的骆驼
   */
  getSecondPlaceCamel(): Camel | null {
    const leadingCamel = this.getLeadingCamel();
    if (!leadingCamel) return null;

    const maxPosition = Math.max(...this.camels.map((c) => c.position));
    const camelsAtMax = getCamelsAtPosition(this.camels, maxPosition);

    if (camelsAtMax.length > 1) {
      return camelsAtMax[camelsAtMax.length - 2];
    }

    const otherCamels = this.camels.filter((c) => c.position < maxPosition);
    if (otherCamels.length === 0) return null;

    const secondMaxPosition = Math.max(...otherCamels.map((c) => c.position));
    const camelsAtSecond = getCamelsAtPosition(this.camels, secondMaxPosition);

    return camelsAtSecond[camelsAtSecond.length - 1] || null;
  }

  /**
   * 检查游戏是否结束
   */
  isGameFinished(): boolean {
    return this.camels.some((camel) => camel.position >= FINISH_LINE);
  }

  /**
   * 重置骆驼位置（新游戏）
   */
  reset(): void {
    this.initializeCamels();
  }

  /**
   * 设置状态（用于多人游戏状态同步）
   */
  setState(camels: Camel[], track: TrackSpace[]): void {
    this.camels = camels;
    this.track = track;
  }
}
