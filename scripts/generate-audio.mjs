import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/audio');
fs.mkdirSync(OUT_DIR, { recursive: true });

if (process.argv.includes('--if-missing')) {
  const sentinel = path.join(OUT_DIR, 'bgm-pulse.wav');
  if (fs.existsSync(sentinel)) {
    process.exit(0);
  }
}

const SAMPLE_RATE = 44100;

function writeWavStereo(filename, left, right) {
  const numSamples = left.length;
  const buffer = Buffer.alloc(44 + numSamples * 4);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 4, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20);  // linear PCM
  buffer.writeUInt16LE(2, 22);  // stereo
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 4, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }
  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
}

function makeBuf(durationSec) {
  const len = Math.floor(durationSec * SAMPLE_RATE);
  return { len, L: new Float32Array(len), R: new Float32Array(len) };
}

// Simple deterministic noise for clean filtered whooshes
function makeNoise(seed = 12345) {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return (s / 4294967296) * 2 - 1;
  };
}

// 1-pole lowpass filter helper
function lowpass(arr, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  let y = 0;
  for (let i = 0; i < arr.length; i++) {
    y += alpha * (arr[i] - y);
    arr[i] = y;
  }
}

// 1. Warm Crystalline Brand Chime (Archify Opening & Finale)
function genBrandChime() {
  const { len, L, R } = makeBuf(2.4);
  const notes = [523.25, 659.25, 783.99, 1046.5, 1174.66]; // C5 E5 G5 C6 D6 (Cmaj9)
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let l = 0;
    let r = 0;
    for (let n = 0; n < notes.length; n++) {
      const start = n * 0.055;
      if (t < start) continue;
      const lt = t - start;
      const env = Math.min(1, lt / 0.04) * Math.exp(-lt * 1.9);
      const f = notes[n];
      const wave =
        Math.sin(2 * Math.PI * f * lt) * 0.65 +
        Math.sin(2 * Math.PI * f * 2 * lt) * 0.16 * Math.exp(-lt * 3.2);
      const pan = (n / (notes.length - 1)) * 0.7 - 0.35;
      l += wave * env * (0.5 - pan * 0.5) * 0.28;
      r += wave * env * (0.5 + pan * 0.5) * 0.28;
    }
    L[i] = l;
    R[i] = r;
  }
  writeWavStereo('sfx-brand-chime.wav', L, R);
}

// 2. Crisp Tactile Keystroke Click
function genKeyTap() {
  const { len, L, R } = makeBuf(0.06);
  const rnd = makeNoise(101);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 140);
    const body = Math.sin(2 * Math.PI * 1950 * t) * 0.35 + rnd() * 0.45;
    L[i] = body * env * 0.35;
    R[i] = body * env * 0.35;
  }
  lowpass(L, 4200);
  lowpass(R, 4200);
  writeWavStereo('sfx-key-tap.wav', L, R);
}

// 3. Clean Double-Chime for Green CI Pop-in
function genCiDing() {
  const { len, L, R } = makeBuf(0.9);
  const freqs = [880, 1318.5]; // A5 -> E6
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    freqs.forEach((f, idx) => {
      const st = idx * 0.09;
      if (t >= st) {
        const lt = t - st;
        const env = Math.min(1, lt / 0.008) * Math.exp(-lt * 5.2);
        s += (Math.sin(2 * Math.PI * f * lt) + 0.2 * Math.sin(2 * Math.PI * f * 2 * lt)) * env * 0.24;
      }
    });
    L[i] = s;
    R[i] = s * 0.96;
  }
  writeWavStereo('sfx-ci-ding.wav', L, R);
}

