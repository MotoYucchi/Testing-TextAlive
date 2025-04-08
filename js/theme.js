/**
 * 未来へのシグナル - テーマ拡張機能
 * マジカルミライ プログラミングコンテスト向けリリックアプリの拡張アニメーション
 */

// 背景アニメーション用のキャンバスを作成
function setupBackgroundCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'background-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.opacity = '0.5';
  document.body.prepend(canvas);
  
  // キャンバスのサイズを設定
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // 初期サイズ設定とリサイズイベントの登録
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  return canvas;
}

// 信号波のアニメーション
class SignalWaveAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.waves = [];
    this.particles = [];
    this.lastBeatTime = 0;
    this.colors = [
      'rgba(0, 255, 255, 0.5)',  // シアン
      'rgba(255, 0, 255, 0.5)',  // マゼンタ
      'rgba(255, 255, 0, 0.5)'   // イエロー
    ];
  }
  
  // 波を追加
  addWave(x, y, color) {
    this.waves.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.8,
      color,
      speed: 2 + Math.random() * 2,
      opacity: 0.7
    });
  }
  
  // パーティクルを追加
  addParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 3,
        color,
        life: 100 + Math.random() * 50
      });
    }
  }
  
  // ビートに反応
  onBeat(beat, position) {
    // ビート間の最小時間を設定（連続したビートを防ぐ）
    const now = Date.now();
    if (now - this.lastBeatTime < 100) return;
    this.lastBeatTime = now;
    
    // ビートの強さに応じて波とパーティクルを生成
    const intensity = Math.min(1, beat.position.length / 8);
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    this.addWave(x, y, color);
    this.addParticles(x, y, Math.floor(10 * intensity), color);
  }
  
  // 歌詞に反応
  onLyricUpdate(word) {
    if (!word) return;
    
    // 歌詞の位置に波とパーティクルを生成
    const rect = word.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    this.addWave(x, y, color);
    this.addParticles(x, y, 5, color);
  }
  
  // アニメーションを更新
  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 波のアニメーション
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      wave.radius += wave.speed;
      wave.opacity -= 0.005;
      
      if (wave.opacity <= 0) {
        this.waves.splice(i, 1);
        continue;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = wave.color.replace(')', `, ${wave.opacity})`);
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // パーティクルのアニメーション
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      const opacity = p.life / 150;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', `, ${opacity})`);
      this.ctx.fill();
    }
  }
}

// 3Dパースペクティブ効果
class PerspectiveEffect {
  constructor() {
    this.lyricsContainer = document.querySelector('.lyrics-container');
    this.lyrics = document.getElementById('lyrics');
    this.perspective = 1000;
    this.rotationX = 0;
    this.rotationY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isMouseMoving = false;
    this.mouseTimeout = null;
    
    // マウス移動イベントの登録
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  
  // マウス移動に反応
  onMouseMove(e) {
    this.isMouseMoving = true;
    clearTimeout(this.mouseTimeout);
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // 画面中央からの相対位置を計算
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (mouseX - centerX) / centerX;
    const deltaY = (mouseY - centerY) / centerY;
    
    // 回転角度を計算（最大±10度）
    this.rotationY = deltaX * 10;
    this.rotationX = -deltaY * 10;
    
    // 歌詞コンテナに3D変換を適用
    this.updateTransform();
    
    // マウスが停止したら元に戻す
    this.mouseTimeout = setTimeout(() => {
      this.isMouseMoving = false;
      this.resetTransform();
    }, 2000);
    
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
  }
  
  // ビートに反応
  onBeat(beat) {
    if (this.isMouseMoving) return;
    
    // ビートの強さに応じて軽く揺らす
    const intensity = Math.min(1, beat.position.length / 8);
    this.rotationX = (Math.random() - 0.5) * 5 * intensity;
    this.rotationY = (Math.random() - 0.5) * 5 * intensity;
    
    this.updateTransform();
    
    // 少し経ったら元に戻す
    setTimeout(() => {
      this.resetTransform();
    }, 300);
  }
  
  // 変換を更新
  updateTransform() {
    this.lyrics.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
  }
  
  // 変換をリセット
  resetTransform() {
    this.rotationX = 0;
    this.rotationY = 0;
    this.lyrics.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }
}

// 未来へのシグナルテーマのメインクラス
class FutureSignalTheme {
  constructor(player) {
    this.player = player;
    this.canvas = setupBackgroundCanvas();
    this.waveAnimation = new SignalWaveAnimation(this.canvas);
    this.perspectiveEffect = new PerspectiveEffect();
    
    // アニメーションループを開始
    this.animate();
    
    // プレイヤーのイベントに追加のリスナーを登録
    this.setupPlayerListeners();
  }
  
  // プレイヤーのイベントリスナーを設定
  setupPlayerListeners() {
    this.player.addListener({
      onBeat: (beat) => {
        this.waveAnimation.onBeat(beat, this.player.timer.position);
        this.perspectiveEffect.onBeat(beat);
      },
      
      onTimeUpdate: (position) => {
        // アクティブな歌詞を取得
        const activeWord = document.querySelector('.word.active');
        if (activeWord) {
          this.waveAnimation.onLyricUpdate(activeWord);
        }
      }
    });
  }
  
  // アニメーションループ
  animate() {
    this.waveAnimation.update();
    requestAnimationFrame(this.animate.bind(this));
  }
}

// メインのJavaScriptファイルが読み込まれた後に実行
window.addEventListener('load', () => {
  // プレイヤーが初期化されるのを待つ
  const checkPlayerInterval = setInterval(() => {
    if (window.player && window.player.isReady) {
      clearInterval(checkPlayerInterval);
      
      // テーマを初期化
      window.futureSignalTheme = new FutureSignalTheme(window.player);
      console.log('Future Signal Theme initialized');
    }
  }, 100);
});
