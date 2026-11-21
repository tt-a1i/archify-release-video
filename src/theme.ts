export const COLORS = {
  // Official Archify Light-First Palette (from website/src/styles/site.css)
  paper: '#F5F6F3',
  paperSoft: '#EEF0EC',
  surface: '#FFFFFF',
  sunken: '#ECEEE9',
  ink: '#121417',
  inkSoft: '#272B33',
  muted: '#5A616E',
  dim: '#8A92A0',
  line: 'rgba(18, 20, 23, 0.10)',
  lineHi: 'rgba(18, 20, 23, 0.18)',

  // Official Brand Lockup & Editorial Accents
  brandBlue: '#0856F5',
  brandTeal: '#1DBBB7',
  ember: '#E2500E',
  emberLight: '#F08A4B',
  emberDeep: '#D6264F',

  // Light-mode Semantic Signals (crisp & vivid on architectural paper)
  frontend: '#0891B2',
  backend: '#059669',
  signal: '#0D9488',
  database: '#7C3AED',
  cloud: '#D97706',
  security: '#E11D48',
  messagebus: '#EA580C',
  external: '#64748B',

  // Obsidian High-Tech Stage Palette (exclusively for Atlas Tech Showcase & Code Excerpts)
  darkBg: '#060911',
  darkSurface: '#0D1322',
  darkBorder: 'rgba(148, 163, 184, 0.18)',
  darkInk: '#F1F5F9',
  darkMuted: '#94A3B8',
  neonCyan: '#22D3EE',
  neonGreen: '#34D399',
  neonViolet: '#A78BFA',
  neonAmber: '#FBBF24',
  neonRose: '#FB7185',
  neonOrange: '#FB923C',
  neonEmber: '#FF6A2B',
} as const;

export const FONTS = {
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  display: '"Space Grotesk", "Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif',
  sans: '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, -apple-system, sans-serif',
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInCubic = (t: number) => {
  const x = clamp01(t);
  return x * x * x;
};
export const easeInOutCubic = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutExpo = (t: number) => {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
export const easeInOutQuart = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
};

export const progressBetween = (frame: number, start: number, end: number) =>
  clamp01((frame - start) / Math.max(1, end - start));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
