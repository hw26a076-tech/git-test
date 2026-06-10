/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { 
  GameStage, Player, WeaponType, Mosquito, MosquitoType, 
  Bullet, BulletOwner, PowerUp, PowerUpType, Bunker, Particle, ParticleType, ScoreEntry 
} from "../types";
import { audio } from "../utils/audio";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Award, FileText } from "lucide-react";

// --- RETRO PIXEL ART MATRICES ---
// 0 = empty, 1 = player handle/blue fan, 2 = player red sun, 3 = mosquito legs/body, 4 = wings, 5 = blood, 6 = green coil, 7 = powerup/accent
const SPRITE_UCHIWA = [
  "....11111....",
  "..111222111..",
  ".11122222111.",
  "1112222222111",
  "1112222222111",
  "1111222221111",
  ".11112221111.",
  "..111111111..",
  "....11111....",
  ".....111.....",
  ".....111.....",
  ".....111.....",
  ".....111....."
];

const SPRITE_MOSQUITO_COMMON_A = [
  "....3......3....",
  "....3......3....",
  ".....44..44.....",
  "....34444443....",
  "....33333333....",
  "...3335533553...",
  "..3.33333333.3..",
  "....33333333....",
  ".....33..33.....",
  "......3...3....."
];
const SPRITE_MOSQUITO_COMMON_B = [
  "....3......3....",
  "...443....344...",
  "..44443..34444..",
  "....33333333....",
  "....33333333....",
  "...3335533553...",
  "..3.33333333.3..",
  "....33333333....",
  ".....33..33.....",
  "......3...3....."
];

const SPRITE_MOSQUITO_TIGER_A = [
  "....3......3....",
  ".....44..44.....",
  "....34477443....",
  "....37733773....",
  "...3335577553...",
  "..3.37733773.3..",
  "....37733773....",
  ".....337733.....",
  "......3..3......"
];
const SPRITE_MOSQUITO_TIGER_B = [
  "....3......3....",
  "...443....344...",
  "..444477774444..",
  "....33377333....",
  "...3335577553...",
  "..3.37733773.3..",
  "....37733773....",
  ".....337733.....",
  "......3..3......"
];

const SPRITE_MOSQUITO_URBAN_A = [
  "...7....7...",
  "....4444....",
  "...344443...",
  "..33333333..",
  "..33553553..",
  "..33333333..",
  "....3333....",
  "...3.33.3...",
  "....3..3...."
];
const SPRITE_MOSQUITO_URBAN_B = [
  "...7....7...",
  "..44333344..",
  ".4444334444.",
  "..33333333..",
  "..33553553..",
  "..33333333..",
  "....3333....",
  "...3.33.3...",
  "....3..3...."
];

const SPRITE_MOSQUITO_GIANT_A = [
  "......3333......",
  "......3553......",
  "......3553......",
  "....44333344....",
  "..444433334444..",
  "3444443333444443",
  "3333333333333333",
  "3333355555533333",
  "3335555555555333",
  "3335555555555333",
  "3..3355555533..3",
  "....33333333....",
  ".....33..33.....",
  ".....3....3.....",
  ".....3....3.....",
  ".....3....3....."
];
const SPRITE_MOSQUITO_GIANT_B = [
  "......3333......",
  "......3553......",
  "......3553......",
  "..44..3333..44..",
  ".4444.3333.4444.",
  "4444443333444444",
  "3333333333333333",
  "3333355555533333",
  "3335555555555333",
  "3335555555555333",
  "3..3355555533..3",
  "....33333333....",
  ".....33..33.....",
  ".....3....3.....",
  ".....3....3.....",
  ".....3....3....."
];

const SPRITE_BOSS_QUEEN_A = [
  "..........7777..........",
  ".........777777.........",
  "........33777733........",
  "........33333333........",
  ".......3355335533.......",
  "......335553355533......",
  ".....44443333334444.....",
  "....4444443333444444....",
  "...444444433334444444...",
  "...444444433334444444...",
  "333333333355553333333333",
  "333355555555555555553333",
  "335555555555555555555533",
  "335555555555555555555533",
  "333555555555555555553333",
  "333355555555555555553333",
  "....3333555555553333....",
  "......333333333333......",
  ".......3333333333.......",
  "........33....33........",
  "........3......3........",
  "........3......3........"
];
const SPRITE_BOSS_QUEEN_B = [
  "..........7777..........",
  ".........777777.........",
  "........33777733........",
  "........33333333........",
  ".......3355335533.......",
  "......335553355533......",
  "....44..43333334..44....",
  "...4444.43333334.4444...",
  "..44444443333334444444..",
  "..44444443333334444444..",
  "333333333355553333333333",
  "333355555555555555553333",
  "335555555555555555555533",
  "335555555555555555555533",
  "333555555555555555553333",
  "333355555555555555553333",
  "....3333555555553333....",
  "......333333333333......",
  ".......3333333333.......",
  "........33....33........",
  "........3......3........",
  "........3......3........"
];

// Canvas parameters
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 550;

