import React, { useMemo } from 'react';
import { useLocale } from '../locale';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  AnimatedArchifyBrandReveal,
  ArchifySymbol,
  CameraRig,
  EditorialPill,
  PaperCanvas,
} from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
  clamp01,
  easeInCubic,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  easeOutExpo,
  lerp,
  progressBetween,
} from '../theme';

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

const PROMPT_TEXT = 'Refactor checkout to async per-org queue...';

const CI_CHECKS = [
  { label: '128 / 128 unit tests passed', sub: 'AI-generated suite' },
  { label: 'Typecheck & Lint passed', sub: '0 errors' },
  { label: '27 files · +1,842 lines', sub: 'generated in 14.2s' },
];

const WHAT_WE_BUILT = [
  {
    num: '01',
    title: '六大语言 AST 静态解析',
    titleEn: 'AST parsing for six languages',
    en: 'DETERMINISTIC GRAPH',
    desc: '不靠大模型猜拓扑，直接提取真实依赖网与函数圈复杂度',
    descEn: 'Extract real dependencies and cyclomatic complexity directly from code, without an LLM guessing the topology.',
    color: COLORS.brandBlue,
  },
  {
    num: '02',
    title: '三种视角透视全仓',
    titleEn: 'Three views of your codebase',
    en: 'ATLAS · 3D · OVERLAY',
    desc: '2D 全仓星盘、3D 粒子树、原版架构图无侵入叠加诊断',
    descEn: 'Explore the 2D Atlas, a 3D particle tree, or diagnostics over your original architecture diagram.',
    color: COLORS.backend,
  },
  {
    num: '03',
    title: '可验证的工程闭环',
    titleEn: 'A verifiable review workflow',
    en: 'DRIFT · PR · AI TASK',
    desc: '拦截架构漂移、钉住 PR 影响面，一键导出源码证据任务',
    descEn: 'Catch architectural drift, pin the impact of a PR, and export tasks backed by source evidence.',
    color: COLORS.ember,
  },
];

// Clean 3-Tier Layered Architecture Stack (Strictly Top-Down at PR #1 -> Violated by Bypasses, Reverse Arrows & Cycles by PR #47!)
const TIERS = [
  {
    name: '01 · API / EDGE LAYER',
    y: 230,
    color: COLORS.frontend,
    nodes: [
      { id: 'checkout-api', label: 'Checkout API', x: 290 },
      { id: 'webhook-api', label: 'Webhook API', x: 640 },
      { id: 'admin-api', label: 'Admin API', x: 990 },
    ],
  },
  {
    name: '02 · DOMAIN LAYER',
    y: 440,
    color: COLORS.backend,
    nodes: [
      { id: 'billing-core', label: 'Billing Core', x: 290 },
      { id: 'ledger-rules', label: 'Ledger Rules', x: 640 },
      { id: 'auth-policy', label: 'Auth Policy', x: 990 },
    ],
  },
  {
    name: '03 · INFRA / DATA LAYER',
    y: 650,
    color: COLORS.database,
    nodes: [
      { id: 'invoices-db', label: 'Invoices DB', x: 290 },
      { id: 'org-queue', label: 'Org Queue', x: 640 },
      { id: 'legacy-audit', label: 'Legacy Audit', x: 990 },
    ],
  },
];

