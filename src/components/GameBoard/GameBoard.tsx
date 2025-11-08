import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { GameRenderer } from '../../renderer/GameRenderer';
import { useGameStore } from '../../store/gameStore';
import { CamelRanking } from '../UI/CamelRanking';
import { CAMEL_COLOR_HEX } from '../../utils/constants';
import { CAMEL_COLOR_NAMES } from '../../utils/helpers';

const MainPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GameInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  gap: 20px;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const DiceList = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const DiceIndicator = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => props.$color};
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #87ceeb 0%, #f5deb3 50%, #d2b48c 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Canvas = styled.canvas`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 18px;
  padding: 40px;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 16px;
  padding: 40px;
  text-align: center;

  button {
    margin-top: 16px;
    padding: 10px 20px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #2980b9;
    }
  }
`;

/**
 * 游戏面板组件 - 包含PixiJS渲染器和游戏信息
 */
export const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const camels = useGameStore((state) => state.camels);
  const track = useGameStore((state) => state.track);
  const lastDiceRoll = useGameStore((state) => state.lastDiceRoll);
  const legNumber = useGameStore((state) => state.legNumber);
  const pyramid = useGameStore((state) => state.pyramid);

  // 初始化渲染器
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initRenderer = async () => {
      if (!canvasRef.current) {
        console.warn('Canvas element not ready');
        return;
      }

      setIsLoading(true);
      setError(null);

      // 设置超时检测（10秒）
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          console.error('Renderer initialization timeout');
          setError('游戏画面加载超时，请刷新页面重试');
          setIsLoading(false);
        }
      }, 10000);

      try {
        console.log('开始初始化游戏渲染器...');
        const renderer = await GameRenderer.create(canvasRef.current);

        if (isMounted) {
          rendererRef.current = renderer;
          setIsLoading(false);
          setError(null);
          console.log('游戏渲染器初始化成功');
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('渲染器初始化失败:', error);
        if (isMounted) {
          setError(`游戏画面加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initRenderer();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (rendererRef.current) {
        console.log('清理游戏渲染器');
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [retryCount]); // 添加 retryCount 作为依赖，支持重试

  // 渲染赛道
  useEffect(() => {
    if (!rendererRef.current || track.length === 0 || isLoading) return;

    rendererRef.current.renderTrack(track);
  }, [track, isLoading]);

  // 渲染骆驼
  useEffect(() => {
    if (!rendererRef.current || camels.length === 0 || isLoading) return;

    rendererRef.current.renderCamels(camels);
  }, [camels, isLoading]);

  // 骆驼移动动画
  useEffect(() => {
    if (!rendererRef.current || !lastDiceRoll || camels.length === 0 || isLoading) return;

    const movedCamels = camels.filter((camel) =>
      lastDiceRoll.carriedCamels.includes(camel.id)
    );

    rendererRef.current.animateMultipleCamels(movedCamels);
  }, [lastDiceRoll, camels, isLoading]);

  // 重试初始化
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <MainPanel>
      {/* 游戏信息栏 */}
      <GameInfoBar>
        <InfoItem>
          <InfoLabel>🏁 当前赛段</InfoLabel>
          <InfoValue>第 {legNumber} 赛段</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>🎲 剩余骰子</InfoLabel>
          <InfoValue>
            {pyramid.availableDices.length} / 5
          </InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>🎲 待掷骰子</InfoLabel>
          <DiceList>
            {pyramid.availableDices.length === 0 ? (
              <span style={{ fontSize: '14px', opacity: 0.8 }}>全部已掷</span>
            ) : (
              pyramid.availableDices.map((color, index) => (
                <DiceIndicator
                  key={`${color}-${index}`}
                  $color={CAMEL_COLOR_HEX[color]}
                  title={`${CAMEL_COLOR_NAMES[color]}骰子`}
                />
              ))
            )}
          </DiceList>
        </InfoItem>
      </GameInfoBar>

      {/* 游戏画面 */}
      <BoardContainer>
        {isLoading && <LoadingText>加载游戏画面...</LoadingText>}
        {error && (
          <ErrorText>
            <div>⚠️ {error}</div>
            <button onClick={handleRetry}>🔄 重试</button>
          </ErrorText>
        )}
        <Canvas
          ref={canvasRef}
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </BoardContainer>

      {/* 骆驼排名 */}
      {camels.length > 0 && <CamelRanking />}
    </MainPanel>
  );
};
