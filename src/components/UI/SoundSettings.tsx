import React from 'react';
import styled from 'styled-components';
import { soundManager } from '../../utils/SoundManager';

const SettingsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SettingLabel = styled.div`
  font-size: 15px;
  color: #555;
  font-weight: 500;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4caf50;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 26px;
  transition: 0.3s;

  &:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 200px;
`;

const VolumeSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #3498db 0%, #2ecc71 100%);
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: none;
  }
`;

const VolumeValue = styled.div`
  font-size: 13px;
  color: #666;
  min-width: 35px;
  text-align: right;
`;

const TestButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TestSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

/**
 * 音效设置组件
 */
export const SoundSettings: React.FC = () => {
  const [enabled, setEnabled] = React.useState(soundManager.isEnabled());
  const [volume, setVolume] = React.useState(soundManager.getVolume());

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);

    if (newEnabled) {
      soundManager.playClick();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const testSound = (soundType: string) => {
    switch (soundType) {
      case 'dice':
        soundManager.playDiceRoll();
        break;
      case 'camel':
        soundManager.playCamelMove();
        break;
      case 'bet':
        soundManager.playBet();
        break;
      case 'money':
        soundManager.playMoneyGain();
        break;
      case 'spectator':
        soundManager.playSpectatorPlace();
        break;
      case 'leg':
        soundManager.playLegEnd();
        break;
    }
  };

  return (
    <SettingsContainer>
      <Title>🔊 音效设置</Title>

      <SettingRow>
        <SettingLabel>启用音效</SettingLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </SettingRow>

      <SettingRow>
        <SettingLabel>音量</SettingLabel>
        <VolumeControl>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!enabled}
          />
          <VolumeValue>{Math.round(volume * 100)}%</VolumeValue>
        </VolumeControl>
      </SettingRow>

      {enabled && (
        <TestSection>
          <SettingLabel style={{ marginBottom: '12px' }}>测试音效</SettingLabel>
          <TestGrid>
            <TestButton onClick={() => testSound('dice')}>🎲 骰子</TestButton>
            <TestButton onClick={() => testSound('camel')}>🐪 骆驼</TestButton>
            <TestButton onClick={() => testSound('bet')}>💰 下注</TestButton>
            <TestButton onClick={() => testSound('money')}>💵 金钱</TestButton>
            <TestButton onClick={() => testSound('spectator')}>👤 板块</TestButton>
            <TestButton onClick={() => testSound('leg')}>🏁 赛段</TestButton>
          </TestGrid>
        </TestSection>
      )}
    </SettingsContainer>
  );
};
