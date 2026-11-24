import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { FULL_FILM_CLIPS, clipStarts, type Clip } from '../cut/clips';

interface SfxCue {
  /** Scene number (1-6) and frame inside that scene. */
  scene: number;
  at: number;
  file: string;
  volume?: number;
  duration?: number;
}

const SFX_CUES: SfxCue[] = [
  // ==================== SCENE 1: BRAND STING -> PROMPT -> PR #1..#47 DRIFT -> WHAT WE BUILT -> PORTAL ====================
  { scene: 1, at: 2, file: 'audio/sfx-brand-chime.wav', volume: 0.55, duration: 75 },
  // Prompt typing keyclicks (frames 104..136)
  { scene: 1, at: 106, file: 'audio/sfx-key-tap.wav', volume: 0.24, duration: 5 },
  { scene: 1, at: 112, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { scene: 1, at: 118, file: 'audio/sfx-key-tap.wav', volume: 0.24, duration: 5 },
  { scene: 1, at: 124, file: 'audio/sfx-key-tap.wav', volume: 0.22, duration: 5 },
  { scene: 1, at: 130, file: 'audio/sfx-key-tap.wav', volume: 0.25, duration: 5 },
  // Green CI checkmarks pop in
  { scene: 1, at: 140, file: 'audio/sfx-ci-ding.wav', volume: 0.44, duration: 30 },
  // PR #1 -> #12 -> #28 -> #47 corruption milestones under green CI!
  { scene: 1, at: 242, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 15 },
  { scene: 1, at: 278, file: 'audio/sfx-tension-reveal.wav', volume: 0.52, duration: 52 },
  { scene: 1, at: 318, file: 'audio/sfx-radar-ping.wav', volume: 0.28, duration: 15 },
  // "What We Built" Archify Code Analysis overlay reveal over live drifted diagram
  { scene: 1, at: 378, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  // Live drifted architecture directly morphs into Obsidian Atlas ring! (Full 85f tail — zero cut-off!)
  { scene: 1, at: 506, file: 'audio/sfx-portal-whoosh.wav', volume: 0.56, duration: 85 },

  // ==================== SCENE 2: 2D ATLAS -> 3D PARTICLE TREE -> EXPANDED CLASSIC OVERLAY ====================
  // Radar sweep discovering architectural signals + 6 languages
  { scene: 2, at: 18, file: 'audio/sfx-radar-ping.wav', volume: 0.22, duration: 24 },
  { scene: 2, at: 34, file: 'audio/sfx-radar-ping.wav', volume: 0.22, duration: 24 },
  { scene: 2, at: 52, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  { scene: 2, at: 70, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  // Sector Zoom dolly push-in
  { scene: 2, at: 108, file: 'audio/sfx-zoom-slide.wav', volume: 0.26, duration: 36 },
  // PR Diff feathered scan curtain
  { scene: 2, at: 272, file: 'audio/sfx-scan-sweep.wav', volume: 0.3, duration: 45 },
  // 2D Atlas -> 3D Particle Tree dimensional lift-off! (Full generous duration so decay never clips!)
  { scene: 2, at: 348, file: 'audio/sfx-3d-ascend.wav', volume: 0.56, duration: 110 },
  // Classic Diagram Overlay diagonal wipe & Code Analysis ON optical curtain
  { scene: 2, at: 556, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { scene: 2, at: 602, file: 'audio/sfx-scan-sweep.wav', volume: 0.28, duration: 45 },
  // Billing Core Source Evidence & Drift Inspector opens!
  { scene: 2, at: 676, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },

  // ==================== SCENE 3: 10 DIAGRAMS -> DECLARATIVE COMPILER -> PULSE BILLING #5 ====================
  { scene: 3, at: 6, file: 'audio/sfx-zoom-slide.wav', volume: 0.22, duration: 36 },
  // Declarative JSON vs Direct AI Hand-coding beat
  { scene: 3, at: 96, file: 'audio/sfx-zoom-slide.wav', volume: 0.22, duration: 36 },
  // JSON compiles directly into live Pulse Billing #5 Architecture!
  { scene: 3, at: 242, file: 'audio/sfx-scan-sweep.wav', volume: 0.26, duration: 45 },
  // Cross-view morph Architecture -> Sequence
  { scene: 3, at: 452, file: 'audio/sfx-zoom-slide.wav', volume: 0.26, duration: 36 },
  // Git-pinned code slide in
  { scene: 3, at: 572, file: 'audio/sfx-radar-ping.wav', volume: 0.24, duration: 24 },
  // Morph to ERD migration
  { scene: 3, at: 690, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },

  // ==================== SCENE 4: REAL PR CASES (TOKIO #1657 + VUE #2532) ====================
  { scene: 4, at: 118, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { scene: 4, at: 238, file: 'audio/sfx-scan-sweep.wav', volume: 0.28, duration: 45 },
  { scene: 4, at: 328, file: 'audio/sfx-tension-reveal.wav', volume: 0.42, duration: 64 },

  // ==================== SCENE 5: DUAL-THEME SWEEP + CLOSED AI LOOP ====================
  { scene: 5, at: 48, file: 'audio/sfx-scan-sweep.wav', volume: 0.3, duration: 45 },
  { scene: 5, at: 198, file: 'audio/sfx-zoom-slide.wav', volume: 0.24, duration: 36 },
  { scene: 5, at: 324, file: 'audio/sfx-success-chord.wav', volume: 0.54, duration: 64 },

  // ==================== SCENE 6: META BOOTSTRAP + OFFICIAL ARCHIFY FINALE ====================
  { scene: 6, at: 86, file: 'audio/sfx-brand-chime.wav', volume: 0.6, duration: 92 },
];

/**
 * Place each scene-local cue on the global timeline of the given edit. A cue
 * plays only when its frame falls inside a clip of its scene, so cuts carry
 * their sound effects with them.
 */
const placeCues = (clips: readonly Clip[]) => {
  const starts = clipStarts(clips);
  const placed: Array<SfxCue & { from: number }> = [];
  for (const cue of SFX_CUES) {
    clips.forEach((clip, i) => {
      if (clip.scene === cue.scene && cue.at >= clip.from && cue.at < clip.to) {
        placed.push({ ...cue, from: starts[i] + cue.at - clip.from });
      }
    });
  }
  return placed;
};

export const SoundTrack: React.FC<{ clips?: readonly Clip[]; totalFrames: number }> = ({
  clips = FULL_FILM_CLIPS,
  totalFrames,
}) => {
  return (
    <>
      <Audio
        src={staticFile('audio/bgm-pulse.wav')}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, totalFrames - 75, totalFrames],
            [0, 0.38, 0.38, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
        }
      />

      {placeCues(clips).map((cue, idx) => (
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
