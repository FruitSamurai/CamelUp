import React, { useState } from 'react';
import styled from 'styled-components';
import type { CharacterType } from '../../types';
import { getDefaultCharacter } from '../../utils/characters';
import { CharacterSelector } from './CharacterSelector';
import { CharacterAvatar } from './CharacterAvatar';

const SetupContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 32px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
`;

const PlayerInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PlayerRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CharacterButton = styled.button`
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const PlayerInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const AddButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #c0392b;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const AISection = styled.div`
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
`;

const AISectionTitle = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AICountSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AILabel = styled.div`
  color: white;
  font-size: 16px;
  flex: 1;
`;

const AICounter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
`;

const AIButton = styled.button`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: white;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const AICount = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
`;

const AIInfo = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-top: 12px;
  line-height: 1.5;
`;

const StartButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #229954;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;

  &:hover {
    background: #f5f5f5;
    border-color: #999;
    color: #333;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
`;

interface GameSetupProps {
  onStart: (
    playerNames: string[],
    aiPlayerCount: number,
    playerCharacters?: CharacterType[]
  ) => void;
  onBack?: () => void;
}

/**
 * 游戏设置组件
 */
export const GameSetup: React.FC<GameSetupProps> = ({ onStart, onBack }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['玩家1', '玩家2']);
  const [aiPlayerCount, setAIPlayerCount] = useState<number>(0);
  const [playerCharacters, setPlayerCharacters] = useState<CharacterType[]>([
    getDefaultCharacter(0),
    getDefaultCharacter(1),
  ]);
  const [currentSelectingPlayer, setCurrentSelectingPlayer] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const totalPlayers = playerNames.length + aiPlayerCount;

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
    setError('');
  };

  const addPlayer = () => {
    if (totalPlayers < 8) {
      setPlayerNames([...playerNames, `玩家${playerNames.length + 1}`]);
      setPlayerCharacters([...playerCharacters, getDefaultCharacter(playerNames.length)]);
      setError('');
    }
  };

  const removePlayer = () => {
    if (playerNames.length > 1 && totalPlayers > 2) {
      setPlayerNames(playerNames.slice(0, -1));
      setPlayerCharacters(playerCharacters.slice(0, -1));
      setError('');
    }
  };

  const handleCharacterSelect = (playerIndex: number, character: CharacterType) => {
    const newCharacters = [...playerCharacters];
    newCharacters[playerIndex] = character;
    setPlayerCharacters(newCharacters);
    setCurrentSelectingPlayer(null);
  };

  const increaseAI = () => {
    if (totalPlayers < 8) {
      setAIPlayerCount(aiPlayerCount + 1);
      setError('');
    }
  };

  const decreaseAI = () => {
    if (aiPlayerCount > 0 && totalPlayers > 2) {
      setAIPlayerCount(aiPlayerCount - 1);
      setError('');
    }
  };

  const handleStart = () => {
    // 验证玩家数量
    if (totalPlayers < 2) {
      setError('至少需要2个玩家（人类+AI）');
      return;
    }

    if (totalPlayers > 8) {
      setError('最多支持8个玩家');
      return;
    }

    // 验证玩家名称
    const trimmedNames = playerNames.map((name) => name.trim());

    if (trimmedNames.some((name) => name === '')) {
      setError('玩家名称不能为空');
      return;
    }

    const uniqueNames = new Set(trimmedNames);
    if (uniqueNames.size !== trimmedNames.length) {
      setError('玩家名称不能重复');
      return;
    }

    // 为AI玩家分配角色
    const allCharacters = [...playerCharacters];
    for (let i = 0; i < aiPlayerCount; i++) {
      allCharacters.push(getDefaultCharacter(playerNames.length + i));
    }

    onStart(trimmedNames, aiPlayerCount, allCharacters);
  };

  return (
    <SetupContainer>
      <Title>🐪 骆驼大赛 🐪</Title>
      <Subtitle>Camel Up - 设置游戏</Subtitle>

      <PlayerInputs>
        {playerNames.map((name, index) => (
          <PlayerRow key={index}>
            <CharacterButton
              onClick={() => setCurrentSelectingPlayer(index)}
              title="点击更换角色"
            >
              <div style={{ transform: 'scale(0.8)' }}>
                <CharacterAvatar
                  character={playerCharacters[index]}
                  size="small"
                  showName={false}
                />
              </div>
            </CharacterButton>
            <PlayerInput
              type="text"
              value={name}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              placeholder={`玩家 ${index + 1} 名称`}
            />
          </PlayerRow>
        ))}
      </PlayerInputs>

      {currentSelectingPlayer !== null && (
        <div style={{ marginBottom: '24px' }}>
          <CharacterSelector
            selectedCharacter={playerCharacters[currentSelectingPlayer]}
            onSelect={(char) => handleCharacterSelect(currentSelectingPlayer, char)}
            usedCharacters={playerCharacters.filter((_, i) => i !== currentSelectingPlayer)}
          />
        </div>
      )}

      <ButtonGroup>
        <AddButton onClick={addPlayer} disabled={totalPlayers >= 8}>
          ➕ 添加玩家
        </AddButton>
        <RemoveButton
          onClick={removePlayer}
          disabled={playerNames.length <= 1 || totalPlayers <= 2}
        >
          ➖ 移除玩家
        </RemoveButton>
      </ButtonGroup>

      <AISection>
        <AISectionTitle>
          🤖 AI玩家设置
        </AISectionTitle>
        <AICountSelector>
          <AILabel>添加AI玩家</AILabel>
          <AICounter>
            <AIButton onClick={decreaseAI} disabled={aiPlayerCount === 0 || totalPlayers <= 2}>
              −
            </AIButton>
            <AICount>{aiPlayerCount}</AICount>
            <AIButton onClick={increaseAI} disabled={totalPlayers >= 8}>
              +
            </AIButton>
          </AICounter>
        </AICountSelector>
        <AIInfo>
          AI玩家会自动分析局面并执行最优策略。
          <br />
          当前总玩家数：{totalPlayers} / 8
        </AIInfo>
      </AISection>

      <StartButton onClick={handleStart} disabled={totalPlayers < 2 || totalPlayers > 8}>
        开始游戏
      </StartButton>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {onBack && (
        <BackButton onClick={onBack}>
          ← 返回主菜单
        </BackButton>
      )}
    </SetupContainer>
  );
};
