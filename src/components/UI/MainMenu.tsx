import React, { useState } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const MenuCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 60px 80px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 64px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #666;
  margin-bottom: 48px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MenuButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 24px 48px;
  border: none;
  border-radius: 16px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.$variant === 'secondary'
    ? 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const Icon = styled.span`
  font-size: 32px;
  margin-right: 16px;
`;

interface MainMenuProps {
  onSelectMode: (mode: 'single' | 'multi') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <MenuContainer>
      <MenuCard>
        <Title>🐪 骆驼大赛</Title>
        <Subtitle>Camel Up - 押注竞赛游戏</Subtitle>
        <ButtonGroup>
          <MenuButton onClick={() => onSelectMode('single')}>
            <Icon>🎮</Icon>
            单人游戏
          </MenuButton>
          <MenuButton onClick={() => onSelectMode('multi')}>
            <Icon>🌐</Icon>
            多人联机
          </MenuButton>
        </ButtonGroup>
      </MenuCard>
    </MenuContainer>
  );
};
