import { io, Socket } from 'socket.io-client';

// Socket.io 客户端管理器
class MultiplayerManager {
  private socket: Socket | null = null;
  private serverUrl: string;
  private currentRoomId: string | null = null;
  private playerName: string = '';
  private isHost: boolean = false;

  // 回调函数
  private onRoomUpdateCallback: ((roomInfo: any) => void) | null = null;
  private onGameStartedCallback: ((data: any) => void) | null = null;
  private onGameStateUpdateCallback: ((gameState: any) => void) | null = null;
  private onPlayerActionCallback: ((action: any) => void) | null = null;
  private onPlayerJoinedCallback: ((data: any) => void) | null = null;
  private onPlayerLeftCallback: ((data: any) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor(serverUrl?: string) {
    // 优先使用传入的 URL，其次使用环境变量，最后使用默认值
    this.serverUrl = serverUrl ||
                     import.meta.env.VITE_SERVER_URL ||
                     'http://localhost:3001';
    console.log('MultiplayerManager 初始化，服务器地址:', this.serverUrl);
  }

  // 连接到服务器
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('已经连接到服务器');
        resolve();
        return;
      }

      console.log(`正在连接到服务器: ${this.serverUrl}`);

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,  // 10秒连接超时
      });

      this.socket.on('connect', () => {
        console.log('✅ 已成功连接到多人游戏服务器');
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ 连接失败:', error.message);
        const errorMsg = `无法连接到游戏服务器 (${this.serverUrl})\n请确保服务器已启动！\n\n启动服务器命令:\n  npm run server:dev\n或:\n  npm run start:all`;
        this.onErrorCallback?.(errorMsg);
        reject(new Error(errorMsg));
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ 与服务器断开连接:', reason);
        if (reason === 'io server disconnect') {
          // 服务器主动断开，尝试重新连接
          this.socket?.connect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 重新连接成功 (尝试次数: ${attemptNumber})`);
        // 如果有房间ID，尝试重新加入
        if (this.currentRoomId && this.playerName) {
          console.log('尝试重新加入房间:', this.currentRoomId);
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 正在尝试重新连接... (${attemptNumber}/5)`);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ 重新连接失败，已达到最大尝试次数');
        this.onErrorCallback?.('无法重新连接到服务器，请刷新页面重试');
      });
    });
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('room-update', (roomInfo) => {
      this.onRoomUpdateCallback?.(roomInfo);
    });

    this.socket.on('game-started', (data) => {
      this.onGameStartedCallback?.(data);
    });

    this.socket.on('game-state-update', (gameState) => {
      this.onGameStateUpdateCallback?.(gameState);
    });

    this.socket.on('player-action-broadcast', (data) => {
      this.onPlayerActionCallback?.(data);
    });

    this.socket.on('player-joined', (data) => {
      this.onPlayerJoinedCallback?.(data);
    });

    this.socket.on('player-left', (data) => {
      this.onPlayerLeftCallback?.(data);
    });
  }

  // 创建房间
  createRoom(playerName: string): Promise<{ success: boolean; roomId?: string; roomInfo?: any; message?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, message: '未连接到服务器' });
        return;
      }

      this.playerName = playerName;
      this.socket.emit('create-room', playerName, (response: any) => {
        if (response.success) {
          this.currentRoomId = response.roomId;
          this.isHost = true;
        }
        resolve(response);
      });
    });
  }

  // 加入房间
  joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; roomInfo?: any; message?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, message: '未连接到服务器' });
        return;
      }

      this.playerName = playerName;
      this.socket.emit('join-room', { roomId, playerName }, (response: any) => {
        if (response.success) {
          this.currentRoomId = roomId;
          this.isHost = false;
        }
        resolve(response);
      });
    });
  }

  // 获取房间列表
  getRoomList(): Promise<any[]> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve([]);
        return;
      }

      this.socket.emit('get-rooms', (rooms: any[]) => {
        resolve(rooms);
      });
    });
  }

  // 玩家准备
  setReady(isReady: boolean) {
    this.socket?.emit('player-ready', isReady);
  }

  // 选择角色
  selectCharacter(character: string) {
    this.socket?.emit('select-character', character);
  }

  // 开始游戏
  startGame(): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, message: '未连接到服务器' });
        return;
      }

      this.socket.emit('start-game', (response: any) => {
        resolve(response);
      });
    });
  }

  // 同步游戏状态
  syncGameState(gameState: any) {
    this.socket?.emit('sync-game-state', gameState);
  }

  // 发送玩家行动
  sendPlayerAction(action: any) {
    this.socket?.emit('player-action', action);
  }

  // 离开房间
  leaveRoom() {
    this.socket?.emit('leave-room');
    this.currentRoomId = null;
    this.isHost = false;
  }

  // 断开连接
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoomId = null;
    this.isHost = false;
  }

  // 设置回调函数
  onRoomUpdate(callback: (roomInfo: any) => void) {
    this.onRoomUpdateCallback = callback;
  }

  onGameStarted(callback: (data: any) => void) {
    this.onGameStartedCallback = callback;
  }

  onGameStateUpdate(callback: (gameState: any) => void) {
    this.onGameStateUpdateCallback = callback;
  }

  onPlayerAction(callback: (data: any) => void) {
    this.onPlayerActionCallback = callback;
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.onPlayerLeftCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  // Getters
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getRoomId(): string | null {
    return this.currentRoomId;
  }

  getPlayerName(): string {
    return this.playerName;
  }

  isRoomHost(): boolean {
    return this.isHost;
  }

  // 设置房间信息（用于恢复状态）
  setRoomInfo(roomId: string, playerName: string, isHost: boolean): void {
    this.currentRoomId = roomId;
    this.playerName = playerName;
    this.isHost = isHost;
  }

  // 重新加入房间（用于刷新后恢复）
  async rejoinRoom(roomId: string, playerName: string): Promise<{ success: boolean; roomInfo?: any; message?: string }> {
    // 尝试重新加入现有房间
    return this.joinRoom(roomId, playerName);
  }
}

// 导出单例
export const multiplayerManager = new MultiplayerManager();
