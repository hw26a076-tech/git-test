/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeaponType } from "../types";

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private activeSprayOsc: AudioBufferSourceNode | null = null;
  private sprayGain: GainNode | null = null;

  constructor() {
    // Lazy initialisation on first interaction (browser requirement)
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Standard comfortable volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  public setVolume(val: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMute() {
    return this.isMuted;
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public playShoot(weapon: WeaponType) {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    if (weapon === WeaponType.WIND_BLADE) {
      // High-speed swoosh sound
      // Create oscillator structure
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);

      // Add a tiny bit of noise puff for realistic uchiwa swing
      try {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(2000, now);
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.1);
      } catch (err) {}

    } else if (weapon === WeaponType.KATORI_RING) {
      // Green smoke rings: high bubbly synth block laser
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.1);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  // Rapid Bug Spray spray audio looping toggle
  public startSprayLoop() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain || this.activeSprayOsc) return;

    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds looping buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3500, now);
      // Sweeping frequency for that dynamic spray can shaking sound
      filter.Q.setValueAtTime(1.5, now);

      this.sprayGain = this.ctx.createGain();
      this.sprayGain.gain.setValueAtTime(0.1, now);

      noise.connect(filter);
      filter.connect(this.sprayGain);
      this.sprayGain.connect(this.masterGain);

      noise.start(now);
      this.activeSprayOsc = noise;
    } catch (e) {
      console.warn("Could not start spray loop", e);
    }
  }

  public stopSprayLoop() {
    if (this.activeSprayOsc && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        if (this.sprayGain) {
          this.sprayGain.gain.cancelScheduledValues(now);
          this.sprayGain.gain.setValueAtTime(this.sprayGain.gain.value, now);
          this.sprayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        }
        const oscToStop = this.activeSprayOsc;
        setTimeout(() => {
          try {
            oscToStop.stop();
          } catch(e){}
        }, 100);
      } catch (e) {}
      this.activeSprayOsc = null;
      this.sprayGain = null;
    }
  }

  // Play a squishy insect splat explosion!
  public playSplat() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    try {
      // Noise component for crunchy splat
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.createNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.2);

      // Low pitch tone to add meat to the squish
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (err) {}
  }

  // Play mosquito firing bullet sound (an annoying high-pitch tiny click or zap)
  public playEnemyShoot() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Player takes damage - "Ouch, it bit me!" - low buzzing noise and scratchy pop
  public playPlayerHit() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // low vibrato alarm
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(100, now + 0.3);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(155, now);
    osc2.frequency.linearRampToValueAtTime(95, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  // Power Up item picked up! Arpeggio fantasy sound.
  public playPowerUp() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [330, 440, 554, 659, 880]; // A major arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  // Classic rhythmic heartbeat (background hum) for the march of incoming swarm
  public playInvaderStep(tickCount: number, speedRate: number) {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    
    // Low alternating pitch to emulate Space Invaders heartbeat ("dum... dum... dum... dum...")
    // Increase frequency slightly as game speeds up to induce delicious anxiety
    const isEven = tickCount % 2 === 0;
    const baseFreq = isEven ? 80 : 70;
    const speedBoost = Math.min(1.5, 1 / (speedRate || 1)) * 30; // gets higher pitched as they get faster
    
    osc.frequency.setValueAtTime(baseFreq + speedBoost, now);
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);

    // Annoying high mosquito hum accompanying the step!
    const buzzOsc = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();
    buzzOsc.type = "sawtooth";
    // 600Hz-800Hz is the classic annoying pitch of a flying mosquito!
    buzzOsc.frequency.setValueAtTime(650 + Math.sin(now * 50) * 80 + speedBoost * 3, now);
    
    buzzGain.gain.setValueAtTime(0.04, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    buzzOsc.connect(buzzGain);
    buzzGain.connect(this.masterGain);
    buzzOsc.start(now);
    buzzOsc.stop(now + 0.15);
  }

  // Victory fanfare melody!
  public playStageClear() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const melody = [
      { note: 523.25, duration: 0.1 },  // C5
      { note: 587.33, duration: 0.1 },  // D5
      { note: 659.25, duration: 0.1 },  // E5
      { note: 783.99, duration: 0.15 }, // G5
      { note: 659.25, duration: 0.1 },  // E5
      { note: 783.99, duration: 0.3 }   // G5 (triumphant)
    ];

    let currentOffset = 0;
    melody.forEach((item) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(item.note, now + currentOffset);
      
      gain.gain.setValueAtTime(0.18, now + currentOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + item.duration + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + item.duration + 0.1);

      currentOffset += item.duration + 0.05;
    });
  }

  // Dramatic game over chiptune
  public playShieldUp() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // An ascending frequency sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.4);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.5);

    // Add a fast high filter sweep for cyber texture
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(660, now + 0.1);
    osc2.frequency.setValueAtTime(990, now + 0.2);
    
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc2.start(now);
    osc2.stop(now + 0.4);
  }

  // Dramatic game over chiptune
  public playGameOver() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const melody = [
      { note: 440.00, duration: 0.2 }, // A4
      { note: 415.30, duration: 0.2 }, // G#4
      { note: 392.00, duration: 0.2 }, // G4
      { note: 349.23, duration: 0.4 }, // F4 (long sad)
      { note: 293.66, duration: 0.6 }  // D4 (deep despair)
    ];

    let currentOffset = 0;
    melody.forEach((item) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(item.note, now + currentOffset);
      
      gain.gain.setValueAtTime(0.2, now + currentOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + item.duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + item.duration + 0.05);

      currentOffset += item.duration + 0.05;
    });
  }
}

export const audio = new AudioManager();
export default audio;
