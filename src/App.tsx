import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/UI/GameSetup';
import { GameBoard } from './components/GameBoard/GameBoard';
import { PlayerPanel } from './components/PlayerPanel/PlayerPanel';
import { BettingArea } from './components/BettingArea/BettingArea';
import { GameHistory } from './components/UI/GameHistory';
import { SoundSettings } from './components/UI/SoundSettings';
import { MusicControl } from './components/UI/MusicControl';
import { MainMenu } from './components/UI/MainMenu';
import { Lobby } from './components/Multiplayer/Lobby';
import { Room } from './components/Multiplayer/Room';
import { useToast } from './components/UI/Toast';
import { GamePhase } from './types';
import type { CharacterType } from './types';
import { soundManager } from './utils/SoundManager';
import { multiplayerManager } from './multiplayer/MultiplayerManager';
import { gameStateStorage } from './utils/gameStateStorage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const GameContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  color: white;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const GameLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1400px) {
    grid-template-columns: 280px 1fr 280px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GameEndOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const GameEndModal = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const WinnerTitle = styled.h2`
  font-size: 36px;
  color: #f39c12;
  margin: 0 0 20px 0;
`;

const WinnerName = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const FinalScores = styled.div`
  margin: 20px 0;
  text-align: left;
`;

const ScoreRow = styled.div<{ $isWinner: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 6px;
  background: ${(props) => (props.$isWinner ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : '#f5f5f5')};
  margin-bottom: 8px;
  font-weight: ${(props) => (props.$isWinner ? 'bold' : 'normal')};
`;

const RestartButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);

  &:hover {
    background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(39, 174, 96, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContinueButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);

  &:hover {
    background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LegEndTitle = styled.h2`
  font-size: 32px;
  color: #3498db;
  margin: 0 0 20px 0;
`;

const LegEndInfo = styled.div`
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const SetupWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
`;

function App() {
  const [gameMode, setGameMode] = useState<'menu' | 'single' | 'lobby' | 'room' | 'playing' | null>('menu');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isRestoringState, setIsRestoringState] = useState(true);

  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const legNumber = useGameStore((state) => state.legNumber);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const continueToNextLeg = useGameStore((state) => state.continueToNextLeg);
  const gameEngine = useGameStore((state) => state.gameEngine);
  const setMultiplayerMode = useGameStore((state) => state.setMultiplayerMode);

  const { success, error, info, ToastComponent } = useToast();

  // 页面加载时恢复状态
  useEffect(() => {
    const restoreState = async () => {
      if (gameStateStorage.hasPersistedState()) {
        const savedState = gameStateStorage.getState();
        console.log('恢复保存的状态:', savedState);

        if (savedState.gameMode === 'room' && savedState.roomId && savedState.playerName) {
          // 恢复到房间等待状态
          try {
            await multiplayerManager.connect();
            const result = await multiplayerManager.rejoinRoom(savedState.roomId, savedState.playerName);

            if (result.success) {
              setGameMode('room');
              setCurrentRoomId(savedState.roomId);
              info('已重新连接到房间');
            } else {
              // 房间不存在了，回到大厅
              setGameMode('lobby');
              gameStateStorage.clearRoomState();
              error('无法重新加入房间，房间可能已关闭');
            }
          } catch (err) {
            setGameMode('lobby');
            gameStateStorage.clearRoomState();
            error('重新连接失败');
          }
        } else if (savedState.gameMode === 'lobby') {
          // 恢复到大厅
          setGameMode('lobby');
        } else if (savedState.gameMode === 'single') {
          // 单机模式（游戏设置页面）
          setGameMode('single');
        } else {
          // 回到主菜单
          setGameMode('menu');
        }
      } else {
        // 没有保存的状态，显示主菜单
        setGameMode('menu');
      }

      setIsRestoringState(false);
    };

    restoreState();
  }, []);

  // 监听游戏阶段变化，播放音效
  React.useEffect(() => {
    if (phase === GamePhase.LEG_END) {
      soundManager.playLegEnd();
    } else if (phase === GamePhase.GAME_END) {
      soundManager.playGameEnd();
    }
  }, [phase]);

  // 保存状态到 sessionStorage
  useEffect(() => {
    if (!isRestoringState) {
      const roomInfo = multiplayerManager.getRoomId()
        ? {
            roomId: multiplayerManager.getRoomId(),
            playerName: multiplayerManager.getPlayerName(),
            isHost: multiplayerManager.isRoomHost(),
          }
        : { roomId: null, playerName: '', isHost: false };

      // 只保存非游戏中的状态
      // 游戏中刷新会导致状态丢失，所以不保存 'playing' 状态
      const modeToSave = gameMode === 'playing'
        ? (currentRoomId ? 'room' : 'single')  // 游戏中的话，保存为房间或单机模式
        : gameMode;

      gameStateStorage.saveState({
        gameMode: modeToSave,
        ...roomInfo,
        selectedCharacter: null,
      });
    }
  }, [gameMode, currentRoomId, isRestoringState]);

  const handleSelectMode = (mode: 'single' | 'multi') => {
    if (mode === 'single') {
      setGameMode('single');
      gameStateStorage.saveGameMode('single');
    } else {
      setGameMode('lobby');
      gameStateStorage.saveGameMode('lobby');
    }
  };

  const handleEnterRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setGameMode('room');
    gameStateStorage.saveRoomInfo(
      roomId,
      multiplayerManager.getPlayerName(),
      multiplayerManager.isRoomHost()
    );
    gameStateStorage.saveGameMode('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setGameMode('lobby');
    gameStateStorage.clearRoomState();
    gameStateStorage.saveGameMode('lobby');
  };

  const handleGameStart = (multiplayerPlayers: any[]) => {
    // 从多人房间启动游戏
    const playerNames = multiplayerPlayers.map(p => p.name);
    const playerCharacters = multiplayerPlayers.map(p => p.character);

    // 设置多人游戏模式，并标识当前客户端的玩家
    const currentClientPlayerName = multiplayerManager.getPlayerName();
    setMultiplayerMode(true, currentClientPlayerName);

    initializeGame(playerNames, 0, playerCharacters);
    setGameMode('playing');
    gameStateStorage.saveGameMode('playing');
    success('多人游戏开始！');

    // 设置监听服务器的游戏状态更新
    multiplayerManager.onGameStateUpdate((gameState) => {
      console.log('收到服务器游戏状态更新:', gameState);

      // 获取当前的 isMultiplayer 和 currentPlayerName，避免被覆盖
      const currentStore = useGameStore.getState();

      // 🔧 更新 gameEngine 的内部状态，确保保持同步
      if (currentStore.gameEngine) {
        currentStore.gameEngine.setGameState(gameState);
      }

      // 更新游戏状态，但保留多人游戏相关的字段
      useGameStore.setState({
        ...gameState,
        isMultiplayer: currentStore.isMultiplayer,
        currentPlayerName: currentStore.currentPlayerName,
        gameEngine: currentStore.gameEngine,  // gameEngine 实例不变，但内部状态已更新
        // UI 状态保持不变
        selectedAction: currentStore.selectedAction,
        selectedCamel: currentStore.selectedCamel,
        selectedSpectatorType: currentStore.selectedSpectatorType,
        isAnimating: currentStore.isAnimating,
      });
    });
  };

  const handleStartGame = (
    playerNames: string[],
    aiPlayerCount: number,
    playerCharacters?: CharacterType[]
  ) => {
    // 单机模式
    setMultiplayerMode(false);

    initializeGame(playerNames, aiPlayerCount, playerCharacters);
    setGameMode('playing');
    gameStateStorage.saveGameMode('playing');
    success('游戏开始！祝你好运！');
  };

  const handleRestart = () => {
    resetGame();
    setGameMode('menu');
    multiplayerManager.disconnect();
    gameStateStorage.clearState();
    info('游戏已重置');
  };

  const handleBackToMenu = () => {
    resetGame();
    setGameMode('menu');
    multiplayerManager.disconnect();
    gameStateStorage.clearState();
  };

  const handleContinueToNextLeg = () => {
    continueToNextLeg();
    success(`赛段 ${legNumber} 开始！`);
  };

  const handleBettingAction = (result: { success: boolean; message: string }) => {
    if (result.success) {
      success(result.message);
    } else {
      error(result.message);
    }
  };

  const winner = gameEngine?.getWinner();

  // 正在恢复状态
  if (isRestoringState) {
    return (
      <AppContainer>
        <ToastComponent />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'white',
          fontSize: '24px'
        }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px', textAlign: 'center' }}>🐪</div>
            <div>正在恢复游戏状态...</div>
          </div>
        </div>
      </AppContainer>
    );
  }

  // 主菜单
  if (gameMode === 'menu') {
    return (
      <AppContainer>
        <ToastComponent />
        <MainMenu onSelectMode={handleSelectMode} />
        <MusicControl />
      </AppContainer>
    );
  }

  // 多人大厅
  if (gameMode === 'lobby') {
    return (
      <AppContainer>
        <ToastComponent />
        <Lobby onEnterRoom={handleEnterRoom} onBackToMenu={handleBackToMenu} />
        <MusicControl />
      </AppContainer>
    );
  }

  // 多人房间等待
  if (gameMode === 'room' && currentRoomId) {
    return (
      <AppContainer>
        <ToastComponent />
        <Room
          roomId={currentRoomId}
          onGameStart={handleGameStart}
          onLeaveRoom={handleLeaveRoom}
        />
        <MusicControl />
      </AppContainer>
    );
  }

  // 游戏进行中（单机或多人）
  return (
    <AppContainer>
      <ToastComponent />
      <GameContainer>
        <Header>
          <Title>🐪 骆驼大赛 🐪</Title>
          <Subtitle>
            Camel Up - 一款刺激的赛驼博弈游戏
            {gameMode === 'playing' && currentRoomId && ` | 房间 #${currentRoomId}`}
          </Subtitle>
        </Header>

        {phase === GamePhase.SETUP && gameMode === 'single' ? (
          <SetupWrapper>
            <GameSetup onStart={handleStartGame} onBack={handleBackToMenu} />
          </SetupWrapper>
        ) : (
          <GameLayout>
            <LeftPanel>
              <PlayerPanel />
            </LeftPanel>

            <GameBoard />

            <RightPanel>
              <BettingArea onAction={handleBettingAction} />
              <GameHistory />
              <SoundSettings />
            </RightPanel>
          </GameLayout>
        )}

        {phase === GamePhase.GAME_END && (
          <GameEndOverlay>
            <GameEndModal>
              <WinnerTitle>🎉 游戏结束！ 🎉</WinnerTitle>
              {winner && (
                <>
                  <WinnerName>🏆 获胜者: {winner.name}</WinnerName>
                  <FinalScores>
                    <h3>最终得分:</h3>
                    {players
                      .sort((a, b) => b.money - a.money)
                      .map((player, index) => (
                        <ScoreRow key={player.id} $isWinner={player.id === winner.id}>
                          <span>
                            {index + 1}. {player.name}
                          </span>
                          <span>{player.money} EP</span>
                        </ScoreRow>
                      ))}
                  </FinalScores>
                </>
              )}
              <RestartButton onClick={handleRestart}>🔄 返回主菜单</RestartButton>
            </GameEndModal>
          </GameEndOverlay>
        )}

        {phase === GamePhase.LEG_END && (
          <GameEndOverlay>
            <GameEndModal>
              <LegEndTitle>🏁 赛段结束！ 🏁</LegEndTitle>
              <LegEndInfo>
                <div>赛段 {legNumber - 1} 已结束！</div>
                <div style={{ marginTop: '15px' }}>
                  所有骆驼已完成本轮赛段，
                  <br />
                  下注已结算。
                </div>
              </LegEndInfo>
              <FinalScores>
                <h3>当前排名:</h3>
                {players
                  .sort((a, b) => b.money - a.money)
                  .map((player, index) => (
                    <ScoreRow key={player.id} $isWinner={index === 0}>
                      <span>
                        {index + 1}. {player.name}
                      </span>
                      <span>{player.money} EP</span>
                    </ScoreRow>
                  ))}
              </FinalScores>
              <ContinueButton onClick={handleContinueToNextLeg}>
                ▶️ 继续下一赛段
              </ContinueButton>
            </GameEndModal>
          </GameEndOverlay>
        )}
      </GameContainer>
      <MusicControl />
    </AppContainer>
  );
}

export default App;
