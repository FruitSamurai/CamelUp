import React from 'react';
import type { CharacterType } from '../../types';
import { getCharacter } from '../../utils/characters';

interface CharacterAvatarProps {
  character: CharacterType;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

/**
 * 角色头像组件
 * 显示角色的图标、名称和主题颜色
 */
export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'medium',
  showName = false,
  onClick,
  selected = false,
}) => {
  const characterInfo = getCharacter(character);

  const sizeStyles = {
    small: {
      container: 'w-12 h-12',
      icon: 'text-2xl',
      name: 'text-xs',
    },
    medium: {
      container: 'w-16 h-16',
      icon: 'text-3xl',
      name: 'text-sm',
    },
    large: {
      container: 'w-24 h-24',
      icon: 'text-5xl',
      name: 'text-base',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={characterInfo.description}
    >
      <div
        className={`
          ${styles.container}
          rounded-full
          flex items-center justify-center
          border-4
          ${selected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-600'}
          transition-all duration-200
          ${onClick ? 'hover:scale-110 hover:shadow-xl' : ''}
        `}
        style={{
          backgroundColor: characterInfo.color,
          boxShadow: selected ? `0 0 20px ${characterInfo.color}` : undefined,
        }}
      >
        <span className={styles.icon}>{characterInfo.icon}</span>
      </div>
      {showName && (
        <div className="text-center">
          <div className={`font-bold ${styles.name}`} style={{ color: characterInfo.color }}>
            {characterInfo.name}
          </div>
          {size === 'large' && (
            <div className="text-xs text-gray-400">{characterInfo.nameEn}</div>
          )}
        </div>
      )}
    </div>
  );
};
