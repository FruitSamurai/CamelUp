import React from 'react';
import type { CharacterType } from '../../types';
import { getAllCharacters } from '../../utils/characters';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterSelectorProps {
  selectedCharacter: CharacterType | null;
  onSelect: (character: CharacterType) => void;
  usedCharacters?: CharacterType[];
}

/**
 * 角色选择器组件
 * 显示所有可选角色供玩家选择
 */
export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedCharacter,
  onSelect,
  usedCharacters = [],
}) => {
  const characters = getAllCharacters();

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
      <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">
        选择你的角色
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {characters.map((char) => {
          const isUsed = usedCharacters.includes(char.type);
          const isSelected = selectedCharacter === char.type;

          return (
            <div key={char.type} className="relative">
              <CharacterAvatar
                character={char.type}
                size="large"
                showName={true}
                onClick={() => !isUsed && onSelect(char.type)}
                selected={isSelected}
              />
              {isUsed && !isSelected && (
                <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 font-bold">已被选择</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
