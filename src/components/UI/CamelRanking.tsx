import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/gameStore';
import { CAMEL_COLOR_HEX } from '../../utils/constants';
import { CAMEL_COLOR_NAMES } from '../../utils/helpers';
import type { Camel } from '../../types';

const RankingContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #f39c12;
  padding-bottom: 8px;
`;

const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RankItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${(props) => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #e6a157 100%)';
    return '#f5f5f5';
  }};
  border: 2px solid ${(props) => {
    if (props.$rank === 1) return '#ffc107';
    if (props.$rank === 2) return '#9e9e9e';
    if (props.$rank === 3) return '#795548';
    return 'transparent';
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.$rank === 1) return '#f39c12';
    if (props.$rank === 2) return '#95a5a6';
    if (props.$rank === 3) return '#e67e22';
    return '#7f8c8d';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

const CamelColor = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 2px solid #333;
  flex-shrink: 0;
`;

const CamelInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CamelName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const CamelPosition = styled.div`
  font-size: 12px;
  color: #666;
`;

const StackInfo = styled.span`
  font-size: 11px;
  color: #999;
  margin-left: 4px;
`;

/**
 * 获取骆驼排名
 */
const getRankedCamels = (camels: Camel[]): Camel[] => {
  return [...camels].sort((a, b) => {
    // 先按位置降序排序
    if (b.position !== a.position) {
      return b.position - a.position;
    }
    // 位置相同时，按堆叠位置降序排序（上面的排在前面）
    return b.stackPosition - a.stackPosition;
  });
};

/**
 * 骆驼排名组件
 */
export const CamelRanking: React.FC = () => {
  const camels = useGameStore((state) => state.camels);

  const rankedCamels = React.useMemo(() => getRankedCamels(camels), [camels]);

  return (
    <RankingContainer>
      <Title>🏆 骆驼排名</Title>
      <RankingList>
        {rankedCamels.map((camel, index) => {
          const rank = index + 1;
          const samePositionCamels = camels.filter(
            (c) => c.position === camel.position
          );

          return (
            <RankItem key={camel.id} $rank={rank}>
              <RankBadge $rank={rank}>{rank}</RankBadge>
              <CamelColor $color={CAMEL_COLOR_HEX[camel.color]} />
              <CamelInfo>
                <CamelName>{CAMEL_COLOR_NAMES[camel.color]}骆驼</CamelName>
                <CamelPosition>
                  位置: {camel.position} 格
                  {samePositionCamels.length > 1 && (
                    <StackInfo>
                      (堆叠 {camel.stackPosition + 1}/{samePositionCamels.length})
                    </StackInfo>
                  )}
                </CamelPosition>
              </CamelInfo>
            </RankItem>
          );
        })}
      </RankingList>
    </RankingContainer>
  );
};
