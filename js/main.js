/**
 * 未来へのシグナル - TextAlive App
 * マジカルミライ プログラミングコンテスト向けリリックアプリ
 */

// TextAlive App API の Player クラスを使用
const { Player } = TextAliveApp;

// プレイヤーのインスタンスを作成
const player = new Player({
  app: {
    appAuthor: "Manus",
    appName: "未来へのシグナル",
    token: "BnYapKSb6dUuJDml" // TextAliveトークンを追加
  },
  mediaElement: document.createElement("audio")
});

// グローバルに公開（theme.jsから参照できるようにする）
window.player = player;

// HTML要素への参照
const visualizerElement = document.getElementById("visualizer");
const lyricsElement = document.getElementById("lyrics");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");

// 信号エフェクト用の要素を作成する関数
function createSignalElements(count) {
  for (let i = 0; i < count; i++) {
    const signal = document.createElement("div");
    signal.className = "signal";
    signal.style.left = `${Math.random() * 100}%`;
    signal.style.top = `${Math.random() * 100}%`;
    signal.style.animationDelay = `${Math.random() * 2}s`;
    
    // ランダムな色を設定
    const colors = [
      "var(--signal-color-1)",
      "var(--signal-color-2)",
      "var(--signal-color-3)"
    ];
    signal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    visualizerElement.appendChild(signal);
  }
}

// 歌詞のフレーズを表示する関数
function createPhraseElement(phrase) {
  // フレーズ要素を作成
  const phraseElement = document.createElement("div");
  phraseElement.className = "phrase";
  
  // フレーズ内の単語を処理
  phrase.children.forEach(word => {
    // 単語要素を作成
    const wordElement = document.createElement("span");
    wordElement.className = "word";
    wordElement.textContent = word.text;
    
    // 単語の開始時間と終了時間を設定
    wordElement.dataset.startTime = word.startTime;
    wordElement.dataset.endTime = word.endTime;
    
    phraseElement.appendChild(wordElement);
  });
  
  return phraseElement;
}

// ビートに合わせて視覚効果を追加する関数
function animateOnBeat(beat) {
  // ビートに合わせて背景色を変更
  const intensity = Math.min(0.2, beat.position.length / 8);
  document.body.style.backgroundColor = `rgba(18, 18, 18, ${1 - intensity})`;
  
  // ランダムな信号エフェクトをアクティブにする
  const signals = visualizerElement.querySelectorAll(".signal");
  if (signals.length > 0) {
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    randomSignal.style.opacity = "0.8";
    setTimeout(() => {
      randomSignal.style.opacity = "0";
    }, 100);
  }
}

// 再生位置に応じて歌詞をハイライトする関数
function updateLyrics(position) {
  // すべての単語要素を取得
  const wordElements = lyricsElement.querySelectorAll(".word");
  
  // 各単語の状態を更新
  wordElements.forEach(wordElement => {
    const startTime = parseInt(wordElement.dataset.startTime);
    const endTime = parseInt(wordElement.dataset.endTime);
    
    // 現在の再生位置が単語の時間範囲内にあるかチェック
    if (position >= startTime && position < endTime) {
      wordElement.classList.add("active");
      
      // 単語内の文字をアニメーション
      const progress = (position - startTime) / (endTime - startTime);
      const chars = wordElement.querySelectorAll(".char");
      chars.forEach((char, index) => {
        const charProgress = index / chars.length;
        if (progress >= charProgress && progress < charProgress + 0.3) {
          char.classList.add("active");
        } else {
          char.classList.remove("active");
        }
      });
    } else {
      wordElement.classList.remove("active");
    }
  });
}

// プレイヤーのイベントリスナーを設定
player.addListener({
  // APIの準備が完了したときに呼ばれる
  onAppReady(app) {
    // TextAlive ホストと接続していなければ、デフォルトの楽曲を読み込む
    if (!app.songUrl) {
      // マジカルミライ2024の楽曲を使用
      player.createFromSongUrl("https://piapro.jp/t/hZ35/20240130103028", {
        video: {
          // 音楽地図訂正履歴: https://songle.jp/songs/2121525/history
          beatId: 4592293,
          chordId: 2727635,
          repetitiveSegmentId: 2824326,
          // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FhZ35%2F20240130103028
          lyricId: 59415,
          lyricDiffId: 13962
        },
      });
    }
    
    // TextAlive ホストがない場合は、コントロールを表示
    if (!app.managed) {
      // 再生ボタンのイベントリスナー
      playButton.addEventListener("click", () => {
        if (player.isPlaying) {
          player.requestPause();
        } else {
          player.requestPlay();
        }
      });
      
      // 一時停止ボタンのイベントリスナー
      pauseButton.addEventListener("click", () => {
        player.requestPause();
      });
      
      // 停止ボタンのイベントリスナー
      stopButton.addEventListener("click", () => {
        player.requestStop();
      });
    } else {
      // TextAlive ホストがある場合は、コントロールを非表示
      document.querySelector(".player-controls").style.display = "none";
    }
  },
  
  // 楽曲が変わったときに呼ばれる
  onAppMediaChange() {
    // 歌詞要素をクリア
    lyricsElement.innerHTML = "";
  },
  
  // 楽曲情報が取得できたときに呼ばれる
  onVideoReady(video) {
    // 信号エフェクト要素を作成
    createSignalElements(20);
    
    // 歌詞のフレーズを表示
    if (video.firstPhrase) {
      let currentPhrase = video.firstPhrase;
      while (currentPhrase) {
        const phraseElement = createPhraseElement(currentPhrase);
        lyricsElement.appendChild(phraseElement);
        currentPhrase = currentPhrase.next;
      }
      
      // 単語内の文字を個別の要素に分割
      const wordElements = lyricsElement.querySelectorAll(".word");
      wordElements.forEach(wordElement => {
        const text = wordElement.textContent;
        wordElement.textContent = "";
        
        // 各文字を個別のspan要素に
        for (let i = 0; i < text.length; i++) {
          const charElement = document.createElement("span");
          charElement.className = "char";
          charElement.textContent = text[i];
          wordElement.appendChild(charElement);
        }
      });
    }
  },
  
  // 再生位置が変わったときに呼ばれる
  onTimeUpdate(position) {
    // 歌詞のハイライトを更新
    updateLyrics(position);
  },
  
  // ビートが検出されたときに呼ばれる
  onBeat(beat) {
    // ビートに合わせてアニメーション
    animateOnBeat(beat);
  }
});

// プレイヤーの初期化
player.on("ready", () => {
  console.log("Player is ready");
});

// エラーハンドリング
player.on("error", (e) => {
  console.error("Error:", e);
});
