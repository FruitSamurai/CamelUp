import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { soundManager } from '../../utils/SoundManager';

const FloatingButton = styled.button<{ $isPlaying: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$isPlaying
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
  };
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: all 0.3s ease;
  z-index: 1000;
  animation: ${props => props.$isPlaying ? 'pulse 2s infinite' : 'none'};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(102, 126, 234, 0.7);
    }
    50% {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 10px rgba(102, 126, 234, 0);
    }
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 24px;
    bottom: 20px;
    right: 20px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  ${FloatingButton}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
  }
`;

/**
 * 悬浮的音乐控制按钮组件
 */
export const MusicControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // 检查音乐状态
  useEffect(() => {
    setIsPlaying(soundManager.isBGMPlaying());

    // 定期检查音乐状态（处理浏览器自动播放限制）
    const interval = setInterval(() => {
      setIsPlaying(soundManager.isBGMPlaying());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    const newState = soundManager.toggleBGM();
    setIsPlaying(newState);
  };

  return (
    <FloatingButton
      onClick={handleToggle}
      $isPlaying={isPlaying}
      title={isPlaying ? '关闭背景音乐' : '开启背景音乐'}
    >
      {isPlaying ? '🎵' : '🔇'}
      <Tooltip>
        {isPlaying ? '关闭背景音乐' : '开启背景音乐'}
      </Tooltip>
    </FloatingButton>
  );
};
