import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { multiplayerManager } from '../../multiplayer/MultiplayerManager';
import { CharacterAvatar } from '../UI/CharacterAvatar';
import { getAllCharacters } from '../../utils/characters';
import { CharacterType } from '../../types';

const RoomContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
`;

const RoomId = styled.div`
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 4px;
  margin-bottom: 16px;
  text-align: center;
`;

const RoomHint = styled.div`
  text-align: center;
  font-size: 18px;
  opacity: 0.9;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PlayersSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlayersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const PlayerCard = styled.div<{ $isMe?: boolean }>`
  background: ${props => props.$isMe
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #e3e9f0 100%)'};
  color: ${props => props.$isMe ? 'white' : '#333'};
  border-radius: 12px;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const PlayerName = styled.div`
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlayerBadge = styled.span<{ $variant: 'host' | 'ready' | 'me' }>`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: bold;
  background: ${props => {
    switch (props.$variant) {
      case 'host': return '#ffc107';
      case 'ready': return '#28a745';
      case 'me': return '#17a2b8';
    }
  }};
  color: white;
`;

const CharacterSelection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
`;

const CharacterOption = styled.div<{ $selected?: boolean; $disabled?: boolean }>`
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.4 : 1};
  border: 3px solid ${props => props.$selected ? '#ffc107' : 'transparent'};
  border-radius: 12px;
  padding: 8px;
  transition: all 0.2s;
  background: ${props => props.$selected ? 'rgba(255, 193, 7, 0.1)' : 'transparent'};

  &:hover:not([disabled]) {
    transform: scale(1.05);
    border-color: #3498db;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
      case 'secondary': return 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
      default: return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    }
  }};
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div<{ $ready?: boolean }>`
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$ready ? '#d4edda' : '#fff3cd'};
  color: ${props => props.$ready ? '#155724' : '#856404'};
  font-weight: 500;
  margin-bottom: 16px;
`;

interface RoomProps {
  roomId: string;
  onGameStart: (players: any[]) => void;
  onLeaveRoom: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomId, onGameStart, onLeaveRoom }) => {
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [usedCharacters, setUsedCharacters] = useState<Set<CharacterType>>(new Set());

  useEffect(() => {
    // 设置回调
    multiplayerManager.onRoomUpdate((info) => {
      setRoomInfo(info);
      updateUsedCharacters(info);
    });

    multiplayerManager.onGameStarted((data) => {
      onGameStart(data.players);
    });

    multiplayerManager.onPlayerJoined((data) => {
      setRoomInfo(data.roomInfo);
      updateUsedCharacters(data.roomInfo);
    });

    multiplayerManager.onPlayerLeft((data) => {
      setRoomInfo(data.roomInfo);
      updateUsedCharacters(data.roomInfo);
    });
  }, [onGameStart]);

  const updateUsedCharacters = (info: any) => {
    const used = new Set<CharacterType>();
    info.players.forEach((p: any) => {
      if (p.character) {
        used.add(p.character);
      }
    });
    setUsedCharacters(used);
  };

  const handleReadyToggle = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    multiplayerManager.setReady(newReady);
  };

  const handleCharacterSelect = (character: CharacterType) => {
    if (usedCharacters.has(character) && character !== selectedCharacter) {
      return; // 角色已被选择
    }
    setSelectedCharacter(character);
    multiplayerManager.selectCharacter(character);
  };

  const handleStartGame = async () => {
    const response = await multiplayerManager.startGame();
    if (!response.success) {
      alert(response.message);
    }
  };

  const handleLeaveRoom = () => {
    multiplayerManager.leaveRoom();
    onLeaveRoom();
  };

  const allCharacters = getAllCharacters();
  const isHost = multiplayerManager.isRoomHost();
  const canStartGame = roomInfo?.players?.every((p: any) => p.isReady) && roomInfo?.players?.length >= 2;

  return (
    <RoomContainer>
      <Header>
        <RoomId>房间 #{roomId}</RoomId>
        <RoomHint>分享房间代码给好友一起玩！</RoomHint>
      </Header>

      <Content>
        <PlayersSection>
          <SectionTitle>👥 玩家列表 ({roomInfo?.players?.length || 0}/8)</SectionTitle>
          <PlayersList>
            {roomInfo?.players?.map((player: any) => (
              <PlayerCard
                key={player.socketId}
                $isMe={player.name === multiplayerManager.getPlayerName()}
              >
                <PlayerName>
                  {player.name}
                  {player.isHost && <PlayerBadge $variant="host">房主</PlayerBadge>}
                  {player.isReady && !player.isHost && <PlayerBadge $variant="ready">已准备</PlayerBadge>}
                  {player.name === multiplayerManager.getPlayerName() && (
                    <PlayerBadge $variant="me">你</PlayerBadge>
                  )}
                </PlayerName>
                {player.character && (
                  <CharacterSelection>
                    <CharacterAvatar character={player.character} size="small" showName />
                  </CharacterSelection>
                )}
              </PlayerCard>
            ))}
          </PlayersList>
        </PlayersSection>

        <SideSection>
          <Card>
            <SectionTitle>🎭 选择角色</SectionTitle>
            <CharacterGrid>
              {allCharacters.map((char) => (
                <CharacterOption
                  key={char.type}
                  $selected={selectedCharacter === char.type}
                  $disabled={usedCharacters.has(char.type) && selectedCharacter !== char.type}
                  onClick={() => handleCharacterSelect(char.type)}
                >
                  <CharacterAvatar
                    character={char.type}
                    size="medium"
                    showName={false}
                  />
                </CharacterOption>
              ))}
            </CharacterGrid>
          </Card>

          <Card>
            <SectionTitle>🎮 游戏控制</SectionTitle>

            {!isHost && (
              <>
                <StatusText $ready={isReady}>
                  {isReady ? '✅ 已准备' : '⏳ 未准备'}
                </StatusText>
                <Button onClick={handleReadyToggle}>
                  {isReady ? '取消准备' : '准备'}
                </Button>
              </>
            )}

            {isHost && (
              <>
                <StatusText $ready={canStartGame}>
                  {canStartGame ? '✅ 所有玩家已准备' : '⏳ 等待玩家准备'}
                </StatusText>
                <Button
                  $variant="success"
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                >
                  开始游戏
                </Button>
              </>
            )}

            <Button
              $variant="secondary"
              onClick={handleLeaveRoom}
              style={{ marginTop: '12px' }}
            >
              离开房间
            </Button>
          </Card>
        </SideSection>
      </Content>
    </RoomContainer>
  );
};
