import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGameStore } from '../../store/gameStore';
import { formatMoney } from '../../utils/helpers';
import { SpectatorType } from '../../types';
import { soundManager } from '../../utils/SoundManager';
import { CharacterAvatar } from '../UI/CharacterAvatar';
import { getCharacter } from '../../utils/characters';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

const moneyIncrease = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
    color: #4caf50;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
`;

const moneyDecrease = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
    color: #f44336;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
`;

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PlayerCard = styled.div<{ $isActive: boolean }>`
  padding: 16px;
  border-radius: 10px;
  background: ${(props) => (props.$isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5')};
  border: 3px solid ${(props) => (props.$isActive ? '#5a67d8' : 'transparent')};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${(props) => (props.$isActive ? pulse : 'none')} 2s infinite;

  &:hover {
    background: ${(props) => (props.$isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#eeeeee')};
    transform: translateX(5px);
  }

  ${(props) =>
    props.$isActive &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `}
`;

const PlayerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const PlayerNameSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlayerName = styled.div<{ $isActive: boolean }>`
  font-weight: ${(props) => (props.$isActive ? 'bold' : 'normal')};
  color: ${(props) => (props.$isActive ? 'white' : '#333')};
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CurrentPlayerBadge = styled.span`
  background: #4caf50;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  animation: ${pulse} 2s infinite;
`;

const AIBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
`;

const TurnIndicator = styled.div`
  position: absolute;
  left: -30px;
  font-size: 24px;
  animation: bounce 1s infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }
`;

const MoneySection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlayerMoney = styled.div<{ $isActive: boolean }>`
  font-weight: bold;
  color: ${(props) => (props.$isActive ? 'white' : '#f39c12')};
  font-size: 18px;
  min-width: 70px;
  text-align: right;
`;

const MoneyChange = styled.div<{ $type: 'increase' | 'decrease' }>`
  position: absolute;
  right: 0;
  font-weight: bold;
  font-size: 14px;
  animation: ${(props) => (props.$type === 'increase' ? moneyIncrease : moneyDecrease)} 1s ease-out;
  pointer-events: none;
`;

const GameInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fff3cd 0%, #fff9e6 100%);
  border-radius: 8px;
  border-left: 4px solid #ffc107;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-weight: bold;
  color: #333;
`;

const DiceIndicator = styled.div`
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
`;

const DiceDot = styled.div<{ $rolled: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$rolled ? '#bbb' : '#4caf50')};
  transition: all 0.3s ease;
`;

const SpectatorTileInfo = styled.div<{ $isActive: boolean }>`
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: ${(props) => (props.$isActive ? 'rgba(255, 255, 255, 0.2)' : '#f0f0f0')};
  font-size: 12px;
  color: ${(props) => (props.$isActive ? 'white' : '#666')};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TileIcon = styled.span<{ $type: SpectatorType }>`
  font-size: 14px;
  font-weight: bold;
  color: ${(props) => (props.$type === SpectatorType.OASIS ? '#2ecc71' : '#e74c3c')};
`;

const SkillInfo = styled.div<{ $isActive: boolean }>`
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: ${(props) => (props.$isActive ? 'rgba(255, 255, 255, 0.15)' : '#f9f9f9')};
  border: 1px solid ${(props) => (props.$isActive ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')};
  font-size: 11px;
  color: ${(props) => (props.$isActive ? 'rgba(255, 255, 255, 0.95)' : '#555')};
  line-height: 1.4;
`;

const SkillName = styled.div<{ $isActive: boolean }>`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
  color: ${(props) => (props.$isActive ? '#fff' : '#333')};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SkillType = styled.span<{ $isActive: boolean; $type: string }>`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(props) => {
    if (props.$type === 'active') {
      return props.$isActive ? 'rgba(255, 193, 7, 0.9)' : '#ffc107';
    }
    return props.$isActive ? 'rgba(76, 175, 80, 0.9)' : '#4caf50';
  }};
  color: white;
  font-weight: bold;
