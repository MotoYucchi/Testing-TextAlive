/**
 * 未来へのシグナル - パフォーマンス最適化
 * マジカルミライ プログラミングコンテスト向けリリックアプリの最適化
 */

// ページの読み込みが完了したときに実行
window.addEventListener('load', () => {
  // 画像の遅延読み込み
  lazyLoadImages();
  
  // アニメーションの最適化
  optimizeAnimations();
  
  // イベントリスナーの最適化
  optimizeEventListeners();
  
  console.log('Performance optimizations applied');
});

// 画像の遅延読み込み
function lazyLoadImages() {
  // 将来的に画像が追加された場合のための準備
  const images = document.querySelectorAll('img[data-src]');
  
  if (images.length > 0) {
    // Intersection Observerを使用して、ビューポートに入った時に画像を読み込む
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// アニメーションの最適化
function optimizeAnimations() {
  // requestAnimationFrameの使用を確認
  const canvas = document.getElementById('background-canvas');
  
  // キャンバスアニメーションの最適化
  if (canvas) {
    // GPUアクセラレーションを有効化
    canvas.style.transform = 'translateZ(0)';
    canvas.style.willChange = 'transform';
  }
  
  // 歌詞アニメーションの最適化
  const lyrics = document.getElementById('lyrics');
  if (lyrics) {
    // GPUアクセラレーションを有効化
    lyrics.style.transform = 'translateZ(0)';
    lyrics.style.willChange = 'transform';
    
    // アニメーション中のみwillChangeを設定するための監視
    lyrics.addEventListener('animationstart', () => {
      lyrics.style.willChange = 'transform, opacity';
    });
    
    lyrics.addEventListener('animationend', () => {
      lyrics.style.willChange = 'auto';
    });
  }
}

// イベントリスナーの最適化
function optimizeEventListeners() {
  // リサイズイベントの最適化（デバウンス処理）
  let resizeTimeout;
  const originalResizeHandler = window.onresize;
  
  window.onresize = function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (typeof originalResizeHandler === 'function') {
        originalResizeHandler();
      }
      
      // キャンバスのリサイズ処理など
      const canvas = document.getElementById('background-canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }, 100);
  };
  
  // マウス移動イベントの最適化（スロットリング処理）
  let lastMouseMoveTime = 0;
  const mouseMoveThrottle = 50; // 50ミリ秒ごとに処理
  
  document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastMouseMoveTime >= mouseMoveThrottle) {
      lastMouseMoveTime = now;
      
      // マウス移動に関連する処理
      if (window.futureSignalTheme && window.futureSignalTheme.perspectiveEffect) {
        window.futureSignalTheme.perspectiveEffect.onMouseMove(e);
      }
    }
  }, { passive: true });
}

// メモリ使用量の最適化
function cleanupUnusedResources() {
  // 未使用のDOM要素の参照を解放
  const cleanupInterval = setInterval(() => {
    // ガベージコレクションのヒントを提供
    if (window.gc) {
      window.gc();
    }
    
    // 長時間実行されていない場合はクリーンアップを停止
    if (document.hidden) {
      clearInterval(cleanupInterval);
    }
  }, 60000); // 1分ごとにチェック
  
  // ページが非表示になったときのリソース解放
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 非表示時にアニメーションを一時停止するなどの処理
      if (window.player && window.player.isPlaying) {
        window.player.pause();
      }
    }
  });
}

// 初期化時にクリーンアップ関数を呼び出し
cleanupUnusedResources();
