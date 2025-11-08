import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/gameStore';
import { CamelColor, SpectatorType, CharacterType } from '../../types';
import { CAMEL_COLORS, CAMEL_COLOR_HEX } from '../../utils/constants';
import { CAMEL_COLOR_NAMES } from '../../utils/helpers';
import { soundManager } from '../../utils/SoundManager';
import { getCharacter } from '../../utils/characters';

const BettingContainer = styled.div`
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

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button<{ $isActive: boolean }>`
  padding: 14px 12px;
  border: 2px solid ${(props) => (props.$isActive ? '#2196f3' : '#ddd')};
  background: ${(props) => (props.$isActive ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' : 'white')};
  color: ${(props) => (props.$isActive ? 'white' : '#333')};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? 'bold' : 'normal')};
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isActive ? '0 4px 8px rgba(33, 150, 243, 0.3)' : 'none')};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$isActive ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' : '#e3f2fd')};
    border-color: #2196f3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectionSection = styled.div`
  margin-top: 12px;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 10px;
`;

const CamelSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CamelButton = styled.button<{ $color: string; $isSelected: boolean }>`
  padding: 12px;
  border: 3px solid ${(props) => (props.$isSelected ? '#000' : 'transparent')};
  background: ${(props) => props.$color};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.$isSelected ? 'bold' : 'normal')};
  color: ${(props) => (props.$color === '#ECF0F1' ? '#333' : '#fff')};
  text-shadow: ${(props) =>
    props.$color === '#ECF0F1' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)'};
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)')};

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SpectatorButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const SpectatorButton = styled.button<{ $type: SpectatorType; $isSelected: boolean }>`
  padding: 14px 10px;
  border: 3px solid ${(props) => (props.$isSelected ? '#000' : 'transparent')};
  background: ${(props) => (props.$type === SpectatorType.OASIS ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)')};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.$isSelected ? 'bold' : 'normal')};
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)')};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PositionInput = styled.div`
  margin-top: 12px;
`;

const PositionInputField = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
`;

const PositionHint = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  text-align: center;
`;

const BetTypeButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
`;

const BetTypeButton = styled.button<{ $isSelected: boolean }>`
  padding: 14px 10px;
  border: 3px solid ${(props) => (props.$isSelected ? '#000' : 'transparent')};
  background: ${(props) => (props.$isSelected ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' : '#f5f5f5')};
  color: ${(props) => (props.$isSelected ? 'white' : '#333')};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.$isSelected ? 'bold' : 'normal')};
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)')};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ExecuteButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const SkillSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
`;

const SkillTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SkillButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(156, 39, 176, 0.3);
  margin-bottom: 8px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(156, 39, 176, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const SheikhMoveInput = styled.div`
  margin-top: 8px;
`;

interface BettingAreaProps {
  onAction?: (result: { success: boolean; message: string }) => void;
}

/**
 * 下注区域组件
 */
export const BettingArea: React.FC<BettingAreaProps> = ({ onAction }) => {
  const selectedAction = useGameStore((state) => state.selectedAction);
  const setSelectedAction = useGameStore((state) => state.setSelectedAction);
  const selectedCamel = useGameStore((state) => state.selectedCamel);
  const setSelectedCamel = useGameStore((state) => state.setSelectedCamel);
  const selectedSpectatorType = useGameStore((state) => state.selectedSpectatorType);
  const setSelectedSpectatorType = useGameStore((state) => state.setSelectedSpectatorType);
  const placeLegBet = useGameStore((state) => state.placeLegBet);
  const rollDice = useGameStore((state) => state.rollDice);
  const placeSpectatorTile = useGameStore((state) => state.placeSpectatorTile);
  const placeRaceBet = useGameStore((state) => state.placeRaceBet);
  const usePriestOracle = useGameStore((state) => state.usePriestOracle);
  const useSheikhMoveTile = useGameStore((state) => state.useSheikhMoveTile);
  const phase = useGameStore((state) => state.phase);
  const currentPlayer = useGameStore((state) => state.players[state.currentPlayerIndex]);
  const players = useGameStore((state) => state.players);
  const isMultiplayer = useGameStore((state) => state.isMultiplayer);
  const currentPlayerName = useGameStore((state) => state.currentPlayerName);

  // 观众板块位置
  const [spectatorPosition, setSpectatorPosition] = React.useState<string>('');
  // 比赛下注类型（冠军/垫底）
  const [raceBetType, setRaceBetType] = React.useState<'winner' | 'loser' | null>(null);
  // 酋长移动板块的新位置
  const [sheikhNewPosition, setSheikhNewPosition] = React.useState<string>('');

  const handleActionSelect = (action: typeof selectedAction) => {
    soundManager.playClick();
    setSelectedAction(action);
    setSelectedCamel(null);
    setSelectedSpectatorType(null);
    setSpectatorPosition('');
    setRaceBetType(null);
    setSheikhNewPosition('');
  };

  const handleExecute = () => {
    let result;

    switch (selectedAction) {
      case 'legBet':
        if (!selectedCamel) {
          result = { success: false, message: '请选择一只骆驼' };
          onAction?.(result);
          return;
        }
        result = placeLegBet(selectedCamel);
        break;

      case 'rollDice':
        result = rollDice();
        break;

      case 'spectator':
        if (!selectedSpectatorType) {
          result = { success: false, message: '请选择观众板块类型' };
          onAction?.(result);
          return;
        }
        const position = parseInt(spectatorPosition);
        if (isNaN(position) || position < 1 || position > 15) {
          result = { success: false, message: '请输入有效位置（1-15）' };
          onAction?.(result);
          return;
        }
        result = placeSpectatorTile(position, selectedSpectatorType);
        break;

      case 'raceBet':
        if (!selectedCamel) {
          result = { success: false, message: '请选择一只骆驼' };
          onAction?.(result);
          return;
        }
        if (!raceBetType) {
          result = { success: false, message: '请选择冠军或垫底' };
          onAction?.(result);
          return;
        }
        result = placeRaceBet(selectedCamel, raceBetType === 'winner');
        break;

      default:
        result = { success: false, message: '请选择一个动作' };
        onAction?.(result);
        return;
    }

    if (result.success) {
      setSelectedAction(null);
      setSelectedCamel(null);
      setSpectatorPosition('');
      setRaceBetType(null);
    }

    onAction?.(result);
  };

  // 处理祭司技能
  const handlePriestOracle = () => {
    const result = usePriestOracle();
    onAction?.(result);
  };

  // 处理酋长技能
  const handleSheikhMove = () => {
    const newPos = parseInt(sheikhNewPosition);
    if (isNaN(newPos) || newPos < 1 || newPos > 15) {
      onAction?.({ success: false, message: '请输入有效位置（1-15）' });
      return;
    }
    const result = useSheikhMoveTile(newPos);
    if (result.success) {
      setSheikhNewPosition('');
    }
    onAction?.(result);
  };

  // 检查当前玩家是否可以使用祭司技能
  const canUsePriestSkill = currentPlayer?.character === CharacterType.PRIEST &&
                            !currentPlayer.priestRevealedDice;

  // 检查当前玩家是否可以使用酋长技能
  const canUseSheikhSkill = currentPlayer?.character === CharacterType.SHEIKH &&
                            !currentPlayer.sheikhMovedTile &&
                            currentPlayer.spectatorTile !== null &&
                            currentPlayer.spectatorTile.position !== null;

  const isPlaying = phase === 'playing';
  const canExecute = selectedAction && (
    selectedAction === 'rollDice' ||
    (selectedAction === 'legBet' && selectedCamel) ||
    (selectedAction === 'spectator' && selectedSpectatorType && spectatorPosition) ||
    (selectedAction === 'raceBet' && selectedCamel && raceBetType)
  );

  // 多人游戏模式下的权限检查 - 使用store中的最新状态
  const isMyTurn = !isMultiplayer || (currentPlayer && currentPlayer.name === currentPlayerName);

  // 如果当前玩家是AI，不显示操作界面
  if (currentPlayer?.isAI) {
    return (
      <BettingContainer>
        <Title>🎯 玩家动作</Title>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            AI玩家正在思考...
          </div>
          <div style={{ fontSize: '14px' }}>
            AI会自动分析局面并执行最优策略
          </div>
        </div>
      </BettingContainer>
    );
  }

  // 多人游戏模式下，如果不是我的回合，显示等待界面
  if (isMultiplayer && !isMyTurn) {
    return (
      <BettingContainer>
        <Title>🎯 玩家动作</Title>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            等待其他玩家操作
          </div>
          <div style={{ fontSize: '14px' }}>
            当前回合: {currentPlayer?.name}
          </div>
        </div>
      </BettingContainer>
    );
  }

  return (
    <BettingContainer>
      <Title>🎯 玩家动作</Title>

      <ActionButtons>
        <ActionButton
          $isActive={selectedAction === 'legBet'}
          onClick={() => handleActionSelect('legBet')}
          disabled={!isPlaying}
        >
          💰 赛段下注
        </ActionButton>
        <ActionButton
          $isActive={selectedAction === 'rollDice'}
          onClick={() => handleActionSelect('rollDice')}
          disabled={!isPlaying}
        >
          🎲 摇骰子 (+1 EP)
        </ActionButton>
        <ActionButton
          $isActive={selectedAction === 'spectator'}
          onClick={() => handleActionSelect('spectator')}
          disabled={!isPlaying}
        >
          👤 观众板块
        </ActionButton>
        <ActionButton
          $isActive={selectedAction === 'raceBet'}
          onClick={() => handleActionSelect('raceBet')}
          disabled={!isPlaying}
        >
          🏆 比赛下注
        </ActionButton>
      </ActionButtons>

      {selectedAction === 'legBet' && (
        <SelectionSection>
          <SectionTitle>选择要下注的骆驼：</SectionTitle>
          <CamelSelection>
            {CAMEL_COLORS.map((color) => (
              <CamelButton
                key={color}
                $color={CAMEL_COLOR_HEX[color]}
                $isSelected={selectedCamel === color}
                onClick={() => setSelectedCamel(color)}
              >
                {CAMEL_COLOR_NAMES[color]} 骆驼
              </CamelButton>
            ))}
          </CamelSelection>
        </SelectionSection>
      )}

      {selectedAction === 'spectator' && (
        <SelectionSection>
          <SectionTitle>选择观众板块类型：</SectionTitle>
          <SpectatorButtons>
            <SpectatorButton
              $type={SpectatorType.OASIS}
              $isSelected={selectedSpectatorType === SpectatorType.OASIS}
              onClick={() => setSelectedSpectatorType(SpectatorType.OASIS)}
            >
              ▲ 绿洲<br />骆驼 +1 格
            </SpectatorButton>
            <SpectatorButton
              $type={SpectatorType.MIRAGE}
              $isSelected={selectedSpectatorType === SpectatorType.MIRAGE}
              onClick={() => setSelectedSpectatorType(SpectatorType.MIRAGE)}
            >
              ▼ 海市蜃楼<br />骆驼 -1 格
            </SpectatorButton>
          </SpectatorButtons>
          {selectedSpectatorType && (
            <PositionInput>
              <SectionTitle>输入位置（1-15）：</SectionTitle>
              <PositionInputField
                type="number"
                min="1"
                max="15"
                value={spectatorPosition}
                onChange={(e) => setSpectatorPosition(e.target.value)}
                placeholder="请输入赛道位置"
              />
              <PositionHint>
                {currentPlayer?.spectatorTile?.position !== null && currentPlayer?.spectatorTile
                  ? `你的板块已在位置 ${currentPlayer.spectatorTile.position}`
                  : '不能放在有骆驼或其他板块的位置'}
              </PositionHint>
            </PositionInput>
          )}
        </SelectionSection>
      )}

      {selectedAction === 'raceBet' && (
        <SelectionSection>
          <SectionTitle>选择下注类型：</SectionTitle>
          <BetTypeButtons>
            <BetTypeButton
              $isSelected={raceBetType === 'winner'}
              onClick={() => setRaceBetType('winner')}
            >
              🏆 冠军
            </BetTypeButton>
            <BetTypeButton
              $isSelected={raceBetType === 'loser'}
              onClick={() => setRaceBetType('loser')}
            >
              💀 垫底
            </BetTypeButton>
          </BetTypeButtons>
          <SectionTitle>选择骆驼：</SectionTitle>
          <CamelSelection>
            {CAMEL_COLORS.map((color) => (
              <CamelButton
                key={color}
                $color={CAMEL_COLOR_HEX[color]}
                $isSelected={selectedCamel === color}
                onClick={() => setSelectedCamel(color)}
              >
                {CAMEL_COLOR_NAMES[color]} 骆驼
              </CamelButton>
            ))}
          </CamelSelection>
        </SelectionSection>
      )}

      <ExecuteButton onClick={handleExecute} disabled={!canExecute || !isPlaying}>
        {selectedAction === 'rollDice' ? '🎲 摇骰子' : '✓ 确认'}
      </ExecuteButton>

      {/* 主动技能区域 */}
      {isPlaying && (canUsePriestSkill || canUseSheikhSkill) && (
        <SkillSection>
          <SkillTitle>✨ 角色技能</SkillTitle>

          {canUsePriestSkill && (
            <SkillButton onClick={handlePriestOracle}>
              🔮 {getCharacter(CharacterType.PRIEST).skill.name}
              <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'normal' }}>
                查看金字塔中的随机骰子
              </div>
            </SkillButton>
          )}

          {canUseSheikhSkill && (
            <>
              <SkillButton
                onClick={handleSheikhMove}
                disabled={!sheikhNewPosition}
              >
                🧔 {getCharacter(CharacterType.SHEIKH).skill.name}
                <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'normal' }}>
                  移动你的观众板块
                </div>
              </SkillButton>
              <SheikhMoveInput>
                <SectionTitle>输入新位置（1-15）：</SectionTitle>
                <PositionInputField
                  type="number"
                  min="1"
                  max="15"
                  value={sheikhNewPosition}
                  onChange={(e) => setSheikhNewPosition(e.target.value)}
                  placeholder="输入新位置"
                />
                <PositionHint>
                  当前板块位置: {currentPlayer.spectatorTile?.position || '无'}
                </PositionHint>
              </SheikhMoveInput>
            </>
          )}
        </SkillSection>
      )}
    </BettingContainer>
  );
};
