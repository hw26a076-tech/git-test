/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStage {
  TITLE = "TITLE",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
  VICTORY = "VICTORY"
}

export enum WeaponType {
  WIND_BLADE = "WIND_BLADE",       // Crescent wind slice
  KATORI_RING = "KATORI_RING",     // Green smoke rings (slower, penetrative)
  MOSQUITO_SPRAY = "MOSQUITO_SPRAY" // Short range wide cloud (rapid)
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number; // 0 to 100 (100 is healthy, 0 is infected/severe itchiness)
  maxHealth: number;
  weapon: WeaponType;
  weaponLevel: number;
  sprayFuel: number; // For Bug Spray weapon
  maxSprayFuel: number;
}

export enum MosquitoType {
  COMMON = "COMMON",       // Red house mosquito (standard)
  TIGER = "TIGER",         // Tiger mosquito (fast and stripes, shoots waves)
  URBAN = "URBAN",         // Underground mosquito (elusive, zig-zag)
  GIANT = "GIANT",         // Giant mosquito (heavy, high HP, double shots)
  QUEEN_BOSS = "QUEEN_BOSS" // Giant boss with custom movement and bullet hell patterns
}

export interface Mosquito {
  id: string;
  type: MosquitoType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  points: number;
  animFrame: number;
  wingSpeed: number;
  wingTimer: number;
  moveDirection: number; // Custom movement offsets if any
  shootCooldown: number;
}

export enum BulletOwner {
  PLAYER = "PLAYER",
  ENEMY = "ENEMY"
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  owner: BulletOwner;
  weaponType?: WeaponType;
  penetrateCount?: number;
  color: string;
}

export enum PowerUpType {
  RECOVERY = "RECOVERY",     // Kinkan / Muhi (muffler ointment) - heals health
  FIRE_RATE = "FIRE_RATE",   // Faster cooling
  WEAPON_UP = "WEAPON_UP",   // Level up active weapon (maximum 3)
  KATORI_SHIELD = "KATORI_SHIELD", // Temporary toxic shield around player
  SPRAY_AMMO = "SPRAY_AMMO"  // Refills jet spray fuel
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Bunker {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // A grid of pixel blocks that can be destroyed individually for retro 1:1 realism
  grid: boolean[][]; // true = solid, false = destroyed
}

export enum ParticleType {
  BLOOD_SPLAT = "BLOOD_SPLAT",
  WIND_PARTICLE = "WIND_PARTICLE",
  SMOKE_GRID = "SMOKE_GRID",
  SPARKS = "SPARKS",
  TEXT = "TEXT"
}

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  text?: string;
  fontSize?: number;
}

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: string;
}
