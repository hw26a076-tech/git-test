/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Sparkles, Zap, Swords, Heart, Bomb } from "lucide-react";

interface InstructionsProps {
  onClose: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="bg-slate-900/95 border-4 border-amber-500/80 p-6 max-w-2xl w-full text-zinc-100 font-sans shadow-2xl rounded-lg animate-fade-in mx-auto max-h-[85vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-wider text-amber-400 font-mono border-b-4 border-amber-500/30 pb-2 inline-block">
          【 蚊退治の極意 - 遊び方 】
        </h2>
        <p className="text-sm text-zinc-400 mt-2 font-mono">
          蚊の猛暑夜襲撃！君のうちわで、安眠を取り戻せ。
        </p>
      </div>

      <div className="space-y-6">
        {/* controls */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded">
          <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            基本操作方法 (CONTROLS)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sans">
            <div>
              <p className="mb-2">
                <span className="font-mono bg-amber-500 text-slate-950 px-2 py-1 rounded font-bold mr-1">A</span> / 
                <span className="font-mono bg-amber-500 text-slate-950 px-2 py-1 rounded font-bold mx-1">D</span> 
                または 
                <span className="font-mono bg-amber-500 text-slate-950 px-2 py-1 rounded font-bold ml-1">←</span> / 
                <span className="font-mono bg-amber-500 text-slate-950 px-2 py-1 rounded font-bold mx-1">→</span>
              </p>
              <span className="text-zinc-400 text-xs">2D八方向移動（うちわの自在な移動操作）。</span>
            </div>
            <div>
              <p className="mb-2">
                <span className="font-mono bg-amber-500 text-slate-950 px-3 py-1 rounded font-bold mr-2">SPACE</span> / 
                <span className="font-mono bg-amber-500 text-slate-950 px-1.5 py-1 rounded font-bold">KeyK</span>
              </p>
              <span className="text-zinc-400 text-xs">うちわを扇いで対空防衛烈風弾を射出し続ける。</span>
            </div>
            <div>
              <p className="mb-2">
                <span className="font-mono bg-rose-500 text-white px-3 py-1 rounded font-bold">【E】キー</span>
              </p>
              <span className="text-zinc-400 text-xs">強力なバリア（煙幕結界）を展開する。効果時間: <strong className="text-lime-400">3秒</strong>、クールタイム: <strong className="text-orange-400">2秒</strong>。</span>
            </div>
          </div>
        </div>

        {/* danmaku features */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded">
          <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-500 animate-pulse" />
            本格弾幕システム攻略 (DANMAKU MANEUVERS)
          </h3>
          <ul className="list-disc pl-5 mt-2 text-xs text-zinc-300 space-y-2 leading-relaxed">
            <li>
              <strong className="text-rose-400 font-bold">極小の当たり判定 (Core Hitbox)</strong>:
              うちわ中央に表示される<span className="text-rose-400 font-bold">「赤白に光る極小のコア」</span>が真の当たり判定です。蚊群の弾幕がうちわの羽をかすめてもノーダメージ！ギリギリの見極めが可能です。
            </li>
            <li>
              <strong className="text-emerald-400 font-bold">護衛用サテライト (Option Satellites)</strong>:
              左右に浮かぶ2機のミニ蚊取りユニットがプレイヤーに追従し、攻撃モードに合わせた追加援助弾（ホーミング弾や拡散霧）を自動射出します。
            </li>
          </ul>
        </div>

        {/* weapons */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded">
          <h3 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            武器システム (WEAPONS)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-slate-950 rounded-full font-bold text-xs shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-blue-300">うちわの烈風 (Wind Blade)</strong> — 【初期装備】
                <p className="text-xs text-zinc-400 mt-1">鋭い風の刃をまっすぐ発射。連射性が高く、ダメージも安定している王道の武器。</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-slate-950 rounded-full font-bold text-xs shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-emerald-300">蚊取りスパイラル (Katori Smoke Ring)</strong> — 【貫通能力】
                <p className="text-xs text-zinc-400 mt-1">蚊取り線香の超強力な煙。あらゆる蚊を貫通してダメージを与え続けることができる。</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-slate-950 rounded-full font-bold text-xs shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-red-300">アーススプレー (Insecticide Jet Spray)</strong> — 【広範囲・超高速】
                <p className="text-xs text-zinc-400 mt-1">強力な殺虫スプレー。火を噴くように連射ができるが、燃料（弾薬）ゲージが必要。</p>
              </div>
            </div>
          </div>
        </div>

        {/* defense & shield */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded">
            <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2 text-sm">
              <Shield className="w-4.5 h-4.5 text-blue-400" />
              蚊取り線香シールド (KATORISENKO)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              ステージ中央に設置された緑色の<span className="text-emerald-400 font-bold">「蚊取り線香」</span>は敵の攻撃を防ぐ防衛シェルター。
              敵の弾を受けると焼き切れ、少しずつボロボロになって最後は消滅します。
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded">
            <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="w-4.5 h-4.5 text-lime-400" />
              夏の救援物質 (POWER-UPS)
            </h3>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <p><span className="text-rose-400 font-bold">◆ キンカン(回復):</span> 痒み限界(HP)を回復</p>
              <p><span className="text-yellow-400 font-bold">◆ 風速強化:</span> 攻撃速度(連射力)がアップ</p>
              <p><span className="text-cyan-400 font-bold">◆ 武器強化 (Lv UP):</span> 弾道数が最大3列に進化</p>
              <p><span className="text-emerald-400 font-bold">◆ 煙幕結界:</span> 一定時間、蚊を寄せ付けない結界</p>
            </div>
          </div>
        </div>

        {/* mosquito species database */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded">
          <h3 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            脅威：極悪モスキート図鑑
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="border border-slate-800 p-2 rounded bg-slate-900/50">
              <p className="font-bold text-yellow-400">● アカイエカ (Common House Mosquito)</p>
              <p className="text-zinc-400">標準的な茶褐色の蚊。普通のスピードで痒み弾を落としてくる。</p>
            </div>
            <div className="border border-slate-800 p-2 rounded bg-slate-900/50">
              <p className="font-bold text-zinc-100 border-l-2 border-white pl-1 bg-zinc-800/50">● ヒトスジシマカ (Tiger Aedes)</p>
              <p className="text-zinc-400">白黒縞のヤブ蚊。素早く動き、危険なかゆみ毒を発射する。</p>
            </div>
            <div className="border border-slate-800 p-2 rounded bg-slate-900/50">
              <p className="font-bold text-cyan-400">● チカイエカ (Urban Culex)</p>
              <p className="text-zinc-400">超高速で蛇行飛行する厄介な蚊。サイズが小さく狙いを絞りにくい。</p>
            </div>
            <div className="border border-slate-800 p-2 rounded bg-slate-900/50">
              <p className="font-bold text-red-400">● オオカ (Giant Toxorhynchites)</p>
              <p className="text-zinc-400">巨大な蚊。HPが非常に高く、一度に2発の追尾かゆみウェーブを放つ。</p>
            </div>
            <div className="sm:col-span-2 border border-amber-500/30 p-2 rounded bg-amber-500/5">
              <p className="font-bold text-amber-400 flex items-center gap-1">
                <Bomb className="w-3.5 h-3.5 text-amber-400" />
                ● 深夜の女王：モスキート・クイーン (女王蜂ならぬ女王蚊)
              </p>
              <p className="text-zinc-400 mt-1">
                一定のゲーム進行で大音の「羽音」と共に登場する巨大ボス。
                極悪な弾幕パターンを展開し、取り巻きの小型蚊を無限に生み出す最大の天敵。
              </p>
            </div>
          </div>
        </div>

        {/* alert boundary constraint */}
        <div className="bg-red-950/40 border border-red-500/30 p-3 rounded text-zinc-300 text-xs leading-relaxed">
          <span className="text-red-400 font-bold block mb-1">【⚠️敗北条件にご注意ください】</span>
          1. 痒み限界（ライフ）が0％になる。<br />
          2. <span className="text-yellow-400 font-bold">蚊の軍勢が、布団が敷かれた最下部ラインに到達する</span>（布団に侵入され、全身がかゆくなって即死！）。
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono py-2.5 px-8 rounded border-b-4 border-amber-700 hover:border-amber-500 transition-all text-sm uppercase tracking-widest cursor-pointer"
        >
          蚊退治の戦場へ戻る (CLOSE)
        </button>
      </div>
    </div>
  );
};