// 4. Cinematic Sub-Drop + Tension Reveal (when Green CI cracks open)
function genTensionReveal() {
  const { len, L, R } = makeBuf(1.6);
  const rnd = makeNoise(777);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const subFreq = 105 * Math.exp(-t * 2.1) + 38;
    const subEnv = Math.min(1, t / 0.03) * Math.exp(-t * 2.2);
    const sub = Math.sin(2 * Math.PI * subFreq * t) * subEnv * 0.52;
    const airEnv = Math.sin(Math.min(1, t / 1.1) * Math.PI) * 0.14;
    L[i] = sub + rnd() * airEnv;
    R[i] = sub + rnd() * airEnv;
  }
  lowpass(L, 680);
  lowpass(R, 680);
  writeWavStereo('sfx-tension-reveal.wav', L, R);
}

// 5. Sci-Fi Optical Portal Lock-On & Whoosh (Scene 1 -> Scene 2 Atlas!)
function genPortalWhoosh() {
  const { len, L, R } = makeBuf(1.9);
  const rnd = makeNoise(2026);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / 1.9;
    const rise = Math.pow(p, 1.7);
    const freq = 110 + rise * 640;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const env = Math.sin(Math.min(1, p) * Math.PI);
    const impact = t > 1.25 ? Math.exp(-(t - 1.25) * 6.5) * Math.sin(2 * Math.PI * 72 * (t - 1.25)) * 0.55 : 0;
    const synth = (Math.sin(phase) * 0.22 + Math.sin(phase * 1.5) * 0.1) * env;
    const air = rnd() * env * 0.25;
    L[i] = synth + air + impact;
    R[i] = synth * 0.92 + rnd() * env * 0.25 + impact;
  }
  lowpass(L, 1900);
  lowpass(R, 1900);
  writeWavStereo('sfx-portal-whoosh.wav', L, R);
}

// 6. Futuristic Sonar Ping (6 Languages igniting around Atlas)
function genRadarPing() {
  const { len, L, R } = makeBuf(0.45);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 9.5);
    const s = (Math.sin(2 * Math.PI * 1480 * t) * 0.7 + Math.sin(2 * Math.PI * 2220 * t) * 0.25) * env * 0.22;
    L[i] = s;
    R[i] = s;
  }
  writeWavStereo('sfx-radar-ping.wav', L, R);
}

// 7. Silky Cinema Camera Air Whoosh (Pure dynamically-filtered air + warm sub breath — ZERO whistle!)
function genZoomSlide() {
  const { len, L, R } = makeBuf(0.78);
  const rndL = makeNoise(3344);
  const rndR = makeNoise(7788);
  // 2-pole gentle state-variable filter with smoothly sweeping cutoff (180Hz -> 780Hz -> 220Hz)
  let lpL = 0, bpL = 0;
  let lpR = 0, bpR = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / 0.78;
    const bell = Math.pow(Math.sin(p * Math.PI), 1.6);
    const cutoff = 180 + bell * 620;
    const f = 2 * Math.sin((Math.PI * cutoff) / SAMPLE_RATE);
    const q = 0.85; // smooth, zero whistling resonance

    const inL = rndL();
    const hpL = inL - lpL - q * bpL;
    bpL += f * hpL;
    lpL += f * bpL;

    const inR = rndR();
    const hpR = inR - lpR - q * bpR;
    bpR += f * hpR;
    lpR += f * bpR;

    // Very subtle warm low-end presence (no pitch glide!)
    const sub = Math.sin(2 * Math.PI * 64 * t) * Math.pow(Math.sin(p * Math.PI), 2.4) * 0.14;
    const panL = 1 - p * 0.25;
    const panR = 0.75 + p * 0.25;
    L[i] = (bpL * 0.28 + lpL * 0.12 + sub) * bell * panL;
    R[i] = (bpR * 0.28 + lpR * 0.12 + sub) * bell * panR;
  }
  writeWavStereo('sfx-zoom-slide.wav', L, R);
}