export const Scene01CognitiveDebt: React.FC = () => {
  const en = useLocale() === 'en';
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each of the 9 EXISTING architecture nodes splits into 4 real source file ticks (36 total)
  // born from the EXACT centered coordinates of those 9 boxes, then magnetically snaps into Scene 2's Atlas ring (cx=960, cy=526, R=244)!
  const liveMorphGraph = useMemo(() => {
    const rand = mulberry32(4201);
    const CENTER_SHIFT_X = 232; // shifts 3-tier stack (x: 130..1325, center=727.5) cleanly to screen center 960!
    const nodes: {
      id: number;
      tierIdx: number;
      parentX: number;
      parentY: number;
      rx: number;
      ry: number;
      ringA: number;
      hue: number;
      spikeLen: number;
    }[] = [];

    const tierHues = [192, 158, 266, 348, 28, 215, 285, 42, 172];
    let idx = 0;
    TIERS.forEach((tier, ti) => {
      tier.nodes.forEach((n, ni) => {
        const boxCenterX = n.x + 120 + CENTER_SHIFT_X;
        const boxCenterY = tier.y + 46;
        const boxIdx = ti * 3 + ni;
        const hue = tierHues[boxIdx % tierHues.length];
        for (let f = 0; f < 4; f++) {
          const jitterX = (f - 1.5) * 44;
          const jitterY = (f % 2 === 0 ? -1 : 1) * 14;
          const ringA = -Math.PI / 2 + (idx / 36) * Math.PI * 2;
          const rx = 960 + Math.cos(ringA) * 244;
          const ry = 526 + Math.sin(ringA) * 244;
          nodes.push({
            id: idx,
            tierIdx: ti,
            parentX: boxCenterX + jitterX,
            parentY: boxCenterY + jitterY,
            rx,
            ry,
            ringA,
            hue,
            spikeLen: 18 + Math.floor(rand() * 44),
          });
          idx++;
        }
      });
    });

    const edges = Array.from({ length: 78 }).map((_, i) => {
      const a = Math.floor(rand() * nodes.length);
      let b = Math.floor(rand() * nodes.length);
      if (b === a) b = (a + 7) % nodes.length;
      return { a, b, isBad: i < 16 };
    });
    return { nodes, edges, CENTER_SHIFT_X };
  }, []);

  // ==================== 5-BEAT FILM TIMELINE (620 frames = 20.7s) ====================
  // Beat 0 (0 - 58): Signature Archify Blueprint-to-Nodes Logo Assembly!
  const brandOut = easeInOutQuart(progressBetween(frame, 44, 64));

  // Beat 1 (50 - 188): AI Era Premise -> Single-Line Prompt -> Green CI Checkmarks -> "然后呢？"
  const eraIn = spring({ frame: Math.max(0, frame - 52), fps, config: { damping: 18, stiffness: 135 } });
  const eraLiftT = easeInOutQuart(progressBetween(frame, 92, 118));
  const promptIn = easeOutCubic(progressBetween(frame, 98, 116));
  const typedChars = Math.floor(
    interpolate(frame, [104, 136], [0, PROMPT_TEXT.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const enterFlashT = easeOutExpo(progressBetween(frame, 136, 152));
  const ciInSpring = spring({ frame: Math.max(0, frame - 140), fps, config: { damping: 16, stiffness: 150 } });
  const ciExitT = easeInOutCubic(progressBetween(frame, 180, 206));

  // Beat 2 (196 - 384): CRISP 3-TIER ARCHITECTURE STACK SILENTLY CORRUPTING UNDER GREEN CI!
  const driftStageIn = easeOutCubic(progressBetween(frame, 196, 222));
  // Only the side telemetry, top CI pill & bottom punchline exit — THE LIVE ARCHITECTURE DIAGRAM STAYS ON SCREEN!
  const driftChromeOut = easeInOutCubic(progressBetween(frame, 364, 392));
  // Live 3-tier diagram smoothly glides to dead-center (960, 526) to become the living background of Beat 3, then morphs into Atlas!
  const diagramCenterT = easeInOutQuart(progressBetween(frame, 368, 408));

  const prNumber = Math.round(
    interpolate(frame, [212, 246, 286, 326], [1, 14, 29, 47], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const testsCount = Math.round(
    interpolate(frame, [212, 246, 286, 326], [128, 142, 168, 214], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Sharp, clean 3-stage structural breakdown milestones:
  const bypassT = easeOutExpo(progressBetween(frame, 238, 266));   // PR #14: Top API bypasses Domain straight into Infra!
  const reverseT = easeOutExpo(progressBetween(frame, 276, 306));  // PR #29: Upward reverse arrows + Domain Cycle Loop!
  const chaosT = easeOutExpo(progressBetween(frame, 314, 344));    // PR #47: Full cross-layer short-circuit + Complexity spike!

  const violationsCount = Math.round(
    interpolate(frame, [238, 266, 296, 332], [0, 3, 6, 9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );
  const cyclesCount = Math.round(
    interpolate(frame, [274, 300, 332], [0, 2, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );
  const maxCcCount = Math.round(
    interpolate(frame, [238, 286, 334], [8, 15, 26], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  const prFlash = Math.max(
    Math.exp(-Math.pow((frame - 246) / 6, 2)),
    Math.exp(-Math.pow((frame - 284) / 6, 2)),
    Math.exp(-Math.pow((frame - 324) / 6, 2))
  );

  // Beat 3 (376 - 504): "SO WHAT WE BUILT" floats directly OVER the living drifted architecture background!
  const builtIn = spring({ frame: Math.max(0, frame - 378), fps, config: { damping: 16, stiffness: 140 } });
  const builtOut = easeInCubic(progressBetween(frame, 480, 506));

  // Beat 4 (498 - 620): DIRECT BACKGROUND + ARCHITECTURE TRANSFORMATION INTO OBSIDIAN 2D ATLAS!
  // The living 9 boxes surge back to full clarity, split into 36 file ticks, and snap straight into Scene 2's R=244 ring
  // while the light drafting paper radially transforms into Obsidian!
  const boxSplitT = easeInOutQuart(progressBetween(frame, 504, 540));
  const snapToCircleT = easeInOutQuart(progressBetween(frame, 520, 594));
  const portalDarkT = easeInOutCubic(progressBetween(frame, 536, 608));
  const reticleInT = easeOutCubic(progressBetween(frame, 502, 530));
  const reticleSpin = (frame - 502) * 2.2;

  // How opaque the live 3-tier architecture backdrop is:
  // Full (1.0) during Beat 2 -> softly receded (0.26) during Beat 3 text overlay -> surges back to 0.95 -> dissolves cleanly as boxes split into 36 Atlas file nodes!
  const diagramBgOpacity =
    driftStageIn *
    lerp(1, 0.24, builtIn * (1 - builtOut)) *
    (1 - boxSplitT);

  // Cinematic Camera Rig
  const camZoom =
    lerp(1.03, 1.0, easeOutCubic(progressBetween(frame, 0, 50))) *
    lerp(1.0, 1.04, chaosT * (1 - driftChromeOut)) *
    lerp(1.0, 1.06, snapToCircleT * (1 - portalDarkT * 0.55));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas glowA={COLORS.ember} glowB={COLORS.signal} gridOpacity={0.6} />

      {/* Radial Background Transformation (Light Drafting Paper -> Obsidian Atlas Canvas at exact cx=960, cy=526!) */}
      {portalDarkT > 0.001 && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.darkBg,
            clipPath: `circle(${portalDarkT * 135}% at 50% 48.7%)`,
            zIndex: 8,
          }}
        >
          <svg width="1920" height="1080" style={{ opacity: portalDarkT * 0.52 }}>
            <circle cx="960" cy="526" r="244" fill="rgba(13, 19, 34, 0.72)" stroke="rgba(148, 163, 184, 0.28)" strokeWidth="1.3" />
            <circle cx="960" cy="526" r="102" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeDasharray="4 7" strokeWidth="1" />
            <circle cx="960" cy="526" r="358" fill="none" stroke={COLORS.neonCyan} strokeWidth="1" strokeDasharray="2 14" opacity="0.32" />
          </svg>
        </AbsoluteFill>
      )}

      {/* Subtle Top-Left Archify Brand Watermark after Brand Sting */}
      {brandOut > 0.25 && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: brandOut * (1 - portalDarkT),
            zIndex: 40,
          }}
        >
          <ArchifySymbol size={30} />
          <span style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.02em' }}>
            Archify
          </span>
        </div>
      )}

      <CameraRig zoom={camZoom}>
        {/* ==================== BEAT 0: SIGNATURE ARCHIFY BLUEPRINT LOGO ASSEMBLY (0 - 64) ==================== */}
        {brandOut < 0.98 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 28,
              opacity: 1 - brandOut,
              transform: `scale(${lerp(1, 0.8, brandOut)}) translateY(${-brandOut * 110}px)`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <AnimatedArchifyBrandReveal localFrame={frame} width={560} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  color: COLORS.muted,
                  opacity: easeOutCubic(progressBetween(frame, 24, 38)),
                }}
              >
                NEW RELEASE FILM
              </span>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 1: AI ERA PREMISE -> PROMPT -> GREEN CI ILLUSION (50 - 206) ==================== */}
        {frame >= 48 && ciExitT < 0.98 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 22,
              opacity: eraIn * (1 - ciExitT),
              transform: `translateY(${-ciExitT * 70}px) scale(${lerp(1, 0.93, ciExitT)})`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  transform: `translateY(${lerp(110, 0, eraLiftT)}px) scale(${lerp(1.15, 0.88, eraLiftT)})`,
                }}
              >
                <EditorialPill label="THE AI CODING ERA" color={COLORS.brandBlue} />
                <div style={{ fontFamily: FONTS.display, fontSize: 60, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.025em', textAlign: 'center' }}>
                  {en ? 'AI is rewriting codebases ' : 'AI 正在以'}
                  <span
                    style={{
                      background: `linear-gradient(100deg, ${COLORS.brandBlue}, ${COLORS.brandTeal})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {en ? 'faster than ever' : '前所未有的速度'}
                  </span>
                  {en ? '.' : '改写代码库。'}
                </div>
              </div>

              <div
                style={{
                  width: 960,
                  padding: '20px 30px',
                  borderRadius: 999,
                  backgroundColor: COLORS.surface,
                  border: `1.5px solid ${enterFlashT > 0.1 ? COLORS.backend : COLORS.lineHi}`,
                  boxShadow:
                    enterFlashT > 0.1
                      ? '0 22px 60px rgba(5, 150, 105, 0.14), 0 4px 18px rgba(18,20,23,0.06)'
                      : '0 18px 50px rgba(18, 20, 23, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: promptIn,
                  transform: `translateY(${(1 - promptIn) * 32}px)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  <ArchifySymbol size={28} />
                  <span style={{ fontFamily: FONTS.mono, fontSize: 21, fontWeight: 500, color: COLORS.ink, whiteSpace: 'nowrap' }}>
                    {PROMPT_TEXT.slice(0, typedChars)}
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 24,
                        backgroundColor: COLORS.ember,
                        marginLeft: 4,
                        verticalAlign: 'middle',
                        opacity: frame % 16 < 9 && frame < 138 ? 1 : 0,
                      }}
                    />
                  </span>
                </div>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    backgroundColor: enterFlashT > 0.1 ? `${COLORS.backend}18` : COLORS.sunken,
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: enterFlashT > 0.1 ? COLORS.backend : COLORS.muted,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {enterFlashT > 0.1 ? '✓ DONE · 14.2s' : 'ENTER ⏎'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 22, opacity: ciInSpring, transform: `translateY(${(1 - ciInSpring) * 24}px)` }}>
                {CI_CHECKS.map((ck) => (
                  <div
                    key={ck.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 22px',
                      borderRadius: 14,
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      border: `1px solid ${COLORS.backend}45`,
                      boxShadow: '0 10px 28px rgba(5, 150, 105, 0.08)',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: COLORS.backend,
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: FONTS.mono,
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </span>
                    <div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{ck.label}</div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 11.5, color: COLORS.muted }}>{ck.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 58,
                  fontWeight: 800,
                  color: COLORS.ink,
                  letterSpacing: '-0.025em',
                  opacity: ciInSpring,
                  transform: `translateY(${(1 - ciInSpring) * 18}px)`,
                }}
              >
                {en ? 'Green CI. All tests pass. ' : 'CI 全绿，测试全过。'}<span style={{ color: COLORS.muted }}>{en ? 'Now what?' : '然后呢？'}</span>
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 2 -> BEAT 4 CONTINUOUS LIVING ARCHITECTURE LAYER (NEVER CUTS AWAY!) ==================== */}
        {frame >= 194 && diagramBgOpacity > 0.01 && (
          <AbsoluteFill
            style={{
              opacity: diagramBgOpacity,
              zIndex: 20,
              transform: `translateX(${lerp(0, liveMorphGraph.CENTER_SHIFT_X, diagramCenterT)}px) translateY(${lerp(
                0,
                22,
                diagramCenterT
              )}px)`,
            }}
          >
            {/* LEFT + CENTER: Crisp 3-Tier Horizontal Architectural Lanes (Stays alive & morphs directly into Atlas!) */}
            <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <marker id="arrow-clean" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={COLORS.dim} />
                </marker>
                <marker id="arrow-ember" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={COLORS.ember} />
                </marker>
                <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={COLORS.security} />
                </marker>
              </defs>

              {/* 3 Pristine Horizontal Layer Swimlanes (gently dissolve as boxes prepare to orbit into Atlas!) */}
              <g opacity={1 - diagramCenterT * 0.55}>
                {TIERS.map((tier) => (
                  <g key={tier.name}>
                    <rect
                      x="130"
                      y={tier.y - 34}
                      width="1195"
                      height="148"
                      rx="18"
                      fill="rgba(255, 255, 255, 0.54)"
                      stroke={COLORS.line}
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                    />
                    <text
                      x="154"
                      y={tier.y - 10}
                      fill={tier.color}
                      fontFamily={FONTS.mono}
                      fontSize="12"
                      fontWeight="800"
                      letterSpacing="0.12em"
                    >
                      {tier.name}
                    </text>
                  </g>
                ))}
              </g>

              {/* Clean Strictly-Downward Arrows (PR #1 Baseline Serenity) */}
              <g opacity={lerp(0.9, 0.25, chaosT)}>
                {[410, 760, 1110].map((cx) => (
                  <React.Fragment key={cx}>
                    <line x1={cx} y1="312" x2={cx} y2="438" stroke={COLORS.dim} strokeWidth="2.2" markerEnd="url(#arrow-clean)" />
                    <line x1={cx} y1="522" x2={cx} y2="648" stroke={COLORS.dim} strokeWidth="2.2" markerEnd="url(#arrow-clean)" />
                  </React.Fragment>
                ))}
              </g>

              {/* MILESTONE 1 (PR #14 ✓): Illegal Layer-Skipping Diagonal Bypass (API -> Infra directly!) */}
              {bypassT > 0.02 && (
                <g opacity={bypassT}>
                  <path
                    d="M 410 312 C 470 430, 960 490, 1085 648"
                    fill="none"
                    stroke={COLORS.ember}
                    strokeWidth="3.8"
                    strokeDasharray="10 6"
                    markerEnd="url(#arrow-ember)"
                  />
                  <path
                    d="M 760 312 C 700 440, 490 500, 425 648"
                    fill="none"
                    stroke={COLORS.ember}
                    strokeWidth="3.2"
                    strokeDasharray="8 5"
                    opacity="0.82"
                    markerEnd="url(#arrow-ember)"
                  />
                </g>
              )}

              {/* MILESTONE 2 (PR #29 ✓): Illegal Upward Reverse Dependencies + Domain Circular Loop! */}
              {reverseT > 0.02 && (
                <g opacity={reverseT}>
                  <path
                    d="M 355 650 C 260 585, 260 545, 355 524"
                    fill="none"
                    stroke={COLORS.security}
                    strokeWidth="3.8"
                    markerEnd="url(#arrow-rose)"
                  />
                  <path
                    d="M 530 478 L 636 478"
                    fill="none"
                    stroke={COLORS.security}
                    strokeWidth="3.6"
                    markerEnd="url(#arrow-rose)"
                  />
                  <path
                    d="M 880 478 L 986 478"
                    fill="none"
                    stroke={COLORS.security}
                    strokeWidth="3.6"
                    markerEnd="url(#arrow-rose)"
                  />
                  <path
                    d="M 1110 440 C 1020 368, 520 368, 430 438"
                    fill="none"
                    stroke={COLORS.security}
                    strokeWidth="3.6"
                    markerEnd="url(#arrow-rose)"
                  />
                </g>
              )}

              {/* MILESTONE 3 (PR #47 ✓): Full Cross-Layer Short-Circuit Web */}
              {chaosT > 0.02 && (
                <g opacity={chaosT}>
                  <path
                    d="M 1110 650 C 1220 510, 1220 390, 1135 314"
                    fill="none"
                    stroke={COLORS.security}
                    strokeWidth="3.2"
                    strokeDasharray="7 5"
                    markerEnd="url(#arrow-rose)"
                  />
                  <path
                    d="M 760 650 C 860 555, 910 395, 785 314"
                    fill="none"
                    stroke={COLORS.ember}
                    strokeWidth="2.8"
                    strokeDasharray="7 5"
                    markerEnd="url(#arrow-ember)"
                  />
                </g>
              )}
            </svg>

            {/* The 9 Crisp Tier Nodes (physically scale down as they split into 36 Atlas file nodes!) */}
            {TIERS.map((tier, ti) =>
              tier.nodes.map((n, ni) => {
                const isCycleNode = ti === 1 && reverseT > 0.3;
                const isHotNode = (n.id === 'billing-core' || n.id === 'ledger-rules') && chaosT > 0.25;
                const isBypassNode = (n.id === 'checkout-api' || n.id === 'legacy-audit') && bypassT > 0.25;
                const accentCol = isHotNode
                  ? COLORS.security
                  : isCycleNode
                  ? COLORS.security
                  : isBypassNode
                  ? COLORS.ember
                  : tier.color;
                return (
                  <div
                    key={n.id}
                    style={{
                      position: 'absolute',
                      left: n.x,
                      top: tier.y + 8,
                      width: 240,
                      height: 76,
                      borderRadius: 13,
                      backgroundColor: isHotNode ? '#FFF1F2' : COLORS.surface,
                      border: `${isHotNode || isCycleNode || isBypassNode ? '2.2px' : '1.4px'} solid ${accentCol}`,
                      boxShadow: isHotNode
                        ? `0 14px 36px ${COLORS.security}28`
                        : '0 8px 22px rgba(18,20,23,0.06)',
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 5,
                      transform: `scale(${lerp(1, 0.72, boxSplitT)})`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 15.5, fontWeight: 800, color: COLORS.ink }}>
                        {n.label}
                      </span>
                      {isHotNode && (
                        <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 900, color: COLORS.security }}>
                          CC {ni === 0 ? 26 : 21} ↑
                        </span>
                      )}
                    </div>
                    <div style={{ height: 5, borderRadius: 999, backgroundColor: COLORS.paperSoft, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${isHotNode ? lerp(28, 92, chaosT) : 28}%`,
                          backgroundColor: isHotNode ? COLORS.security : tier.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 2 CHROME: GREEN CI BAR + ALIGNED TELEMETRY + PUNCHLINE ==================== */}
        {frame >= 194 && driftChromeOut < 0.99 && (
          <AbsoluteFill
            style={{
              opacity: driftStageIn * (1 - driftChromeOut),
              zIndex: 24,
              pointerEvents: 'none',
            }}
          >
            {/* Top Eternally-Green CI Bar */}
            <div
              style={{
                position: 'absolute',
                top: 76,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '12px 28px',
                borderRadius: 999,
                backgroundColor: COLORS.surface,
                border: `1.5px solid ${COLORS.backend}`,
                boxShadow: `0 14px 40px rgba(5, 150, 105, ${0.12 + prFlash * 0.24})`,
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: COLORS.ink, minWidth: 96 }}>
                PR #{prNumber}
              </span>
              <span style={{ width: 1, height: 22, backgroundColor: COLORS.lineHi }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: FONTS.mono, fontSize: 16, fontWeight: 800, color: COLORS.backend }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: COLORS.backend,
                    boxShadow: `0 0 ${10 + prFlash * 14}px ${COLORS.backend}`,
                  }}
                />
                ✓ {testsCount} / {testsCount} UNIT TESTS PASSED · MERGED
              </span>
            </div>

            {/* RIGHT SIDE: Vertically Aligned Top-to-Bottom with the 3-Tier Swimlanes (y: 196..764)! */}
            <div
              style={{
                position: 'absolute',
                right: 92,
                top: 196,
                height: 568,
                width: 420,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 800, color: COLORS.muted, letterSpacing: '0.12em' }}>
                HIDDEN BEHIND GREEN CI
              </div>

              {[
                {
                  label: en ? 'LAYER BYPASSES' : 'LAYER BYPASSES · 跨层偷连',
                  val: String(violationsCount),
                  tag: violationsCount > 0 ? (en ? 'NO CI ERRORS' : 'CI 未报错') : 'CLEAN',
                  color: violationsCount > 0 ? COLORS.ember : COLORS.backend,
                  hot: violationsCount > 0,
                },
                {
                  label: en ? 'IMPORT CYCLES' : 'IMPORT CYCLES · 循环依赖',
                  val: String(cyclesCount),
                  tag: cyclesCount > 0 ? (en ? 'TESTS PASS' : '单测全绿') : 'CLEAN',
                  color: cyclesCount > 0 ? COLORS.security : COLORS.backend,
                  hot: cyclesCount > 0,
                },
                {
                  label: en ? 'MAX COMPLEXITY' : 'MAX COMPLEXITY · 峰值复杂度',
                  val: `CC ${maxCcCount}`,
                  tag: maxCcCount > 15 ? (en ? 'RISING FAST' : '暗中飙升') : 'HEALTHY',
                  color: maxCcCount > 15 ? COLORS.security : COLORS.backend,
                  hot: maxCcCount > 15,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: '22px 24px',
                    borderRadius: 16,
                    backgroundColor: COLORS.surface,
                    border: `1.8px solid ${m.hot ? m.color : COLORS.lineHi}`,
                    boxShadow: m.hot ? `0 16px 40px ${m.color}1C` : '0 8px 24px rgba(18,20,23,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 700, color: COLORS.muted }}>
                      {m.label}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: 999,
                        backgroundColor: `${m.color}16`,
                        color: m.color,
                      }}
                    >
                      {m.tag}
                    </span>
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 900, color: m.color, marginTop: 8 }}>
                    {m.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Sharp Editorial Punchline */}
            <div
              style={{
                position: 'absolute',
                bottom: 58,
                left: 0,
                right: 0,
                textAlign: 'center',
                opacity: easeOutCubic(progressBetween(frame, 230, 258)),
              }}
            >
              <div style={{ fontFamily: FONTS.display, fontSize: 48, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.02em' }}>
                {en ? 'CI stayed green. The architecture ' : 'CI 一路全绿，但架构早已'}
                <span
                  style={{
                    background: `linear-gradient(100deg, ${COLORS.emberLight} 0%, ${COLORS.ember} 48%, ${COLORS.emberDeep} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {en ? 'drifted anyway' : '面目全非'}
                </span>
                {en ? '.' : '。'}
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 20.5, color: COLORS.muted, marginTop: 8 }}>
                {en ? 'Tests can pass in isolation and still miss layer bypasses, import cycles, and runaway complexity.' : 'AI 写的测试只验证单点「跑得通」，防不住跨层偷连、循环耦合与复杂度失控'}
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 3: "WHAT WE BUILT" FLOATS OVER THE LIVING DRIFTED DIAGRAM (376 - 506) ==================== */}
        {frame >= 374 && builtOut < 0.99 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 28,
              opacity: builtIn * (1 - builtOut),
              transform: `scale(${lerp(0.95, 1, builtIn)}) translateY(${-builtOut * 28}px)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 30,
                maxWidth: 1460,
                padding: '44px 56px',
                borderRadius: 28,
                backgroundColor: 'rgba(245, 246, 243, 0.84)',
                border: `1px solid ${COLORS.line}`,
                boxShadow: '0 28px 80px rgba(18, 20, 23, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <EditorialPill label="SO WHAT WE BUILT · ARCHIFY CODE ANALYSIS" color={COLORS.backend} />

              <div style={{ textAlign: 'center', fontFamily: FONTS.display, fontSize: 64, fontWeight: 800, lineHeight: 1.18, color: COLORS.ink, letterSpacing: '-0.025em' }}>
                {en ? 'So we built Archify a' : '所以我们为 Archify 打造了：'}
                <br />
                <span
                  style={{
                    background: `linear-gradient(100deg, ${COLORS.brandBlue} 0%, ${COLORS.brandTeal} 55%, ${COLORS.backend} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {en ? 'deterministic code analysis engine' : '确定性代码分析引擎'}
                </span>
              </div>

              <div style={{ fontFamily: FONTS.sans, fontSize: 22.5, color: COLORS.muted, textAlign: 'center' }}>
                {en ? 'See the architecture your code actually implements. No LLM guesswork, no reliance on green tests alone.' : '不靠大模型盲猜，也不只盯着单测绿灯——直接把眼前的代码架构变成看得见的图谱'}
              </div>

              <div style={{ display: 'flex', gap: 38, marginTop: 8 }}>
                {WHAT_WE_BUILT.map((item, idx) => {
                  const pSpring = spring({
                    frame: Math.max(0, frame - (398 + idx * 12)),
                    fps,
                    config: { damping: 16, stiffness: 150 },
                  });
                  return (
                    <div
                      key={item.num}
                      style={{
                        width: 424,
                        paddingTop: 16,
                        borderTop: `3.5px solid ${item.color}`,
                        opacity: pSpring,
                        transform: `translateY(${(1 - pSpring) * 24}px)`,
                      }}
                    >
                      <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: item.color, letterSpacing: '0.12em' }}>
                        {item.num} · {item.en}
                      </div>
                      <div style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 800, color: COLORS.ink, marginTop: 8 }}>
                        {en ? item.titleEn : item.title}
                      </div>
                      <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.muted, marginTop: 6, lineHeight: 1.55 }}>
                        {en ? item.descEn : item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 4: EXISTING 9 DRIFTED BOXES SPLIT & MORPH DIRECTLY INTO 2D ATLAS RING! (500 - 620) ==================== */}
        {reticleInT > 0.01 && (
          <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
            <defs>
              <filter id="s1-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Existing dependencies curve from the 9 boxes' exact coordinates into bundled Bezier chords inside R=244! */}
            {liveMorphGraph.edges.map((e, idx) => {
              const na = liveMorphGraph.nodes[e.a];
              const nb = liveMorphGraph.nodes[e.b];
              const ax = lerp(na.parentX, na.rx, snapToCircleT);
              const ay = lerp(na.parentY, na.ry, snapToCircleT);
              const bx = lerp(nb.parentX, nb.rx, snapToCircleT);
              const by = lerp(nb.parentY, nb.ry, snapToCircleT);
              const pull = lerp(0.14, 0.58, snapToCircleT);
              const c1x = lerp(ax, 960, pull);
              const c1y = lerp(ay, 526, pull);
              const c2x = lerp(bx, 960, pull);
              const c2y = lerp(by, 526, pull);
              const strokeColor =
                portalDarkT > 0.25
                  ? e.isBad
                    ? COLORS.neonRose
                    : `hsl(${na.hue}, 70%, 62%)`
                  : e.isBad
                  ? COLORS.security
                  : COLORS.brandBlue;
              return (
                <path
                  key={idx}
                  d={`M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(
                    1
                  )} ${c2y.toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={e.isBad ? 1.85 : 1.05}
                  opacity={boxSplitT * (portalDarkT > 0.25 ? (e.isBad ? 0.72 : 0.26) : 0.28)}
                />
              );
            })}

            {/* 36 File Nodes born directly from the 9 drifted boxes, orbiting into Scene 2's exact R=244 ring + complexity spikes! */}
            {liveMorphGraph.nodes.map((n) => {
              const nx = lerp(n.parentX, n.rx, snapToCircleT);
              const ny = lerp(n.parentY, n.ry, snapToCircleT);
              return (
                <g key={n.id} opacity={boxSplitT}>
                  <circle cx={nx} cy={ny} r={4.2} fill={portalDarkT > 0.25 ? `hsl(${n.hue}, 74%, 65%)` : COLORS.brandBlue} />
                  {snapToCircleT > 0.35 && (
                    <line
                      x1={nx}
                      y1={ny}
                      x2={nx + Math.cos(n.ringA) * n.spikeLen * clamp01((snapToCircleT - 0.35) / 0.65)}
                      y2={ny + Math.sin(n.ringA) * n.spikeLen * clamp01((snapToCircleT - 0.35) / 0.65)}
                      stroke={portalDarkT > 0.25 ? `hsl(${n.hue}, 74%, 65%)` : COLORS.signal}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      opacity={clamp01((snapToCircleT - 0.35) / 0.55)}
                    />
                  )}
                </g>
              );
            })}

            {/* Optical Reticle locking onto (960, 526) — exact center of Scene 2 Atlas! */}
            <g transform="translate(960, 526)" opacity={reticleInT} filter={portalDarkT > 0.2 ? 'url(#s1-glow)' : undefined}>
              <g transform={`rotate(${reticleSpin})`}>
                <circle
                  r={lerp(430, 316, snapToCircleT)}
                  fill="none"
                  stroke={portalDarkT > 0.25 ? COLORS.neonCyan : COLORS.brandBlue}
                  strokeWidth={1.8}
                  strokeDasharray="18 14 4 14"
                  opacity={0.78}
                />
              </g>
              <g transform={`rotate(${-reticleSpin * 0.7})`}>
                <circle
                  r={lerp(490, 362, snapToCircleT)}
                  fill="none"
                  stroke={portalDarkT > 0.25 ? COLORS.neonGreen : COLORS.ember}
                  strokeWidth={1.2}
                  strokeDasharray="6 18"
                  opacity={0.55}
                />
              </g>
              <text
                y={-lerp(465, 396, snapToCircleT)}
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="13.5"
                fontWeight="800"
                letterSpacing="0.16em"
                fill={portalDarkT > 0.12 ? COLORS.neonCyan : COLORS.brandBlue}
              >
                STATIC GRAPH LOCK-ON · AST EXTRACTION
              </text>
            </g>
          </svg>
        )}
      </CameraRig>
    </AbsoluteFill>
  );
};
