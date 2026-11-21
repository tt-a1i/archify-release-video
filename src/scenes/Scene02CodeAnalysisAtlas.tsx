import React, { useMemo } from 'react';
import { useLocale } from '../locale';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CameraRig,
  EditorialPill,
  FloatingCaption,
  PaperCanvas,
  SemanticSigil,
  SigilKind,
} from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
  clamp01,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  easeOutExpo,
  lerp,
  progressBetween,
} from '../theme';

interface ModuleDef {
  id: string;
  label: string;
  fileCount: number;
  hue: number;
  prStats?: string;
}

interface FileDef {
  id: number;
  mod: number;
  spikes: number[];
  baseSpikes?: number[];
  prMark?: 'added' | 'modified';
}

interface EdgeDef {
  from: number;
  to: number;
  isCycle?: boolean;
  isRemovedInPR?: boolean;
  isDrift?: boolean;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODULES: ModuleDef[] = [
  { id: 'api', label: 'api/routes', fileCount: 7, hue: 192, prStats: '+1 ◇2' },
  { id: 'billing', label: 'core/billing', fileCount: 9, hue: 158, prStats: '+3 ◇2 −1' },
  { id: 'queue', label: 'runtime/queue', fileCount: 6, hue: 28, prStats: '+2' },
  { id: 'ledger', label: 'domain/ledger', fileCount: 8, hue: 266, prStats: '◇1' },
  { id: 'auth', label: 'security/auth', fileCount: 6, hue: 348 },
  { id: 'compiler', label: 'ir/compiler', fileCount: 8, hue: 215 },
  { id: 'storage', label: 'infra/storage', fileCount: 7, hue: 285 },
  { id: 'audit', label: 'legacy/audit', fileCount: 5, hue: 42, prStats: '−2' },
];

// 6 Supported Static Analysis Languages displayed on clean outer left/right flanks around the Atlas!
const ORBITAL_LANGUAGES = [
  { name: 'TypeScript / JS', sub: 'AST + ESM calls', x: 1765, y: 318, isRight: true, color: '#38BDF8' },
  { name: 'Python', sub: 'Pyright parser', x: 1775, y: 526, isRight: true, color: '#FBBF24' },
  { name: 'Java', sub: 'Static lexical', x: 1765, y: 734, isRight: true, color: '#FB923C' },
  { name: 'Go', sub: 'go.mod packages', x: 155, y: 734, isRight: false, color: '#22D3EE' },
  { name: 'Rust', sub: 'Cargo + traits', x: 145, y: 526, isRight: false, color: '#FB7185' },
  { name: 'C / C++', sub: 'libclang DB', x: 155, y: 318, isRight: false, color: '#A78BFA' },
];

// 4 Real Archify Code Analysis Rule Signals that ignite sequentially the moment the Radar Sweep crosses their sector!
const RADAR_ARCH_SIGNALS = [
  {
    id: 'sig-cycle',
    modIdx: 1, // core/billing (~ -0.58 rad, top-right)
    code: 'coupling/cycle',
    detail: '3-module import loop',
    bx: 1455,
    by: 196,
    alignRight: false,
    color: COLORS.neonRose,
  },
  {
    id: 'sig-complexity',
    modIdx: 3, // domain/ledger (~ +1.05 rad, bottom-right)
    code: 'complexity/function',
    detail: 'Max CC 25 · deep nesting',
    bx: 1455,
    by: 836,
    alignRight: false,
    color: COLORS.neonAmber,
  },
  {
    id: 'sig-boundary',
    modIdx: 5, // ir/compiler -> infra (~ +2.65 rad, bottom-left)
    code: 'architecture/boundary',
    detail: 'layer bypass detected',
    bx: 465,
    by: 836,
    alignRight: true,
    color: COLORS.neonCyan,
  },
  {
    id: 'sig-leak',
    modIdx: 7, // legacy/audit (~ +4.05 rad, top-left)
    code: 'coupling/internal-leak',
    detail: 'undeclared hub fan-in',
    bx: 465,
    by: 196,
    alignRight: true,
    color: COLORS.neonViolet,
  },
];

function buildAtlasData() {
  const rand = mulberry32(20261121);
  const files: FileDef[] = [];
  let fid = 0;
  MODULES.forEach((m, mi) => {
    for (let j = 0; j < m.fileCount; j++) {
      const fnCount = 2 + Math.floor(rand() * 4);
      const spikes: number[] = [];
      for (let k = 0; k < fnCount; k++) {
        const base =
          mi === 1 && j === 3 && k === 1
            ? 25
            : mi === 5 && j === 4
            ? 22
            : 4 + Math.floor(rand() * 14);
        spikes.push(base);
      }
      let prMark: 'added' | 'modified' | undefined;
      let baseSpikes: number[] | undefined;
      if (mi === 1 && (j === 1 || j === 5 || j === 7)) prMark = 'added';
      else if (mi === 1 && (j === 3 || j === 4)) {
        prMark = 'modified';
        baseSpikes = spikes.map((s) => Math.max(2, Math.round(s * 0.45)));
      } else if (mi === 2 && (j === 2 || j === 4)) prMark = 'added';
      else if (mi === 0 && j === 2) {
        prMark = 'modified';
        baseSpikes = spikes.map((s) => Math.max(2, s - 4));
      } else if (mi === 3 && j === 2) {
        prMark = 'modified';
        baseSpikes = spikes.map((s) => Math.max(2, s - 3));
      }
      files.push({ id: fid++, mod: mi, spikes, baseSpikes, prMark });
    }
  });

  const edges: EdgeDef[] = [];
  const modOffsets: number[] = [];
  let acc = 0;
  MODULES.forEach((m) => {
    modOffsets.push(acc);
    acc += m.fileCount;
  });

  for (let i = 0; i < 126; i++) {
    const a = Math.floor(rand() * files.length);
    const b = Math.floor(rand() * files.length);
    if (a !== b) edges.push({ from: a, to: b });
  }

  const bFile = modOffsets[1] + 3;
  const lFile = modOffsets[3] + 2;
  const aFile = modOffsets[4] + 2;
  edges.push({ from: bFile, to: lFile, isCycle: true });
  edges.push({ from: lFile, to: aFile, isCycle: true });
  edges.push({ from: aFile, to: bFile, isCycle: true });

  edges.push({ from: modOffsets[1] + 2, to: modOffsets[7] + 1, isRemovedInPR: true });
  edges.push({ from: modOffsets[1] + 4, to: modOffsets[7] + 3, isRemovedInPR: true });
  edges.push({ from: modOffsets[1] + 5, to: modOffsets[2] + 2, isDrift: true });
  edges.push({ from: modOffsets[0] + 2, to: modOffsets[1] + 1, isDrift: true });

  return { files, edges, cyclePath: [bFile, lFile, aFile] };
}

// ==================== TRUE 3D ATLAS PARTICLE TREE MODEL ====================
interface TreeBranch {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  width: number;
  layer: number;
  label?: string;
}
interface TreeParticle {
  // Starting position right on the 2D Atlas circular ring floor (y = -220)!
  startX: number;
  startZ: number;
  // Final elevated 3D position in the Particle Tree!
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  isBlossom: boolean;
  layer: number;
  phase: number;
}
interface TreeThread {
  a: [number, number, number];
  b: [number, number, number];
  highlight?: boolean;
  seed: number;
}

function buildAtlas3DTree() {
  const rand = mulberry32(314159);
  const branches: TreeBranch[] = [];
  const particles: TreeParticle[] = [];
  const threads: TreeThread[] = [];

  const trunkBase: [number, number, number] = [0, -225, 0];
  const trunkTop: [number, number, number] = [0, -24, 0];
  branches.push({
    from: trunkBase,
    to: trunkTop,
    color: COLORS.neonGreen,
    width: 6.5,
    layer: 0,
    label: 'core/shared (trunk)',
  });

  // Trunk particles rise from inner ring floor into a luminous vertical core column
  for (let i = 0; i < 72; i++) {
    const t = rand();
    const ang = rand() * Math.PI * 2;
    const rad = 7 + rand() * 22;
    const floorR = 90 + rand() * 140;
    particles.push({
      startX: Math.cos(ang) * floorR,
      startZ: Math.sin(ang) * floorR,
      x: Math.cos(ang) * rad,
      y: lerp(-220, -22, t),
      z: Math.sin(ang) * rad,
      r: 1.6 + rand() * 2.4,
      color: COLORS.neonGreen,
      isBlossom: false,
      layer: 0,
      phase: rand() * Math.PI * 2,
    });
  }

  const l1Tips: [number, number, number][] = [];
  const l2Tips: [number, number, number][] = [];
  const modLabels = ['core/billing', 'api/routes', 'domain/ledger', 'ir/compiler', 'security/auth'];
  const modColors = [COLORS.neonGreen, COLORS.neonCyan, COLORS.neonViolet, COLORS.neonAmber, COLORS.neonRose];

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.35;
    const r = 185 + (i % 2) * 38;
    const y = 78 + (i % 3) * 32;
    const tip: [number, number, number] = [Math.cos(a) * r, y, Math.sin(a) * r];
    l1Tips.push(tip);
    branches.push({
      from: trunkTop,
      to: tip,
      color: modColors[i],
      width: 3.6,
      layer: 1,
      label: modLabels[i],
    });

    // Layer 1 module blossom cluster (launches up from corresponding ring arc!)
    for (let p = 0; p < 38; p++) {
      const pa = rand() * Math.PI * 2;
      const pb = (rand() - 0.5) * Math.PI;
      const pr = 12 + rand() * 58;
      const floorA = a + (rand() - 0.5) * 0.5;
      const floorR = 235 + (rand() - 0.5) * 32;
      const isHot = p < 5 && (i === 0 || i === 4);
      particles.push({
        startX: Math.cos(floorA) * floorR,
        startZ: Math.sin(floorA) * floorR,
        x: tip[0] + Math.cos(pa) * Math.cos(pb) * pr,
        y: tip[1] + Math.sin(pb) * pr * 0.85,
        z: tip[2] + Math.sin(pa) * Math.cos(pb) * pr,
        r: isHot ? 5.2 + rand() * 3.2 : 1.7 + rand() * 3.0,
        color: isHot ? (i === 4 ? COLORS.neonRose : COLORS.neonAmber) : modColors[i],
        isBlossom: p < 18,
        layer: 1,
        phase: rand() * Math.PI * 2,
      });
    }

    // 2 Layer-2 crown branches per Layer-1 module
    for (let k = 0; k < 2; k++) {
      const subA = a + (k === 0 ? -0.35 : 0.35);
      const subR = r + 105 + rand() * 42;
      const subY = y + 98 + rand() * 50;
      const subTip: [number, number, number] = [Math.cos(subA) * subR, subY, Math.sin(subA) * subR];
      l2Tips.push(subTip);
      branches.push({ from: tip, to: subTip, color: modColors[i], width: 2.1, layer: 2 });

      for (let p = 0; p < 26; p++) {
        const pa = rand() * Math.PI * 2;
        const pb = (rand() - 0.5) * Math.PI;
        const pr = 10 + rand() * 46;
        const floorA = subA + (rand() - 0.5) * 0.4;
        const floorR = 260 + (rand() - 0.5) * 40;
        const isWarn = p < 3 && (i === 0 || i === 3);
        particles.push({
          startX: Math.cos(floorA) * floorR,
          startZ: Math.sin(floorA) * floorR,
          x: subTip[0] + Math.cos(pa) * Math.cos(pb) * pr,
          y: subTip[1] + Math.sin(pb) * pr * 0.85,
          z: subTip[2] + Math.sin(pa) * Math.cos(pb) * pr,
          r: isWarn ? 5.0 : 1.5 + rand() * 2.5,
          color: isWarn ? COLORS.neonAmber : modColors[i],
          isBlossom: p < 14,
          layer: 2,
          phase: rand() * Math.PI * 2,
        });
      }
    }
  }