// 8. Ascending 3D Particle Tree Shimmer Swell (2D -> 3D Lift-Off!)
function gen3DAscend() {
  const { len, L, R } = makeBuf(2.6);
  const arp = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99, 987.77, 1174.66]; // Cmaj9 ascending shimmer
  const rnd = makeNoise(5599);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let l = 0;
    let r = 0;
    // Deep rising bass swell
    const subEnv = Math.sin(Math.min(1, t / 2.2) * Math.PI);
    const sub = Math.sin(2 * Math.PI * (55 + t * 18) * t) * subEnv * 0.24;
    l += sub;
    r += sub;

    for (let n = 0; n < arp.length; n++) {
      const st = 0.14 + n * 0.13;
      if (t < st) continue;
      const lt = t - st;
      const env = Math.min(1, lt / 0.05) * Math.exp(-lt * 1.5);
      const wave = Math.sin(2 * Math.PI * arp[n] * lt) * 0.14 + Math.sin(2 * Math.PI * arp[n] * 2 * lt) * 0.04;
      const pan = Math.sin(n * 1.1) * 0.55;
      l += wave * env * (0.5 - pan * 0.45);
      r += wave * env * (0.5 + pan * 0.45);
    }
    const shimmer = rnd() * Math.sin(Math.min(1, t / 2.4) * Math.PI) * 0.06;
    L[i] = l + shimmer;
    R[i] = r + shimmer;
  }
  lowpass(L, 4800);
  lowpass(R, 4800);
  writeWavStereo('sfx-3d-ascend.wav', L, R);
}

// 9. Refined Frosted-Glass Optical Sweep (Stereo silky air + soft harmonic sheen — ZERO UFO siren!)
function genScanSweep() {
  const { len, L, R } = makeBuf(1.05);
  const rndL = makeNoise(8812);
  const rndR = makeNoise(9923);
  let lpL = 0, bpL = 0;
  let lpR = 0, bpR = 0;
  const chord = [523.25, 783.99, 1174.66]; // soft C5 + G5 + D6 glass sheen

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / 1.05;
    const env = Math.pow(Math.sin(p * Math.PI), 1.5);
    const cutoff = 520 + env * 1450;
    const f = 2 * Math.sin((Math.PI * cutoff) / SAMPLE_RATE);
    const q = 0.9;

    const hpL = rndL() - lpL - q * bpL;
    bpL += f * hpL;
    lpL += f * bpL;

    const hpR = rndR() - lpR - q * bpR;
    bpR += f * hpR;
    lpR += f * bpR;

    let glass = 0;
    for (let k = 0; k < chord.length; k++) {
      glass += Math.sin(2 * Math.PI * chord[k] * t) * (0.042 / (k + 1));
    }

    // Smooth stereo travel left -> right matching the visual scan curtain!
    const panL = Math.cos(p * Math.PI * 0.5) * 0.75 + 0.25;
    const panR = Math.sin(p * Math.PI * 0.5) * 0.75 + 0.25;

    L[i] = (bpL * 0.18 + glass) * env * panL;
    R[i] = (bpR * 0.18 + glass) * env * panR;
  }
  writeWavStereo('sfx-scan-sweep.wav', L, R);
}

// 10. Proof-Green Resolution Chord (AI Loop Step 04 Resolved!)
function genSuccessChord() {
  const { len, L, R } = makeBuf(1.6);
  const notes = [523.25, 659.25, 783.99, 1046.5];
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    notes.forEach((f, idx) => {
      const st = idx * 0.04;
      if (t >= st) {
        const lt = t - st;
        const env = Math.min(1, lt / 0.02) * Math.exp(-lt * 2.4);
        s += Math.sin(2 * Math.PI * f * lt) * env * 0.16;
      }
    });
    L[i] = s;
    R[i] = s;
  }
  writeWavStereo('sfx-success-chord.wav', L, R);
}

