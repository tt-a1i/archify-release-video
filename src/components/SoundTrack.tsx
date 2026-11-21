import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { SCENE_DURATIONS, TOTAL_DURATION, TRANSITION_DURATION } from '../timeline';

// Compute exact global start frame of each scene inside TransitionSeries
const S1 = 0;
const S2 = S1 + SCENE_DURATIONS.scene1 - TRANSITION_DURATION;
const S3 = S2 + SCENE_DURATIONS.scene2 - TRANSITION_DURATION;
const S4 = S3 + SCENE_DURATIONS.scene3 - TRANSITION_DURATION;
const S5 = S4 + SCENE_DURATIONS.scene4 - TRANSITION_DURATION;
const S6 = S5 + SCENE_DURATIONS.scene5 - TRANSITION_DURATION;

interface SfxCue {
  from: number;
  file: string;
  volume?: number;
  duration?: number;
}

const SFX_CUES: SfxCue[] = [
  // ==================== SCENE 1: BRAND STING -> ERA -> PROMPT -> CI ILLUSION -> PORTAL ====================
  { from: S1 + 2, file: 'audio/sfx-brand-chime.wav', volume: 0.55, duration: 75 },
  // Subtle tactile keystroke taps during prompt typing (frames 114..148)
  { from: S1 + 115, file: 'audio/sfx-key-tap.wav', volume: 0.25, duration: 5 },
  { from: S1 + 121, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { from: S1 + 127, file: 'audio/sfx-key-tap.wav', volume: 0.24, duration: 5 },
  { from: S1 + 133, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { from: S1 + 139, file: 'audio/sfx-key-tap.wav', volume: 0.25, duration: 5 },
  { from: S1 + 145, file: 'audio/sfx-key-tap.wav', volume: 0.26, duration: 5 },
  // Green CI checkmarks pop in
  { from: S1 + 151, file: 'audio/sfx-ci-ding.wav', volume: 0.45, duration: 30 },
  // Green CI peels away -> spaghetti chaos tension sub-drop
  { from: S1 + 202, file: 'audio/sfx-tension-reveal.wav', volume: 0.58, duration: 52 },
  // Optical reticle lock-on + magnetic snap portal into Atlas
  { from: S1 + 382, file: 'audio/sfx-portal-whoosh.wav', volume: 0.62, duration: 60 },

  // ==================== SCENE 2: 2D ATLAS -> 3D PARTICLE TREE -> CLASSIC OVERLAY ====================
  // 6 orbital languages pinging sequentially during radar sweep
  { from: S2 + 18, file: 'audio/sfx-radar-ping.wav', volume: 0.26, duration: 15 },
  { from: S2 + 28, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 15 },
  { from: S2 + 38, file: 'audio/sfx-radar-ping.wav', volume: 0.26, duration: 15 },
  { from: S2 + 48, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 15 },
  { from: S2 + 58, file: 'audio/sfx-radar-ping.wav', volume: 0.26, duration: 15 },
  { from: S2 + 68, file: 'audio/sfx-radar-ping.wav', volume: 0.28, duration: 15 },
  // Sector Zoom dolly push-in
  { from: S2 + 108, file: 'audio/sfx-zoom-slide.wav', volume: 0.3, duration: 26 },
  // PR Diff scanline sweep
  { from: S2 + 272, file: 'audio/sfx-scan-sweep.wav', volume: 0.34, duration: 34 },
  // 2D Atlas -> 3D Particle Tree dimensional lift-off!
  { from: S2 + 348, file: 'audio/sfx-3d-ascend.wav', volume: 0.62, duration: 82 },
  // Classic Diagram Overlay diagonal wipe & Code Analysis ON optical curtain
  { from: S2 + 556, file: 'audio/sfx-zoom-slide.wav', volume: 0.28, duration: 26 },
  { from: S2 + 602, file: 'audio/sfx-scan-sweep.wav', volume: 0.32, duration: 34 },

  // ==================== SCENE 3: STORY CHOREOGRAPHY (PULSE BILLING #5) ====================
  { from: S3 + 6, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 26 },
  // Cross-view morph Architecture -> Sequence
  { from: S3 + 300, file: 'audio/sfx-zoom-slide.wav', volume: 0.3, duration: 26 },
  // Git-pinned code slide in
  { from: S3 + 422, file: 'audio/sfx-radar-ping.wav', volume: 0.26, duration: 15 },
  // Morph to ERD migration
  { from: S3 + 538, file: 'audio/sfx-zoom-slide.wav', volume: 0.28, duration: 26 },

  // ==================== SCENE 4: REAL PR CASES (TOKIO #1657 + VUE #2532) ====================
  // Tokio camera dolly pan to Lifecycle
  { from: S4 + 118, file: 'audio/sfx-zoom-slide.wav', volume: 0.28, duration: 26 },
  // Diagonal fold wipe into Vue #2532
  { from: S4 + 238, file: 'audio/sfx-scan-sweep.wav', volume: 0.32, duration: 34 },
  // Dramatic Macro-Dive cracking open nested prefix() 2->6!
  { from: S4 + 328, file: 'audio/sfx-tension-reveal.wav', volume: 0.46, duration: 50 },

  // ==================== SCENE 5: DUAL-THEME SWEEP + CLOSED AI LOOP ====================
  // Dual-Theme Light <-> Dark diagonal optical sweep
  { from: S5 + 48, file: 'audio/sfx-scan-sweep.wav', volume: 0.34, duration: 34 },
  // AI Loop step transition
  { from: S5 + 198, file: 'audio/sfx-zoom-slide.wav', volume: 0.28, duration: 26 },
  // Step 04 Re-analyze hits Proof Green 0 cycles · 0 drift!
  { from: S5 + 324, file: 'audio/sfx-success-chord.wav', volume: 0.56, duration: 52 },

  // ==================== SCENE 6: META BOOTSTRAP + OFFICIAL ARCHIFY FINALE ====================
  { from: S6 + 86, file: 'audio/sfx-brand-chime.wav', volume: 0.62, duration: 76 },
];

export const SoundTrack: React.FC = () => {
  return (
    <>
      {/* Continuous Minimal Modern Tech BGM Bed */}
      <Audio
        src={staticFile('audio/bgm-pulse.wav')}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, TOTAL_DURATION - 75, TOTAL_DURATION],
            [0, 0.38, 0.38, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        }
      />

      {/* Frame-Locked Precision UI & Motion SFX */}
      {SFX_CUES.map((cue, idx) => (
        <Sequence
          key={`${cue.file}-${idx}`}
          from={cue.from}
          durationInFrames={cue.duration ?? 60}
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume ?? 0.45} />
        </Sequence>
      ))}
    </>
  );
};
