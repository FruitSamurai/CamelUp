import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { multiplayerManager } from '../../multiplayer/MultiplayerManager';

const LobbyContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 48px;
  color: #333;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
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

const InputGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const Input = styled.input`
  flex: 1;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$variant === 'secondary'
    ? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
    : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'};
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RoomsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const RoomCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
`;

const RoomId = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
`;

const RoomInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  margin-top: 16px;
`;

const HostName = styled.div`
  opacity: 0.9;
`;

const PlayerCount = styled.div`
  background: rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: bold;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
`;

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  background: ${props => props.$connected ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$connected ? '#155724' : '#721c24'};
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const StatusDot = styled.div<{ $connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$connected ? '#28a745' : '#dc3545'};
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
  white-space: pre-line;

  button {
    margin-top: 12px;
    padding: 8px 16px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;

    &:hover {
      background: #c82333;
    }
  }
`;

interface LobbyProps {
  onEnterRoom: (roomId: string) => void;
  onBackToMenu: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onEnterRoom, onBackToMenu }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    connectToServer();
    const interval = setInterval(refreshRoomList, 3000);

    // 设置错误回调
    multiplayerManager.onError((errorMsg) => {
      setError(errorMsg);
      setIsConnected(false);
    });

    return () => clearInterval(interval);
  }, []);

  const connectToServer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('正在连接到游戏服务器...');
      await multiplayerManager.connect();
      setIsConnected(true);
      setError(null);
      refreshRoomList();
      console.log('连接成功');
    } catch (error: any) {
      console.error('连接失败:', error);
      setIsConnected(false);
      setError(error.message || '无法连接到服务器，请确保服务器正在运行');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRoomList = async () => {
    if (multiplayerManager.isConnected()) {
      const roomsList = await multiplayerManager.getRoomList();
      setRooms(roomsList);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('请输入玩家名称');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await multiplayerManager.createRoom(playerName);
      if (response.success && response.roomId) {
        onEnterRoom(response.roomId);
      } else {
        setError(response.message || '创建房间失败');
      }
    } catch (error) {
      setError('创建房间失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!playerName.trim()) {
      setError('请输入玩家名称');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await multiplayerManager.joinRoom(roomId, playerName);
      if (response.success) {
        onEnterRoom(roomId);
      } else {
        setError(response.message || '加入房间失败');
      }
    } catch (error) {
      setError('加入房间失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoomByCode = () => {
    if (!roomIdInput.trim()) {
      setError('请输入房间代码');
      return;
    }
    handleJoinRoom(roomIdInput.toUpperCase());
  };

  return (
    <LobbyContainer>
      <Header>
        <Title>🐪 骆驼大赛 - 多人大厅</Title>
        <Subtitle>创建房间或加入好友的房间开始游戏</Subtitle>
      </Header>

      <ConnectionStatus $connected={isConnected}>
        <StatusDot $connected={isConnected} />
        {isConnected ? '✅ 已连接到服务器' : '⚠️ 未连接到服务器'}
      </ConnectionStatus>

      {error && (
        <ErrorMessage>
          <div>{error}</div>
          {!isConnected && (
            <button onClick={connectToServer} disabled={isLoading}>
              {isLoading ? '重新连接中...' : '🔄 重新连接'}
            </button>
          )}
        </ErrorMessage>
      )}

      <Section>
        <SectionTitle>👤 玩家信息</SectionTitle>
        <InputGroup>
          <Input
            type="text"
            placeholder="输入你的名字"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>🎮 快速开始</SectionTitle>
        <InputGroup>
          <Button
            onClick={handleCreateRoom}
            disabled={!isConnected || !playerName.trim() || isLoading}
          >
            创建新房间
          </Button>
          <Input
            type="text"
            placeholder="输入房间代码"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <Button
            onClick={handleJoinRoomByCode}
            disabled={!isConnected || !playerName.trim() || !roomIdInput.trim() || isLoading}
          >
            加入房间
          </Button>
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>
          🏠 可用房间
          <Button
            $variant="secondary"
            onClick={refreshRoomList}
            disabled={!isConnected}
            style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '14px' }}
          >
            🔄 刷新
          </Button>
        </SectionTitle>

        {rooms.length > 0 ? (
          <RoomsList>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                onClick={() => handleJoinRoom(room.id)}
              >
                <RoomId>房间 #{room.id}</RoomId>
                <RoomInfo>
                  <HostName>房主: {room.hostName}</HostName>
                  <PlayerCount>{room.playerCount}/{room.maxPlayers}</PlayerCount>
                </RoomInfo>
              </RoomCard>
            ))}
          </RoomsList>
        ) : (
          <EmptyState>
            {isConnected ? '暂无可用房间，创建一个新房间吧！' : '正在连接服务器...'}
          </EmptyState>
        )}
      </Section>

      <div style={{ textAlign: 'center' }}>
        <Button $variant="secondary" onClick={onBackToMenu}>
          返回主菜单
        </Button>
      </div>
    </LobbyContainer>
  );
};
