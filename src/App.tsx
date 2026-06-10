/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { GameStage, ScoreEntry } from "./types";
import { GameCanvas } from "./components/GameCanvas";
import { Instructions } from "./components/Instructions";
import { audio } from "./utils/audio";
import { 
  Dribbble, Sparkles, Trophy, Play, Info, Trash2, 
  Moon, Heart, ChevronRight, Volume2, Gamepad2, ShieldAlert
} from "lucide-react";

export default function App() {
  const [stage, setStage] = useState<GameStage>(GameStage.TITLE);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentWave, setCurrentWave] = useState<number>(1);
  
  // Modal/UI views
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [scoresList, setScoresList] = useState<ScoreEntry[]>([]);
  
  // Web Audio activation checker
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);

  // Firefly background animation particles
  const [fireflies, setFireflies] = useState<Array<{ id: number; x: number; y: number; s: number; angle: number }>>([]);

  // Initialize fireflies & scoreboard
  useEffect(() => {
    // Generate 18 floating pixel fireflies
    const initialFlies = Array.from({ length: 18 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 0.3 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2
    }));
    setFireflies(initialFlies);

    // Load custom scores
    loadScoreboard();

    // Load top overall highscore
    const saved = localStorage.getItem("mos_invader_highscore");
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }

    // Firefly translation loop
    const interval = setInterval(() => {
      setFireflies(prev => 
        prev.map(fly => {
          const nextAngle = fly.angle + (Math.random() * 0.4 - 0.2);
          return {
            ...fly,
            x: (fly.x + Math.cos(nextAngle) * 0.15 + 100) % 100,
            y: (fly.y + Math.sin(nextAngle) * 0.15 + 100) % 100,
            angle: nextAngle
          };
        })
      );
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const loadScoreboard = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem("mos_invader_scores") || "[]");
      setScoresList(parsed);
    } catch (e) {
      setScoresList([]);
    }
  };

  const handleStartGame = () => {
    // Force initialize Web Audio context on user gesture
    audio.playShoot(audio.getMute() ? null as any : (audio as any).WeaponType?.WIND_BLADE || "WIND_BLADE");
    setAudioInitialized(true);
    
    setScore(0);
    setCurrentWave(1);
    setStage(GameStage.PLAYING);
  };

  const handleClearScores = () => {
    if (window.confirm("これまでの退治功績（スコア履歴）をリセットしますか？")) {
      localStorage.removeItem("mos_invader_scores");
      localStorage.removeItem("mos_invader_highscore");
      setHighScore(0);
      setScoresList([]);
    }
  };

  const tryPlayTestSound = () => {
    audio.playShoot(audio.getMute() ? null as any : (audio as any).WeaponType?.WIND_BLADE || "WIND_BLADE" as any);
    setAudioInitialized(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 relative overflow-hidden font-pixel" id="main_game_viewport">
      
      {/* 2D Floating Firefly Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {fireflies.map(fly => (
          <div
            key={fly.id}
            className="absolute rounded-full bg-cyan-400 opacity-70 blur-xs transition-all duration-300 animate-pulse"
            style={{
              left: `${fly.x}%`,
              top: `${fly.y}%`,
              width: `${fly.s * 8}px`,
              height: `${fly.s * 8}px`,
              boxShadow: "0 0 12px #22d3ee, 0 0 5px #22d3ee"
            }}
          />
        ))}
      </div>

      {/* WEB AUDIO INITIALIZER TOAST */}
      {!audioInitialized && (
        <div 
          onClick={tryPlayTestSound}
          className="w-full max-w-lg mx-auto bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 py-2.5 px-4 rounded-lg flex items-center justify-between text-xs text-amber-300 font-sans cursor-pointer transition-all animate-bounce z-40 mt-2 mb-1 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>【音声警報】タップ・クリックしてレトロ効果音を有効化してください！</span>
          </div>
          <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold text-[10px]">ENABLE</span>
        </div>
      )}

      {/* --- APP HEADER --- */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-xl backdrop-blur-sm z-20 mt-2 gap-3" id="navigation_header">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              蚊インベーダー
            </h1>
            <p className="text-[10px] text-zinc-400 font-sans tracking-wide">
              RETRO INSECT SLAPPER ARCADE v1.02
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-zinc-400">BEST RECORD:</span>
            <span className="font-bold text-yellow-400 text-sm">{highScore}</span>
          </div>
        </div>
      </header>

      {/* --- MAIN STAGE CONTAINER --- */}
      <main className="flex-1 w-full flex items-center justify-center my-4 z-20">
        
        {stage === GameStage.TITLE ? (
          /* ========================================================== */
          /*                       TITLE SCREEN                          */
          /* ========================================================== */
          <div className="w-full max-w-2xl bg-neutral-900/90 border-4 border-amber-600/80 p-6 sm:p-8 rounded-2xl shadow-2xl relative flex flex-col items-center justify-between min-h-[460px] animate-fade-in" id="title_screen_box">
            
            {/* Retro wood screen handle pattern */}
            <div className="absolute top-0 bottom-0 left-2 w-1 bg-amber-800/10 border-r border-amber-900/30"></div>
            <div className="absolute top-0 bottom-0 right-2 w-1 bg-amber-800/10 border-l border-amber-900/30"></div>

            {/* Glowing moon & late summer evening mockup */}
            <div className="w-full flex justify-between items-start mb-6">
              <div className="flex items-center gap-1.5 bg-zinc-800/60 text-zinc-300 py-1 px-2.5 rounded text-[11px] border border-zinc-700/50">
                <Moon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>【戦闘高度 5,500m】 真夏の戦闘領空</span>
              </div>
              <div className="text-[11px] text-zinc-500 tracking-widest uppercase font-retro animate-pulse">
                INSERT COIN
              </div>
            </div>

            {/* Glowing game logo */}
            <div className="text-center my-4 relative">
              {/* Ghost shadow glow */}
              <h2 className="text-4xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-sky-400 to-blue-500 select-none filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.5)]">
                蚊インベーダー
              </h2>
              <div className="text-[12px] sm:text-sm font-sans tracking-[0.2em] text-cyan-300 mt-2 flex justify-center items-center gap-2">
                <span>[ 真夏の超高度空中戦：扇烈風 vs 蚊群航空艦隊 ]</span>
              </div>
            </div>

            {/* Interactive cartoon warning graphic */}
            <div className="bg-slate-950/90 border-2 border-slate-800 p-4 rounded-xl w-full max-w-md my-4 text-center text-xs font-sans text-neutral-300 leading-relaxed shadow-inner">
              <span className="text-cyan-400 font-bold block text-sm mb-1.5 flex items-center justify-center gap-1">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                【真夏の防空警報 (Aviation Notice)】
              </span>
              青空の戦略防衛エリアに『アカイエカ空隊』をはじめとする害虫航空工作群が侵入！
              大空を<span className="text-amber-400 font-bold">縦横無尽に飛び回り</span>、伝承のうちわの烈風スラッシャーと対空蚊取りスプレーで墜落させよ！
            </div>

            {/* Menu Buttons list */}
            <div className="w-full max-w-sm flex flex-col gap-3 my-4">
              <button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold py-3 px-6 rounded-lg text-sm sm:text-base tracking-widest shadow-lg border-b-4 border-amber-700 hover:border-amber-500 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 text-slate-950 fill-slate-950 font-bold" />
                蚊退治（戦闘）を開始する (START)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowInstructions(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-zinc-100 py-2.5 px-4 rounded border-b-4 border-slate-950 text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Info className="w-4 h-4 text-amber-400" /> 遊び方
                </button>
                <button
                  onClick={() => {
                    loadScoreboard();
                    setShowScoreboard(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-zinc-100 py-2.5 px-4 rounded border-b-4 border-slate-950 text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trophy className="w-4 h-4 text-yellow-500" /> 歴代功績
                </button>
              </div>
            </div>

            {/* Nostalgic summer evening credit */}
            <div className="text-[11px] text-zinc-600 mt-4 text-center font-sans">
              夜更けの羽音に抗う、すべての日本国民へ捧ぐ。
            </div>
            
          </div>
        ) : (
          /* ========================================================== */
          /*                 ACTIVE GAMEPLAY CANVAS VIEW                */
          /* ========================================================== */
          <GameCanvas
            stage={stage}
            setStage={setStage}
            score={score}
            setScore={setScore}
            highScore={highScore}
            setHighScore={setHighScore}
            currentWave={currentWave}
            setCurrentWave={setCurrentWave}
            onOpenInstructions={() => setShowInstructions(true)}
          />
        )}

      </main>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. TUTORIAL TABS INSTRUCTIONS */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <Instructions onClose={() => setShowInstructions(false)} />
        </div>
      )}

      {/* 2. REPUTABLE SCOREBOARD RANKINGS */}
      {showScoreboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border-4 border-amber-600 p-6 max-w-md w-full text-zinc-100 font-sans shadow-2xl rounded-lg animate-fade-in relative">
            <div className="text-center mb-5">
              <h3 className="text-2xl font-bold text-amber-400 font-pixel">【 歴代安眠の防衛英雄録 】</h3>
              <p className="text-xs text-zinc-400 mt-1">
                熱帯夜の悪魔たちを多く屠った、偉大なる英雄たちの記録。
              </p>
            </div>

            {scoresList.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded border border-slate-800 text-center text-zinc-500 my-4 text-xs font-mono">
                英雄記録がまだありません。<br />
                蚊を撃破して、最初の功績を刻もう！
              </div>
            ) : (
              <div className="space-y-2.5 my-4">
                {scoresList.map((entry, idx) => (
                  <div 
                    key={entry.date + "_" + idx} 
                    className={`flex justify-between items-center bg-slate-950 border p-2.5 rounded-md ${
                      idx === 0 ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-transparent" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                        idx === 0 ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-zinc-300"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-zinc-200 text-xs font-bold">{entry.name}</span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-yellow-400 font-bold block">{entry.score} pts</span>
                      <span className="text-[10px] text-zinc-500 block">第 {entry.wave} 夜まで生存 • {entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleClearScores}
                disabled={scoresList.length === 0}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-bold font-sans disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" /> 記録の初期化
              </button>
              <button
                onClick={() => setShowScoreboard(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-5 rounded cursor-pointer text-xs"
              >
                閉じる (CLOSE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER REGULATION --- */}
      <footer className="w-full text-center py-2 text-[10px] sm:text-xs text-zinc-600 font-sans tracking-wide shrink-0">
        <p>© 2026 蚊インベーダー防衛製作委員会. All Rights Reserved. </p>
      </footer>

    </div>
  );
}
