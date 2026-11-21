import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { SCENE_DURATIONS, TOTAL_DURATION, TRANSITION_DURATION } from '../timeline';

// Exact global start frame of each scene inside TransitionSeries
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
  // ==================== SCENE 1: BRAND STING -> PROMPT -> PR #1..#47 DRIFT -> WHAT WE BUILT -> PORTAL ====================
  { from: S1 + 2, file: 'audio/sfx-brand-chime.wav', volume: 0.55, duration: 75 },
  // Prompt typing keyclicks (frames 104..136)
  { from: S1 + 106, file: 'audio/sfx-key-tap.wav', volume: 0.24, duration: 5 },
  { from: S1 + 112, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { from: S1 + 118, file: 'audio/sfx-key-tap.wav', volume: 0.24, duration: 5 },
  { from: S1 + 124, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { from: S1 + 130, file: 'audio/sfx-key-tap.wav', volume: 0.25, duration: 5 },
  // Green CI checkmarks pop in
  { from: S1 + 140, file: 'audio/sfx-ci-ding.wav', volume: 0.44, duration: 30 },
  // PR #1 -> #12 -> #28 -> #47 corruption milestones under green CI!
  { from: S1 + 242, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 15 },
  { from: S1 + 278, file: 'audio/sfx-tension-reveal.wav', volume: 0.52, duration: 52 },
  { from: S1 + 318, file: 'audio/sfx-radar-ping.wav', volume: 0.28, duration: 15 },
  // "What We Built" Archify Code Analysis overlay reveal over live drifted diagram
  { from: S1 + 378, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  // Live drifted architecture directly morphs into Obsidian Atlas ring! (Full 85f tail — zero cut-off!)
  { from: S1 + 506, file: 'audio/sfx-portal-whoosh.wav', volume: 0.56, duration: 85 },

  // ==================== SCENE 2: 2D ATLAS -> 3D PARTICLE TREE -> EXPANDED CLASSIC OVERLAY ====================
  // Radar sweep discovering architectural signals + 6 languages
  { from: S2 + 18, file: 'audio/sfx-radar-ping.wav', volume: 0.22, duration: 24 },
  { from: S2 + 34, file: 'audio/sfx-radar-ping.wav', volume: 0.22, duration: 24 },
  { from: S2 + 52, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  { from: S2 + 70, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  // Sector Zoom dolly push-in
  { from: S2 + 108, file: 'audio/sfx-zoom-slide.wav', volume: 0.26, duration: 36 },
  // PR Diff feathered scan curtain
  { from: S2 + 272, file: 'audio/sfx-scan-sweep.wav', volume: 0.3, duration: 45 },
  // 2D Atlas -> 3D Particle Tree dimensional lift-off! (Full generous duration so decay never clips!)
  { from: S2 + 348, file: 'audio/sfx-3d-ascend.wav', volume: 0.56, duration: 110 },
  // Classic Diagram Overlay diagonal wipe & Code Analysis ON optical curtain
  { from: S2 + 556, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { from: S2 + 602, file: 'audio/sfx-scan-sweep.wav', volume: 0.28, duration: 45 },
  // Billing Core Source Evidence & Drift Inspector opens!
  { from: S2 + 676, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },

  // ==================== SCENE 3: 10 DIAGRAMS -> DECLARATIVE COMPILER -> PULSE BILLING #5 ====================
  { from: S3 + 6, file: 'audio/sfx-zoom-slide.wav', volume: 0.22, duration: 36 },
  // Declarative JSON vs Direct AI Hand-coding beat
  { from: S3 + 96, file: 'audio/sfx-zoom-slide.wav', volume: 0.22, duration: 36 },
  // JSON compiles directly into live Pulse Billing #5 Architecture!
  { from: S3 + 242, file: 'audio/sfx-scan-sweep.wav', volume: 0.26, duration: 45 },
  // Cross-view morph Architecture -> Sequence
  { from: S3 + 452, file: 'audio/sfx-zoom-slide.wav', volume: 0.26, duration: 36 },
  // Git-pinned code slide in
  { from: S3 + 572, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  // Morph to ERD migration
  { from: S3 + 690, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },

  // ==================== SCENE 4: REAL PR CASES (TOKIO #1657 + VUE #2532) ====================
  { from: S4 + 118, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { from: S4 + 238, file: 'audio/sfx-scan-sweep.wav', volume: 0.28, duration: 45 },
  { from: S4 + 328, file: 'audio/sfx-tension-reveal.wav', volume: 0.42, duration: 64 },

  // ==================== SCENE 5: DUAL-THEME SWEEP + CLOSED AI LOOP ====================
  { from: S5 + 48, file: 'audio/sfx-scan-sweep.wav', volume: 0.3, duration: 45 },
  { from: S5 + 198, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { from: S5 + 324, file: 'audio/sfx-success-chord.wav', volume: 0.54, duration: 64 },

  // ==================== SCENE 6: META BOOTSTRAP + OFFICIAL ARCHIFY FINALE ====================
  { from: S6 + 86, file: 'audio/sfx-brand-chime.wav', volume: 0.6, duration: 92 },
];

export const SoundTrack: React.FC = () => {
  return (
    <>
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

      {SFX_CUES.map((cue, idx) => (
        <Sequence
          key={`${cue.file}-${idx}`}
          from={cue.from}
          durationInFrames={cue.duration ?? 60}
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume ?? 0.4} />
        </Sequence>
      ))}
    </>
  );
};
