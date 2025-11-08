import * as PIXI from 'pixi.js';
import type { Camel, TrackSpace, SpectatorTile } from '../types';
import { SpectatorType } from '../types';
import {
  CAMEL_COLOR_HEX,
  TRACK_CONFIG,
  CAMEL_CONFIG,
  CANVAS_CONFIG,
  PYRAMID_CONFIG,
  TENT_CONFIG,
  DECORATION_CONFIG,
} from '../utils/constants';
import gsap from 'gsap';

/**
 * PixiJS 渲染器 - 负责游戏画面的渲染
 */
export class GameRenderer {
  private app: PIXI.Application;
  private trackContainer: PIXI.Container;
  private camelContainer: PIXI.Container;
  private decorationContainer: PIXI.Container;
  private camelSprites: Map<string, PIXI.Graphics>;
  private isReady: boolean = false;

  private constructor() {
    this.app = new PIXI.Application();
    this.trackContainer = new PIXI.Container();
    this.camelContainer = new PIXI.Container();
    this.decorationContainer = new PIXI.Container();
    this.camelSprites = new Map();
  }

  /**
   * 静态工厂方法 - 创建并初始化渲染器
   */
  static async create(canvas: HTMLCanvasElement): Promise<GameRenderer> {
    try {
      console.log('GameRenderer.create: 开始创建渲染器');
      const renderer = new GameRenderer();
      console.log('GameRenderer.create: 渲染器实例已创建');
      await renderer.initialize(canvas);
      console.log('GameRenderer.create: 渲染器初始化完成');
      return renderer;
    } catch (error) {
      console.error('GameRenderer.create: 渲染器创建失败', error);
      throw new Error(`渲染器创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 初始化应用
   */
  private async initialize(canvas: HTMLCanvasElement): Promise<void> {
    try {
      console.log('GameRenderer.initialize: 开始初始化 PixiJS Application');

      // 检查canvas是否有效
      if (!canvas) {
        throw new Error('Canvas element is null');
      }

      await this.app.init({
        canvas,
        width: CANVAS_CONFIG.width,
        height: CANVAS_CONFIG.height,
        backgroundColor: CANVAS_CONFIG.backgroundColor,
        antialias: true,
      });

      console.log('GameRenderer.initialize: PixiJS Application 初始化成功');

      // 添加容器，顺序很重要：装饰 -> 赛道 -> 骆驼
      this.app.stage.addChild(this.decorationContainer);
      this.app.stage.addChild(this.trackContainer);
      this.app.stage.addChild(this.camelContainer);

      console.log('GameRenderer.initialize: 容器已添加到舞台');

      // 渲染埃及风格装饰
      this.renderDecorations();

      console.log('GameRenderer.initialize: 装饰已渲染');

      this.isReady = true;
      console.log('GameRenderer.initialize: 渲染器已准备就绪');
    } catch (error) {
      console.error('GameRenderer.initialize: 初始化失败', error);
      throw new Error(`PixiJS初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 渲染赛道（环形布局）
   */
  renderTrack(track: TrackSpace[]): void {
    if (!this.isReady) return;

    this.trackContainer.removeChildren();

    const angleStep = 360 / track.length;

    track.forEach((space, index) => {
      // 计算不规则偏移
      const offset = TRACK_CONFIG.irregularOffsets?.[index] || { radiusOffset: 0, angleOffset: 0 };
      const angle = TRACK_CONFIG.startAngle + index * angleStep + offset.angleOffset;
      const radius = TRACK_CONFIG.radius + offset.radiusOffset;

      // 转换为弧度
      const radian = (angle * Math.PI) / 180;

      // 计算位置
      const x = TRACK_CONFIG.centerX + radius * Math.cos(radian);
      const y = TRACK_CONFIG.centerY + radius * Math.sin(radian);

      // 绘制赛道格子
      const spaceGraphic = new PIXI.Graphics();

      // 格子背景 - 使用更柔和的沙色
      spaceGraphic.roundRect(
        -TRACK_CONFIG.spaceWidth / 2,
        -TRACK_CONFIG.spaceHeight / 2,
        TRACK_CONFIG.spaceWidth,
        TRACK_CONFIG.spaceHeight,
        8
      );

      // 起点和终点使用特殊颜色
      let bgColor = 0xf4e4c1; // 默认沙色
      if (index === 0) {
        bgColor = 0x90EE90; // 起点用浅绿色
      } else if (index === track.length - 1) {
        bgColor = 0xFFB6C1; // 终点用浅红色
      }

      spaceGraphic.fill(bgColor);
      spaceGraphic.stroke({ width: 2, color: 0x8b7355 });

      spaceGraphic.x = x;
      spaceGraphic.y = y;

      // 旋转格子使其朝向圆心
      spaceGraphic.rotation = radian + Math.PI / 2;

      this.trackContainer.addChild(spaceGraphic);

      // 绘制位置编号
      const positionText = new PIXI.Text({
        text: index.toString(),
        style: {
          fontSize: 16,
          fill: 0x666666,
          fontWeight: 'bold',
        },
      });
      positionText.anchor.set(0.5);
      positionText.x = x;
      positionText.y = y;
      this.trackContainer.addChild(positionText);

      // 起点标记
      if (index === 0) {
        const startLabel = new PIXI.Text({
          text: 'START',
          style: {
            fontSize: 12,
            fill: 0x228B22,
            fontWeight: 'bold',
          },
        });
        startLabel.anchor.set(0.5);
        startLabel.x = x;
        startLabel.y = y + 18;
        this.trackContainer.addChild(startLabel);
      }

      // 终点标记
      if (index === track.length - 1) {
        const finishLabel = new PIXI.Text({
          text: 'FINISH',
          style: {
            fontSize: 12,
            fill: 0xDC143C,
            fontWeight: 'bold',
          },
        });
        finishLabel.anchor.set(0.5);
        finishLabel.x = x;
        finishLabel.y = y + 18;
        this.trackContainer.addChild(finishLabel);
      }

      // 绘制观众板块（如果有）
      if (space.spectatorTile) {
        // 计算观众板块的位置（稍微向圆心偏移）
        const tileRadius = radius - 50;
        const tileX = TRACK_CONFIG.centerX + tileRadius * Math.cos(radian);
        const tileY = TRACK_CONFIG.centerY + tileRadius * Math.sin(radian);
        this.renderSpectatorTile(space.spectatorTile, tileX, tileY);
      }
    });
  }

  /**
   * 渲染观众板块
   */
  private renderSpectatorTile(
    tile: SpectatorTile,
    x: number,
    y: number
  ): void {
    const tileGraphic = new PIXI.Graphics();

    const color = tile.type === SpectatorType.OASIS ? 0x2ecc71 : 0xe74c3c;

    tileGraphic.circle(0, 0, 15);
    tileGraphic.fill(color);

    tileGraphic.x = x;
    tileGraphic.y = y;

    this.trackContainer.addChild(tileGraphic);

    // 添加箭头指示
    const arrow = new PIXI.Text({
      text: tile.type === SpectatorType.OASIS ? '▲' : '▼',
      style: {
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    arrow.anchor.set(0.5);
    arrow.x = x;
    arrow.y = y - 1;
    this.trackContainer.addChild(arrow);
  }

  /**
   * 渲染骆驼（环形布局）
   */
  renderCamels(camels: Camel[]): void {
    if (!this.isReady) return;

    // 清除旧的骆驼精灵
    this.camelSprites.forEach((sprite) => {
      this.camelContainer.removeChild(sprite);
    });
    this.camelSprites.clear();

    const angleStep = 360 / 16; // 假设有16个位置

    // 渲染每只骆驼
    camels.forEach((camel) => {
      const sprite = this.createCamelSprite(camel);
      this.camelSprites.set(camel.id, sprite);
      this.camelContainer.addChild(sprite);

      // 计算不规则偏移
      const offset = TRACK_CONFIG.irregularOffsets?.[camel.position] || { radiusOffset: 0, angleOffset: 0 };
      const angle = TRACK_CONFIG.startAngle + camel.position * angleStep + offset.angleOffset;
      const radius = TRACK_CONFIG.radius + offset.radiusOffset;

      // 转换为弧度
      const radian = (angle * Math.PI) / 180;

      // 计算骆驼在赛道上的位置（考虑堆叠，径向向外偏移）
      const stackRadiusOffset = camel.stackPosition * CAMEL_CONFIG.stackOffset;
      const camelRadius = radius + stackRadiusOffset;

      const x = TRACK_CONFIG.centerX + camelRadius * Math.cos(radian);
      const y = TRACK_CONFIG.centerY + camelRadius * Math.sin(radian);

      sprite.x = x;
      sprite.y = y;

      // 旋转骆驼使其朝向运动方向
      sprite.rotation = radian + Math.PI / 2;
    });
  }

  /**
   * 创建骆驼精灵
   */
  private createCamelSprite(camel: Camel): PIXI.Graphics {
    const sprite = new PIXI.Graphics();

    const color = CAMEL_COLOR_HEX[camel.color];

    // 骆驼身体（简化为圆角矩形）
    sprite.roundRect(0, 15, CAMEL_CONFIG.width, 35, 5);
    sprite.fill(color);

    // 骆驼头部
    sprite.circle(CAMEL_CONFIG.width / 2, 10, 12);
    sprite.fill(color);

    // 骆驼眼睛
    sprite.circle(CAMEL_CONFIG.width / 2 - 5, 8, 3);
    sprite.fill(0x000000);

    sprite.circle(CAMEL_CONFIG.width / 2 + 5, 8, 3);
    sprite.fill(0x000000);

    // 添加边框
    sprite.rect(0, 15, CAMEL_CONFIG.width, 35);
    sprite.stroke({ width: 2, color: 0x000000 });

    return sprite;
  }

  /**
   * 动画：移动骆驼（环形布局）
   */
  animateCamelMove(
    camelId: string,
    targetPosition: number,
    targetStackPosition: number,
    duration: number = 0.8
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isReady) {
        resolve();
        return;
      }

      const sprite = this.camelSprites.get(camelId);
      if (!sprite) {
        resolve();
        return;
      }

      const angleStep = 360 / 16;

      // 计算不规则偏移
      const offset = TRACK_CONFIG.irregularOffsets?.[targetPosition] || { radiusOffset: 0, angleOffset: 0 };
      const angle = TRACK_CONFIG.startAngle + targetPosition * angleStep + offset.angleOffset;
      const radius = TRACK_CONFIG.radius + offset.radiusOffset;

      // 转换为弧度
      const radian = (angle * Math.PI) / 180;

      // 计算骆驼在赛道上的位置（考虑堆叠）
      const stackRadiusOffset = targetStackPosition * CAMEL_CONFIG.stackOffset;
      const camelRadius = radius + stackRadiusOffset;

      const targetX = TRACK_CONFIG.centerX + camelRadius * Math.cos(radian);
      const targetY = TRACK_CONFIG.centerY + camelRadius * Math.sin(radian);

      gsap.to(sprite, {
        x: targetX,
        y: targetY,
        rotation: radian + Math.PI / 2,
        duration,
        ease: 'power2.out',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * 批量动画：移动多只骆驼
   */
  async animateMultipleCamels(
    camels: Camel[],
    duration: number = 0.8
  ): Promise<void> {
    if (!this.isReady) return;

    const animations = camels.map((camel) =>
      this.animateCamelMove(camel.id, camel.position, camel.stackPosition, duration)
    );

    await Promise.all(animations);
  }

  /**
   * 调整画布大小
   */
  resize(width: number, height: number): void {
    if (!this.isReady) return;
    this.app.renderer.resize(width, height);
  }

  /**
   * 渲染所有装饰元素
   */
  private renderDecorations(): void {
    this.decorationContainer.removeChildren();

    // 先渲染沙丘（最底层）
    this.renderSandDunes();

    // 渲染金字塔
    this.renderPyramid();

    // 渲染帐篷
    this.renderTents();

    // 渲染棕榈树
    this.renderPalmTrees();
  }

  /**
   * 渲染金字塔
   */
  private renderPyramid(): void {
    const pyramid = new PIXI.Graphics();

    const { x, y, baseWidth, height } = PYRAMID_CONFIG;

    // 金字塔主体（三角形）
    pyramid.moveTo(x, y - height / 2);
    pyramid.lineTo(x - baseWidth / 2, y + height / 2);
    pyramid.lineTo(x + baseWidth / 2, y + height / 2);
    pyramid.lineTo(x, y - height / 2);

    // 使用渐变色模拟立体感 - 使用金黄色
    pyramid.fill(0xdaa520);

    // 添加边框
    pyramid.moveTo(x, y - height / 2);
    pyramid.lineTo(x - baseWidth / 2, y + height / 2);
    pyramid.lineTo(x + baseWidth / 2, y + height / 2);
    pyramid.lineTo(x, y - height / 2);
    pyramid.stroke({ width: 3, color: 0x8b7355 });

    // 添加金字塔纹理线条
    for (let i = 1; i <= 5; i++) {
      const ratio = i / 6;
      const lineY = y - height / 2 + height * ratio;
      const lineWidth = baseWidth * (1 - ratio);

      pyramid.moveTo(x - lineWidth / 2, lineY);
      pyramid.lineTo(x + lineWidth / 2, lineY);
      pyramid.stroke({ width: 1, color: 0x8b7355, alpha: 0.3 });
    }

    // 左侧面（稍暗）
    const leftFace = new PIXI.Graphics();
    leftFace.moveTo(x, y - height / 2);
    leftFace.lineTo(x - baseWidth / 2, y + height / 2);
    leftFace.lineTo(x, y + height / 2);
    leftFace.lineTo(x, y - height / 2);
    leftFace.fill({ color: 0xb8860b, alpha: 0.6 });

    this.decorationContainer.addChild(leftFace);
    this.decorationContainer.addChild(pyramid);

    // 添加金字塔顶部装饰
    const capstone = new PIXI.Graphics();
    capstone.circle(x, y - height / 2, 5);
    capstone.fill(0xffd700);
    capstone.stroke({ width: 2, color: 0x8b7355 });
    this.decorationContainer.addChild(capstone);
  }

  /**
   * 渲染帐篷
   */
  private renderTents(): void {
    TENT_CONFIG.positions.forEach((pos, index) => {
      const tent = new PIXI.Graphics();

      // 帐篷主体（三角形）
      tent.moveTo(pos.x, pos.y - TENT_CONFIG.height);
      tent.lineTo(pos.x - TENT_CONFIG.width / 2, pos.y);
      tent.lineTo(pos.x + TENT_CONFIG.width / 2, pos.y);
      tent.lineTo(pos.x, pos.y - TENT_CONFIG.height);

      // 不同颜色的帐篷
      const colors = [0xe74c3c, 0x3498db, 0x9b59b6];
      tent.fill(colors[index % colors.length]);

      // 添加边框
      tent.moveTo(pos.x, pos.y - TENT_CONFIG.height);
      tent.lineTo(pos.x - TENT_CONFIG.width / 2, pos.y);
      tent.lineTo(pos.x + TENT_CONFIG.width / 2, pos.y);
      tent.lineTo(pos.x, pos.y - TENT_CONFIG.height);
      tent.stroke({ width: 2, color: 0x8b7355 });

      // 添加中间线
      tent.moveTo(pos.x, pos.y - TENT_CONFIG.height);
      tent.lineTo(pos.x, pos.y);
      tent.stroke({ width: 1.5, color: 0x8b7355 });

      // 添加入口
      const door = new PIXI.Graphics();
      door.roundRect(
        pos.x - 10,
        pos.y - 20,
        20,
        20,
        3
      );
      door.fill(0x2c3e50);
      door.stroke({ width: 1, color: 0x8b7355 });

      this.decorationContainer.addChild(tent);
      this.decorationContainer.addChild(door);
    });
  }

  /**
   * 渲染棕榈树
   */
  private renderPalmTrees(): void {
    DECORATION_CONFIG.palmTreePositions.forEach((pos) => {
      const tree = new PIXI.Container();

      // 树干
      const trunk = new PIXI.Graphics();
      const trunkHeight = 60 * pos.scale;
      const trunkWidth = 10 * pos.scale;

      trunk.roundRect(
        -trunkWidth / 2,
        -trunkHeight,
        trunkWidth,
        trunkHeight,
        3
      );
      trunk.fill(0x8b4513);
      trunk.stroke({ width: 1, color: 0x654321 });

      // 添加树干纹理
      for (let i = 0; i < 5; i++) {
        trunk.moveTo(-trunkWidth / 2, -trunkHeight + (i * trunkHeight) / 5);
        trunk.lineTo(trunkWidth / 2, -trunkHeight + (i * trunkHeight) / 5);
        trunk.stroke({ width: 1, color: 0x654321, alpha: 0.5 });
      }

      tree.addChild(trunk);

      // 棕榈叶（8片）
      for (let i = 0; i < 8; i++) {
        const leaf = new PIXI.Graphics();
        const angle = (i * 45 * Math.PI) / 180;
        const leafLength = 35 * pos.scale;

        leaf.moveTo(0, 0);
        leaf.bezierCurveTo(
          leafLength * 0.3 * Math.cos(angle),
          -trunkHeight + leafLength * 0.3 * Math.sin(angle),
          leafLength * 0.6 * Math.cos(angle),
          -trunkHeight + leafLength * 0.6 * Math.sin(angle),
          leafLength * Math.cos(angle),
          -trunkHeight + leafLength * Math.sin(angle)
        );
        leaf.stroke({ width: 4 * pos.scale, color: 0x228b22 });

        tree.addChild(leaf);
      }

      tree.x = pos.x;
      tree.y = pos.y;

      this.decorationContainer.addChild(tree);
    });
  }

  /**
   * 渲染沙丘
   */
  private renderSandDunes(): void {
    DECORATION_CONFIG.sandDunePositions.forEach((pos) => {
      const dune = new PIXI.Graphics();

      // 使用椭圆创建沙丘
      dune.ellipse(pos.x, pos.y, pos.width / 2, pos.height / 2);
      dune.fill({ color: 0xe8d5b7, alpha: 0.7 });

      // 添加柔和的边缘
      dune.ellipse(pos.x, pos.y, pos.width / 2, pos.height / 2);
      dune.stroke({ width: 2, color: 0xd4b896, alpha: 0.5 });

      // 添加沙丘纹理
      for (let i = 0; i < 3; i++) {
        const offsetY = (i - 1) * (pos.height / 6);
        dune.ellipse(pos.x, pos.y + offsetY, pos.width / 2.5, pos.height / 4);
        dune.stroke({ width: 1, color: 0xd4b896, alpha: 0.3 });
      }

      this.decorationContainer.addChild(dune);
    });
  }

  /**
   * 获取 PixiJS Application
   */
  getApp(): PIXI.Application {
    return this.app;
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true, { children: true });
    }
  }
}