  for (let i = 0; i < l1Tips.length; i++) {
    const next = (i + 1) % l1Tips.length;
    threads.push({ a: l1Tips[i], b: l1Tips[next], highlight: i === 0 || i === 3, seed: i * 0.23 });
  }
  for (let i = 0; i < l2Tips.length; i++) {
    const target = l2Tips[(i + 3) % l2Tips.length];
    threads.push({ a: l2Tips[i], b: target, highlight: i === 1 || i === 6, seed: 0.1 + i * 0.17 });
  }

  return { branches, particles, threads };
}

function project3D(
  p: [number, number, number],
  yaw: number,
  pitch: number,
  cx: number,
  cy: number,
  scale: number
) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = p[0] * cosY - p[2] * sinY;
  const z1 = p[0] * sinY + p[2] * cosY;

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = p[1] * cosP - z1 * sinP;
  const z2 = p[1] * sinP + z1 * cosP;

  const fov = 940;
  const depth = fov / (fov + z2 + 270);
  return {
    sx: cx + x1 * depth * scale,
    sy: cy - y2 * depth * scale,
    depth,
    z: z2,
  };
}

function computeAtlasGeometry(
  files: FileDef[],
  focusMod: number,
  focusAmount: number,
  cx: number,
  cy: number,
  R: number
) {
  const weights = files.map((f) => {
    if (focusMod < 0 || focusAmount <= 0) return 1;
    const target = f.mod === focusMod ? 3.1 : 0.52;
    return lerp(1, target, focusAmount);
  });
  const gap = 2.2;
  const totalSlots = weights.reduce((a, b) => a + b, 0) + gap * MODULES.length;
  const ang: number[] = new Array(files.length);
  const fileSpan: number[] = new Array(files.length);
  const span: [number, number][] = [];

  let k = 0;
  let fi = 0;
  MODULES.forEach((m, mi) => {
    const start = k;
    for (let j = 0; j < m.fileCount; j++) {
      ang[fi] = -Math.PI / 2 + (2 * Math.PI * (k + weights[fi] / 2)) / totalSlots;
      fileSpan[fi] = (2 * Math.PI * weights[fi]) / totalSlots;
      k += weights[fi];
      fi++;
    }
    span.push([
      -Math.PI / 2 + (2 * Math.PI * start) / totalSlots,
      -Math.PI / 2 + (2 * Math.PI * k) / totalSlots,
    ]);
    k += gap;
  });

  const pt = (a: number, r: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const mid = (mi: number) => (span[mi][0] + span[mi][1]) / 2;

  return {
    cx,
    cy,
    R,
    ang,
    fileSpan,
    span,
    pt,
    mid,
    spike0: R * 1.055,
    spikeMax: R * 0.38,
    arcR: R * 1.48,
    labelR: R * 1.61,
  };
}

function cubicPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  u: number
): [number, number] {
  const v = 1 - u;
  return [
    v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
  ];
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${x2.toFixed(
    2
  )} ${y2.toFixed(2)}`;
}

const ClassicOverlayNode: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  sigil: SigilKind;
  baseColor: string;
  halo?: 'red' | 'amber' | 'green' | 'blue' | 'grey';
  haloAlpha: number;
  badge?: string;
  pulse: number;
  selected?: boolean;
}> = ({ x, y, w, h, title, sub, sigil, baseColor, halo, haloAlpha, badge, pulse, selected }) => {
  const haloColor =
    halo === 'red'
      ? COLORS.security
      : halo === 'amber'
      ? COLORS.cloud
      : halo === 'blue'
      ? COLORS.brandBlue
      : halo === 'grey'
      ? '#64748B'
      : COLORS.backend;
  const isUnmapped = halo === 'grey';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      {halo && haloAlpha > 0.02 && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: 22,
            border: `${isUnmapped ? '2.5px dashed' : selected ? '4.5px solid' : '3.8px solid'} ${haloColor}`,
            boxShadow: isUnmapped
              ? 'none'
              : `0 0 ${halo === 'red' ? 24 + pulse * 18 : 20}px ${haloColor}${
                  halo === 'red' ? '99' : '55'
                }`,
            opacity: haloAlpha * (halo === 'red' ? 0.65 + pulse * 0.35 : isUnmapped ? 0.72 : 0.88),
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          border: `1.8px solid ${baseColor}88`,
          boxShadow: '0 14px 36px rgba(18,20,23,0.08)',
          padding: '15px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3.5, backgroundColor: baseColor }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <SemanticSigil kind={sigil} color={baseColor} size={19} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 17, fontWeight: 800, color: COLORS.ink, whiteSpace: 'nowrap' }}>
              {title}
            </span>
          </div>
          {badge && haloAlpha > 0.25 && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                fontWeight: 800,
                padding: '2.5px 9px',
                borderRadius: 999,
                backgroundColor: `${haloColor}18`,
                border: `1px solid ${haloColor}66`,
                color: haloColor,
                opacity: haloAlpha,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 13.5, color: COLORS.muted }}>{sub}</div>
      </div>
    </div>
  );
};

export const Scene02CodeAnalysisAtlas: React.FC = () => {
  const en = useLocale() === 'en';
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { files, edges, cyclePath } = useMemo(() => buildAtlasData(), []);
  const tree3D = useMemo(() => buildAtlas3DTree(), []);

  const particles = useMemo(() => {
    const rand = mulberry32(991);
    return Array.from({ length: 42 }).map((_, i) => ({
      x: rand() * 1920,
      y: rand() * 1080,
      r: 1.2 + rand() * 2.2,
      speed: 0.4 + rand() * 1.2,
      color: i % 3 === 0 ? COLORS.neonCyan : i % 3 === 1 ? COLORS.neonGreen : COLORS.neonViolet,
    }));
  }, []);

  // ==================== TRILOGY TIMELINE (730 frames = 24.3s) ====================
  // ACT 2A (0 - 355): 2D Radial Atlas + 6 Orbital Languages Radar + Sector Zoom + Cycle Comet + PR Diff Mode
  const orbitalPitchT = easeInOutQuart(progressBetween(frame, 14, 86));
  const radarAngle = -Math.PI / 2 + easeOutCubic(progressBetween(frame, 0, 88)) * Math.PI * 2.25;
  const radarAlpha = 1 - progressBetween(frame, 88, 114);
  const langOrbitAlpha =
    easeOutCubic(progressBetween(frame, 8, 32)) * (1 - easeInOutCubic(progressBetween(frame, 98, 120)));
  const spikeBloomT = easeOutExpo(progressBetween(frame, 12, 74));

  const sectorZoomIn = easeInOutQuart(progressBetween(frame, 108, 152));
  const sectorZoomBack = easeInOutCubic(progressBetween(frame, 194, 222));
  const prRefocus = easeInOutCubic(progressBetween(frame, 286, 322));
  const focusAmount = clamp01(sectorZoomIn - sectorZoomBack * 0.65 + prRefocus * 0.5);

  const cycleAlpha =
    easeOutCubic(progressBetween(frame, 196, 218)) *
    (1 - easeInOutCubic(progressBetween(frame, 268, 290)));

  const scanWipeT = easeInOutQuart(progressBetween(frame, 272, 314));
  const prModeAlpha = easeOutCubic(progressBetween(frame, 288, 318)) * (1 - progressBetween(frame, 344, 372));

  // ACT 2B (348 - 562): POLISHED 2D -> 3D DIMENSIONAL LIFT-OFF & ORBITING PARTICLE TREE!
  const shockwaveT = easeOutExpo(progressBetween(frame, 346, 396));
  const to3DTreeT = easeInOutQuart(progressBetween(frame, 350, 404));
  // 2D flat Atlas completely tilts flat, spins, and dissolves into the 3D floor pedestal (NO ghost wallpaper!)
  const atlas2DFadeOut = 1 - easeInOutCubic(progressBetween(frame, 358, 396));
  // Staggered 3-layer eruption from the 2D ring floor upward!
  const layer0Grow = easeOutExpo(progressBetween(frame, 368, 412));
  const layer1Grow = easeOutExpo(progressBetween(frame, 386, 440));
  const layer2Grow = easeOutExpo(progressBetween(frame, 408, 466));
  const verticalScanT = easeInOutCubic(progressBetween(frame, 374, 462));

  // Heroic sweeping 3D camera orbit (accelerates smoothly into rich isometric orbit + subtle push-in)
  const orbitProgress = easeInOutCubic(progressBetween(frame, 365, 560));
  const treeYaw = lerp(-0.35, 1.65, orbitProgress);
  const treePitch = lerp(0.06, 0.34, easeInOutCubic(progressBetween(frame, 372, 520)));
  const treeScale = lerp(1.02, 1.22, easeOutCubic(progressBetween(frame, 385, 535)));

  // ACT 2C (554 - 870): EXPANDED CLASSIC DIAGRAM OVERLAY ("原版架构图叠加改造", --ir) + Live Evidence Inspector + Unhurried Bridge!
  const classicWipeT = easeInOutQuart(progressBetween(frame, 554, 588));
  const overlayToggleT = easeOutCubic(progressBetween(frame, 600, 620));
  const toggleClickBounce = spring({
    frame: Math.max(0, frame - 600),
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const overlayScanT = easeInOutCubic(progressBetween(frame, 604, 666));
  const scanX = lerp(130, 1760, overlayScanT);
  // Each node's diagnostic halo illuminates right as the feathered optical curtain sweeps past it!
  const apiHaloT = clamp01((scanX - 240) / 170) * overlayToggleT;
  const billingHaloT = clamp01((scanX - 720) / 180) * overlayToggleT;
  const ledgerHaloT = clamp01((scanX - 1240) / 180) * overlayToggleT;
  const driftLineT = clamp01((scanX - 1140) / 220) * overlayToggleT;

  // NEW Deep-Dive Beat (674 - 796): Focus Billing Core + Slide in Archify Code Analysis Evidence Inspector Drawer!
  const inspectorIn = spring({
    frame: Math.max(0, frame - 674),
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  const inspectorOut = easeInOutCubic(progressBetween(frame, 778, 804));
  const inspectorT = clamp01(inspectorIn - inspectorOut);

  const classicCamPush = easeInOutCubic(progressBetween(frame, 646, 706));
  // Narrative bridge fades in smoothly (788..816) and HOLDS crisp & comfortable until frame 870 (~2.2s)!
  const bridgeToStoryT = easeInOutCubic(progressBetween(frame, 788, 816));
  const redPulse = 0.5 + 0.5 * Math.sin((frame - 615) * 0.22);

  // ==================== 2D ATLAS CAMERA RIG ====================
  const camRotX =
    lerp(54, 0, orbitalPitchT) +
    lerp(0, 7, sectorZoomIn) * (1 - sectorZoomBack) +
    lerp(0, 78, to3DTreeT);
  const camRotZ = lerp(-20, 0, orbitalPitchT) + lerp(0, 48, to3DTreeT);
  const camRotY = lerp(0, -9, sectorZoomIn) * (1 - sectorZoomBack);
  const camZoom =
    lerp(1.14, 0.96, orbitalPitchT) *
    lerp(1.0, 1.28, sectorZoomIn * (1 - sectorZoomBack * 0.85)) *
    lerp(1.0, 0.78, to3DTreeT);
  const camX = lerp(0, 185, sectorZoomIn * (1 - sectorZoomBack * 0.85)) * (1 - to3DTreeT);
  const camY =
    lerp(20, -14, orbitalPitchT) +
    lerp(0, -54, sectorZoomIn * (1 - sectorZoomBack * 0.85)) +
    lerp(0, -250, to3DTreeT);

  const geo = computeAtlasGeometry(files, 1, focusAmount, 960, 526, 244);

  const cycleComet = useMemo(() => {
    if (cycleAlpha <= 0.01) return null;
    const total = ((frame - 196) / 24) % cyclePath.length;
    const pts: [number, number][] = [];
    for (let s = 0; s < 10; s++) {
      let t = total - s * 0.025;
      while (t < 0) t += cyclePath.length;
      const hop = Math.floor(t) % cyclePath.length;
      const u = t - Math.floor(t);
      const a = cyclePath[hop];
      const b = cyclePath[(hop + 1) % cyclePath.length];
      const ma = files[a].mod;
      const mb = files[b].mod;
      pts.push(
        cubicPoint(
          geo.pt(geo.ang[a], geo.R * 0.985),
          geo.pt(geo.mid(ma), geo.R * 0.42),
          geo.pt(geo.mid(mb), geo.R * 0.42),
          geo.pt(geo.ang[b], geo.R * 0.985),
          u
        )
      );
    }
    return pts;
  }, [cycleAlpha, frame, cyclePath, files, geo]);

  const billingMid = geo.mid(1);
  const billingAnchor = geo.pt(billingMid, geo.arcR + 10);

  // ==================== TRUE 3D PROJECTION & SPIRAL ELEVATION ====================
  const projectedTree = useMemo(() => {
    if (to3DTreeT <= 0.02) return null;
    const cx = 960;
    const cy = 625;

    const layerGrowth = [layer0Grow, layer1Grow, layer2Grow];

    const projBranches = tree3D.branches.map((b) => {
      const g = layerGrowth[b.layer] ?? layer2Grow;
      const growTo: [number, number, number] = [
        lerp(b.from[0], b.to[0], g),
        lerp(b.from[1], b.to[1], g),
        lerp(b.from[2], b.to[2], g),
      ];
      // Midpoint lifted slightly to give organic curved branch feel
      const mid3D: [number, number, number] = [
        (b.from[0] + growTo[0]) / 2,
        (b.from[1] + growTo[1]) / 2 + 24 * g,
        (b.from[2] + growTo[2]) / 2,
      ];
      const p0 = project3D(b.from, treeYaw, treePitch, cx, cy, treeScale);
      const pm = project3D(mid3D, treeYaw, treePitch, cx, cy, treeScale);
      const p1 = project3D(growTo, treeYaw, treePitch, cx, cy, treeScale);
      return { ...b, p0, pm, p1, g };
    });

    const projThreads = tree3D.threads.map((th) => {
      const p0 = project3D(th.a, treeYaw, treePitch, cx, cy, treeScale);
      const p1 = project3D(th.b, treeYaw, treePitch, cx, cy, treeScale);
      // Animated light packet traveling along highlighted 3D cross-module thread!
      const u = ((frame - 410) * 0.018 + th.seed) % 1;
      const pulsePt: [number, number, number] = [
        lerp(th.a[0], th.b[0], u),
        lerp(th.a[1], th.b[1], u) + Math.sin(u * Math.PI) * 36,
        lerp(th.a[2], th.b[2], u),
      ];
      const pPulse = project3D(pulsePt, treeYaw, treePitch, cx, cy, treeScale);
      return { ...th, p0, p1, pPulse };
    });

    // Every particle physically launches from the 2D Atlas floor (startX, -225, startZ) with spiral swirl!
    const projParticles = tree3D.particles
      .map((pt) => {
        const g = layerGrowth[pt.layer] ?? layer2Grow;
        const swirl = (1 - g) * 0.85;
        const cosS = Math.cos(swirl);
        const sinS = Math.sin(swirl);
        const rawX = lerp(pt.startX, pt.x, g);
        const rawZ = lerp(pt.startZ, pt.z, g);
        const x = rawX * cosS - rawZ * sinS;
        const z = rawX * sinS + rawZ * cosS;
        const y = lerp(-225, pt.y, g);
        const proj = project3D([x, y, z], treeYaw, treePitch, cx, cy, treeScale);
        const twinkle = 0.78 + 0.22 * Math.sin(frame * 0.14 + pt.phase);
        return { ...pt, ...proj, g, twinkle };
      })
      .sort((a, b) => b.z - a.z);

    // True 3D-projected holographic floor pedestal rings (orbits in 100% locked sync with the 3D Tree!)
    const makeFloorRing = (radius: number) => {
      const pts: string[] = [];
      for (let s = 0; s <= 48; s++) {
        const a = (s / 48) * Math.PI * 2;
        const fp = project3D([Math.cos(a) * radius, -225, Math.sin(a) * radius], treeYaw, treePitch, cx, cy, treeScale);
        pts.push(`${s === 0 ? 'M' : 'L'} ${fp.sx.toFixed(1)} ${fp.sy.toFixed(1)}`);
      }
      return pts.join(' ') + ' Z';
    };
    const floorRingOuter = makeFloorRing(275);
    const floorRingInner = makeFloorRing(155);
    const floorRadials = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
      const a = (idx / 8) * Math.PI * 2;
      const pA = project3D([Math.cos(a) * 155, -225, Math.sin(a) * 155], treeYaw, treePitch, cx, cy, treeScale);
      const pB = project3D([Math.cos(a) * 285, -225, Math.sin(a) * 285], treeYaw, treePitch, cx, cy, treeScale);
      return { pA, pB };
    });

    // Rising 3D holographic laser scan ring (projected ellipse at current scan height!)
    const scanY = lerp(-225, 245, verticalScanT);
    const scanPts: string[] = [];
    for (let s = 0; s <= 40; s++) {
      const a = (s / 40) * Math.PI * 2;
      const r = lerp(290, 340, verticalScanT);
      const sp = project3D([Math.cos(a) * r, scanY, Math.sin(a) * r], treeYaw, treePitch, cx, cy, treeScale);
      scanPts.push(`${s === 0 ? 'M' : 'L'} ${sp.sx.toFixed(1)} ${sp.sy.toFixed(1)}`);
    }

    return {
      projBranches,
      projThreads,
      projParticles,
      scanRingPath: scanPts.join(' ') + ' Z',
      floorRingOuter,
      floorRingInner,
      floorRadials,
    };
  }, [to3DTreeT, tree3D, layer0Grow, layer1Grow, layer2Grow, verticalScanT, treeYaw, treePitch, treeScale, frame]);

  // Dynamic Mode Indicator & Product-Facing Captions (ZERO internal PR numbers!)
  const activeModeIdx = frame < 358 ? 0 : frame < 562 ? 1 : 2;
  let kicker = 'VIEW 1/3 · 2D ATLAS';
  let kickerColor: string = COLORS.neonCyan;
  let caption = en ? 'Map dependencies and complexity across TS/JS, Python, Java, Go, Rust, and C/C++.' : '原生支持 TS/JS、Python、Java、Go、Rust、C/C++ 六大语言静态解析：全仓星盘一眼洞穿依赖与复杂度';

  if (frame >= 108 && frame < 196) {
    kicker = 'ATLAS · SECTOR ZOOM';
    kickerColor = COLORS.neonGreen;
    caption = en ? 'Zoom into a hotspot to see its files and complexity spikes without overlap.' : '扇区聚焦缩放：镜头推入热点模块，圆内无遮挡展开全部文件与复杂度尖刺';
  } else if (frame >= 196 && frame < 278) {
    kicker = 'ATLAS · CYCLE & DRIFT';
    kickerColor = COLORS.neonRose;
    caption = en ? 'Trace import cycles and boundary violations, each linked to exact source lines.' : '光轨直击跨模块循环依赖与边界越权 —— 每条信号都绑定精确源码行号';
  } else if (frame >= 278 && frame < 358) {
    kicker = 'ATLAS · PR DIFF MODE';
    kickerColor = COLORS.neonGreen;
    caption = en ? 'Compare dependencies and complexity at the pinned baseline and PR head.' : '一键切入 PR 差异分析：固定基线与当前提交，增删改依赖与基线复杂度同屏对照';
  } else if (frame >= 358 && frame < 562) {
    kicker = 'VIEW 2/3 · ATLAS 3D TREE';
    kickerColor = COLORS.neonViolet;
    caption = en ? 'The same graph in 3D: height shows dependency layers, and particles show function complexity.' : '同一份静态分析数据三维升维：核心主干拔地而起，依赖层为高度、函数复杂度化作发光粒子云';
  } else if (frame >= 562 && frame < 678) {
    kicker = 'VIEW 3/3 · CLASSIC OVERLAY';
    kickerColor = COLORS.ember;
    caption = en ? 'Five diagnostic colors flag errors, warnings, info, clean nodes, and unmapped external dependencies.' : '原生架构图叠加改造：五色诊断光晕覆盖报错、告警、信息、洁净与未映射外部依赖，直指越界漂移连线';
  } else if (frame >= 678) {
    kicker = 'CLASSIC · WORKBENCH';
    kickerColor = COLORS.security;
    caption = en ? 'Prioritize findings, inspect source diffs, accept a baseline, or copy a task for your agent.' : '优先级清单 + 内嵌循环/复杂度迷你图 + 工作区 Diff 源码直连 — 支持 Baseline 接纳与一键复制 AI 任务';
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.darkBg, overflow: 'hidden' }}>
      {/* ==================== DARK SCI-FI STAGE (ACT 2A: 2D ATLAS + ACT 2B: 3D PARTICLE TREE) ==================== */}
      {classicWipeT < 0.99 && (
        <AbsoluteFill>
          {/* Ambient Core Glow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1320,
              height: 1320,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background:
                to3DTreeT > 0.35
                  ? `radial-gradient(circle, ${COLORS.neonViolet}2A 0%, ${COLORS.neonCyan}14 40%, transparent 72%)`
                  : cycleAlpha > 0.3
                  ? `radial-gradient(circle, ${COLORS.neonRose}24 0%, ${COLORS.brandBlue}12 42%, transparent 70%)`
                  : `radial-gradient(circle, ${COLORS.neonCyan}1E 0%, ${COLORS.neonGreen}10 40%, transparent 72%)`,
              filter: 'blur(48px)',
            }}
          />

          {/* Ambient Dust Particles */}
          <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: 0.42 }}>
            {particles.map((p, i) => (
              <circle
                key={i}
                cx={(p.x + frame * p.speed * 0.4) % 1920}
                cy={(p.y - frame * p.speed * 0.25 + 1080) % 1080}
                r={p.r}
                fill={p.color}
                opacity={0.35 + 0.45 * Math.sin(frame * 0.06 + i)}
              />
            ))}
          </svg>

          {/* Top-Left Minimal Badge */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              left: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              zIndex: 45,
            }}
          >
            <EditorialPill
              label={to3DTreeT > 0.4 ? 'ATLAS 3D · PARTICLE TREE' : 'CODE ANALYSIS · 6 LANGUAGES'}
              color={to3DTreeT > 0.4 ? COLORS.neonViolet : COLORS.neonCyan}
              dark
            />
            {to3DTreeT > 0.4 && (
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.darkMuted }}>
                TRUNK = CORE HUB · HEIGHT = TARJAN LAYER · BLOSSOM = COMPLEXITY
              </span>
            )}
          </div>

          {/* Top-Right Mode Breadcrumb */}
          <div
            style={{
              position: 'absolute',
              top: 38,
              right: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              zIndex: 45,
            }}
          >
            {['01 2D Atlas', '02 3D Particle Tree', '03 Classic Overlay'].map((m, i) => (
              <span
                key={m}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  fontWeight: activeModeIdx === i ? 800 : 500,
                  color: activeModeIdx === i ? '#FFFFFF' : COLORS.darkMuted,
                  borderBottom:
                    activeModeIdx === i ? `2.5px solid ${COLORS.neonCyan}` : '2.5px solid transparent',
                  paddingBottom: 3,
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* 2D ATLAS RING — tilts flat, spins, and cleanly dissolves into the 3D floor particles! */}
          {atlas2DFadeOut > 0.01 && (
            <CameraRig
              x={camX}
              y={camY}
              zoom={camZoom}
              rotateX={camRotX}
              rotateY={camRotY}
              rotateZ={camRotZ}
              perspective={1450}
            >
              <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ opacity: atlas2DFadeOut }}>
              <defs>
                <filter id="atlas-neon-rose" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="atlas-neon-cyan" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="radar-radial-fade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={COLORS.neonCyan} stopOpacity="0.03" />
                  <stop offset="56%" stopColor={COLORS.neonCyan} stopOpacity="0.16" />
                  <stop offset="88%" stopColor={COLORS.neonGreen} stopOpacity="0.34" />
                  <stop offset="100%" stopColor={COLORS.neonCyan} stopOpacity="0.02" />
                </radialGradient>
                <linearGradient id="pr-curtain-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={COLORS.neonCyan} stopOpacity="0" />
                  <stop offset="72%" stopColor={COLORS.neonCyan} stopOpacity="0.08" />
                  <stop offset="96%" stopColor={COLORS.neonGreen} stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id="pr-curtain-vmask" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="18%" stopColor="white" stopOpacity="1" />
                  <stop offset="82%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask id="pr-curtain-mask">
                  <rect x="0" y="70" width="1920" height="920" fill="url(#pr-curtain-vmask)" />
                </mask>
              </defs>

              {/* Outer Degree Reticle */}
              <g transform={`translate(${geo.cx}, ${geo.cy})`}>
                <circle r={geo.arcR + 78} fill="none" stroke={COLORS.neonCyan} strokeWidth={1} strokeDasharray="2 14" opacity={0.28} />
                <circle r={geo.arcR + 46} fill="none" stroke="rgba(148, 163, 184, 0.14)" strokeWidth={1} />
              </g>

              {/* Dimensional Lift-Off Shockwave Ring on the Floor Pedestal! */}
              {shockwaveT > 0.01 && shockwaveT < 0.99 && (
                <circle
                  cx={geo.cx}
                  cy={geo.cy}
                  r={lerp(20, 560, shockwaveT)}
                  fill="none"
                  stroke={COLORS.neonViolet}
                  strokeWidth={lerp(8, 1, shockwaveT)}
                  opacity={(1 - shockwaveT) * 0.9}
                  filter="url(#atlas-neon-cyan)"
                />
              )}

              <circle cx={geo.cx} cy={geo.cy} r={geo.R} fill="rgba(13, 19, 34, 0.72)" stroke="rgba(148, 163, 184, 0.26)" strokeWidth={1.3} />
              <circle cx={geo.cx} cy={geo.cy} r={geo.R * 0.42} fill="none" stroke="rgba(34, 211, 238, 0.18)" strokeDasharray="4 7" strokeWidth={1} />

              {/* Museum-Grade 18-Slice Feathered Phosphor Radar Sweep (Zero hard flat edge!) */}
              {radarAlpha > 0.01 && (() => {
                const radarR = geo.arcR + 12;
                const slices = 18;
                const totalArc = 0.92;
                const step = totalArc / slices;
                const tipRing = geo.pt(radarAngle, geo.R);
                const tipOuter = geo.pt(radarAngle, geo.arcR);
                return (
                  <g opacity={radarAlpha}>
                    {Array.from({ length: slices }).map((_, k) => {
                      const aEnd = radarAngle - k * step;
                      const aStart = aEnd - step * 1.15;
                      const decay = Math.pow(1 - k / slices, 2.35);
                      const x1 = geo.cx + Math.cos(aStart) * radarR;
                      const y1 = geo.cy + Math.sin(aStart) * radarR;
                      const x2 = geo.cx + Math.cos(aEnd) * radarR;
                      const y2 = geo.cy + Math.sin(aEnd) * radarR;
                      return (
                        <path
                          key={`rs-${k}`}
                          d={`M ${geo.cx} ${geo.cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radarR} ${radarR} 0 0 1 ${x2.toFixed(
                            1
                          )} ${y2.toFixed(1)} Z`}
                          fill="url(#radar-radial-fade)"
                          opacity={decay * 0.95}
                        />
                      );
                    })}
                    {/* Luminous leading arc shimmer along the outer precision ring */}
                    <path
                      d={describeArc(geo.cx, geo.cy, geo.arcR + 3, radarAngle - 0.32, radarAngle)}
                      fill="none"
                      stroke={COLORS.neonCyan}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      opacity={0.72}
                      filter="url(#atlas-neon-cyan)"
                    />
                    {/* Fine optical leading needle + precision ring beads */}
                    <line
                      x1={geo.cx}
                      y1={geo.cy}
                      x2={geo.cx + Math.cos(radarAngle) * radarR}
                      y2={geo.cy + Math.sin(radarAngle) * radarR}
                      stroke={COLORS.neonCyan}
                      strokeWidth={2.6}
                      opacity={0.48}
                      filter="url(#atlas-neon-cyan)"
                    />
                    <line
                      x1={geo.cx}
                      y1={geo.cy}
                      x2={geo.cx + Math.cos(radarAngle) * radarR}
                      y2={geo.cy + Math.sin(radarAngle) * radarR}
                      stroke="#E0F2FE"
                      strokeWidth={1.15}
                      opacity={0.92}
                    />
                    <circle cx={tipRing[0]} cy={tipRing[1]} r={4.2} fill="#FFFFFF" stroke={COLORS.neonCyan} strokeWidth={1.8} filter="url(#atlas-neon-cyan)" />
                    <circle cx={tipOuter[0]} cy={tipOuter[1]} r={3.4} fill={COLORS.neonGreen} filter="url(#atlas-neon-cyan)" />
                  </g>
                );
              })()}

              {/* Bundled Bezier Chords */}
              {edges.map((e, i) => {
                const ma = files[e.from].mod;
                const mb = files[e.to].mod;
                const p0 = geo.pt(geo.ang[e.from], geo.R * 0.985);
                const p3 = geo.pt(geo.ang[e.to], geo.R * 0.985);
                const p1 = ma === mb ? geo.pt(geo.ang[e.from], geo.R * 0.8) : geo.pt(geo.mid(ma), geo.R * 0.42);
                const p2 = ma === mb ? geo.pt(geo.ang[e.to], geo.R * 0.8) : geo.pt(geo.mid(mb), geo.R * 0.42);
                const d = `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} C ${p1[0].toFixed(1)} ${p1[1].toFixed(
                  1
                )}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}, ${p3[0].toFixed(1)} ${p3[1].toFixed(1)}`;

                if (e.isRemovedInPR) {
                  if (prModeAlpha <= 0.01) return null;
                  return (
                    <path key={`rm-${i}`} d={d} fill="none" stroke={COLORS.neonRose} strokeWidth={2.8} strokeDasharray="8 5" opacity={prModeAlpha * 0.95} filter="url(#atlas-neon-rose)" />
                  );
                }
                if (e.isDrift) {
                  return (
                    <path key={`dr-${i}`} d={d} fill="none" stroke={COLORS.neonGreen} strokeWidth={prModeAlpha > 0.2 ? 3 : 1.6} opacity={0.28 + Math.max(prModeAlpha, focusAmount * 0.45) * 0.7} />
                  );
                }
                if (e.isCycle && cycleAlpha > 0.01) {
                  return (
                    <path key={`cy-${i}`} d={d} fill="none" stroke={COLORS.neonRose} strokeWidth={3.4} opacity={cycleAlpha} filter="url(#atlas-neon-rose)" />
                  );
                }
                const touchesFocus = ma === 1 || mb === 1;
                const alpha = cycleAlpha > 0.25 ? 0.06 : focusAmount > 0.15 ? (touchesFocus ? 0.36 : 0.07) : 0.2;
                return (
                  <path key={`e-${i}`} d={d} fill="none" stroke={`hsl(${MODULES[ma].hue}, 72%, 64%)`} strokeWidth={touchesFocus && focusAmount > 0.2 ? 1.5 : 0.95} opacity={alpha} />
                );
              })}

              {/* Cycle Comet */}
              {cycleComet && (
                <g filter="url(#atlas-neon-rose)" opacity={cycleAlpha}>
                  {cycleComet.map((pt, idx) => (
                    <circle key={idx} cx={pt[0]} cy={pt[1]} r={Math.max(2, 9 - idx * 0.75)} fill={idx === 0 ? '#FFFFFF' : COLORS.neonRose} opacity={1 - idx * 0.095} />
                  ))}
                </g>
              )}

              {/* File Ticks & Complexity Spikes */}
              {files.map((f, fi) => {
                const m = MODULES[f.mod];
                const isFocusedMod = f.mod === 1;
                const dimmed = (cycleAlpha > 0.25 && !cyclePath.includes(fi)) || (focusAmount > 0.3 && !isFocusedMod && prModeAlpha < 0.2);
                const tick0 = geo.pt(geo.ang[fi], geo.R);
                const tick1 = geo.pt(geo.ang[fi], geo.R + geo.R * 0.044);
                return (
                  <g key={`f-${fi}`} opacity={dimmed ? 0.24 : 0.96}>
                    <line x1={tick0[0]} y1={tick0[1]} x2={tick1[0]} y2={tick1[1]} stroke={`hsl(${m.hue}, 74%, 66%)`} strokeWidth={isFocusedMod && focusAmount > 0.2 ? 2.6 : 1.5} />
                    {f.spikes.map((cxVal, si) => {
                      const n = f.spikes.length;
                      const sa = geo.ang[fi] + (n > 1 ? (si / (n - 1) - 0.5) * geo.fileSpan[fi] * 0.78 : 0);
                      const targetLen = geo.spikeMax * (0.08 + 0.92 * (Math.min(cxVal, 26) / 26)) * spikeBloomT;
                      const s0 = geo.pt(sa, geo.spike0);
                      const s1 = geo.pt(sa, geo.spike0 + targetLen);
                      const isHot = cxVal >= 16;
                      const baseVal = f.baseSpikes?.[si];
                      const baseEnd = baseVal != null ? geo.pt(sa + 0.006, geo.spike0 + geo.spikeMax * (0.08 + 0.92 * (Math.min(baseVal, 26) / 26))) : null;
                      const spikeColor =
                        prModeAlpha > 0.3 && f.prMark === 'added'
                          ? COLORS.neonGreen
                          : prModeAlpha > 0.3 && f.prMark === 'modified'
                          ? COLORS.neonAmber
                          : isHot
                          ? COLORS.neonAmber
                          : `hsl(${m.hue}, 70%, 64%)`;
                      return (
                        <g key={`sp-${fi}-${si}`}>
                          {baseEnd && prModeAlpha > 0.1 && (
                            <line x1={s0[0]} y1={s0[1]} x2={baseEnd[0]} y2={baseEnd[1]} stroke={COLORS.darkMuted} strokeWidth={2} strokeDasharray="3 3" opacity={prModeAlpha * 0.85} />
                          )}
                          <line x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]} stroke={spikeColor} strokeWidth={isHot || (isFocusedMod && focusAmount > 0.3) ? 3 : 1.8} strokeLinecap="round" />
                        </g>
                      );
                    })}
                    {prModeAlpha > 0.1 && f.prMark && (
                      <g opacity={prModeAlpha} transform={`translate(${geo.pt(geo.ang[fi], geo.R * 0.92)[0]}, ${geo.pt(geo.ang[fi], geo.R * 0.92)[1]})`}>
                        <circle r={9} fill={COLORS.darkBg} stroke={f.prMark === 'added' ? COLORS.neonGreen : COLORS.neonAmber} strokeWidth={2} />
                        <text textAnchor="middle" dominantBaseline="central" fill={f.prMark === 'added' ? COLORS.neonGreen : COLORS.neonAmber} fontFamily={FONTS.mono} fontSize={11.5} fontWeight={800}>
                          {f.prMark === 'added' ? '+' : '◇'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Outer Module Arcs & Labels */}
              {MODULES.map((m, mi) => {
                const [a0, a1] = geo.span[mi];
                const midA = (a0 + a1) / 2;
                const isFocused = mi === 1 && focusAmount > 0.2 && to3DTreeT < 0.2;
                const arcPath = describeArc(geo.cx, geo.cy, geo.arcR, a0, a1);
                const [lx, ly] = geo.pt(midA, geo.labelR);
                const leftSide = Math.cos(midA) < 0;
                return (
                  <g key={m.id}>
                    <path d={arcPath} fill="none" stroke={`hsl(${m.hue}, 74%, ${isFocused ? 68 : 58}%)`} strokeWidth={isFocused ? 7 : 3.8} strokeLinecap="round" opacity={isFocused ? 1 : focusAmount > 0.3 ? 0.32 : 0.88} />
                    <text x={lx} y={ly} textAnchor={leftSide ? 'end' : 'start'} dominantBaseline="central" fontFamily={FONTS.mono} fontSize={isFocused ? 17 : 13.5} fontWeight={isFocused ? 800 : 600} fill={isFocused ? '#FFFFFF' : COLORS.darkMuted}>
                      {m.label}
                    </text>
                    {prModeAlpha > 0.2 && m.prStats && (
                      <text x={lx} y={ly + 18} textAnchor={leftSide ? 'end' : 'start'} dominantBaseline="central" fontFamily={FONTS.mono} fontSize={12.5} fontWeight={700} fill={COLORS.neonGreen} opacity={prModeAlpha}>
                        {m.prStats}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Floating Leaders for 2D Atlas */}
              {/* Real Archify Architectural Signals igniting the instant the Radar Beam sweeps past each sector! */}
              {langOrbitAlpha > 0.02 &&
                to3DTreeT < 0.08 &&
                RADAR_ARCH_SIGNALS.map((sig) => {
                  const targetAngle = geo.mid(sig.modIdx);
                  // Smooth angular detection as radarAngle sweeps from -PI/2 -> +1.75*PI
                  const delta = radarAngle - targetAngle;
                  if (delta < 0) return null;
                  const popT = easeOutExpo(clamp01(delta / 0.35));
                  const rippleT = clamp01(delta / 0.65);
                  const anchor = geo.pt(targetAngle, geo.arcR + 6);
                  const kneeX = sig.alignRight ? sig.bx + 128 : sig.bx - 128;
                  const kneeY = sig.by;
                  const alpha = popT * langOrbitAlpha;
                  return (
                    <g key={sig.id} opacity={alpha}>
                      {/* Sonar Lock Ripple right on the Atlas module arc */}
                      {rippleT < 0.99 && (
                        <circle
                          cx={anchor[0]}
                          cy={anchor[1]}
                          r={6 + rippleT * 30}
                          fill="none"
                          stroke={sig.color}
                          strokeWidth={2 * (1 - rippleT)}
                          opacity={1 - rippleT}
                        />
                      )}
                      <circle
                        cx={anchor[0]}
                        cy={anchor[1]}
                        r={4.8}
                        fill="#FFFFFF"
                        stroke={sig.color}
                        strokeWidth={2.2}
                        filter="url(#atlas-neon-cyan)"
                      />
                      <polyline
                        points={`${anchor[0].toFixed(1)},${anchor[1].toFixed(1)} ${kneeX.toFixed(1)},${kneeY.toFixed(1)}`}
                        fill="none"
                        stroke={sig.color}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.78}
                      />
                      <g transform={`translate(${sig.bx - 126}, ${sig.by - 28})`}>
                        <rect
                          width="252"
                          height="56"
                          rx="12"
                          fill="rgba(11, 17, 32, 0.92)"
                          stroke={`${sig.color}99`}
                          strokeWidth="1.4"
                        />
                        <circle cx="18" cy="20" r="4.5" fill={sig.color} />
                        <text
                          x="31"
                          y="24"
                          fill={sig.color}
                          fontFamily={FONTS.mono}
                          fontSize="12.5"
                          fontWeight="800"
                        >
                          {sig.code}
                        </text>
                        <text
                          x="31"
                          y="43"
                          fill={COLORS.darkInk}
                          fontFamily={FONTS.mono}
                          fontSize="11.5"
                          fontWeight="600"
                        >
                          {sig.detail}
                        </text>
                      </g>
                    </g>
                  );
                })}

              {focusAmount > 0.35 && cycleAlpha < 0.25 && prModeAlpha < 0.25 && to3DTreeT < 0.1 && (
                <g opacity={(focusAmount - 0.35) * 1.5}>
                  <polyline points={`${billingAnchor[0]},${billingAnchor[1]} ${billingAnchor[0] + 64},${billingAnchor[1] - 46} ${billingAnchor[0] + 240},${billingAnchor[1] - 46}`} fill="none" stroke={COLORS.neonGreen} strokeWidth={1.8} />
                  <circle cx={billingAnchor[0]} cy={billingAnchor[1]} r={4.5} fill={COLORS.neonGreen} />
                  <text x={billingAnchor[0] + 72} y={billingAnchor[1] - 58} fill={COLORS.neonGreen} fontFamily={FONTS.mono} fontSize={13} fontWeight={800}>
                    SECTOR EXPANDED · MAX CC 25
                  </text>
                  <text x={billingAnchor[0] + 72} y={billingAnchor[1] - 24} fill={COLORS.darkInk} fontFamily={FONTS.sans} fontSize={15} fontWeight={600}>
                    {en ? 'Expand the hotspot without crowding other modules' : '热点扇区圆内平滑放大，其余模块无重叠压缩'}
                  </text>
                </g>
              )}

              {cycleAlpha > 0.2 && to3DTreeT < 0.1 && (
                <g opacity={cycleAlpha}>
                  <polyline points="960,526 1390,286 1745,286" fill="none" stroke={COLORS.neonRose} strokeWidth={2} filter="url(#atlas-neon-rose)" />
                  <circle cx="960" cy="526" r="5" fill={COLORS.neonRose} />
                  <text x="1402" y="270" fill={COLORS.neonRose} fontFamily={FONTS.mono} fontSize="15" fontWeight="800">
                    ● coupling/cycle · 3 MODULES
                  </text>
                  <text x="1402" y="310" fill={COLORS.darkInk} fontFamily={FONTS.mono} fontSize="15" fontWeight="600">
                    billing → ledger → auth → billing
                  </text>
                </g>
              )}

              {prModeAlpha > 0.2 && to3DTreeT < 0.15 && (
                <g opacity={prModeAlpha}>
                  <polyline points="1295,382 1408,290 1765,290" fill="none" stroke={COLORS.neonGreen} strokeWidth={1.8} />
                  <text x="1418" y="274" fill={COLORS.neonGreen} fontFamily={FONTS.mono} fontSize="14" fontWeight="800">
                    + PR DIFF ANALYSIS · --pr
                  </text>
                  <text x="1418" y="314" fill={COLORS.darkInk} fontFamily={FONTS.sans} fontSize="16" fontWeight="600">
                    {en ? 'Pinned base → head · 2 direct callers found' : '固定基线 → 当前提交 · 2 处直接调用方已定位'}
                  </text>
                  <polyline points="630,395 515,316 185,316" fill="none" stroke={COLORS.neonRose} strokeWidth={1.8} strokeDasharray="5 4" />
                  <text x="185" y="300" fill={COLORS.neonRose} fontFamily={FONTS.mono} fontSize="14" fontWeight="800">
                    − REMOVED DEPENDENCIES · DRIFT GATE
                  </text>
                  <text x="185" y="340" fill={COLORS.darkInk} fontFamily={FONTS.sans} fontSize="16" fontWeight="600">
                    {en ? 'Sync audit removed · dashed CC baseline' : '移除同步 audit 依赖 · 灰虚线对照基线复杂度'}
                  </text>
                </g>
              )}

              {scanWipeT > 0.01 && scanWipeT < 0.99 && (() => {
                const leadX = lerp(280, 1660, scanWipeT);
                const veilW = 190;
                return (
                  <g mask="url(#pr-curtain-mask)" opacity={Math.sin(scanWipeT * Math.PI)}>
                    <polygon
                      points={`${leadX - veilW},80 ${leadX},80 ${leadX - 75},980 ${leadX - 75 - veilW},980`}
                      fill="url(#pr-curtain-grad)"
                    />
                    <line
                      x1={leadX}
                      y1="80"
                      x2={leadX - 75}
                      y2="980"
                      stroke="#E0F2FE"
                      strokeWidth={1.6}
                      filter="url(#atlas-neon-cyan)"
                    />
                  </g>
                );
              })()}
              </svg>
            </CameraRig>
          )}

          {/* ==================== 6 SUPPORTED LANGUAGES ORBITING RIGHT AROUND THE ATLAS! ==================== */}
          {langOrbitAlpha > 0.01 && (
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 42 }}>
              {ORBITAL_LANGUAGES.map((lang, idx) => {
                // Ignite each language badge sequentially as the radar beam sweeps clockwise!
                const igniteAt = 16 + idx * 10;
                const igniteT = easeOutExpo(progressBetween(frame, igniteAt, igniteAt + 20));
                const { x, y, isRight } = lang;

                return (
                  <div
                    key={lang.name}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      transform: `translate(-50%, -50%) translateX(${(1 - igniteT) * (isRight ? 28 : -28)}px) scale(${lerp(0.88, 1, igniteT)})`,
                      opacity: igniteT * langOrbitAlpha,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 18px',
                      borderRadius: 14,
                      backgroundColor: 'rgba(13, 19, 34, 0.9)',
                      border: `1.5px solid ${lang.color}88`,
                      boxShadow: `0 0 28px ${lang.color}28, 0 12px 32px rgba(0,0,0,0.45)`,
                      flexDirection: isRight ? 'row' : 'row-reverse',
                      minWidth: 205,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: lang.color,
                        boxShadow: `0 0 14px ${lang.color}`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ textAlign: isRight ? 'left' : 'right' }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                        {lang.name}
                      </div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: lang.color, marginTop: 2, whiteSpace: 'nowrap' }}>
                        {lang.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </AbsoluteFill>
          )}

          {/* ==================== ACT 2B: CINEMA-POLISHED 3D ORBITING ATLAS PARTICLE TREE! ==================== */}
          {projectedTree && (
            <AbsoluteFill style={{ pointerEvents: 'none', opacity: clamp01(to3DTreeT * 1.4) }}>
              <svg width="1920" height="1080" viewBox="0 0 1920 1080">
                <defs>
                  <filter id="tree-bloom" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="tree-soft-bokeh" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="2.5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* True 3D-Projected Holographic Floor Pedestal Disc (orbits in 100% locked sync with the 3D Tree!) */}
                <g opacity={clamp01(to3DTreeT * 1.15)}>
                  <path
                    d={projectedTree.floorRingOuter}
                    fill="rgba(13, 19, 34, 0.45)"
                    stroke={COLORS.neonCyan}
                    strokeWidth={1.6}
                    opacity={0.55}
                  />
                  <path
                    d={projectedTree.floorRingInner}
                    fill="none"
                    stroke={COLORS.neonViolet}
                    strokeWidth={1.2}
                    strokeDasharray="6 8"
                    opacity={0.5}
                  />
                  {projectedTree.floorRadials.map((rad, idx) => (
                    <line
                      key={`fr-${idx}`}
                      x1={rad.pA.sx}
                      y1={rad.pA.sy}
                      x2={rad.pB.sx}
                      y2={rad.pB.sy}
                      stroke={COLORS.neonCyan}
                      strokeWidth={1}
                      opacity={0.32}
                    />
                  ))}
                </g>

                {/* Rising 3D Holographic Scan Ring sweeping Layer 0 -> Layer 2! */}
                {verticalScanT > 0.02 && verticalScanT < 0.98 && (
                  <path
                    d={projectedTree.scanRingPath}
                    fill="none"
                    stroke={COLORS.neonCyan}
                    strokeWidth={2.6}
                    opacity={Math.sin(verticalScanT * Math.PI) * 0.85}
                    filter="url(#tree-bloom)"
                  />
                )}

                {/* Cross-module gossamer light threads + live pulsing energy packets! */}
                {projectedTree.projThreads.map((th, i) => (
                  <g key={`th-${i}`} opacity={layer2Grow}>
                    <path
                      d={`M ${th.p0.sx.toFixed(1)} ${th.p0.sy.toFixed(1)} Q 960 ${((th.p0.sy + th.p1.sy) / 2 - 52).toFixed(
                        1
                      )}, ${th.p1.sx.toFixed(1)} ${th.p1.sy.toFixed(1)}`}
                      fill="none"
                      stroke={th.highlight ? COLORS.neonRose : COLORS.neonCyan}
                      strokeWidth={th.highlight ? 2.0 : 0.95}
                      opacity={th.highlight ? 0.68 : 0.22}
                      filter={th.highlight ? 'url(#tree-bloom)' : undefined}
                    />
                    {th.highlight && layer2Grow > 0.7 && (
                      <circle
                        cx={th.pPulse.sx}
                        cy={th.pPulse.sy}
                        r={4.5 * th.pPulse.depth}
                        fill="#FFFFFF"
                        stroke={COLORS.neonRose}
                        strokeWidth={2}
                        filter="url(#tree-bloom)"
                      />
                    )}
                  </g>
                ))}

                {/* Organic Curved 3D Branches growing layer-by-layer from the Core Trunk */}
                {projectedTree.projBranches.map((b, i) => (
                  <g key={`br-${i}`} opacity={b.g}>
                    <path
                      d={`M ${b.p0.sx.toFixed(1)} ${b.p0.sy.toFixed(1)} Q ${b.pm.sx.toFixed(1)} ${b.pm.sy.toFixed(
                        1
                      )}, ${b.p1.sx.toFixed(1)} ${b.p1.sy.toFixed(1)}`}
                      fill="none"
                      stroke={b.color}
                      strokeWidth={b.width * ((b.p0.depth + b.p1.depth) / 2)}
                      strokeLinecap="round"
                      opacity={0.85}
                      filter={b.layer === 0 ? 'url(#tree-bloom)' : undefined}
                    />
                  </g>
                ))}

                {/* 480+ Depth-Sorted Shimmering 3D Function Blossom Particles (spiraled up from 2D ring!) */}
                {projectedTree.projParticles.map((p, i) => (
                  <g key={`pt-${i}`}>
                    {p.r > 4.2 && (
                      <circle
                        cx={p.sx}
                        cy={p.sy}
                        r={p.r * p.depth * 2.1}
                        fill={p.color}
                        opacity={0.18 * p.twinkle * p.g}
                      />
                    )}
                    <circle
                      cx={p.sx}
                      cy={p.sy}
                      r={Math.max(1.1, p.r * p.depth)}
                      fill={p.r > 4.8 ? '#FFFFFF' : p.color}
                      stroke={p.r > 4.8 ? p.color : 'none'}
                      strokeWidth={p.r > 4.8 ? 1.8 : 0}
                      opacity={clamp01((p.isBlossom ? 0.94 : 0.44) * p.depth * p.twinkle)}
                      filter={p.r > 4.2 ? 'url(#tree-soft-bokeh)' : undefined}
                    />
                  </g>
                ))}

                {/* Orbiting 3D-Projected Module Callout Tags anchored directly to branch tips */}
                {projectedTree.projBranches
                  .filter((b) => b.label && b.g > 0.65)
                  .map((b) => {
                    const right = b.p1.sx >= 960;
                    const alpha = clamp01((b.g - 0.65) * 3) * clamp01(b.p1.depth * 1.15);
                    return (
                      <g key={`lbl-${b.label}`} opacity={alpha}>
                        <line
                          x1={b.p1.sx}
                          y1={b.p1.sy}
                          x2={b.p1.sx + (right ? 26 : -26)}
                          y2={b.p1.sy - 14}
                          stroke={b.color}
                          strokeWidth={1.4}
                          opacity={0.8}
                        />
                        <circle cx={b.p1.sx} cy={b.p1.sy} r={3.5} fill={b.color} />
                        <text
                          x={b.p1.sx + (right ? 34 : -34)}
                          y={b.p1.sy - 10}
                          textAnchor={right ? 'start' : 'end'}
                          fill="#FFFFFF"
                          fontFamily={FONTS.mono}
                          fontSize={Math.round(12 + b.p1.depth * 3)}
                          fontWeight={800}
                        >
                          {b.label}
                        </text>
                      </g>
                    );
                  })}

                {/* Left Layer Elevation Axis (lights up sequentially as vertical scan passes!) */}
                <g opacity={easeOutCubic(progressBetween(frame, 385, 420))}>
                  <line x1="110" y1="740" x2="110" y2="250" stroke="rgba(148,163,184,0.28)" strokeWidth="1.5" strokeDasharray="4 5" />
                  {[
                    { y: 720, label: 'LAYER 0 · TRUNK (CORE HUB)', lit: layer0Grow },
                    { y: 500, label: 'LAYER 1 · DOMAIN MODULES', lit: layer1Grow },
                    { y: 290, label: 'LAYER 2 · CROWN BLOSSOMS', lit: layer2Grow },
                  ].map((lv) => (
                    <g key={lv.label} opacity={0.35 + lv.lit * 0.65}>
                      <circle cx="110" cy={lv.y} r={4 + lv.lit * 1.5} fill={COLORS.neonViolet} />
                      <text x="128" y={lv.y + 4} fill={lv.lit > 0.5 ? COLORS.darkInk : COLORS.darkMuted} fontFamily={FONTS.mono} fontSize="12.5" fontWeight="700">
                        {lv.label}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Right-side Floating 3D Telemetry */}
                <g opacity={easeOutCubic(progressBetween(frame, 400, 438))}>
                  <text x="1845" y="248" textAnchor="end" fill={COLORS.neonViolet} fontFamily={FONTS.mono} fontSize="13.5" fontWeight="800">
                    SAME STATIC GRAPH · 3D PARTICLE TREE
                  </text>
                  <text x="1845" y="282" textAnchor="end" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize="24" fontWeight="800">
                    2,841 FUNCTIONS · 138 FILES
                  </text>
                  <text x="1845" y="314" textAnchor="end" fill={COLORS.darkMuted} fontFamily={FONTS.sans} fontSize="15.5">
                    {en ? 'Cluster size = complexity · glowing links = boundary leaks' : '光簇大小 = 圈复杂度 · 发光连丝 = 跨模块泄漏'}
                  </text>
                </g>
              </svg>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      {/* ==================== ACT 2C: CLASSIC DIAGRAM OVERLAY ("原版架构图叠加改造", --ir) ==================== */}
      {classicWipeT > 0.01 && (
        <AbsoluteFill
          style={{
            clipPath: `polygon(${lerp(120, -20, classicWipeT)}% 0%, 100% 0%, 100% 100%, ${lerp(
              100,
              -40,
              classicWipeT
            )}% 100%)`,
            backgroundColor: COLORS.paper,
            zIndex: 48,
          }}
        >
          <PaperCanvas glowA={COLORS.ember} glowB={COLORS.backend} gridOpacity={0.55} />

          <div style={{ position: 'absolute', top: 36, left: 56, display: 'flex', alignItems: 'center', gap: 14, zIndex: 55 }}>
            <EditorialPill label="CLASSIC OVERLAY · --ir architecture.json" color={COLORS.ember} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.muted }}>
              {en ? 'Add static diagnostics to your original diagram' : '保留原版架构图，一键叠加静态诊断光晕'}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 34,
              right: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '9px 18px',
              borderRadius: 999,
              backgroundColor: overlayToggleT > 0.3 ? COLORS.ink : COLORS.surface,
              border: `1.5px solid ${overlayToggleT > 0.3 ? COLORS.neonGreen : COLORS.lineHi}`,
              boxShadow: overlayToggleT > 0.3 ? '0 12px 32px rgba(5, 150, 105, 0.25)' : '0 8px 20px rgba(18,20,23,0.06)',
              transform: `scale(${frame >= 600 ? lerp(0.92, 1, toggleClickBounce) : 1})`,
              zIndex: 55,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: overlayToggleT > 0.3 ? COLORS.neonGreen : COLORS.dim,
                boxShadow: overlayToggleT > 0.3 ? `0 0 12px ${COLORS.neonGreen}` : 'none',
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13.5,
                fontWeight: 800,
                color: overlayToggleT > 0.3 ? '#FFFFFF' : COLORS.ink,
              }}
            >
              {overlayToggleT > 0.3 ? 'Code Analysis · ON' : 'Code Analysis · OFF'}
            </span>
          </div>

          <CameraRig
            x={lerp(0, 30, classicCamPush) * (1 - inspectorT) + lerp(0, 315, inspectorT)}
            y={lerp(0, -14, classicCamPush) + lerp(0, 26, inspectorT)}
            zoom={lerp(0.94, 1.0, classicCamPush) * lerp(1, 0.72, inspectorT) * lerp(1, 0.9, bridgeToStoryT)}
          >
            <AbsoluteFill style={{ opacity: 1 - bridgeToStoryT * 0.82 }}>
              <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id="classic-veil-h" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={COLORS.backend} stopOpacity="0" />
                    <stop offset="68%" stopColor={COLORS.backend} stopOpacity="0.06" />
                    <stop offset="94%" stopColor={COLORS.signal} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={COLORS.backend} stopOpacity="0.65" />
                  </linearGradient>
                  <linearGradient id="classic-veil-v" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="20%" stopColor="white" stopOpacity="1" />
                    <stop offset="80%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <mask id="classic-veil-mask">
                    <rect x="0" y="120" width="1920" height="800" fill="url(#classic-veil-v)" />
                  </mask>
                  <filter id="classic-beam-glow" x="-40%" y="-10%" width="180%" height="120%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Authored Native Architecture Trust Boundary Container */}
                <g opacity={0.85}>
                  <rect
                    x="595"
                    y="238"
                    width="995"
                    height="536"
                    rx="26"
                    fill="rgba(255, 255, 255, 0.34)"
                    stroke={COLORS.lineHi}
                    strokeWidth="1.8"
                    strokeDasharray="9 7"
                  />
                  <text
                    x="622"
                    y="270"
                    fill={COLORS.muted}
                    fontFamily={FONTS.mono}
                    fontSize="12.5"
                    fontWeight="800"
                    letterSpacing="0.08em"
                  >
                    TRUST BOUNDARY · PAYMENT CORE DOMAIN (MAPPED TO src/**)
                  </text>
                </g>

                {/* Declared Authored Architecture Connections */}
                <g opacity={lerp(0.92, 0.32, overlayToggleT)}>
                  <path d="M 468 380 L 642 380" fill="none" stroke={COLORS.frontend} strokeWidth="2.8" />
                  <path d="M 982 380 L 1190 380" fill="none" stroke={COLORS.database} strokeWidth="2.8" />
                  <path d="M 812 438 L 812 586" fill="none" stroke={COLORS.messagebus} strokeWidth="2.6" />
                  <path
                    d="M 468 640 L 642 640"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2.2"
                    strokeDasharray="6 5"
                  />
                </g>

                {/* Undeclared Drift Edge discovered by static AST analysis! */}
                {driftLineT > 0.02 && (() => {
                  const driftU = ((frame - 620) % 48) / 48;
                  const pt = cubicPoint([982, 410], [1085, 410], [1110, 642], [1190, 642], driftU);
                  return (
                    <g opacity={driftLineT}>
                      <path
                        d="M 982 410 C 1085 410, 1110 642, 1190 642"
                        fill="none"
                        stroke={COLORS.security}
                        strokeWidth="3.6"
                        strokeDasharray="9 6"
                      />
                      <circle cx={pt[0]} cy={pt[1]} r="5.5" fill="#FFFFFF" stroke={COLORS.security} strokeWidth="2.6" />
                      <rect
                        x="1018"
                        y="506"
                        width="284"
                        height="34"
                        rx="17"
                        ry="17"
                        fill="#FFF1F2"
                        stroke={COLORS.security}
                        strokeWidth="1.8"
                      />
                      <text
                        x="1160"
                        y="528"
                        textAnchor="middle"
                        fill={COLORS.security}
                        fontFamily={FONTS.mono}
                        fontSize="12.5"
                        fontWeight="800"
                      >
                        ✗ UNDECLARED DRIFT IMPORT
                      </text>
                    </g>
                  );
                })()}

                {/* Feathered Optical Diagnostic Veil (smooth vertical fade + soft gradient curtain!) */}
                {overlayScanT > 0.01 && overlayScanT < 0.99 && (
                  <g mask="url(#classic-veil-mask)" opacity={Math.sin(overlayScanT * Math.PI)}>
                    <rect x={scanX - 180} y="120" width="180" height="800" fill="url(#classic-veil-h)" />
                    <line
                      x1={scanX}
                      y1="120"
                      x2={scanX}
                      y2="920"
                      stroke={COLORS.backend}
                      strokeWidth="2.2"
                      opacity="0.72"
                      filter="url(#classic-beam-glow)"
                    />
                    <line x1={scanX} y1="120" x2={scanX} y2="920" stroke="#ECFDF5" strokeWidth="1" opacity="0.95" />
                  </g>
                )}
              </svg>

              {/* 6 Native Nodes demonstrating ALL 5 Archify Diagnostic Halos: Clean, Error, Warning, Info, Unmapped! */}
              <ClassicOverlayNode
                x={188}
                y={322}
                w={280}
                h={116}
                title="API Gateway"
                sub="src/edge/** · 4 files clean"
                sigil="frontend"
                baseColor={COLORS.frontend}
                halo="green"
                haloAlpha={apiHaloT}
                badge="✓ CLEAN"
                pulse={redPulse}
              />

              <ClassicOverlayNode
                x={188}
                y={584}
                w={280}
                h={112}
                title="Stripe API"
                sub="External SaaS · no local AST"
                sigil="cloud"
                baseColor="#64748B"
                halo="grey"
                haloAlpha={apiHaloT}
                badge="◌ UNMAPPED"
                pulse={redPulse}
              />

              <ClassicOverlayNode
                x={642}
                y={322}
                w={340}
                h={116}
                title="Billing Core"
                sub="src/billing/** · 9 files mapped"
                sigil="backend"
                baseColor={COLORS.backend}
                halo="red"
                haloAlpha={billingHaloT}
                badge="● CYCLE + DRIFT"
                pulse={redPulse}
                selected={inspectorT > 0.25}
              />

              <ClassicOverlayNode
                x={1190}
                y={322}
                w={335}
                h={116}
                title="Ledger Domain"
                sub="src/ledger/** · CC hotspot"
                sigil="database"
                baseColor={COLORS.database}
                halo="amber"
                haloAlpha={ledgerHaloT}
                badge="▲ MAX CC 24"
                pulse={redPulse}
              />

              <ClassicOverlayNode
                x={642}
                y={586}
                w={340}
                h={112}
                title="Org Queue"
                sub="src/queue/** · high fan-in (7)"
                sigil="messagebus"
                baseColor={COLORS.messagebus}
                halo="blue"
                haloAlpha={billingHaloT}
                badge="ℹ INFO · FAN-IN 7"
                pulse={redPulse}
              />

              <ClassicOverlayNode
                x={1190}
                y={586}
                w={355}
                h={112}
                title="Legacy Audit"
                sub={en ? 'Undeclared import in code' : '未声明连线 — 代码里却偷偷导入'}
                sigil="security"
                baseColor={COLORS.security}
                halo="red"
                haloAlpha={driftLineT}
                badge="✗ DRIFT TARGET"
                pulse={redPulse}
              />

              {/* Authentic Archify 5-Color Overlay Legend Bar (#bauify-legend) */}
              {overlayToggleT > 0.25 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 188,
                    top: 808,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    padding: '10px 22px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: `1px solid ${COLORS.lineHi}`,
                    boxShadow: '0 12px 32px rgba(18, 20, 23, 0.08)',
                    opacity: clamp01((scanX - 900) / 360) * overlayToggleT,
                    fontFamily: FONTS.mono,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  <span style={{ color: COLORS.muted, fontSize: 11.5, letterSpacing: '0.08em' }}>OVERLAY LEGEND</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.security }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: COLORS.security }} /> Error (2)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.cloud }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: COLORS.cloud }} /> Warning (1)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.brandBlue }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: COLORS.brandBlue }} /> Info (1)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.backend }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: COLORS.backend }} /> Clean (1)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', border: '1.8px dashed #64748B' }} /> Unmapped (1)
                  </span>
                  <span style={{ color: COLORS.muted, borderLeft: `1px solid ${COLORS.lineHi}`, paddingLeft: 14 }}>
                    +2 Off-diagram · ESLint SARIF
                  </span>
                </div>
              )}
            </AbsoluteFill>
          </CameraRig>

          {/* ENRICHED Authentic Archify Native Overlay Workbench Drawer — Vertically Centered on Optical Axis (y=508)! */}
          {inspectorT > 0.01 && (
            <div
              style={{
                position: 'absolute',
                right: 52,
                top: 508,
                width: 604,
                borderRadius: 20,
                backgroundColor: COLORS.surface,
                border: `1.5px solid ${COLORS.security}66`,
                boxShadow: '0 28px 80px rgba(18, 20, 23, 0.16)',
                transform: `translateY(-50%) translateX(${(1 - inspectorT) * 660}px)`,
                opacity: inspectorT,
                overflow: 'hidden',
                zIndex: 58,
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${COLORS.line}`,
                  backgroundColor: '#FFF1F2',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: COLORS.security, letterSpacing: '0.1em' }}>
                    CODE ANALYSIS OVERLAY · COMPONENT DETAIL
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: COLORS.ink, marginTop: 2 }}>
                    Billing Core
                  </div>
                </div>
                <EditorialPill label="9 FILES · 3 PRIORITIES · SARIF +1" color={COLORS.security} />
              </div>

              {/* Workbench Body */}
              <div style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Top Priorities (Deduplicated Overview, matching overview.mjs MAX_PRIORITIES=3) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: COLORS.muted, letterSpacing: '0.08em' }}>
                    TOP PRIORITIES · DEDUPLICATED + EXTERNAL DIAGNOSTICS
                  </div>
                  {[
                    {
                      rank: '#1',
                      rule: 'architecture/drift',
                      loc: 'checkout.ts:38',
                      detail: en ? 'Undeclared import: legacy-audit/writer' : '未声明导入 legacy-audit/writer',
                      c: COLORS.security,
                    },
                    {
                      rank: '#2',
                      rule: 'coupling/cycle',
                      loc: '3 modules',
                      detail: 'billing → ledger → auth → billing',
                      c: COLORS.cloud,
                    },
                    {
                      rank: '#3',
                      rule: 'eslint / SARIF',
                      loc: 'external',
                      detail: 'no-restricted-imports (imported report)',
                      c: COLORS.brandBlue,
                    },
                  ].map((p) => (
                    <div
                      key={p.rank}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 10,
                        backgroundColor: COLORS.paper,
                        border: `1px solid ${p.c}44`,
                        fontFamily: FONTS.mono,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ fontWeight: 900, color: p.c }}>{p.rank}</span>
                        <span style={{ fontWeight: 800, color: COLORS.ink }}>{p.rule}</span>
                        <span style={{ fontFamily: FONTS.sans, fontSize: 12.5, color: COLORS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.detail}
                        </span>
                      </div>
                      <span style={{ color: p.c, fontWeight: 700, flexShrink: 0 }}>{p.loc}</span>
                    </div>
                  ))}
                </div>

                {/* Embedded SVG Mini-Diagrams (#bauify-detail svg.diagram: Cycle Triangle + Complexity Spark Bars!) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      backgroundColor: COLORS.paper,
                      border: `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, color: COLORS.muted, marginBottom: 4 }}>
                      MINI-GRAPH · CYCLE PATH
                    </div>
                    <svg width="248" height="74" viewBox="0 0 248 74">
                      <path d="M 54 18 L 194 18" stroke={COLORS.security} strokeWidth="2" fill="none" />
                      <path d="M 194 26 L 126 58" stroke={COLORS.cloud} strokeWidth="2" fill="none" />
                      <path d="M 118 58 L 54 26" stroke={COLORS.security} strokeWidth="2" strokeDasharray="4 3" fill="none" />
                      <rect x="6" y="6" width="76" height="22" rx="6" fill="#FFF1F2" stroke={COLORS.security} strokeWidth="1.4" />
                      <text x="44" y="21" textAnchor="middle" fill={COLORS.security} fontFamily={FONTS.mono} fontSize="10.5" fontWeight="800">
                        billing
                      </text>
                      <rect x="164" y="6" width="76" height="22" rx="6" fill="#FFFBEB" stroke={COLORS.cloud} strokeWidth="1.4" />
                      <text x="202" y="21" textAnchor="middle" fill={COLORS.cloud} fontFamily={FONTS.mono} fontSize="10.5" fontWeight="800">
                        ledger
                      </text>
                      <rect x="86" y="48" width="76" height="22" rx="6" fill="#EFF6FF" stroke={COLORS.brandBlue} strokeWidth="1.4" />
                      <text x="124" y="63" textAnchor="middle" fill={COLORS.brandBlue} fontFamily={FONTS.mono} fontSize="10.5" fontWeight="800">
                        auth
                      </text>
                    </svg>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      backgroundColor: COLORS.paper,
                      border: `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, color: COLORS.muted, marginBottom: 4 }}>
                      MINI-CHART · FUNCTION COMPLEXITY
                    </div>
                    <svg width="248" height="74" viewBox="0 0 248 74">
                      <line x1="8" y1="24" x2="240" y2="24" stroke={COLORS.cloud} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                      <text x="240" y="20" textAnchor="end" fill={COLORS.cloud} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
                        warn=15
                      </text>
                      {[
                        { x: 16, h: 16, v: 5, c: COLORS.backend },
                        { x: 60, h: 26, v: 9, c: COLORS.backend },
                        { x: 104, h: 36, v: 13, c: COLORS.brandBlue },
                        { x: 148, h: 58, v: 24, c: COLORS.security },
                        { x: 192, h: 46, v: 19, c: COLORS.cloud },
                      ].map((bar) => (
                        <g key={bar.x}>
                          <rect x={bar.x} y={66 - bar.h} width="26" height={bar.h} rx="4" fill={`${bar.c}2E`} stroke={bar.c} strokeWidth="1.5" />
                          <text x={bar.x + 13} y={62 - bar.h} textAnchor="middle" fill={bar.c} fontFamily={FONTS.mono} fontSize="10" fontWeight="800">
                            {bar.v}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Working-Tree Source Pane with Authentic Git Diff Gutters (#bauify-code) */}
                <div
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#0C111D',
                    padding: '11px 14px',
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    lineHeight: 1.65,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 4, fontSize: 11 }}>
                    <span>// Working-tree source · src/billing/checkout.ts</span>
                    <span style={{ color: COLORS.neonGreen }}>● GIT DIFF GUTTERS</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, paddingLeft: 6, borderLeft: '3px solid transparent', color: '#94A3B8' }}>
                    <span style={{ color: '#475569' }}>36</span>
                    <span>import &#123; claimLock &#125; from &quot;./idempotency&quot;;</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, paddingLeft: 6, borderLeft: `3px solid ${COLORS.neonGreen}`, backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#D1FAE5' }}>
                    <span style={{ color: COLORS.neonGreen }}>37+</span>
                    <span>import &#123; queueJob &#125; from &quot;../queue&quot;;</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      paddingLeft: 6,
                      borderLeft: `3px solid ${COLORS.neonRose}`,
                      backgroundColor: 'rgba(251, 113, 133, 0.22)',
                      color: '#FFE4E6',
                      borderRadius: 3,
                    }}
                  >
                    <span style={{ color: COLORS.neonRose }}>38~</span>
                    <span>import &#123; auditSink &#125; from &quot;../legacy-audit/writer&quot;;</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, paddingLeft: 6, borderLeft: '3px solid transparent', color: '#94A3B8' }}>
                    <span style={{ color: '#475569' }}>39</span>
                    <span>export async function handleCheckout(req) &#123;</span>
                  </div>
                </div>

                {/* Action Buttons Footer: Copy Task for AI + Accept Baseline + Re-analyze */}
                <div style={{ display: 'flex', gap: 9, marginTop: 2 }}>
                  <div
                    style={{
                      flex: 1.35,
                      padding: '10px 12px',
                      borderRadius: 10,
                      backgroundColor: COLORS.backend,
                      color: '#FFFFFF',
                      fontFamily: FONTS.mono,
                      fontSize: 12.5,
                      fontWeight: 800,
                      textAlign: 'center',
                    }}
                  >
                    Copy Task for AI ↗
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: '10px 10px',
                      borderRadius: 10,
                      backgroundColor: COLORS.paper,
                      border: `1px solid ${COLORS.lineHi}`,
                      color: COLORS.ink,
                      fontFamily: FONTS.mono,
                      fontSize: 12.5,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    Accept Baseline
                  </div>
                  <div
                    style={{
                      padding: '10px 13px',
                      borderRadius: 10,
                      backgroundColor: COLORS.paper,
                      border: `1px solid ${COLORS.lineHi}`,
                      color: COLORS.ink,
                      fontFamily: FONTS.mono,
                      fontSize: 12.5,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    Re-analyze
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smooth Narrative Bridge to Scene 3 (Code Analysis -> Dynamic Story Choreography!) */}
          {bridgeToStoryT > 0.01 && (
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 62,
                opacity: bridgeToStoryT,
                transform: `translateY(${(1 - bridgeToStoryT) * 24}px)`,
              }}
            >
              <div
                style={{
                  padding: '30px 48px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(245, 246, 243, 0.92)',
                  border: `1px solid ${COLORS.lineHi}`,
                  boxShadow: '0 26px 70px rgba(18,20,23,0.1)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: COLORS.backend, letterSpacing: '0.12em' }}>
                  ✓ STRUCTURE VERIFIED · NEXT STEP
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 48, fontWeight: 800, color: COLORS.ink, marginTop: 10 }}>
                  {en ? 'Analysis shows what changed. ' : '代码分析看清了真相，'}
                  <span style={{ color: COLORS.ember }}>{en ? 'Can your team grasp it in ten seconds?' : '怎么让团队十秒听懂？'}</span>
                </div>
              </div>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      <FloatingCaption
        kicker={kicker}
        text={caption}
        accent={kickerColor}
        dark={classicWipeT < 0.5}
        opacity={1 - bridgeToStoryT}
      />
    </AbsoluteFill>
  );
};
