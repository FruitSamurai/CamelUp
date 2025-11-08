import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 房间管理
const rooms = new Map();

// 房间数据结构
class Room {
  constructor(id, hostId, hostName) {
    this.id = id;
    this.hostId = hostId;
    this.players = new Map();
    this.gameState = null;
    this.isGameStarted = false;
    this.maxPlayers = 8;

    // 添加房主
    this.addPlayer(hostId, hostName, true);
  }

  addPlayer(socketId, playerName, isHost = false) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    this.players.set(socketId, {
      socketId,
      name: playerName,
      isHost,
      isReady: isHost, // 房主自动准备
      character: null,
      joinedAt: Date.now()
    });

    return true;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);

    // 如果房主离开，转移房主权限
    if (socketId === this.hostId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0];
      newHost.isHost = true;
      newHost.isReady = true;
      this.hostId = newHost.socketId;
    }

    return this.players.size === 0;
  }

  setPlayerReady(socketId, isReady) {
    const player = this.players.get(socketId);
    if (player && !player.isHost) {
      player.isReady = isReady;
    }
  }

  setPlayerCharacter(socketId, character) {
    const player = this.players.get(socketId);
    if (player) {
      player.character = character;
    }
  }

  canStartGame() {
    if (this.players.size < 2) return false;
    return Array.from(this.players.values()).every(p => p.isReady);
  }

  getPlayersList() {
    return Array.from(this.players.values());
  }

  getRoomInfo() {
    return {
      id: this.id,
      players: this.getPlayersList(),
      isGameStarted: this.isGameStarted,
      maxPlayers: this.maxPlayers,
      hostId: this.hostId
    };
  }
}

// 生成房间ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`玩家连接: ${socket.id}`);

  // 创建房间
  socket.on('create-room', (playerName, callback) => {
    const roomId = generateRoomId();
    const room = new Room(roomId, socket.id, playerName);
    rooms.set(roomId, room);

    socket.join(roomId);
    socket.roomId = roomId;

    console.log(`房间创建: ${roomId} by ${playerName}`);

    callback({
      success: true,
      roomId,
      roomInfo: room.getRoomInfo()
    });
  });

  // 加入房间
  socket.on('join-room', (data, callback) => {
    const { roomId, playerName } = data;
    const room = rooms.get(roomId);

    if (!room) {
      callback({ success: false, message: '房间不存在' });
      return;
    }

    if (room.isGameStarted) {
      callback({ success: false, message: '游戏已开始' });
      return;
    }

    if (room.players.size >= room.maxPlayers) {
      callback({ success: false, message: '房间已满' });
      return;
    }

    const success = room.addPlayer(socket.id, playerName);
    if (success) {
      socket.join(roomId);
      socket.roomId = roomId;

      console.log(`${playerName} 加入房间 ${roomId}`);

      // 通知房间内所有玩家
      io.to(roomId).emit('player-joined', {
        player: room.players.get(socket.id),
        roomInfo: room.getRoomInfo()
      });

      callback({
        success: true,
        roomInfo: room.getRoomInfo()
      });
    } else {
      callback({ success: false, message: '加入房间失败' });
    }
  });

  // 获取房间列表
  socket.on('get-rooms', (callback) => {
    const roomsList = Array.from(rooms.values())
      .filter(room => !room.isGameStarted)
      .map(room => ({
        id: room.id,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        hostName: room.players.get(room.hostId)?.name
      }));

    callback(roomsList);
  });

  // 玩家准备
  socket.on('player-ready', (isReady) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (room) {
      room.setPlayerReady(socket.id, isReady);
      io.to(roomId).emit('room-update', room.getRoomInfo());
    }
  });

  // 选择角色
  socket.on('select-character', (character) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (room) {
      room.setPlayerCharacter(socket.id, character);
      io.to(roomId).emit('room-update', room.getRoomInfo());
    }
  });

  // 开始游戏
  socket.on('start-game', (callback) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);

    if (!room) {
      callback({ success: false, message: '房间不存在' });
      return;
    }

    if (socket.id !== room.hostId) {
      callback({ success: false, message: '只有房主可以开始游戏' });
      return;
    }

    if (!room.canStartGame()) {
      callback({ success: false, message: '还有玩家未准备' });
      return;
    }

    room.isGameStarted = true;

    // 通知所有玩家游戏开始
    io.to(roomId).emit('game-started', {
      players: room.getPlayersList()
    });

    console.log(`游戏开始: 房间 ${roomId}`);

    callback({ success: true });
  });

  // 游戏状态同步
  socket.on('sync-game-state', (gameState) => {
    const roomId = socket.roomId;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.gameState = gameState;
        // 广播给房间内其他玩家
        socket.to(roomId).emit('game-state-update', gameState);
      }
    }
  });

  // 玩家行动
  socket.on('player-action', (action) => {
    const roomId = socket.roomId;
    if (roomId) {
      // 广播给房间内所有玩家
      io.to(roomId).emit('player-action-broadcast', {
        playerId: socket.id,
        action
      });
    }
  });

  // 断线处理
  socket.on('disconnect', () => {
    console.log(`玩家断线: ${socket.id}`);

    const roomId = socket.roomId;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const isEmpty = room.removePlayer(socket.id);

        if (isEmpty) {
          // 房间为空，删除房间
          rooms.delete(roomId);
          console.log(`房间删除: ${roomId}`);
        } else {
          // 通知其他玩家
          io.to(roomId).emit('player-left', {
            playerId: socket.id,
            roomInfo: room.getRoomInfo()
          });
        }
      }
    }
  });

  // 离开房间
  socket.on('leave-room', () => {
    const roomId = socket.roomId;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const isEmpty = room.removePlayer(socket.id);

        socket.leave(roomId);
        socket.roomId = null;

        if (isEmpty) {
          rooms.delete(roomId);
          console.log(`房间删除: ${roomId}`);
        } else {
          io.to(roomId).emit('player-left', {
            playerId: socket.id,
            roomInfo: room.getRoomInfo()
          });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 多人游戏服务器运行在端口 ${PORT}`);
  console.log(`🎮 等待玩家连接...`);
});