`;

/**
 * 玩家面板组件
 */
export const PlayerPanel: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const legNumber = useGameStore((state) => state.legNumber);
  const pyramid = useGameStore((state) => state.pyramid);

  const [previousMoney, setPreviousMoney] = useState<{ [key: string]: number }>({});
  const [moneyChanges, setMoneyChanges] = useState<{ [key: string]: { amount: number; type: 'increase' | 'decrease' } }>({});

  const currentPlayer = players[currentPlayerIndex];

  // 监听金钱变化
  useEffect(() => {
    const newChanges: typeof moneyChanges = {};

    players.forEach((player) => {
      const prevMoney = previousMoney[player.id];
      if (prevMoney !== undefined && prevMoney !== player.money) {
        const diff = player.money - prevMoney;
        newChanges[player.id] = {
          amount: Math.abs(diff),
          type: diff > 0 ? 'increase' : 'decrease',
        };

        // 播放金钱变化音效
        if (diff > 0) {
          soundManager.playMoneyGain();
        } else if (diff < 0) {
          soundManager.playMoneyLoss();
        }

        // 清除动画
        setTimeout(() => {
          setMoneyChanges((prev) => {
            const next = { ...prev };
            delete next[player.id];
            return next;
          });
        }, 1000);
      }
    });

    setMoneyChanges(newChanges);

    // 更新记录
    const newPreviousMoney: typeof previousMoney = {};
    players.forEach((player) => {
      newPreviousMoney[player.id] = player.money;
    });
    setPreviousMoney(newPreviousMoney);
  }, [players]);

  return (
    <PanelContainer>
      <Title>
        👥 玩家信息
      </Title>

      <PlayerList>
        {players.map((player, index) => (
          <PlayerCard key={player.id} $isActive={index === currentPlayerIndex}>
            {index === currentPlayerIndex && <TurnIndicator>👉</TurnIndicator>}
            <PlayerInfo>
              <PlayerNameSection>
                {player.character && (
                  <div style={{ flexShrink: 0 }}>
                    <CharacterAvatar
                      character={player.character}
                      size="small"
                      showName={false}
                    />
                  </div>
                )}
                <PlayerName $isActive={index === currentPlayerIndex}>
                  <div>{player.name}</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {index === currentPlayerIndex && (
                      <CurrentPlayerBadge>当前回合</CurrentPlayerBadge>
                    )}
                    {player.isAI && (
                      <AIBadge>AI</AIBadge>
                    )}
                  </div>
                </PlayerName>
              </PlayerNameSection>
              <MoneySection>
                <PlayerMoney $isActive={index === currentPlayerIndex}>
                  {formatMoney(player.money)}
                </PlayerMoney>
                {moneyChanges[player.id] && (
                  <MoneyChange $type={moneyChanges[player.id].type}>
                    {moneyChanges[player.id].type === 'increase' ? '+' : '-'}
                    {moneyChanges[player.id].amount}
                  </MoneyChange>
                )}
              </MoneySection>
            </PlayerInfo>
            {player.spectatorTile && player.spectatorTile.position !== null && (
              <SpectatorTileInfo $isActive={index === currentPlayerIndex}>
                <TileIcon $type={player.spectatorTile.type}>
                  {player.spectatorTile.type === SpectatorType.OASIS ? '▲' : '▼'}
                </TileIcon>
                <span>
                  {player.spectatorTile.type === SpectatorType.OASIS ? '绿洲' : '海市蜃楼'}
                  @ 位置 {player.spectatorTile.position}
                </span>
              </SpectatorTileInfo>
            )}
            {player.character && (
              <SkillInfo $isActive={index === currentPlayerIndex}>
                <SkillName $isActive={index === currentPlayerIndex}>
                  ✨ {getCharacter(player.character).skill.name}
                  <SkillType $isActive={index === currentPlayerIndex} $type={getCharacter(player.character).skill.type}>
                    {getCharacter(player.character).skill.type === 'active' ? '主动' : '被动'}
                  </SkillType>
                </SkillName>
                {getCharacter(player.character).skill.description}
              </SkillInfo>
            )}
          </PlayerCard>
        ))}
      </PlayerList>

      <GameInfo>
        <InfoRow>
          <InfoLabel>📍 当前赛段:</InfoLabel>
          <InfoValue>第 {legNumber} 段</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>🎲 剩余骰子:</InfoLabel>
          <InfoValue>
            {pyramid.availableDices.length} / 5
            <DiceIndicator>
              {[0, 1, 2, 3, 4].map((i) => (
                <DiceDot key={i} $rolled={i >= pyramid.availableDices.length} />
              ))}
            </DiceIndicator>
          </InfoValue>
        </InfoRow>
        {currentPlayer && (
          <InfoRow>
            <InfoLabel>🎯 当前玩家:</InfoLabel>
            <InfoValue>{currentPlayer.name}</InfoValue>
          </InfoRow>
        )}
      </GameInfo>
    </PanelContainer>
  );
};
