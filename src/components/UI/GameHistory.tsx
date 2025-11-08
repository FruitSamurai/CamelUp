import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/gameStore';

const HistoryContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const HistoryItem = styled.div<{ $type: string }>`
  padding: 10px 12px;
  border-radius: 6px;
  background: ${(props) => {
    switch (props.$type) {
      case 'roll':
        return '#e3f2fd';
      case 'bet':
        return '#fff3e0';
      case 'spectator':
        return '#f3e5f5';
      case 'leg':
        return '#e8f5e9';
      case 'game':
        return '#fce4ec';
      default:
        return '#f5f5f5';
    }
  }};
  border-left: 3px solid ${(props) => {
    switch (props.$type) {
      case 'roll':
        return '#2196f3';
      case 'bet':
        return '#ff9800';
      case 'spectator':
        return '#9c27b0';
      case 'leg':
        return '#4caf50';
      case 'game':
        return '#e91e63';
      default:
        return '#757575';
    }
  }};
  font-size: 13px;
  color: #333;
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

const PlayerName = styled.span`
  font-weight: bold;
  color: #2c3e50;
`;

const ActionDetails = styled.span`
  color: #555;
`;

const TimeStamp = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
`;

const getActionIcon = (type: string) => {
  switch (type) {
    case 'roll':
      return '🎲';
    case 'bet':
      return '💰';
    case 'spectator':
      return '👤';
    case 'leg':
      return '🏁';
    case 'game':
      return '🎮';
    default:
      return '📝';
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 游戏历史记录面板
 */
export const GameHistory: React.FC = () => {
  const history = useGameStore((state) => state.history);
  const historyListRef = useRef<HTMLDivElement>(null);

  // 当历史记录更新时，自动滚动到底部（显示最新记录）
  useEffect(() => {
    if (historyListRef.current) {
      historyListRef.current.scrollTop = historyListRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <HistoryContainer>
      <Title>📜 游戏记录</Title>
      <HistoryList ref={historyListRef}>
        {history.length === 0 ? (
          <EmptyMessage>暂无游戏记录</EmptyMessage>
        ) : (
          history.map((entry, index) => (
            <HistoryItem key={`${entry.timestamp}_${index}`} $type={entry.type}>
              <div>
                {getActionIcon(entry.type)}{' '}
                <PlayerName>{entry.playerName}</PlayerName>{' '}
                <ActionDetails>{entry.details}</ActionDetails>
              </div>
              <TimeStamp>{formatTime(entry.timestamp)}</TimeStamp>
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </HistoryContainer>
  );
};
