/**
 * 音效管理器
 * 使用Web Audio API生成契合埃及/沙漠主题的音效
 * 支持背景音乐播放
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private oscillatorCache: Map<string, OscillatorNode> = new Map();

  // 背景音乐相关
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmEnabled: boolean = false;
  private bgmVolume: number = 0.3;
  private bgmPath: string = '/audio/background.mp3';

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initializeBGM();
    }
  }

  /**
   * 初始化背景音乐
   */
  private initializeBGM(): void {
    this.bgmAudio = new Audio(this.bgmPath);
    this.bgmAudio.loop = true; // 设置循环播放
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudio.preload = 'auto'; // 预加载音频

    // 监听加载错误
    this.bgmAudio.addEventListener('error', (e) => {
      console.warn('背景音乐文件加载失败，请确保文件存在于 public/audio/background.mp3', e);
    });

    // 监听音频加载完成
    this.bgmAudio.addEventListener('canplaythrough', () => {
      console.log('背景音乐加载完成');
    });

    // 监听播放结束（理论上不应该触发，因为loop=true）
    this.bgmAudio.addEventListener('ended', () => {
      console.warn('背景音乐意外结束，尝试重新播放');
      if (this.bgmEnabled) {
        this.bgmAudio?.play().catch(err => {
          console.error('重新播放失败:', err);
        });
      }
    });
  }

  /**
   * 播放背景音乐
   */
  playBGM(): void {
    if (!this.bgmAudio) return;

    this.bgmEnabled = true;
    this.bgmAudio.loop = true; // 确保循环播放开启
    this.bgmAudio.volume = this.bgmVolume;

    // 尝试播放，如果失败可能是因为浏览器限制
    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('背景音乐开始播放（循环模式）');
        })
        .catch(error => {
          console.warn('背景音乐播放失败（可能需要用户交互）:', error);
        });
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM(): void {
    if (!this.bgmAudio) return;

    this.bgmEnabled = false;
    this.bgmAudio.pause();
  }

  /**
   * 切换背景音乐状态
   */
  toggleBGM(): boolean {
    if (this.bgmEnabled) {
      this.pauseBGM();
    } else {
      this.playBGM();
    }
    return this.bgmEnabled;
  }

  /**
   * 获取背景音乐状态
   */
  isBGMPlaying(): boolean {
    return this.bgmEnabled && this.bgmAudio !== null && !this.bgmAudio.paused;
  }

  /**
   * 设置背景音乐音量 (0-1)
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  /**
   * 获取背景音乐音量
   */
  getBGMVolume(): number {
    return this.bgmVolume;
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 设置音量 (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 获取音量
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 播放骰子滚动音效（真实模拟）
   */
  playDiceRoll(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 创建白噪音源（用于模拟骰子撞击声）
    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // 生成白噪音
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 第一次落地 - 最响
    this.playDiceBounce(now, 0, 1.0, noiseBuffer);

    // 第一次弹跳
    this.playDiceBounce(now, 0.15, 0.7, noiseBuffer);

    // 第二次弹跳
    this.playDiceBounce(now, 0.28, 0.5, noiseBuffer);

    // 第三次弹跳（较小）
    this.playDiceBounce(now, 0.38, 0.35, noiseBuffer);

    // 第四次弹跳（更小）
    this.playDiceBounce(now, 0.46, 0.25, noiseBuffer);

    // 滚动声音（多次小撞击）
    for (let i = 0; i < 5; i++) {
      this.playDiceRattle(now, 0.52 + i * 0.08, 0.15 - i * 0.02, noiseBuffer);
    }

    // 最后的静止声（轻微）
    this.playDiceBounce(now, 0.95, 0.1, noiseBuffer);
  }

  /**
   * 播放单次骰子弹跳声
   */
  private playDiceBounce(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;

    // 高通滤波器，让撞击声更清脆
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300 + Math.random() * 200, startTime + offset);
    filter.Q.setValueAtTime(1, startTime + offset);

    // 音量包络 - 快速衰减
    const time = startTime + offset;
    const duration = 0.08 - intensity * 0.02; // 强度越大，持续时间越长

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume * intensity * 0.6, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
    source.stop(time + duration);
  }

  /**
   * 播放骰子滚动的嘎嘎声
   */
  private playDiceRattle(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;

    // 带通滤波器，模拟滚动时的摩擦声
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400 + Math.random() * 300, startTime + offset);
    filter.Q.setValueAtTime(2, startTime + offset);

    // 短促的音量包络
    const time = startTime + offset;
    const duration = 0.05;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume * intensity * 0.4, time + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
    source.stop(time + duration);
  }

  /**
   * 播放骆驼移动音效 - 模拟真实奔跑声音
   */
  playCamelMove(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 创建噪音缓冲区用于模拟沙地摩擦和蹄声
    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 骆驼四条腿的节奏（每条腿落地的时间）
    // 骆驼奔跑时是一种"摇摆步态"，前后腿交替
    const hoofBeats = [0, 0.12, 0.24, 0.36, 0.50, 0.62, 0.74, 0.86]; // 8个蹄声模拟跑步

    hoofBeats.forEach((timing, index) => {
      // 蹄声 - 低频重击
      this.playHoofBeat(now, timing, 0.9 - index * 0.05, noiseBuffer);

      // 沙地摩擦声 - 稍微延后
      this.playSandFriction(now, timing + 0.03, 0.6 - index * 0.03, noiseBuffer);
    });

    // 添加连续的沙地摩擦音（背景）
    this.playContinuousSandSound(now, 1.0, noiseBuffer);

    // 添加骆驼呼吸/移动的低频氛围音
    this.playCamelAmbience(now, 1.0);
  }

  /**
   * 播放单次蹄声
   */
  private playHoofBeat(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;

    // 低通滤波器，模拟厚重的蹄声
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180 + Math.random() * 80, startTime + offset);
    filter.Q.setValueAtTime(3, startTime + offset);

    const time = startTime + offset;
    const duration = 0.08;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume * intensity * 0.35, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
    source.stop(time + duration);
  }

  /**
   * 播放沙地摩擦声
   */
  private playSandFriction(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;

    // 高通滤波器，模拟沙子摩擦的沙沙声
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800 + Math.random() * 400, startTime + offset);
    filter.Q.setValueAtTime(1, startTime + offset);

    const time = startTime + offset;
    const duration = 0.06;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume * intensity * 0.2, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
    source.stop(time + duration);
  }

  /**
   * 播放连续的沙地摩擦音
   */
  private playContinuousSandSound(
    startTime: number,
    duration: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;
    source.loop = true;

    // 带通滤波器，模拟持续的沙地移动声
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, startTime);
    filter.Q.setValueAtTime(2, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.08, startTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.08, startTime + duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(startTime);
    source.stop(startTime + duration);
  }

  /**
   * 播放骆驼移动的低频氛围音
   */
  private playCamelAmbience(startTime: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(65, startTime);
    oscillator.frequency.linearRampToValueAtTime(75, startTime + duration / 2);
    oscillator.frequency.linearRampToValueAtTime(65, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, startTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, startTime + duration - 0.2);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * 播放下注音效
   */
  playBet(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * 播放金钱增加音效 - 模拟硬币碰撞声
   */
  playMoneyGain(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 创建金属噪音缓冲区
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 模拟多个硬币落下和碰撞
    const coinDrops = [0, 0.08, 0.15, 0.21, 0.26]; // 5个硬币依次落下

    coinDrops.forEach((timing, index) => {
      // 硬币碰撞的金属声
      this.playCoinClink(now, timing, 1.0 - index * 0.12, noiseBuffer);

      // 硬币弹跳
      if (index < 3) {
        this.playCoinBounce(now, timing + 0.04, 0.6 - index * 0.1, noiseBuffer);
      }
    });

    // 添加上升的音调（表示获得）
    this.playMoneyMelody(now, true);
  }

  /**
   * 播放金钱减少音效 - 模拟硬币散落声
   */
  playMoneyLoss(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 创建金属噪音缓冲区
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 模拟硬币散落
    const coinScatters = [0, 0.06, 0.11, 0.15]; // 4个硬币散落

    coinScatters.forEach((timing, index) => {
      // 硬币碰撞声，强度逐渐减弱
      this.playCoinClink(now, timing, 0.8 - index * 0.15, noiseBuffer);
    });

    // 添加下降的音调（表示损失）
    this.playMoneyMelody(now, false);
  }

  /**
   * 播放硬币碰撞声
   */
  private playCoinClink(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    // 使用噪音模拟金属碰撞
    const noiseSource = this.audioContext.createBufferSource();
    const noiseFilter = this.audioContext.createBiquadFilter();
    const noiseGain = this.audioContext.createGain();

    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2800 + Math.random() * 800, startTime + offset);
    noiseFilter.Q.setValueAtTime(8, startTime + offset);

    const time = startTime + offset;
    noiseGain.gain.setValueAtTime(0, time);
    noiseGain.gain.linearRampToValueAtTime(this.volume * intensity * 0.25, time + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);

    noiseSource.start(time);
    noiseSource.stop(time + 0.08);

    // 添加金属的共振音（高频）
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const metalGain = this.audioContext.createGain();

    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(3200 + Math.random() * 400, time);
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(4100 + Math.random() * 500, time);

    metalGain.gain.setValueAtTime(0, time);
    metalGain.gain.linearRampToValueAtTime(this.volume * intensity * 0.15, time + 0.003);
    metalGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    oscillator1.connect(metalGain);
    oscillator2.connect(metalGain);
    metalGain.connect(this.audioContext.destination);

    oscillator1.start(time);
    oscillator2.start(time);
    oscillator1.stop(time + 0.12);
    oscillator2.stop(time + 0.12);
  }

  /**
   * 播放硬币弹跳声
   */
  private playCoinBounce(
    startTime: number,
    offset: number,
    intensity: number,
    noiseBuffer: AudioBuffer
  ): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000 + Math.random() * 1000, startTime + offset);
    filter.Q.setValueAtTime(5, startTime + offset);

    const time = startTime + offset;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume * intensity * 0.15, time + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(time);
    source.stop(time + 0.05);
  }

  /**
   * 播放金钱旋律（上升或下降）
   */
  private playMoneyMelody(startTime: number, isGain: boolean): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';

    if (isGain) {
      // 上升音阶 - 表示获得
      oscillator.frequency.setValueAtTime(800, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + 0.15);
      oscillator.frequency.exponentialRampToValueAtTime(1600, startTime + 0.3);
    } else {
      // 下降音阶 - 表示损失
      oscillator.frequency.setValueAtTime(800, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, startTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(400, startTime + 0.2);
    }

    gainNode.gain.setValueAtTime(this.volume * 0.08, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + (isGain ? 0.35 : 0.25));

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + (isGain ? 0.35 : 0.25));
  }

  /**
   * 播放按钮点击音效
   */
  playClick(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);

    gainNode.gain.setValueAtTime(this.volume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  /**
   * 播放游戏开始音效
   */
  playGameStart(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 播放上升音阶
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + i * 0.15);

      gainNode.gain.setValueAtTime(this.volume * 0.3, now + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.start(now + i * 0.15);
      oscillator.stop(now + i * 0.15 + 0.2);
    });
  }

  /**
   * 播放赛段结束音效
   */
  playLegEnd(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 播放鼓点效果
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(100, now + i * 0.2);

      gainNode.gain.setValueAtTime(this.volume * 0.5, now + i * 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now + i * 0.2);
      oscillator.stop(now + i * 0.2 + 0.15);
    }
  }

  /**
   * 播放游戏结束音效
   */
  playGameEnd(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 播放胜利旋律
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.2 },  // E5
      { freq: 783.99, time: 0.4 },  // G5
      { freq: 1046.50, time: 0.6 }, // C6
    ];

    melody.forEach(({ freq, time }) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(this.volume * 0.3, now + time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + time + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.start(now + time);
      oscillator.stop(now + time + 0.3);
    });
  }

  /**
   * 播放观众板块放置音效
   */
  playSpectatorPlace(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.linearRampToValueAtTime(500, now + 0.1);

    gainNode.gain.setValueAtTime(this.volume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * 播放沙漠风声环境音效
   */
  playAmbientWind(): void {
    if (!this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(50 + Math.random() * 30, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.Q.setValueAtTime(0.5, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, now + 2);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 2);
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.oscillatorCache.clear();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// 创建全局单例
export const soundManager = new SoundManager();
