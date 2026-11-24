import { SCENE_DURATIONS, TRANSITION_DURATION } from '../timeline';

export type SceneNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface ClipCaption {
  zh: string;
  en: string;
  /** Scene background is the dark Atlas stage. */
  dark?: boolean;
}

/** A frame range [from, to) of one scene, played in edit order. */
export interface Clip {
  scene: SceneNumber;
  from: number;
  to: number;
  /** Frames this clip overlaps the previous one (its incoming transition). */
  transitionIn: number;
  caption?: ClipCaption;
}

export const clipLength = (clip: Clip) => clip.to - clip.from;

/** Global start frame of every clip, accounting for overlapping transitions. */
export const clipStarts = (clips: readonly Clip[]): number[] => {
  const starts: number[] = [];
  clips.forEach((clip, i) => {
    starts.push(i === 0 ? 0 : starts[i - 1] + clipLength(clips[i - 1]) - clip.transitionIn);
  });
  return starts;
};

export const editLength = (clips: readonly Clip[]): number => {
  const starts = clipStarts(clips);
  const last = clips.length - 1;
  return starts[last] + clipLength(clips[last]);
};

/** The full film: every scene from start to end. */
export const FULL_FILM_CLIPS: readonly Clip[] = ([1, 2, 3, 4, 5, 6] as const).map((scene, i) => ({
  scene,
  from: 0,
  to: SCENE_DURATIONS[`scene${scene}`],
  transitionIn: i === 0 ? 0 : TRANSITION_DURATION,
}));

const CUT = 10;

/**
 * The 60-second cut. Frame ranges are scene-local and were chosen by looking
 * at the full film: one strongest shot per capability, no second PR case, no
 * "why not hand-code motion" comparison and no engine-bootstrap card.
 */
export const SIXTY_SECOND_CLIPS: readonly Clip[] = [
  // Hook: AI rewrites code fast; CI is green. Then what?
  { scene: 1, from: 60, to: 195, transitionIn: 0 },
  // Green CI while the architecture drifts, then what Archify is, morphing into the Atlas.
  { scene: 1, from: 250, to: 585, transitionIn: CUT },
  {
    scene: 2, from: 20, to: 180, transitionIn: CUT,
    caption: { zh: '整个仓库的依赖星图，六种语言', en: 'Your whole repo as a dependency atlas', dark: true },
  },
  {
    scene: 2, from: 380, to: 510, transitionIn: CUT,
    caption: { zh: '同一份数据，3D 看层级与复杂度', en: 'The same graph in 3D: layers and complexity', dark: true },
  },
  {
    scene: 2, from: 580, to: 730, transitionIn: CUT,
    caption: { zh: '问题直接标在你的架构图上', en: 'Findings land on your own architecture diagram' },
  },
  {
    scene: 3, from: 20, to: 85, transitionIn: CUT,
  },
  {
    scene: 3, from: 270, to: 420, transitionIn: CUT,
    caption: { zh: '一份 JSON，讲清一次架构改动', en: 'One JSON file tells the story of a change' },
  },
  {
    scene: 3, from: 450, to: 560, transitionIn: CUT,
    caption: { zh: '架构图无缝切成时序图', en: 'Architecture morphs into a sequence diagram' },
  },
  {
    scene: 3, from: 700, to: 800, transitionIn: CUT,
    caption: { zh: '再切到数据表结构', en: '…and into the database schema' },
  },
  {
    scene: 4, from: 300, to: 470, transitionIn: CUT,
    caption: { zh: '真实 PR：找出 Vue\u00a0#2532 里藏着的复杂度', en: 'Real PR: the complexity hidden in Vue #2532' },
  },
  {
    scene: 5, from: 30, to: 160, transitionIn: CUT,
    caption: { zh: '导出动态 SVG、演示页或 1080p 视频', en: 'Export animated SVG, a stage page or 1080p video' },
  },
  {
    scene: 5, from: 220, to: 370, transitionIn: CUT,
    caption: { zh: '问题交给 Coding Agent 修，再一键复检', en: 'Hand the fix to your coding agent, then re-check' },
  },
  // Brand lockup and install command.
  { scene: 6, from: 100, to: 240, transitionIn: CUT },
];
