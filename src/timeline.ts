export const SCENE_DURATIONS = {
  scene1: 620, // 20.7s: Brand Sting -> AI Era & Green CI -> PR #1..#47 Gradual Drift -> What We Built -> Live Diagram Morph into Atlas
  scene2: 870, // 29.0s: Code Analysis Trilogy — 2D Atlas (Radar Signals) -> 3D Particle Tree -> Enriched Classic Overlay + Workbench + Bridge
  scene3: 820, // 27.3s: 10 Native Diagrams -> Why Declarative Choreography > Direct AI Hand-Coding -> Pulse Billing #5 (Arch -> Seq+Code -> ERD)
  scene4: 540, // 18.0s: Real PR Cases (Tokio #1657 Dolly Pan + Vue #2532 Macro-Dive 22->22 / 2->6)
  scene5: 390, // 13.0s: Dual-Theme PR/MR SVG Sweep (4 Presets + Remotion/Video Pipeline) + Camera-Tracked Closed AI Loop
  scene6: 240, //  8.0s: Engine Bootstrap Pullback + Official Light Archify Lockup Finale
} as const;

export const TRANSITION_DURATION = 20;

export const TOTAL_DURATION =
  SCENE_DURATIONS.scene1 +
  SCENE_DURATIONS.scene2 +
  SCENE_DURATIONS.scene3 +
  SCENE_DURATIONS.scene4 +
  SCENE_DURATIONS.scene5 +
  SCENE_DURATIONS.scene6 -
  TRANSITION_DURATION * 5; // 3380 frames = 112.7s @ 30fps