// 11. Full-Length Minimal Modern Tech BGM Bed (~105s, 116 BPM)
// Bright warm electronic chords on paper sections, shifting smoothly to deep obsidian tech pulse during Scene 2 Atlas!
function genBgmBed() {
  const duration = 105;
  const { len, L, R } = makeBuf(duration);
  const bpm = 116;
  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;

  // Chord progressions (Hz)
  const lightChords = [
    [130.81, 261.63, 329.63, 392.0, 493.88], // Cmaj7
    [110.0, 220.0, 261.63, 329.63, 392.0],   // Am7
    [174.61, 261.63, 329.63, 392.0, 440.0],  // Fmaj9
    [196.0, 246.94, 293.66, 392.0, 440.0],   // G6
  ];
  const techChords = [
    [110.0, 220.0, 261.63, 329.63, 493.88],  // Am9
    [98.0, 196.0, 246.94, 293.66, 440.0],    // G6/9
    [87.31, 174.61, 261.63, 329.63, 392.0],  // Fmaj9
    [130.81, 196.0, 293.66, 329.63, 493.88], // Cmaj9
  ];

  const rnd = makeNoise(44100);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const barIndex = Math.floor(t / barDur);
    const barPos = (t % barDur) / barDur;
    const beatPos = (t % beatDur) / beatDur;
    const eighthPos = (t % (beatDur / 2)) / (beatDur / 2);

    // Scene 2 dark Atlas / 3D spans roughly 14s..34s
    const inTechZone = t >= 13.5 && t <= 34.5;
    const chords = inTechZone ? techChords : lightChords;
    const chord = chords[barIndex % chords.length];

    // Smooth bar pad envelope
    const padEnv = Math.min(1, barPos / 0.14) * Math.min(1, (1 - barPos) / 0.14 + 0.35);
    let padL = 0;
    let padR = 0;
    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const w1 = Math.sin(2 * Math.PI * f * t);
      const w2 = Math.sin(2 * Math.PI * (f * 1.0025) * t); // gentle stereo chorus detune
      const gain = c === 0 ? 0.16 : 0.068;
      padL += w1 * gain * padEnv;
      padR += w2 * gain * padEnv;
    }

    // Minimalist warm sub-kick on beat 1 & 3 (muted, refined)
    const beatInBar = Math.floor((t % barDur) / beatDur);
    let kick = 0;
    if (t > 2.0 && t < 96.0 && (beatInBar === 0 || beatInBar === 2)) {
      const kt = beatPos * beatDur;
      if (kt < 0.22) {
        const kf = 52 + 65 * Math.exp(-kt * 28);
        kick = Math.sin(2 * Math.PI * kf * kt) * Math.exp(-kt * 14) * (inTechZone ? 0.22 : 0.14);
      }
    }

    // Delicate 8th-note melodic arpeggio pluck (adds modern forward momentum!)
    let pluck = 0;
    if (t > 4.0 && t < 95.0) {
      const step = Math.floor(t / (beatDur / 2));
      const noteFreq = chord[1 + (step % (chord.length - 1))] * (step % 4 === 3 ? 2 : 1);
      const pt = eighthPos * (beatDur / 2);
      const pEnv = Math.min(1, pt / 0.008) * Math.exp(-pt * 10);
      pluck = Math.sin(2 * Math.PI * noteFreq * pt) * pEnv * (inTechZone ? 0.085 : 0.06);
    }

    // Whisper-soft hi-hat tick on off-beats during active tech/showcase sections
    let hat = 0;
    if (t > 12.0 && t < 92.0) {
      const ht = eighthPos * (beatDur / 2);
      if (ht < 0.035) {
        hat = rnd() * Math.exp(-ht * 95) * (inTechZone ? 0.032 : 0.018);
      }
    }

    // Overall master fade in / fade out
    const master = Math.min(1, t / 1.5) * Math.min(1, Math.max(0, (101 - t) / 3.5));
    L[i] = (padL + kick + pluck * 0.85 + hat) * master * 0.72;
    R[i] = (padR + kick + pluck * 1.15 - hat * 0.7) * master * 0.72;
  }

  lowpass(L, 5200);
  lowpass(R, 5200);
  writeWavStereo('bgm-pulse.wav', L, R);
}

genBrandChime();
genKeyTap();
genCiDing();
genTensionReveal();
genPortalWhoosh();
genRadarPing();
genZoomSlide();
gen3DAscend();
genScanSweep();
genSuccessChord();
genBgmBed();

console.log('Generated 11 audio assets in', OUT_DIR);
