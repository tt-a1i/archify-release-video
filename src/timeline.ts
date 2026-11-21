export const SCENE_DURATIONS = {
  scene1: 465, // 15.5s: Minimal Brand Sting -> AI Era Premise -> Prompt & Green CI Illusion -> Why CI Can't Stop Drift -> Portal
  scene2: 785, // 26.2s: Code Analysis Trilogy — 2D Atlas (6 Langs + Sector Zoom + Cycle + PR Diff) -> 3D Particle Tree -> Classic Overlay + Bridge
  scene3: 665, // 22.2s: 10 Native Diagrams -> Story Choreography Engine (Pulse Billing #5: Arch -> Seq Morph + Code -> ERD)
  scene4: 540, // 18.0s: Real PR Cases (Tokio #1657 Dolly Pan + Vue #2532 Macro-Dive 22->22 / 2->6)
  scene5: 390, // 13.0s: Dual-Theme PR SVG Diagonal Sweep + Camera-Tracked Closed AI Loop
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
  TRANSITION_DURATION * 5; // 2985 frames = 99.5s @ 30fps