interface GameCanvasProps {
  stage: GameStage;
  setStage: (stage: GameStage) => void;
  score: number;
  setScore: (score: number) => void;
  highScore: number;
  setHighScore: (highScore: number) => void;
  currentWave: number;
  setCurrentWave: (wave: number) => void;
  onOpenInstructions: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stage,
  setStage,
  score,
  setScore,
  highScore,
  setHighScore,
  currentWave,
  setCurrentWave,
  onOpenInstructions
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game mutable refs for the main game loop
  const pRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 65,
    width: 55,
    height: 65,
    speed: 6,
    health: 100,
    maxHealth: 100,
    weapon: WeaponType.WIND_BLADE,
    weaponLevel: 1,
    sprayFuel: 100,
    maxSprayFuel: 100
  });

  const mosquitoesRef = useRef<Mosquito[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const bunkersRef = useRef<Bunker[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Key tracking state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Game states we don't want to over-re-render React for
  const waveInProgressRef = useRef<boolean>(false);
  const shootCooldownRef = useRef<number>(0);
  const audioStepTimerRef = useRef<number>(0);
  const animTickRef = useRef<number>(0);
  const stepCountRef = useRef<number>(0);
  const comboCountRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0); // 120 frames cooldown (2 seconds)
  const isEnteringStageRef = useRef<boolean>(false);
  const stageBannerTimerRef = useRef<number>(0);
  const shieldExpiryRef = useRef<number>(0); // Time frames showing green protective shield
  const manualShieldCooldownRef = useRef<number>(0); // Cooldown frames for KeyE manual shield

  // Movement direction of the mosquito team
  const invaderDirectionRef = useRef<number>(1); // 1 = right, -1 = left
  const invaderSpeedMultiplierRef = useRef<number>(1);
  const invaderStepCooldownRef = useRef<number>(4); // Starts moving every 4 frames (extremely fast from start), decreases with less enemies
  const invaderMoveTimerRef = useRef<number>(0);

  // Audio mute helper
  const [muted, setMuted] = useState<boolean>(audio.getMute());
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  // Extermination Bomb (アース蚊取り爆弾) - Player starts with 3 bombs, max 5.
  const [bombs, setBombs] = useState<number>(3);
  const bombsRef = useRef<number>(3);
  const bombActiveFramesRef = useRef<number>(0);

  const triggerMosquitoBomb = () => {
    if (bombsRef.current <= 0) {
      spawnTextParticle(pRef.current.x + pRef.current.width / 2, pRef.current.y - 15, "ボム切れ! (No Bombs)", "#f43f5e");
      return;
    }
    
    bombsRef.current--;
    setBombs(bombsRef.current);
    bombActiveFramesRef.current = 60; // 1 second of screen shockwaves (60 FPS)

    // Play intense sonic & splat sounds
    try {
      audio.playShieldUp();
      setTimeout(() => {
        audio.playSplat();
      }, 70);
      setTimeout(() => {
        audio.playSplat();
      }, 180);
    } catch (e) {}

    // 1. Clear all ENEMY bullets to save player from direct hits
    bulletsRef.current = bulletsRef.current.filter((bul) => bul.owner !== BulletOwner.ENEMY);

    // 2. Heavy 220 damage payload to all active mosquitoes
    let splatCount = 0;
    const invaders = mosquitoesRef.current;
    const remainingMosquitoes: Mosquito[] = [];
    
    invaders.forEach((mos) => {
      // Inflict heavy lethal bomb damage
      mos.hp -= 220;
      
      if (mos.hp <= 0) {
        splatCount++;
        // Splat explosion of pixel cells
        spawnExplosionParticles(
          mos.x + mos.width / 2, 
          mos.y + mos.height / 2, 
          ParticleType.BLOOD_SPLAT, 
          mos.type === MosquitoType.QUEEN_BOSS ? 30 : 10
        );

        // Give score and combo boost
        comboCountRef.current++;
        comboTimerRef.current = 140; 
        const comboMultiplier = Math.min(5, 1 + Math.floor(comboCountRef.current / 3));
        const pointGained = mos.points * comboMultiplier;
        setScore((prev) => prev + pointGained);

        spawnTextParticle(
          mos.x + mos.width / 2, 
          mos.y, 
          `+${pointGained} ${comboMultiplier > 1 ? `x${comboMultiplier} Combo` : ""}`,
          comboMultiplier > 3 ? "#ef4444" : comboMultiplier > 1 ? "#34d399" : "#facc15"
        );

        // Drop bonus weapons or recovery items (25% rate)
        if (Math.random() < 0.25 || mos.type === MosquitoType.QUEEN_BOSS) {
          const items = [
            PowerUpType.RECOVERY, 
            PowerUpType.FIRE_RATE, 
            PowerUpType.WEAPON_UP, 
            PowerUpType.KATORI_SHIELD, 
            PowerUpType.SPRAY_AMMO
          ];
          const chosen = items[Math.floor(Math.random() * items.length)];
          powerupsRef.current.push({
            id: `pw_bomb_${mos.id}_${Date.now()}`,
            type: chosen,
            x: mos.x + mos.width / 2 - 12,
            y: mos.y + mos.height / 2,
            width: 24,
            height: 24,
            speed: 1.8 + Math.random() * 0.8
          });
        }
      } else {
        // High HP boss / large mosquito survived
        spawnExplosionParticles(mos.x + mos.width / 2, mos.y + mos.height / 2, ParticleType.SPARKS, 8);
        spawnTextParticle(
          mos.x + mos.width / 2, 
          mos.y - 12, 
          `BOMB -220 HP`, 
          "#fbbf24"
        );
        remainingMosquitoes.push(mos);
      }
    });

    mosquitoesRef.current = remainingMosquitoes;

    if (splatCount > 0) {
      spawnTextParticle(
        CANVAS_WIDTH / 2, 
        CANVAS_HEIGHT / 2 - 40, 
        `蚊 ${splatCount} 匹を爆風撲滅！`, 
        "#fbbf24"
      );
    } else {
      spawnTextParticle(pRef.current.x + pRef.current.width / 2, pRef.current.y - 15, "防空爆波！敵弾一掃", "#38bdf8");
    }

    // Spawn massive beautiful green cloud of katorisenko incense and spray particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 9.5;
      particlesRef.current.push({
        id: `earth_bomb_smoke_${Date.now()}_${i}`,
        x: pRef.current.x + pRef.current.width / 2,
        y: pRef.current.y + pRef.current.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 12,
        color: i % 2 === 0 ? "rgba(16, 185, 129, 0.45)" : "rgba(245, 158, 11, 0.45)", // emerald and amber smoke clouds
        alpha: 1.0,
        decay: 0.013 + Math.random() * 0.01
      });
    }
  };

  // Initialize key handlers once
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll with arrows and space inside iframe
      if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyE", "KeyF"].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;

      // Handle custom E Key barrier trigger
      if (e.code === "KeyE" && stage === GameStage.PLAYING) {
        if (manualShieldCooldownRef.current === 0 && shieldExpiryRef.current === 0) {
          shieldExpiryRef.current = 180; // 3 seconds defensive shield duration (60 FPS * 3 = 180)
          manualShieldCooldownRef.current = 300; // 3 seconds duration (180) + 2 seconds cooldown (120) = 300 frames total
          audio.playShieldUp();
          spawnTextParticle(pRef.current.x + pRef.current.width / 2, pRef.current.y - 15, "電磁バリア展開!! (3秒間無敵)", "#34d399");

          // Circular aesthetic particles on trigger
          for (let i = 0; i < 18; i++) {
            const angle = (i / 18) * Math.PI * 2;
            particlesRef.current.push({
              id: `shield_spawn_${Date.now()}_${i}`,
              x: pRef.current.x + pRef.current.width / 2,
              y: pRef.current.y + pRef.current.height / 2,
              vx: Math.cos(angle) * 4.5,
              vy: Math.sin(angle) * 4.5,
              size: 4 + Math.random() * 3,
              color: "#34d399",
              alpha: 1,
              decay: 0.03 + Math.random() * 0.02,
              type: ParticleType.SMOKE_GRID
            });
          }
        }
      }

      // Handle custom F Key - 蚊撲滅アースボム
      if (e.code === "KeyF" && stage === GameStage.PLAYING) {
        triggerMosquitoBomb();
      }

      // Handle Single press action on keydown if needed
      if ((e.code === "Space" || e.code === "KeyK") && stage === GameStage.PLAYING) {
        // Just standard shooting triggers on key hold too, but good to ensure response
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === "Space" || e.code === "KeyK") {
        audio.stopSprayLoop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      audio.stopSprayLoop();
    };
  }, [stage]);

  // Clean-up spray looping on unmount or stage change
  useEffect(() => {
    if (stage !== GameStage.PLAYING) {
      audio.stopSprayLoop();
    }
  }, [stage]);

  // Reset Game variables to load a clean state
  const resetGame = (restartFromWave1: boolean = true) => {
    pRef.current = {
      x: CANVAS_WIDTH / 2 - 25,
      y: CANVAS_HEIGHT - 65,
      width: 55,
      height: 65,
      speed: 6.5,
      health: 100,
      maxHealth: 100,
      weapon: WeaponType.WIND_BLADE,
      weaponLevel: 1,
      sprayFuel: 100,
      maxSprayFuel: 100
    };

    bulletsRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    shieldExpiryRef.current = 0;
    manualShieldCooldownRef.current = 0;
    comboCountRef.current = 0;
    comboTimerRef.current = 0;
    shootCooldownRef.current = 0;

    bombsRef.current = 3;
    setBombs(3);

    if (restartFromWave1) {
      setScore(0);
      setCurrentWave(1);
      setupWave(1);
    } else {
      setupWave(currentWave);
    }
  };

  // Set up the bunkers (Katorisenko defensive structures)
  const createBunkers = () => {
    bunkersRef.current = []; // Defensive walls are completely removed as requested
  };

  // Build the wave of Mosquito Invaders
  const setupWave = (wave: number) => {
    waveInProgressRef.current = true;
    isEnteringStageRef.current = true;
    stageBannerTimerRef.current = 120; // Show banner for 2 seconds (120 frames)
    bulletsRef.current = [];
    powerupsRef.current = [];
    shieldExpiryRef.current = Math.max(0, shieldExpiryRef.current - 1);

    if (wave > 1) {
      bombsRef.current = Math.min(5, bombsRef.current + 1);
      setBombs(bombsRef.current);
      spawnTextParticle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, "WAVE CLEAR BONUS: ボム+1補給！", "#facc15");
    }

    createBunkers();

    const mosquitoes: Mosquito[] = [];
    const cols = 6;
    const rows = 4;
    const startX = 120;
    const startY = 80;
    const spacingX = 85;
    const spacingY = 50;

    // Difficulty curve scaling
    const hpMultiplier = 1 + (wave - 1) * 0.35;
    const speedBoost = Math.min(2.0, (wave - 1) * 0.25);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let type = MosquitoType.COMMON;
        let points = 10;
        let hp = Math.floor(1 * hpMultiplier);

        // Assign mosquito species based on row
        if (r === 0) {
          type = MosquitoType.GIANT;
          hp = Math.floor(3 * hpMultiplier);
          points = 100;
        } else if (r === 1) {
          type = MosquitoType.URBAN;
          hp = Math.floor(2 * hpMultiplier);
          points = 45;
        } else if (r === 2) {
          type = MosquitoType.TIGER;
          hp = Math.floor(2 * hpMultiplier);
          points = 25;
        }

        mosquitoes.push({
          id: `mos_${r}_${c}`,
          type,
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: type === MosquitoType.GIANT ? 48 : 36,
          height: type === MosquitoType.GIANT ? 48 : 32,
          hp,
          maxHp: hp,
          points,
          animFrame: Math.floor(Math.random() * 2),
          wingSpeed: type === MosquitoType.URBAN ? 4 : 8,
          wingTimer: 0,
          moveDirection: 1,
          shootCooldown: 120 + Math.random() * 240
        });
      }
    }

    // Boss spawns in waves multiple of 3 (e.g. 3, 6, 9)
    if (wave % 3 === 0) {
      const bossHp = Math.floor(25 + (wave * 8));
      mosquitoes.push({
        id: `boss_queen_${wave}`,
        type: MosquitoType.QUEEN_BOSS,
        x: CANVAS_WIDTH / 2 - 50,
        y: 40,
        width: 90,
        height: 60,
        hp: bossHp,
        maxHp: bossHp,
        points: 500,
        animFrame: 0,
        wingSpeed: 3,
        wingTimer: 0,
        moveDirection: 1,
        shootCooldown: 90
      });
    }

    mosquitoesRef.current = mosquitoes;
    invaderDirectionRef.current = 1;
    invaderSpeedMultiplierRef.current = 2.4; // Speed boost multiplier
    invaderStepCooldownRef.current = Math.max(1, 4 - speedBoost * 1.5); // Fast step cycle frame limit immediately from start (4 frames)
    invaderMoveTimerRef.current = 0;
  };

  // Play audio buzzing step timing
  const handleRetroStepNoise = () => {
    audioStepTimerRef.current++;
    const aliveCount = mosquitoesRef.current.length;
    if (aliveCount === 0) return;

    // Adjust step interval dynamically: as fewer enemies are alive, they move and buzz FASTER!
    // This perfectly replicates Space Invaders speed pressure logic.
    const stepsPerTick = Math.max(8, Math.floor((aliveCount / 24) * invaderStepCooldownRef.current));
    
    if (audioStepTimerRef.current >= stepsPerTick) {
      stepCountRef.current++;
      // Calculate pitch increase based on remaining invaders percentage
      const totalEnemies = 24 + (currentWave % 3 === 0 ? 1 : 0);
      const ratio = 1 - (aliveCount / totalEnemies);
      audio.playInvaderStep(stepCountRef.current, ratio);
      audioStepTimerRef.current = 0;
    }
  };

  // Create customized animated particles (blood spat, sparks, etc.)
  const spawnExplosionParticles = (x: number, y: number, type: ParticleType, count: number, customColor?: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      
      let color = "#ef4444"; // red blood
      let decay = 0.02 + Math.random() * 0.03;
      let vyOffset = 0;

      if (type === ParticleType.WIND_PARTICLE) {
        color = "#e2e8f0"; // white wind
        decay = 0.05;
      } else if (type === ParticleType.SMOKE_GRID) {
        color = "#22c55e"; // green shield smoke
        decay = 0.03;
      } else if (type === ParticleType.SPARKS) {
        color = "#eab308"; // yellow sparks
        decay = 0.04;
      }

      const p: Particle = {
        id: `p_${Date.now()}_${Math.random()}`,
        type,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + vyOffset,
        size: 2 + Math.random() * 4,
        color: customColor || color,
        alpha: 1.0,
        decay
      };
      particlesRef.current.push(p);
    }
  };

  const spawnTextParticle = (x: number, y: number, text: string, color: string = "#facc15") => {
    const p: Particle = {
      id: `p_txt_${Date.now()}_${Math.random()}`,
      type: ParticleType.TEXT,
      x,
      y: y - 10,
      vx: 0,
      vy: -0.8,
      size: 1, // acts as general scaling
      color,
      alpha: 1.0,
      decay: 0.022,
      text,
      fontSize: 14
    };
    particlesRef.current.push(p);
  };

  // Shoot weapons
  const firePlayerWeapon = () => {
    if (shootCooldownRef.current > 0) return;

    const p = pRef.current;
    
    // Check shooting type speed bounds
    let baseCooldown = 18; // WIND_BLADE standard (~300ms)
    if (p.weapon === WeaponType.KATORI_RING) {
      baseCooldown = 32; // green ring is heavy but penetrative
    } else if (p.weapon === WeaponType.MOSQUITO_SPRAY) {
      baseCooldown = 3; // rapid spray fires super fast!
    }

    // Halve cooldowns slightly if fire rate upgrade collected
    const speedMultiplier = p.weaponLevel >= 2 ? 0.75 : 1.0;
    shootCooldownRef.current = Math.max(2, Math.floor(baseCooldown * speedMultiplier));

    const bulletIdPrefix = `bul_${Date.now()}_`;

    // Dynamic satellite positions for shooting origin
    const optOffsetAngle = animTickRef.current * 0.08;
    const optL_x = p.x - 24 + Math.cos(optOffsetAngle) * 4;
    const optL_y = p.y + 20 + Math.sin(optOffsetAngle) * 4;
    const optR_x = p.x + p.width + 12 - Math.cos(optOffsetAngle) * 4;
    const optR_y = p.y + 20 - Math.sin(optOffsetAngle) * 4;

    if (p.weapon === WeaponType.WIND_BLADE) {
      // Wind Blade fires beautiful sharp crescent wind blasts
      audio.playShoot(WeaponType.WIND_BLADE);
      
      const dmg = 1;
      if (p.weaponLevel === 1) {
        bulletsRef.current.push({
          id: bulletIdPrefix + "0",
          x: p.x + p.width / 2 - 4,
          y: p.y - 10,
          vx: 0,
          vy: -9,
          width: 8,
          height: 12,
          damage: dmg,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#38bdf8"
        });
      } else if (p.weaponLevel === 2) {
        // Dual wind blades
        bulletsRef.current.push({
          id: bulletIdPrefix + "1",
          x: p.x + p.width / 3 - 4,
          y: p.y - 10,
          vx: -0.8,
          vy: -9.5,
          width: 8,
          height: 12,
          damage: dmg,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#38bdf8"
        });
        bulletsRef.current.push({
          id: bulletIdPrefix + "2",
          x: p.x + (p.width * 2) / 3 - 4,
          y: p.y - 10,
          vx: 0.8,
          vy: -9.5,
          width: 8,
          height: 12,
          damage: dmg,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#38bdf8"
        });
      } else {
        // 3-way wind fan blade storm + epic fan out!
        bulletsRef.current.push({
          id: bulletIdPrefix + "1",
          x: p.x + p.width / 2 - 4,
          y: p.y - 12,
          vx: 0,
          vy: -11,
          width: 10,
          height: 14,
          damage: dmg + 0.3,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#38bdf8"
        });
        bulletsRef.current.push({
          id: bulletIdPrefix + "2",
          x: p.x + 4,
          y: p.y - 8,
          vx: -2.5,
          vy: -10,
          width: 8,
          height: 12,
          damage: dmg,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#0284c7"
        });
        bulletsRef.current.push({
          id: bulletIdPrefix + "3",
          x: p.x + p.width - 12,
          y: p.y - 8,
          vx: 2.5,
          vy: -10,
          width: 8,
          height: 12,
          damage: dmg,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.WIND_BLADE,
          color: "#0284c7"
        });
      }

      // Options fire homing lightning needle lasers in WIND_BLADE mode!
      bulletsRef.current.push({
        id: `player_bul_homing_${Date.now()}_L`,
        x: optL_x + 4,
        y: optL_y,
        vx: -2.0,
        vy: -7,
        width: 6,
        height: 6,
        damage: 0.45,
        owner: BulletOwner.PLAYER,
        color: "#10b981" // Option toxic green laser core
      });
      bulletsRef.current.push({
        id: `player_bul_homing_${Date.now()}_R`,
        x: optR_x + 4,
        y: optR_y,
        vx: 2.0,
        vy: -7,
        width: 6,
        height: 6,
        damage: 0.45,
        owner: BulletOwner.PLAYER,
        color: "#10b981"
      });

      // Play uchiwa physical visual slash wave
      spawnExplosionParticles(p.x + p.width / 2, p.y + 10, ParticleType.WIND_PARTICLE, 3);

    } else if (p.weapon === WeaponType.KATORI_RING) {
      // Katori green loop rings (slower, penetrative, bypasses single enemy)
      audio.playShoot(WeaponType.KATORI_RING);
      const dmg = 2; // heavier damage!
      const pen = p.weaponLevel >= 3 ? 3 : p.weaponLevel >= 2 ? 2 : 1;

      bulletsRef.current.push({
        id: bulletIdPrefix + "k0",
        x: p.x + p.width / 2 - 9,
        y: p.y - 14,
        vx: 0,
        vy: -6.5,
        width: 18,
        height: 18,
        damage: dmg,
        owner: BulletOwner.PLAYER,
        weaponType: WeaponType.KATORI_RING,
        penetrateCount: pen,
        color: "#10b981" // deep toxic coil green
      });

      if (p.weaponLevel >= 2) {
        // Emit side spiral fumes
        bulletsRef.current.push({
          id: bulletIdPrefix + "k1",
          x: p.x + p.width / 2 - 19,
          y: p.y - 6,
          vx: -1.5,
          vy: -6.5,
          width: 14,
          height: 14,
          damage: 1.2,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.KATORI_RING,
          penetrateCount: 1,
          color: "#a7f3d0"
        });
        bulletsRef.current.push({
          id: bulletIdPrefix + "k2",
          x: p.x + p.width / 2 + 5,
          y: p.y - 6,
          vx: 1.5,
          vy: -6.5,
          width: 14,
          height: 14,
          damage: 1.2,
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.KATORI_RING,
          penetrateCount: 1,
          color: "#a7f3d0"
        });
      }

      // Options fire auxiliary mini coils
      bulletsRef.current.push({
        id: bulletIdPrefix + "k_opt_L",
        x: optL_x,
        y: optL_y,
        vx: -0.5,
        vy: -5.5,
        width: 12,
        height: 12,
        damage: 0.8,
        owner: BulletOwner.PLAYER,
        weaponType: WeaponType.KATORI_RING,
        penetrateCount: 1,
        color: "#059669"
      });
      bulletsRef.current.push({
        id: bulletIdPrefix + "k_opt_R",
        x: optR_x,
        y: optR_y,
        vx: 0.5,
        vy: -5.5,
        width: 12,
        height: 12,
        damage: 0.8,
        owner: BulletOwner.PLAYER,
        weaponType: WeaponType.KATORI_RING,
        penetrateCount: 1,
        color: "#059669"
      });

    } else if (p.weapon === WeaponType.MOSQUITO_SPRAY) {
      // Rapid spray triggers
      if (p.sprayFuel <= 0) {
        p.weapon = WeaponType.WIND_BLADE; // fallback on empty
        spawnTextParticle(p.x + p.width / 2, p.y, "ガス欠！ (Out of Gas!)", "#f43f5e");
        audio.stopSprayLoop();
        return;
      }

      audio.startSprayLoop();
      p.sprayFuel = Math.max(0, p.sprayFuel - 1.2);

      // Fire spray droplets (jittery speed upward mist)
      const numDroplets = p.weaponLevel >= 3 ? 3 : p.weaponLevel >= 2 ? 2 : 1;
      
      for (let k = 0; k < numDroplets; k++) {
        const spreadX = (Math.random() * 3 - 1.5) + (k * 1.5 - (numDroplets - 1) * 0.75);
        bulletsRef.current.push({
          id: `${bulletIdPrefix}sp_${k}_${Math.random()}`,
          x: p.x + p.width / 2 - 4 + spreadX * 5,
          y: p.y - 12 - (Math.random() * 10),
          vx: spreadX * 0.9,
          vy: -11 - Math.random() * 3,
          width: 12 + Math.random() * 6,
          height: 12 + Math.random() * 6,
          damage: 0.6, // Low per hit but extremely high frequency!
          owner: BulletOwner.PLAYER,
          weaponType: WeaponType.MOSQUITO_SPRAY,
          color: `rgba(167, 243, 208, ${0.4 + Math.random() * 0.4})` // misty lime spray
        });
      }

      // Options spray side mist arcs
      bulletsRef.current.push({
        id: `${bulletIdPrefix}sp_optL_${Math.random()}`,
        x: optL_x - 3,
        y: optL_y,
        vx: -2.0,
        vy: -9 - Math.random() * 2,
        width: 10,
        height: 10,
        damage: 0.35,
        owner: BulletOwner.PLAYER,
        weaponType: WeaponType.MOSQUITO_SPRAY,
        color: "rgba(52, 211, 153, 0.4)"
      });
      bulletsRef.current.push({
        id: `${bulletIdPrefix}sp_optR_${Math.random()}`,
        x: optR_x + 3,
        y: optR_y,
        vx: 2.0,
        vy: -9 - Math.random() * 2,
        width: 10,
        height: 10,
        damage: 0.35,
        owner: BulletOwner.PLAYER,
        weaponType: WeaponType.MOSQUITO_SPRAY,
        color: "rgba(52, 211, 153, 0.4)"
      });
    }
  };

  // Handle item pick ups
  const handlePowerUpPickup = (pow: PowerUp) => {
    audio.playPowerUp();
    const p = pRef.current;
    
    switch (pow.type) {
      case PowerUpType.RECOVERY:
        p.health = Math.min(p.maxHealth, p.health + 25);
        spawnTextParticle(pow.x, pow.y, "かゆみ解消! +25", "#38bdf8");
        break;
      case PowerUpType.FIRE_RATE:
        // Switch weapon instantly to the fun spray weapon as reward or enhance fire speed
        p.weapon = WeaponType.MOSQUITO_SPRAY;
        p.sprayFuel = Math.min(p.maxSprayFuel, p.sprayFuel + 65);
        spawnTextParticle(pow.x, pow.y, "殺虫ジェット! スプレー充填", "#facc15");
        break;
      case PowerUpType.WEAPON_UP:
        if (p.weaponLevel < 3) {
          p.weaponLevel++;
          spawnTextParticle(pow.x, pow.y, `武器威力レベル UP! [Lv ${p.weaponLevel}]`, "#22c55e");
        } else {
          setScore(score + 100);
          spawnTextParticle(pow.x, pow.y, "武器レベルMAX! +100pts", "#a855f7");
        }
        break;
      case PowerUpType.KATORI_SHIELD:
        shieldExpiryRef.current = 360; // 6 seconds defensive green shield!
        spawnTextParticle(pow.x, pow.y, "煙幕結界バリア!! (6秒間無敵)", "#4ade80");
        break;
      case PowerUpType.SPRAY_AMMO:
        // Force upgrade active weapon style
        p.weapon = WeaponType.KATORI_RING;
        spawnTextParticle(pow.x, pow.y, "装備: 蚊取り線香リング!", "#22c55e");
        break;
    }
  };

  // Main game logic loop updates triggered every single frame
  const updateGame = () => {
    if (stage !== GameStage.PLAYING) return;

    animTickRef.current++;
    handleRetroStepNoise();

    const p = pRef.current;

    // 1. Cooldown Tickers
    if (shootCooldownRef.current > 0) shootCooldownRef.current--;
    if (manualShieldCooldownRef.current > 0) manualShieldCooldownRef.current--;
    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current === 0) {
        comboCountRef.current = 0; // Combo broke!
      }
    }
    if (shieldExpiryRef.current > 0) {
      shieldExpiryRef.current--;
      // Spawn surrounding defensive particles
      if (animTickRef.current % 4 === 0) {
        spawnExplosionParticles(p.x + p.width/2 + Math.sin(animTickRef.current)*40, p.y + p.height/2 + Math.cos(animTickRef.current)*30, ParticleType.SMOKE_GRID, 1);
      }
    }

    // Regrow fuel slightly
    if (p.weapon !== WeaponType.MOSQUITO_SPRAY && p.sprayFuel < p.maxSprayFuel) {
      p.sprayFuel = Math.min(p.maxSprayFuel, p.sprayFuel + 0.12);
    }

    // 2. Keyboard moves player in 8 directions (vertical and horizontal)
    if (keysPressed.current["ArrowLeft"] || keysPressed.current["KeyA"]) {
      p.x = Math.max(0, p.x - p.speed);
    }
    if (keysPressed.current["ArrowRight"] || keysPressed.current["KeyD"]) {
      p.x = Math.min(CANVAS_WIDTH - p.width, p.x + p.speed);
    }
    if (keysPressed.current["ArrowUp"] || keysPressed.current["KeyW"]) {
      p.y = Math.max(0, p.y - p.speed);
    }
    if (keysPressed.current["ArrowDown"] || keysPressed.current["KeyS"]) {
      p.y = Math.min(CANVAS_HEIGHT - p.height - 15, p.y + p.speed);
    }

    // Hold down space triggers weapon firing
    if (keysPressed.current["Space"] || keysPressed.current["KeyK"]) {
      firePlayerWeapon();
    }

    // 3. Bullets update
    bulletsRef.current.forEach((bul) => {
      // Sinusoidal DNA helical path for enemy wavy pattern bullets
      if (bul.id.startsWith("enemy_bul_wave_L_")) {
        bul.x += Math.sin(bul.y * 0.08) * 2.8;
      } else if (bul.id.startsWith("enemy_bul_wave_R_")) {
        bul.x -= Math.sin(bul.y * 0.08) * 2.8;
      }

      // Homing self-directed player needles seek nearest target
      if (bul.id.startsWith("player_bul_homing_") && mosquitoesRef.current.length > 0) {
        let closestM = mosquitoesRef.current[0];
        let minDist = 999999;
        mosquitoesRef.current.forEach((m) => {
          const dx = (m.x + m.width / 2) - bul.x;
          const dy = (m.y + m.height / 2) - bul.y;
          const d = dx * dx + dy * dy;
          if (d < minDist) {
            minDist = d;
            closestM = m;
          }
        });

        // Pull velocity slightly towards found coordinate
        const tx = closestM.x + closestM.width / 2;
        const ty = closestM.y + closestM.height / 2;
        const dx = tx - bul.x;
        const dy = ty - bul.y;
        const targetDist = Math.sqrt(dx * dx + dy * dy);
        if (targetDist > 10) {
          const homingSpeed = 10;
          const targetVx = (dx / targetDist) * homingSpeed;
          const targetVy = (dy / targetDist) * homingSpeed;
          bul.vx = bul.vx * 0.82 + targetVx * 0.18;
          bul.vy = bul.vy * 0.82 + targetVy * 0.18;
        }
      }

      bul.x += bul.vx;
      bul.y += bul.vy;
    });

    // Clean departed bullets
    bulletsRef.current = bulletsRef.current.filter(
      (b) => b.y > -20 && b.y < CANVAS_HEIGHT + 20 && b.x > -20 && b.x < CANVAS_WIDTH + 20
    );

    // 4. Power-ups drift down
    powerupsRef.current.forEach((pow) => {
      pow.y += pow.speed;
    });

    // Player collects power-up collision
    powerupsRef.current = powerupsRef.current.filter((pow) => {
      const collides = (
        pow.x + pow.width > p.x &&
        pow.x < p.x + p.width &&
        pow.y + pow.height > p.y &&
        pow.y < p.y + p.height
      );
      if (collides) {
        handlePowerUpPickup(pow);
        return false;
      }
      return pow.y < CANVAS_HEIGHT + 30; // drop off screen
    });

    // 5. Particles update
    particlesRef.current.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha = Math.max(0, pt.alpha - pt.decay);
    });
    particlesRef.current = particlesRef.current.filter((pt) => pt.alpha > 0);

    // 6. Invaders marching steps & logic
    const invaders = mosquitoesRef.current;
    if (invaders.length === 0 && waveInProgressRef.current) {
      // Stage cleared!
      waveInProgressRef.current = false;
      audio.stopSprayLoop();
      audio.playStageClear();
      setPlaySpeed(1.0);
      
      setTimeout(() => {
        const nextW = currentWave + 1;
        setCurrentWave(nextW);
        setupWave(nextW);
      }, 1500);
      return;
    }

    // Check boundary hits to shift entire line squad downward
    let hitBorder = false;
    
    // As remaining insects decreases, they start marching faster!
    const alivePercentage = invaders.length / 24;
    const invadersSpeed = (4.5 + (currentWave - 1) * 0.7 + (1 - alivePercentage) * 4.0) * invaderDirectionRef.current;

    setPlaySpeed(parseFloat((Math.abs(invadersSpeed)).toFixed(2)));

    // Slow moving march timer
    invaderMoveTimerRef.current++;
    const actualMoveStepTick = Math.max(1, Math.floor(alivePercentage * invaderStepCooldownRef.current));

    // Only progress if boss is on. Boss moves dynamically anyway
    const hasBoss = invaders.some(inv => inv.type === MosquitoType.QUEEN_BOSS);

    invaders.forEach((mos) => {
      mos.wingTimer++;
      if (mos.wingTimer >= mos.wingSpeed) {
        mos.animFrame = mos.animFrame === 0 ? 1 : 0;
        mos.wingTimer = 0;
      }

      if (mos.type === MosquitoType.QUEEN_BOSS) {
        // Boss moves back and forth at the top screen dynamically relative to frame count
        mos.x += mos.moveDirection * 2.5;
        if (mos.x <= 40) {
          mos.moveDirection = 1;
        } else if (mos.x >= CANVAS_WIDTH - mos.width - 40) {
          mos.moveDirection = -1;
        }

        // Boss attacks
        mos.shootCooldown--;
        if (mos.shootCooldown <= 0) {
          audio.playEnemyShoot();
          const burstType = Math.floor(Math.random() * 4); // 4 wonderful patterns!
          
          if (burstType === 0) {
            // Pattern 0: Rotating Spiral Danmaku Ring (360-degree flowering star)
            // Fire 16 circular bullets at symmetric polar angles!
            const baseAngle = (animTickRef.current * 0.05) % (Math.PI * 2);
            for (let i = 0; i < 16; i++) {
              const angle = baseAngle + (i / 16) * Math.PI * 2;
              bulletsRef.current.push({
                id: `enemy_bul_boss_spiral_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2,
                y: mos.y + mos.height / 2,
                vx: Math.cos(angle) * 1.8,
                vy: Math.sin(angle) * 1.8 + 0.4,
                width: 12,
                height: 12,
                damage: 12,
                owner: BulletOwner.ENEMY,
                color: "#ec4899" // hot magenta circle
              });
            }
          } else if (burstType === 1) {
            // Pattern 1: Helix Wave Lattice Walls (Slow descent)
            // Fires 8 bullets oscillating in sinusoidal streams
            for (let i = -3; i <= 3; i++) {
              if (i === 0) continue;
              const isL = i < 0;
              bulletsRef.current.push({
                id: isL ? `enemy_bul_wave_L_boss_${Date.now()}_${i}` : `enemy_bul_wave_R_boss_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2 + i * 15,
                y: mos.y + mos.height - 5,
                vx: i * 0.45,
                vy: 2.4,
                width: 10,
                height: 10,
                damage: 10,
                owner: BulletOwner.ENEMY,
                color: "#a855f7" // royal purple waves
              });
            }
          } else if (burstType === 2) {
            // Pattern 2: Heavy 9-Way Starburst Fan targeting player (Gentler speeds)
            const targetX = p.x + p.width / 2;
            const targetY = p.y + p.height / 2;
            const dx = targetX - (mos.x + mos.width / 2);
            const dy = targetY - (mos.y + mos.height);
            const centralAngle = Math.atan2(dy, dx);
            
            // Fire 9 bullets spread out by 10-degree increments
            for (let i = -4; i <= 4; i++) {
              const spreadAngle = centralAngle + i * (Math.PI / 16);
              bulletsRef.current.push({
                id: `enemy_bul_boss_fan_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2,
                y: mos.y + mos.height - 5,
                vx: Math.cos(spreadAngle) * 2.2,
                vy: Math.sin(spreadAngle) * 2.2,
                width: 10,
                height: 10,
                damage: 14,
                owner: BulletOwner.ENEMY,
                color: "#f43f5e" // deep rose target
              });
            }
          } else {
            // Pattern 3: Circular Ring Expansion Drops (Slow ripple)
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
              bulletsRef.current.push({
                id: `enemy_bul_boss_ring_${Date.now()}_${angle}`,
                x: mos.x + mos.width / 2,
                y: mos.y + mos.height / 2,
                vx: Math.cos(angle) * 1.4,
                vy: Math.sin(angle) * 1.4 + 0.6,
                width: 11,
                height: 11,
                damage: 12,
                owner: BulletOwner.ENEMY,
                color: "#eab308" // glowing amber fire rings
              });
            }
          }

          mos.shootCooldown = 40 + Math.random() * 30; // Faster trigger sweeps
        }
      } else {
        // Standard marching invader logic
        if (invaderMoveTimerRef.current >= actualMoveStepTick) {
          mos.x += invadersSpeed;
          
          if (mos.x >= CANVAS_WIDTH - mos.width - 25 && invaderDirectionRef.current === 1) {
            hitBorder = true;
          } else if (mos.x <= 25 && invaderDirectionRef.current === -1) {
            hitBorder = true;
          }
        }

        // Mosquito shooting hazard
        mos.shootCooldown--;
        if (mos.shootCooldown <= 0) {
          audio.playEnemyShoot();
          
          if (mos.type === MosquitoType.TIGER) {
            // Tiger mosquito fires a targeted 3-way tight shotgun spread (Highly dodgeable speed!)
            const targetX = p.x + p.width / 2;
            const targetY = p.y + p.height / 2;
            const dx = targetX - (mos.x + mos.width / 2);
            const dy = targetY - (mos.y + mos.height);
            const angle = Math.atan2(dy, dx);
            
            for (let i = -1; i <= 1; i++) {
              const bulletAngle = angle + i * 0.14; // tight arc
              bulletsRef.current.push({
                id: `enemy_bul_tiger_${mos.id}_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2 - 4,
                y: mos.y + mos.height,
                vx: Math.cos(bulletAngle) * 2.5,
                vy: Math.sin(bulletAngle) * 2.5,
                width: 8,
                height: 8,
                damage: 8,
                owner: BulletOwner.ENEMY,
                color: "#ff7e00" // striking orange stars
              });
            }
          } else if (mos.type === MosquitoType.URBAN) {
            // Urban mosquito fires dual crossing helix waves!
            bulletsRef.current.push({
              id: `enemy_bul_wave_L_${mos.id}_${Date.now()}`,
              x: mos.x + mos.width / 2 - 8,
              y: mos.y + mos.height,
              vx: -0.3,
              vy: 2.2,
              width: 8,
              height: 8,
              damage: 7,
              owner: BulletOwner.ENEMY,
              color: "#a855f7" // purple helix L
            });
            bulletsRef.current.push({
              id: `enemy_bul_wave_R_${mos.id}_${Date.now()}`,
              x: mos.x + mos.width / 2 + 8,
              y: mos.y + mos.height,
              vx: 0.3,
              vy: 2.2,
              width: 8,
              height: 8,
              damage: 7,
              owner: BulletOwner.ENEMY,
              color: "#a855f7" // purple helix R
            });
          } else if (mos.type === MosquitoType.GIANT) {
            // Giant mosquito shoots a wide, majestic 5-way Emerald Leaf spread (Slow sweep!)
            const targetX = p.x + p.width / 2;
            const targetY = p.y + p.height / 2;
            const dx = targetX - (mos.x + mos.width / 2);
            const dy = targetY - (mos.y + mos.height);
            const baseAngle = Math.atan2(dy, dx);

            for (let i = -2; i <= 2; i++) {
              const angle = baseAngle + i * (Math.PI / 10);
              bulletsRef.current.push({
                id: `enemy_bul_giant_${mos.id}_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2 - 5,
                y: mos.y + mos.height,
                vx: Math.cos(angle) * 2.0,
                vy: Math.sin(angle) * 2.0,
                width: 10,
                height: 10,
                damage: 12,
                owner: BulletOwner.ENEMY,
                color: "#10b981" // elegant emerald spheres
              });
            }
          } else {
            // Common Mosquito: 3-way symmetric flower spray (Gentler speed!)
            for (let i = -1; i <= 1; i++) {
              bulletsRef.current.push({
                id: `enemy_bul_common_${mos.id}_${Date.now()}_${i}`,
                x: mos.x + mos.width / 2 - 4,
                y: mos.y + mos.height,
                vx: i * 0.9,
                vy: 1.8,
                width: 8,
                height: 8,
                damage: 6,
                owner: BulletOwner.ENEMY,
                color: "#ef4444" // hot red dots
              });
            }
          }

          // re-arm cooldown (Slightly faster frequency for more bullet hell density!)
          mos.shootCooldown = 110 + Math.random() * 210 - (currentWave * 9);
        }
      }
    });

    if (invaderMoveTimerRef.current >= actualMoveStepTick) {
      invaderMoveTimerRef.current = 0;
    }

    if (hitBorder) {
      invaderDirectionRef.current *= -1;
      // Shift everyone down
      invaders.forEach((mos) => {
        if (mos.type !== MosquitoType.QUEEN_BOSS) {
          mos.y += 12;
        }
      });
    }

    // Check floor breach: Mosquitoes descend past absolute airspace defense line!
    for (let mos of invaders) {
      if (mos.type !== MosquitoType.QUEEN_BOSS && mos.y + mos.height >= CANVAS_HEIGHT - 75) {
        // Breached airspace warning limits!
        p.health = 0;
        triggerGameOver("対空絶対防衛線が突破されました！ 蚊の大群に地上を占領され大敗北！");
        return;
      }
    }

    // 7. Bunkers structural logic (micro grid destruction)
    bulletsRef.current = bulletsRef.current.filter((bul) => {
      let isBulletDestroyed = false;

      bunkersRef.current.forEach((bunk) => {
        if (isBulletDestroyed) return;

        // Bounding box pre-check
        if (
          bul.x + bul.width > bunk.x &&
          bul.x < bunk.x + bunk.width &&
          bul.y + bul.height > bunk.y &&
          bul.y < bunk.y + bunk.height
        ) {
          // Overlaps bunker! Check exact pixel coordinate cells
          const cellW = bunk.width / bunk.grid[0].length;
          const cellH = bunk.height / bunk.grid.length;
          
          // Probe all overlapping block grid points
          const relLeft = Math.floor((bul.x - bunk.x) / cellW);
          const relRight = Math.ceil((bul.x + bul.width - bunk.x) / cellW);
          const relTop = Math.floor((bul.y - bunk.y) / cellH);
          const relBottom = Math.ceil((bul.y + bul.height - bunk.y) / cellH);

          // Find if hitting any solid pixel cell of the coil
          let hitCellR = -1;
          let hitCellC = -1;

          for (let r = Math.max(0, relTop); r < Math.min(bunk.grid.length, relBottom); r++) {
            for (let c = Math.max(0, relLeft); c < Math.min(bunk.grid[0].length, relRight); c++) {
              if (bunk.grid[r][c]) {
                hitCellR = r;
                hitCellC = c;
                break;
              }
            }
            if (hitCellR !== -1) break;
          }

          if (hitCellR !== -1) {
            // Hitted! Carve out a crater (blast radius of 2 cells)
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = hitCellR + dr;
                const nc = hitCellC + dc;
                if (nr >= 0 && nr < bunk.grid.length && nc >= 0 && nc < bunk.grid[0].length) {
                  bunk.grid[nr][nc] = false; // Burn away!
                }
              }
            }

            // Spawn smoke/dust ash debris
            const hitWorldX = bunk.x + hitCellC * cellW;
            const hitWorldY = bunk.y + hitCellR * cellH;
            spawnExplosionParticles(hitWorldX, hitWorldY, ParticleType.SMOKE_GRID, 4, "#22c55e");
            
            // Player spray penetrative bubbles melt, do not destroy bullet instantly
            if (bul.weaponType !== WeaponType.MOSQUITO_SPRAY) {
              isBulletDestroyed = true;
            }
          }
        }
      });

      return !isBulletDestroyed;
    });

    // 8. Bullet hit Mosquito Swarm Collisions
    bulletsRef.current = bulletsRef.current.filter((bul) => {
      if (bul.owner !== BulletOwner.PLAYER) return true; // check player bullets only here

      let isBulletDestroyed = false;

      invaders.forEach((mos) => {
        if (isBulletDestroyed) return;

        if (
          bul.x + bul.width > mos.x &&
          bul.x < mos.x + mos.width &&
          bul.y + bul.height > mos.y &&
          bul.y < mos.y + mos.height
        ) {
          // Hit! Damage mosquito
          mos.hp -= bul.damage;
          
          // Spawn little yellow contact spark sparks
          spawnExplosionParticles(bul.x + bul.width / 2, bul.y, ParticleType.SPARKS, 3);

          if (mos.hp <= 0) {
            // SQUASHED!
            audio.playSplat();
            
            // Explode in a cloud of juicy pixel blood splash!
            const isBoss = mos.type === MosquitoType.QUEEN_BOSS;
            spawnExplosionParticles(
              mos.x + mos.width / 2, 
              mos.y + mos.height / 2, 
              ParticleType.BLOOD_SPLAT, 
              isBoss ? 25 : 8
            );

            // Give score with multiplier combo reward
            comboCountRef.current++;
            comboTimerRef.current = 140; // refresh 2.3 seconds
            
            const comboMultiplier = Math.min(5, 1 + Math.floor(comboCountRef.current / 3));
            const pointGained = mos.points * comboMultiplier;
            setScore(score + pointGained);

            // Tiny retro rising points text
            spawnTextParticle(
              mos.x + mos.width / 2, 
              mos.y, 
              `+${pointGained} ${comboMultiplier > 1 ? `x${comboMultiplier} Combo` : ""}`,
              comboMultiplier > 3 ? "#ef4444" : comboMultiplier > 1 ? "#34d399" : "#facc15"
            );

            // Spawn power-up dropping (15% base rate)
            if (Math.random() < 0.16 || (isBoss)) {
              const rolls = [
                PowerUpType.RECOVERY, 
                PowerUpType.FIRE_RATE, 
                PowerUpType.WEAPON_UP, 
                PowerUpType.KATORI_SHIELD, 
                PowerUpType.SPRAY_AMMO
              ];
              // Pick random bonus item
              const type = rolls[Math.floor(Math.random() * rolls.length)];
              
              powerupsRef.current.push({
                id: `pw_${mos.id}_${Date.now()}`,
                type,
                x: mos.x + mos.width / 2 - 12,
                y: mos.y + mos.height / 2,
                width: 24,
                height: 24,
                speed: 1.8 + Math.random() * 0.8
              });
            }

            // Remove mosquito from list
            mosquitoesRef.current = mosquitoesRef.current.filter((m) => m.id !== mos.id);
          }

          // Handle piercing bullets logic
          if (bul.penetrateCount !== undefined && bul.penetrateCount > 1) {
            bul.penetrateCount--;
          } else {
            isBulletDestroyed = true;
          }
        }
      });

      return !isBulletDestroyed;
    });

    // 9. Bullet Hits Player (Enemy strikes)
    bulletsRef.current = bulletsRef.current.filter((bul) => {
      if (bul.owner !== BulletOwner.ENEMY) return true;

      // Player center coordinates for bullet hell precision math
      const px_center = p.x + p.width / 2;
      const py_center = p.y + p.height / 2;

      // Bullet center coordinates
      const bx_center = bul.x + bul.width / 2;
      const by_center = bul.y + bul.height / 2;

      const dx = px_center - bx_center;
      const dy = py_center - by_center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Bullet hell hitbox thresholds: Player hitbox core = 1.0px (extremely precise!), Bullet radius is scaled to 45% for grazing thrills!
      const bRad = Math.max(bul.width, bul.height) / 2;
      const collides = dist < (1.0 + bRad * 0.45);

      if (collides) {
        // Player takes hit! Check shield expiry (invincibility)
        if (shieldExpiryRef.current > 0) {
          // Absorb via barrier
          audio.playShoot(WeaponType.KATORI_RING);
          spawnExplosionParticles(bul.x + bul.width/2, bul.y, ParticleType.SMOKE_GRID, 6, "#22c55e");
          spawnTextParticle(p.x + p.width/2, p.y - 15, "まもった! (Guaraded)", "#a7f3d0");
          return false;
        }

        // Apply health penalty
        audio.playPlayerHit();
        p.health = Math.max(0, p.health - bul.damage);
        
        // Red critical pain flash sparks
        spawnExplosionParticles(bul.x + bul.width / 2, bul.y, ParticleType.BLOOD_SPLAT, 6, "#f43f5e");
        spawnTextParticle(p.x + p.width/2, p.y - 12, `かゆいっ! -${bul.damage}%`, "#f43f5e");

        // Break combo count on hit!
        comboCountRef.current = 0;
        comboTimerRef.current = 0;

        if (p.health <= 0) {
          triggerGameOver("蚊のかゆみ毒（アレルギー限界）に到達した！ かゆくてかきむしりゲームオーバー！");
        }

        return false;
      }
      return true;
    });

    // 10. Direct 2D contact collision list (flying player crashing with mosquitoes in airspace)
    invaders.forEach((mos) => {
      // Distance based body check
      const px_center = p.x + p.width / 2;
      const py_center = p.y + p.height / 2;
      const mx_center = mos.x + mos.width / 2;
      const my_center = mos.y + mos.height / 2;

      const dx = px_center - mx_center;
      const dy = py_center - my_center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const mosRadius = Math.max(mos.width, mos.height) / 2;
      // Body collision is slightly larger but still fair (12px core + body)
      const collides = dist < (12 + mosRadius * 0.65);

      if (collides) {
        if (shieldExpiryRef.current > 0) {
          if (animTickRef.current % 30 === 0) {
            spawnTextParticle(p.x + p.width / 2, p.y, "バリア防衛中!!", "#a7f3d0");
          }
        } else {
          // Take direct collision impact damage
          if (animTickRef.current % 25 === 0) { // Throttle player impact triggers once per 25 frames
            audio.playPlayerHit();
            const contactDamage = mos.type === MosquitoType.QUEEN_BOSS ? 20 : mos.type === MosquitoType.GIANT ? 14 : 7;
            p.health = Math.max(0, p.health - contactDamage);
            
            // Explode contact sparks and blood splat
            spawnExplosionParticles(p.x + p.width / 2, p.y + p.height / 2, ParticleType.BLOOD_SPLAT, 4);
            spawnTextParticle(p.x + p.width / 2, p.y - 12, `直接接触! -${contactDamage}%`, "#f43f5e");
            
            if (p.health <= 0) {
              triggerGameOver("蚊の機体接触による毒素リアクション！ 痒さ限界で不時着、墜落敗北！");
            }
          }
        }
      }
    });
  };

  const triggerGameOver = (msg: string) => {
    setStage(GameStage.GAME_OVER);
    audio.playGameOver();
    audio.stopSprayLoop();
    
    // Save High Score board in local persistence
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("mos_invader_highscore", score.toString());
    }

    // append to localized scoreboard array
    let history: ScoreEntry[] = [];
    try {
      history = JSON.parse(localStorage.getItem("mos_invader_scores") || "[]");
    } catch(e) {}
    
    history.push({
      name: `PLAYER_${Math.floor(100 + Math.random()*900)}`,
      score,
      wave: currentWave,
      date: new Date().toLocaleDateString("ja-JP")
    });

    history.sort((a,b) => b.score - a.score);
    localStorage.setItem("mos_invader_scores", JSON.stringify(history.slice(0, 5)));
  };

  // MAIN PIXEL DRAWING CODE
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Midsummer Sky Blue Gradient background representing high flight altitude
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, "#014d80");   // Deep aerospace blue
    skyGrad.addColorStop(0.35, "#0284c7"); // Mid sky blue
    skyGrad.addColorStop(0.8, "#38bdf8");  // Light vivid sky blue
    skyGrad.addColorStop(1.0, "#bae6fd");  // Atmosphere mist horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Draw a burning high-energy retro summer sun flare
    const sunGrad = ctx.createRadialGradient(
      CANVAS_WIDTH - 90, 60, 5,
      CANVAS_WIDTH - 90, 60, 45
    );
    sunGrad.addColorStop(0, "#ffffff");
    sunGrad.addColorStop(0.2, "#fff9c4");
    sunGrad.addColorStop(0.5, "#fbbf24");
    sunGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 90, 60, 55, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw procedurally scrolling cumulus flight clouds (white fluffy retro puff balls) moving down
    for (let c = 0; c < 7; c++) {
      // Semi-random parameters derived from the cloud index
      const speed = 0.75 + (c % 3) * 0.95;
      const sizeScale = 0.75 + ((c * 7) % 4) * 0.35;
      const opacity = 0.45 + (c % 2) * 0.28;
      
      const seedX = (c * 173 + 50) % (CANVAS_WIDTH + 140) - 70;
      // Scroll downwards
      const seedY = ((animTickRef.current * speed + c * 135) % (CANVAS_HEIGHT + 220)) - 110;

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      // Draw stacked circular segments to compose a lovely pixel cloud
      ctx.arc(seedX, seedY, 24 * sizeScale, 0, Math.PI * 2);
      ctx.arc(seedX - 16 * sizeScale, seedY + 6 * sizeScale, 18 * sizeScale, 0, Math.PI * 2);
      ctx.arc(seedX + 16 * sizeScale, seedY + 6 * sizeScale, 18 * sizeScale, 0, Math.PI * 2);
      ctx.arc(seedX - 30 * sizeScale, seedY + 12 * sizeScale, 12 * sizeScale, 0, Math.PI * 2);
      ctx.arc(seedX + 30 * sizeScale, seedY + 12 * sizeScale, 12 * sizeScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw beautiful summer green landscape far below (represented with high-altitude rolling hills)
    ctx.fillStyle = "#16a34a"; // summer green fields
    ctx.fillRect(0, CANVAS_HEIGHT - 45, CANVAS_WIDTH, 45);
    
    ctx.fillStyle = "#15803d"; // dark green shadow hills
    for (let h = 0; h < CANVAS_WIDTH; h += 90) {
      const hHeight = 16 + Math.sin(h / 65 + (animTickRef.current * 0.005)) * 8;
      ctx.beginPath();
      ctx.ellipse(h + 45, CANVAS_HEIGHT - 40, 70, hHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw active yellow anti-mosquito airspace defense mist barrier
    ctx.fillStyle = "rgba(34, 197, 94, 0.16)";
    ctx.fillRect(0, CANVAS_HEIGHT - 75, CANVAS_WIDTH, 30);

    // 6. Underline high contrast absolute vertical defense warning boundary
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 75);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 75);
    ctx.stroke();
    ctx.setLineDash([]); // reset indicator

    // 7. Render defensive aviation text warning
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 11px monospace";
    ctx.fillText("【対空絶対防衛線 - EXTREME AIRSPACE DEFENSE BARRIER】", 15, CANVAS_HEIGHT - 85);

    // Helper to draw sprites procedurally cell by cell
    const drawSpriteMatrix = (
      sprite: string[], 
      x: number, 
      y: number, 
      width: number, 
      height: number,
      colors: { [key: string]: string }
    ) => {
      const rows = sprite.length;
      const cols = sprite[0].length;
      const cellW = width / cols;
      const cellH = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const char = sprite[r][c];
          if (char !== "." && colors[char]) {
            ctx.fillStyle = colors[char];
            ctx.fillRect(
              Math.floor(x + c * cellW), 
              Math.floor(y + r * cellH), 
              Math.ceil(cellW), 
              Math.ceil(cellH)
            );
          }
        }
      }
    };

    // 1. Draw Player (Uchiwa Fan)
    const pColorMap: { [key: string]: string } = {
      "1": "#1d4ed8", // rich royal blue fan paper outline
      "2": "#dc2626", // red sun emblem
      "3": "#0f172a"
    };
    
    const p = pRef.current;

    // Draw active Shmup Option Satellites (護衛蚊取り線香サテライト)
    const optGlow = 3 + Math.sin(animTickRef.current * 0.2) * 2;
    const optOffsetAngle = animTickRef.current * 0.08;
    const optL_x = p.x - 24 + Math.cos(optOffsetAngle) * 4;
    const optL_y = p.y + 20 + Math.sin(optOffsetAngle) * 4;
    const optR_x = p.x + p.width + 12 - Math.cos(optOffsetAngle) * 4;
    const optR_y = p.y + 20 - Math.sin(optOffsetAngle) * 4;

    // Left Option
    ctx.save();
    ctx.shadowBlur = optGlow * 2;
    ctx.shadowColor = "#10b981";
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(optL_x + 6, optL_y + 6, 7, 0, Math.PI * 2);
    ctx.stroke();
    // Inner vortex dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(optL_x + 6, optL_y + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right Option
    ctx.beginPath();
    ctx.arc(optR_x + 6, optR_y + 6, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(optR_x + 6, optR_y + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw glowing green shield around player if active
    if (shieldExpiryRef.current > 0) {
      ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, Math.max(p.width, p.height) * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    }

    drawSpriteMatrix(SPRITE_UCHIWA, p.x, p.y, p.width, p.height, pColorMap);

    // Draw bullet hell tiny precision core hitbox (弾幕当たり判定のコア表示)
    const coreX = p.x + p.width / 2;
    const coreY = p.y + p.height / 2;
    const coreGlowSize = 4 + Math.sin(animTickRef.current * 0.25) * 2;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#f59e0b"; // glowing orange border
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(coreX, coreY, 1.2, 0, Math.PI * 2); // Extremely tiny visual pure core dot (1.2px)
    ctx.fill();
    // Neon Red precise outer tracking ring (scaled down to match precision)
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreGlowSize * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Mosquitoes
    mosquitoesRef.current.forEach((mos) => {
      // Pick matrices based on flapping wing animation frame
      let sprite = SPRITE_MOSQUITO_COMMON_A;
      let colors: { [key: string]: string } = {
        "3": "#854d0e", // chocolate common legs
        "4": "#93c5fd", // ice blue translucent wings
        "5": "#991b1b"  // angry mosquito blood belly
      };

      if (mos.type === MosquitoType.TIGER) {
        sprite = mos.animFrame === 0 ? SPRITE_MOSQUITO_TIGER_A : SPRITE_MOSQUITO_TIGER_B;
        colors = {
          "3": "#1e293b", // dark tiger slate
          "4": "#cbd5e1", // white/translucent wings
          "5": "#991b1b",
          "7": "#ffffff"  // striking white stripes!
        };
      } else if (mos.type === MosquitoType.URBAN) {
        sprite = mos.animFrame === 0 ? SPRITE_MOSQUITO_URBAN_A : SPRITE_MOSQUITO_URBAN_B;
        colors = {
          "3": "#5b21b6", // purple sneaky underground mosquito
          "4": "#a5b4fc",
          "5": "#dc2626",
          "7": "#ef4444"  // glaring red eye antennas
        };
      } else if (mos.type === MosquitoType.GIANT) {
        sprite = mos.animFrame === 0 ? SPRITE_MOSQUITO_GIANT_A : SPRITE_MOSQUITO_GIANT_B;
        colors = {
          "3": "#065f46", // toxic forest green legs
          "4": "#a7f3d0", 
          "5": "#ef4444"  // massive belly full of sucked blood!
        };
      } else if (mos.type === MosquitoType.QUEEN_BOSS) {
        sprite = mos.animFrame === 0 ? SPRITE_BOSS_QUEEN_A : SPRITE_BOSS_QUEEN_B;
        colors = {
          "3": "#0f172a", // royal slate
          "4": "#bae6fd", // massive majestic wings
          "5": "#f43f5e", // heavy red crown and blood jewels
          "7": "#fbbf24"  // gold crown glowing top tips
        };
      } else {
        // Common
        sprite = mos.animFrame === 0 ? SPRITE_MOSQUITO_COMMON_A : SPRITE_MOSQUITO_COMMON_B;
      }

      drawSpriteMatrix(sprite, mos.x, mos.y, mos.width, mos.height, colors);

      // HP bar for heavy giants & Bosses
      if (mos.hp < mos.maxHp && (mos.type === MosquitoType.GIANT || mos.type === MosquitoType.QUEEN_BOSS)) {
        const hpPercent = mos.hp / mos.maxHp;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(mos.x, mos.y - 10, mos.width, 4);
        ctx.fillStyle = hpPercent > 0.4 ? "#22c55e" : "#ef4444";
        ctx.fillRect(mos.x, mos.y - 10, mos.width * hpPercent, 4);
      }
    });

    // 3. Draw Bullets
    bulletsRef.current.forEach((bul) => {
      ctx.fillStyle = bul.color || "#ffffff";
      
      if (bul.owner === BulletOwner.ENEMY) {
        // Beautiful glowing retro arcade candy spheres for enemy barrages!
        ctx.save();
        const r = Math.max(bul.width, bul.height) / 2;
        const cx = bul.x + bul.width / 2;
        const cy = bul.y + bul.height / 2;

        // Radial glowing gradient
        const radial = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.4);
        radial.addColorStop(0, "#ffffff"); // glowing intense white core
        radial.addColorStop(0.35, bul.color || "#ef4444");
        radial.addColorStop(1, "rgba(239, 68, 68, 0)"); // smooth trail bleed

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // High contrast vector crisp outer preservation ring
        ctx.strokeStyle = bul.color || "#ef4444";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      } else {
        // Player's stylish high-tech projectile variants
        if (bul.weaponType === WeaponType.WIND_BLADE) {
          // Elegant crescent blade slicing upward with a glowing neon trail
          ctx.save();
          ctx.shadowBlur = 6;
          ctx.shadowColor = bul.color || "#38bdf8";
          ctx.beginPath();
          ctx.arc(bul.x + bul.width/2, bul.y + bul.height, bul.width, Math.PI, 0, false);
          ctx.arc(bul.x + bul.width/2, bul.y + bul.height - 3.5, bul.width - 2, 0, Math.PI, true);
          ctx.fill();
          ctx.restore();
        } else if (bul.id.startsWith("player_bul_homing_")) {
          // Homing green spark needles
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#34d399";
          ctx.beginPath();
          ctx.arc(bul.x + bul.width / 2, bul.y + bul.height / 2, bul.width, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (bul.weaponType === WeaponType.KATORI_RING) {
          // Beautiful circle donuts vector style (green ring coils)
          ctx.save();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = bul.color || "#22c55e";
          ctx.shadowBlur = 5;
          ctx.shadowColor = bul.color || "#22c55e";
          ctx.beginPath();
          ctx.arc(bul.x + bul.width/2, bul.y + bul.height/2, bul.width/2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (bul.weaponType === WeaponType.MOSQUITO_SPRAY) {
          // Smoke clouds expanding
          ctx.beginPath();
          ctx.arc(bul.x + bul.width/2, bul.y + bul.height/2, bul.width * 0.72, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Fallback player blocks
          ctx.fillRect(bul.x, bul.y, bul.width, bul.height);
        }
      }
    });

    // 4. Draw Power-Ups
    powerupsRef.current.forEach((pow) => {
      ctx.save();
      // Retro pulsating sizing glow
      const pulseScalar = 1 + Math.sin(animTickRef.current * 0.15) * 0.1;
      const pw = pow.width * pulseScalar;
      const ph = pow.height * pulseScalar;
      const px = pow.x - (pw - pow.width) / 2;
      const py = pow.y - (ph - pow.height) / 2;

      // Draw pixel container card
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeRect(px, py, pw, ph);

      // Icon symbol drawers based on power-up flavor
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let symbol = "⭐";
      if (pow.type === PowerUpType.RECOVERY) {
        ctx.fillStyle = "#ff4d4d";
        symbol = "薬"; // Traditional character for medicine/Muhi ointment
      } else if (pow.type === PowerUpType.FIRE_RATE) {
        ctx.fillStyle = "#fbbf24";
        symbol = "速"; // Traditional character for high velocity/Speed
      } else if (pow.type === PowerUpType.WEAPON_UP) {
        ctx.fillStyle = "#22c55e";
        symbol = "強"; // Stronger weapon level
      } else if (pow.type === PowerUpType.KATORI_SHIELD) {
        ctx.fillStyle = "#a7f3d0";
        symbol = "煙"; // Smoke barrier shield
      } else if (pow.type === PowerUpType.SPRAY_AMMO) {
        ctx.fillStyle = "#38bdf8";
        symbol = "煙"; // Ring Weapon unlock!
      }

      ctx.fillText(symbol, px + pw/2, py + ph/2);
      ctx.restore();
    });

    // 5. Draw Bunkers crumbling cells (Katorisenko)
    bunkersRef.current.forEach((bunk) => {
      const cellW = bunk.width / bunk.grid[0].length;
      const cellH = bunk.height / bunk.grid.length;

      for (let r = 0; r < bunk.grid.length; r++) {
        for (let c = 0; c < bunk.grid[0].length; c++) {
          if (bunk.grid[r][c]) {
            // Retro green coil lines layout gradient
            const greenVal = 140 + r * 10;
            ctx.fillStyle = `rgb(16, ${greenVal}, 64)`;
            ctx.fillRect(
              Math.floor(bunk.x + c * cellW),
              Math.floor(bunk.y + r * cellH),
              Math.ceil(cellW),
              Math.ceil(cellH)
            );
          }
        }
      }
    });

    // 6. Draw Particles
    particlesRef.current.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;

      if (pt.type === ParticleType.TEXT && pt.text) {
        ctx.font = `bold ${pt.fontSize || 13}px monospace`;
        ctx.fillText(pt.text, pt.x, pt.y);
      } else {
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }
      ctx.restore();
    });

    // 6.5 Render Mosquito Extermination Bomb expanding shockwaves! (蚊取りアース爆波)
    if (bombActiveFramesRef.current > 0) {
      bombActiveFramesRef.current--;
      
      const progress = (60 - bombActiveFramesRef.current) / 60; // 0.0 to 1.0 linear progression
      ctx.save();
      
      // Expand rings from player center
      const px_center = pRef.current.x + pRef.current.width / 2;
      const py_center = pRef.current.y + pRef.current.height / 2;
      const maxRadius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 1.5;
      const currentRadius = progress * maxRadius;

      // Outer primary glowing emerald ring
      ctx.strokeStyle = `rgba(16, 185, 129, ${1 - progress})`;
      ctx.lineWidth = 8 + (1 - progress) * 18;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(px_center, py_center, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner companion high-energy glowing amber spiral ring
      ctx.strokeStyle = `rgba(245, 158, 11, ${(1 - progress) * 0.85})`;
      ctx.lineWidth = 4 + (1 - progress) * 10;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(px_center, py_center, currentRadius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Golden high-frequency scanline concentric rings
      ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - progress) * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 0;
      for (let i = 0; i < 3; i++) {
        const subRadius = currentRadius * (0.4 + i * 0.25);
        if (subRadius < maxRadius) {
          ctx.beginPath();
          ctx.arc(px_center, py_center, subRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Dynamic screen-wide full negative high-contrast flash
      ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * 0.3})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.restore();
    }

    // 7. Render dynamic stage intro banner overlays
    if (isEnteringStageRef.current && stageBannerTimerRef.current > 0) {
      stageBannerTimerRef.current--;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, CANVAS_HEIGHT / 2 - 50, CANVAS_WIDTH, 90);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      
      const isBossWave = currentWave % 3 === 0;
      const waveLabel = isBossWave 
        ? `⚠️ 【防空超警報】 第 ${currentWave} 次防空戦：女王蚊「クイーン・マザー」来襲！ ⚠️`
        : `【空域防衛指令】 第 ${currentWave} 次防空戦：蚊型戦闘機群 侵入！`;
      
      ctx.fillText(waveLabel, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px monospace";
      ctx.fillText(
        isBossWave ? "極悪領空を支配する巨大空母「モスキート・クイーン」を撃墜せよ！" : "地上の安らぎを死守するため、編隊を組む吸血害虫を全機撃墜せよ！", 
        CANVAS_WIDTH / 2, 
        CANVAS_HEIGHT / 2 + 25
      );

      if (stageBannerTimerRef.current === 0) {
        isEnteringStageRef.current = false;
      }
    }
  };

  // React hook to handle game ticker schedule animation frames
  useEffect(() => {
    let animId: number;

    const tick = () => {
      updateGame();
      drawGame();
      animId = requestAnimationFrame(tick);
    };

    if (stage === GameStage.PLAYING) {
      animId = requestAnimationFrame(tick);
    } else {
      // Just do static redraw on boot, pause or Game Over
      drawGame();
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stage, currentWave]);

  // Initialise scores and load top score from local persistence on mount
  useEffect(() => {
    const cachedHighScore = localStorage.getItem("mos_invader_highscore");
    if (cachedHighScore) {
      setHighScore(parseInt(cachedHighScore, 10));
    }
    resetGame(true);
  }, []);

  // UI trigger toggles
  const handleToggleMute = () => {
    const isNowMuted = audio.toggleMute();
    setMuted(isNowMuted);
  };

  const getWeaponLabel = (w: WeaponType) => {
    switch (w) {
      case WeaponType.WIND_BLADE: return "烈風うちわ刃 (Wind Blade)";
      case WeaponType.KATORI_RING: return "蚊取りスパイラル (Katori Ring)";
      case WeaponType.MOSQUITO_SPRAY: return "アースジェットスプレー (Bug Spray)";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center w-full max-w-6xl mx-auto p-4 select-none" id="invader_app_shell">
      {/* LEFT COLUMN: STATUS & COMBAT ANALYZERS */}
      <div className="flex flex-col gap-4 w-full lg:w-64 bg-slate-900 border-2 border-slate-700/60 p-4 rounded-lg text-zinc-100 font-mono shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
        
        <div>
          <span className="text-xs text-zinc-400 block tracking-widest uppercase">Score</span>
          <span className="text-2xl font-bold text-yellow-400 font-mono tracking-wider">{score}</span>
        </div>

        <div className="border-t border-slate-800 pt-2">
          <span className="text-xs text-zinc-400 block tracking-widest uppercase">High Score</span>
          <span className="text-lg font-bold text-amber-500 font-mono">{highScore}</span>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-400 uppercase">機体シールド耐久値</span>
            <span className="text-xs font-bold text-rose-400">{pRef.current.health}%</span>
          </div>
          {/* Health Bar */}
          <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-150 ${
                pRef.current.health > 50 ? "bg-emerald-500" : pRef.current.health > 25 ? "bg-yellow-500 animate-pulse" : "bg-red-600 animate-pulse"
              }`}
              style={{ width: `${pRef.current.health}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-400">スプレー燃料ゲージ</span>
            <span className="text-xs font-bold text-lime-400">{Math.floor(pRef.current.sprayFuel)}%</span>
          </div>
          {/* Fuel Bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full rounded-full bg-lime-500 transition-all duration-75"
              style={{ width: `${pRef.current.sprayFuel}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">スプレー装備時のみ発射で消費</span>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-400">緊急バリア (Eキー)</span>
            <span className={`text-xs font-bold ${
              shieldExpiryRef.current > 0 
                ? "text-emerald-400 animate-pulse" 
                : manualShieldCooldownRef.current > 0 
                  ? "text-rose-400" 
                  : "text-emerald-400"
            }`}>
              {shieldExpiryRef.current > 0 
                ? "展開中! " + Math.ceil(shieldExpiryRef.current / 60) + "秒" 
                : manualShieldCooldownRef.current > 0 
                  ? "冷却中 " + Math.ceil(manualShieldCooldownRef.current / 60) + "秒" 
                  : "READY (発動可)"}
            </span>
          </div>
          {/* Barrier progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            {shieldExpiryRef.current > 0 ? (
              <div 
                className="h-full rounded-full bg-emerald-500 animate-pulse"
                style={{ width: `${(shieldExpiryRef.current / 180) * 100}%` }}
              ></div>
            ) : manualShieldCooldownRef.current > 0 ? (
              <div 
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${(1 - (manualShieldCooldownRef.current / 120)) * 100}%` }}
              ></div>
            ) : (
              <div className="h-full rounded-full bg-emerald-500 w-full"></div>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">3秒間無敵 (使用後2秒クールタイム)</span>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-400 uppercase font-sans">蚊撲滅ボム (Fキー / 💥)</span>
            <span className={`text-xs font-bold ${bombs > 0 ? "text-red-400 animate-pulse" : "text-zinc-500"}`}>
              残：{bombs} / 5
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                key={idx}
                onClick={idx < bombs ? triggerMosquitoBomb : undefined}
                disabled={stage !== GameStage.PLAYING || idx >= bombs}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all border ${
                  idx < bombs 
                    ? "bg-red-600 hover:bg-red-500 border-red-400 text-sm cursor-pointer shadow-md active:scale-90" 
                    : "bg-slate-950 border-slate-800 text-zinc-700 text-xs pointer-events-none"
                }`}
                title={idx < bombs ? "クリックでアース蚊取り強風ボム発弾！" : "残弾なし"}
              >
                {idx < bombs ? "💥" : "・"}
              </button>
            ))}
          </div>
          <span className="text-[9px] text-zinc-500 mt-1.5 block leading-tight">全敵弾消去 ＆ 画面の全蚊に220の崩壊ダメージ！</span>
        </div>

        <div className="border-t border-slate-800 pt-3 flex flex-col gap-1.5 text-xs text-zinc-300">
          <div>
            <span className="text-zinc-500 block">アクティブな武器 / 威力:</span>
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              {getWeaponLabel(pRef.current.weapon)}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              扇能力レベル: <span className="text-green-400 font-bold">Lv {pRef.current.weaponLevel}</span>
            </span>
          </div>

          <div className="mt-1 pt-1 border-t border-slate-800/40">
            <span className="text-zinc-500 block">現在の夜 (Stage):</span>
            <span className="font-bold text-amber-500">第 {currentWave} 夜</span>
          </div>

          <div className="mt-1 pt-1 border-t border-slate-800/40">
            <span className="text-zinc-500 block">蚊の行進速度 (March Hz):</span>
            <span className="font-bold text-yellow-400">{playSpeed}x speed</span>
          </div>
        </div>

        {/* Combo alerts */}
        {comboCountRef.current > 0 && (
          <div className="border-t border-emerald-900 bg-emerald-950/20 p-2.5 rounded text-center animate-bounce mt-auto">
            <span className="text-xs text-zinc-400 block">RAGE MULTIPLIER</span>
            <span className="text-xl font-black text-emerald-400">
              {comboCountRef.current} COMBO!
            </span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">
              (得点倍率: x{Math.min(5, 1 + Math.floor(comboCountRef.current / 3))})
            </span>
          </div>
        )}
      </div>

      {/* CENTER COLUMN: HIGH-CONTRAST ARCADE CANVAS */}
      <div className="flex-1 flex flex-col items-center gap-4 bg-slate-950 border-4 border-slate-800 p-3 sm:p-5 rounded-2xl shadow-2xl relative">
        {/* Glow CRT Monitor overlay lines */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient-crt z-10 opacity-15 rounded-xl"></div>
        
        {/* Retro Header info */}
        <div className="w-full flex justify-between items-center px-4 font-mono text-zinc-100 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse"></div>
            <span className="text-xs font-bold text-red-500 tracking-wider">RETRO CAB-1985 [ACTIVE]</span>
          </div>
          {/* Controls shortcuts */}
          <div className="hidden md:flex gap-3 text-[11px] text-zinc-400">
            <span>[WASD / 矢印キー] 8方向移動</span>
            <span>[SPACE / K] 射撃</span>
            <span>[E] 緊急バリア (3秒無敵)</span>
          </div>
        </div>

        {/* The interactive retro stage viewports */}
        <div className="relative border-4 border-slate-700 bg-slate-900 rounded-lg overflow-hidden w-full max-w-full">
          <canvas
            id="retro_combat_canvas"
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full aspect-[80/55] block object-contain cursor-crosshair"
          />

          {/* PAUSED COVER overlay */}
          {stage === GameStage.PAUSED && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-zinc-100 font-mono border-t border-slate-800">
              <span className="text-3xl font-black tracking-widest text-amber-500 mb-2 animate-pulse">【 一時停止中 】</span>
              <p className="text-xs text-zinc-400 mb-6 max-w-md leading-relaxed">
                蚊取り線香を消して、休憩中。再開ボタンを押すか、[P]キーで蚊との戦いに戻ります。
              </p>
              <button
                onClick={() => setStage(GameStage.PLAYING)}
                className="bg-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded hover:bg-amber-400 border-b-4 border-amber-700 cursor-pointer text-sm"
              >
                蚊退治を再開する (RESUME)
              </button>
            </div>
          )}

          {/* GAME OVER CARD */}
          {stage === GameStage.GAME_OVER && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-zinc-100 font-mono border-t border-slate-800">
              <ShieldAlert className="w-16 h-16 text-rose-600 animate-bounce mb-3" />
              <span className="text-4xl font-extrabold tracking-widest text-red-500 mb-1">敗 北 / GAME OVER</span>
              <span className="text-amber-400 font-bold mb-4 font-sans text-sm">
                真夏の空中戦、防衛網を突破され不時着デッド！
              </span>
              
              <div className="bg-slate-900 border border-slate-800 p-3 max-w-lg rounded text-xs text-zinc-400 leading-relaxed mb-6">
                <span className="text-rose-400 font-bold block mb-1">【退治結果分析レポート】</span>
                ・最終スコア: <span className="text-yellow-400 font-bold text-sm font-mono">{score} pts</span><br />
                ・防空成功次数: <span className="text-zinc-100 font-bold">第 {currentWave} 次防空戦</span> まで耐え抜いた！<br />
                <span className="text-[10px] text-zinc-500 block mt-2">※耐久値がゼロになるか、対空絶対防衛線の侵犯を許すと敗北します。</span>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    resetGame(true);
                    setStage(GameStage.PLAYING);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded border-b-4 border-red-800 hover:border-red-600 transition-all text-xs tracking-widest cursor-pointer uppercase flex items-center gap-1"
                >
                  <RotateCcw className="w-4.5 h-4.5" /> もう一度挑戦する
                </button>
                <button
                  onClick={() => setStage(GameStage.TITLE)}
                  className="bg-slate-700 hover:bg-slate-600 text-zinc-100 font-bold py-2 px-6 rounded border-b-4 border-slate-900 transition-all text-xs cursor-pointer uppercase"
                >
                  タイトルへ戻る
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM QUICK INTERACTIVE TOOLBAR */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mt-1.5 font-mono z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (stage === GameStage.PLAYING) {
                  setStage(GameStage.PAUSED);
                } else if (stage === GameStage.PAUSED) {
                  setStage(GameStage.PLAYING);
                }
              }}
              disabled={stage !== GameStage.PLAYING && stage !== GameStage.PAUSED}
              className={`p-2 rounded font-bold cursor-pointer border ${
                stage === GameStage.PLAYING
                  ? "bg-slate-800 border-slate-700 text-zinc-300 hover:bg-slate-700"
                  : stage === GameStage.PAUSED
                  ? "bg-amber-600 border-amber-500 text-slate-950 hover:bg-amber-500"
                  : "bg-slate-900 border-slate-950 text-slate-700 opacity-30 cursor-not-allowed"
              }`}
            >
              {stage === GameStage.PAUSED ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                resetGame(false);
                setStage(GameStage.PLAYING);
              }}
              disabled={stage === GameStage.TITLE}
              className="p-2 rounded bg-slate-800 border border-slate-700 text-zinc-300 hover:bg-slate-700 cursor-pointer"
              title="この夜をはじめからやり直す"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded bg-slate-800 border border-slate-700 text-zinc-300 hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              <span className="text-[11px] hidden sm:inline">{muted ? "ミュート中" : "音あり"}</span>
            </button>
          </div>

          <button
            onClick={onOpenInstructions}
            className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 py-2 px-5 rounded cursor-pointer transition-all flex items-center gap-1.5 font-bold font-sans"
          >
            <FileText className="w-4 h-4" /> 【遊び方・蚊図鑑をみる】
          </button>
        </div>
      </div>
    </div>
  );
};
