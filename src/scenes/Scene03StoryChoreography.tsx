import React from 'react';
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
  lerp,
  progressBetween,
} from '../theme';

interface LightNodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle: string;
  color: string;
  sigil: SigilKind;
  change?: 'added' | 'modified' | 'removed';
  opacity?: number;
  highlight?: number;
  sourceTag?: string;
}

const LightArchifyNode: React.FC<LightNodeProps> = ({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  color,
  sigil,
  change,
  opacity = 1,
  highlight = 0,
  sourceTag,
}) => {
  const isRemoved = change === 'removed';
  const strokeColor =
    change === 'added'
      ? COLORS.backend
      : change === 'removed'
      ? COLORS.security
      : change === 'modified'
      ? COLORS.cloud
      : color;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 16,
        backgroundColor: isRemoved ? 'rgba(255, 255, 255, 0.52)' : COLORS.surface,
        border: `${isRemoved ? '1.8px dashed' : highlight > 0.35 ? '2px solid' : '1.5px solid'} ${
          highlight > 0.35 ? strokeColor : `${strokeColor}77`
        }`,
        boxShadow:
          highlight > 0.3
            ? `0 20px 50px ${strokeColor}24, 0 6px 20px rgba(18, 20, 23, 0.08)`
            : '0 12px 32px rgba(18, 20, 23, 0.06)',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: isRemoved ? opacity * 0.56 : opacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 3.5,
          backgroundColor: strokeColor,
          opacity: isRemoved ? 0.45 : 0.92,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <SemanticSigil kind={sigil} color={strokeColor} size={19} />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16.5,
              fontWeight: 700,
              color: COLORS.ink,
              textDecoration: isRemoved ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
        {change && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              fontWeight: 800,
              padding: '2.5px 9px',
              borderRadius: 999,
              backgroundColor: `${strokeColor}18`,
              border: `1px solid ${strokeColor}66`,
              color: strokeColor,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {change === 'added' ? '+ ADDED' : change === 'removed' ? '− REMOVED' : '~ MOD'}
          </span>
        )}
        {!change && sourceTag && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2.5px 8px',
              borderRadius: 999,
              backgroundColor: `${COLORS.backend}14`,
              border: `1px solid ${COLORS.backend}55`,
              color: COLORS.backend,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {sourceTag}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: 13.5,
          color: COLORS.muted,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// Exact piecewise polyline sampler so flow tokens NEVER drift off orthogonal SVG corridors!
function samplePolyline(pts: [number, number][], t: number): [number, number] {
  const clamped = clamp01(t);
  let total = 0;
  const segLens: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0];
    const dy = pts[i + 1][1] - pts[i][1];
    const len = Math.hypot(dx, dy);
    segLens.push(len);
    total += len;
  }
  let dist = clamped * total;
  for (let i = 0; i < segLens.length; i++) {
    if (dist <= segLens[i] || i === segLens.length - 1) {
      const localT = segLens[i] > 0 ? clamp01(dist / segLens[i]) : 0;
      return [
        lerp(pts[i][0], pts[i + 1][0], localT),
        lerp(pts[i][1], pts[i + 1][1], localT),
      ];
    }
    dist -= segLens[i];
  }
  return pts[pts.length - 1];
}

const ARCH_LEG_1: [number, number][] = [
  [425, 474],
  [540, 474],
];
const ARCH_LEG_2: [number, number][] = [
  [815, 498],
  [885, 498],
  [885, 574],
  [960, 574],
];
const ARCH_LEG_3: [number, number][] = [
  [1235, 574],
  [1350, 574],
];
const ARCH_LEG_4: [number, number][] = [
  [1615, 574],
  [1675, 574],
  [1675, 376],
  [1615, 376],
];
const ARCH_LOCK_LEG: [number, number][] = [
  [678, 528],
  [678, 686],
];

export const Scene03StoryChoreography: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== TIMELINE (820 frames = 27.3s) ====================
  // Beat 3.0 (0 - 98): Engine Intro — 10 Existing Archify Native Diagram Families -> Motion Engine!
  const introIn = spring({ frame, fps, config: { damping: 16, stiffness: 145 } });
  const introOut = easeInOutCubic(progressBetween(frame, 76, 100));

  // Beat 3.1 (92 - 262): WHY NOT LET AI HAND-CODE ANIMATIONS?
  // Direct AI Hand-Coding (brittle pixels / hallucinated code / dead on next PR) vs. Archify Declarative Compiler!
  const howIn = spring({ frame: Math.max(0, frame - 92), fps, config: { damping: 17, stiffness: 140 } });
  const howOut = easeInOutQuart(progressBetween(frame, 236, 264));

  // Local frame for Pulse Billing multi-view walkthrough (compiles directly out of choreography.json!)
  const f = Math.max(0, frame - 248);

  // 0-58: Architecture establishing shot
  const enterT = easeOutCubic(progressBetween(f, 0, 32));
  const removeOldT = easeInOutCubic(progressBetween(f, 55, 95));
  const addNewSpring = spring({
    frame: Math.max(0, f - 82),
    fps,
    config: { damping: 15, stiffness: 135 },
  });
  const archFlowT = progressBetween(f, 108, 200);

  // 205-262: THE MONEY SHOT — Cross-View Shared-Component Morph (Architecture -> Sequence)!
  const morphToSeqT = easeInOutQuart(progressBetween(f, 205, 262));
  const seqMsg1T = easeOutCubic(progressBetween(f, 262, 300));
  const seqMsg2T = easeOutCubic(progressBetween(f, 304, 342));

  // 325-435: Camera tracks left as dark-contrast Git-pinned source excerpt glides in
  const codeSlideIn = spring({
    frame: Math.max(0, f - 325),
    fps,
    config: { damping: 18, stiffness: 130 },
  });
  const codeSlideOut = easeInOutCubic(progressBetween(f, 422, 452));
  const codePanelT = clamp01(codeSlideIn - codeSlideOut);

  // 445-566: Smooth Whip-Pan & Morph to ERD Schema Migration
  const morphToErdT = easeInOutQuart(progressBetween(f, 442, 492));
  const erdRevealT = easeOutCubic(progressBetween(f, 480, 526));

  // ==================== REAL CINEMATIC CAMERA RIG ====================
  const archTrackPanX = lerp(0, 115, easeInOutCubic(archFlowT)) * (1 - morphToSeqT);
  const archTrackZoom =
    lerp(0.94, 1.11, easeInOutCubic(progressBetween(f, 85, 165))) *
    lerp(1, 1 / 1.11, morphToSeqT);

  const seqCamX = lerp(0, 290, codePanelT) * (1 - morphToErdT);
  const seqCamZoom = lerp(1.0, 0.8, codePanelT);
  const erdCamZoom = lerp(1.0, 1.08, easeOutCubic(progressBetween(f, 472, 540)));

  const camX = archTrackPanX + seqCamX;
  const camY = lerp(20, 0, enterT);
  const camZoom = morphToErdT > 0.5 ? erdCamZoom : archTrackZoom * seqCamZoom;

  // Shared Component Morph Coordinates (World space 1920 x 1080)
  const clientX = lerp(180, 260, morphToSeqT);
  const clientY = lerp(420, 185, morphToSeqT);
  const clientW = lerp(245, 235, morphToSeqT);
  const clientH = lerp(108, 84, morphToSeqT);

  const apiX = lerp(540, 660, morphToSeqT);
  const apiY = lerp(420, 185, morphToSeqT);
  const apiW = lerp(275, 255, morphToSeqT);
  const apiH = lerp(108, 84, morphToSeqT);

  const queueX = lerp(960, 1080, morphToSeqT);
  const queueY = lerp(520, 185, morphToSeqT);
  const queueW = lerp(275, 245, morphToSeqT);
  const queueH = lerp(108, 84, morphToSeqT);

  const activeStep = f < 228 ? 0 : f < 458 ? 1 : 2;
  const progressPct = clamp01(f / 555) * 100;

  let caption = '把 Archify 原生 10 种图结构直接变成动态演示：PR 评审、文档讲解、方案汇报或视频工作流，随需导出 SVG 与视频';
  if (frame >= 92 && frame < 248) {
    caption = '为什么不让 AI 直接手写动效代码？AI 只写 20 行声明式意图，镜头、源码校验与无脚本烘焙全交由确定性引擎';
  } else if (frame >= 248 && f < 205) {
    caption = 'Pulse Billing #5：一份 JSON 直接编译出活体演示 —— 同步扣款虚化、异步队列入场，镜头自动紧跟语义流';
  } else if (f >= 205 && f < 325) {
    caption = '跨视图同源变身：同一核心服务从架构图滑入时序图，清晰区分首次 202 与重复幂等命中';
  } else if (f >= 325 && f < 448) {
    caption = '镜头自动让位：右侧滑出 Git 固定提交的真实源码与诚实桩函数边界声明';
  } else if (f >= 448) {
    caption = '一镜到底切入 ERD：UUID 主键不变，新增 org_id 归属、idempotency_key 唯一索引与 amount_cents 升 bigint';
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas glowA={COLORS.signal} glowB={COLORS.brandBlue} gridOpacity={0.55} />

      {/* Minimalist Floating Top-Left Story Step Breadcrumb (NO heavy header bar!) */}
      <div
        style={{
          position: 'absolute',
          top: 38,
          left: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 50,
          opacity: enterT,
        }}
      >
        <EditorialPill label="STORY CHOREOGRAPHY · PULSE BILLING #5" color={COLORS.signal} />
        {[
          { num: '01', name: 'Architecture' },
          { num: '02', name: 'Sequence + Source' },
          { num: '03', name: 'ERD Migration' },
        ].map((s, i) => (
          <span
            key={s.num}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: activeStep === i ? 800 : 500,
              color: activeStep === i ? COLORS.ink : COLORS.dim,
              borderBottom: activeStep === i ? `2.5px solid ${COLORS.ember}` : '2.5px solid transparent',
              paddingBottom: 3,
            }}
          >
            {s.num} {s.name}
          </span>
        ))}
      </div>

      {/* Whisper-Thin Story Progress Hairline at Top Edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progressPct}%`,
          height: 4,
          background: `linear-gradient(90deg, ${COLORS.brandBlue}, ${COLORS.brandTeal}, ${COLORS.ember})`,
          zIndex: 60,
        }}
      />

      {/* ==================== OPENING INTRO: 10 NATIVE DIAGRAMS -> MOTION ENGINE & VIDEO WORKFLOW ==================== */}
      {introOut < 0.99 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 45,
            opacity: introIn * (1 - introOut),
            transform: `scale(${lerp(0.92, 1, introIn) * lerp(1, 1.08, introOut)})`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, maxWidth: 1460 }}>
            <EditorialPill label="PART 02 · FROM SEEING TO EXPLAINING · 动态演示引擎" color={COLORS.ember} />

            <div
              style={{
                textAlign: 'center',
                fontFamily: FONTS.display,
                fontSize: 68,
                fontWeight: 800,
                lineHeight: 1.18,
                color: COLORS.ink,
                letterSpacing: '-0.025em',
              }}
            >
              把 Archify 原生{' '}
              <span
                style={{
                  background: `linear-gradient(100deg, ${COLORS.brandBlue}, ${COLORS.brandTeal})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                10 种图结构
              </span>
              ，
              <br />
              直接变成可自由编排的动态演示。
            </div>

            <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: COLORS.muted, fontWeight: 500 }}>
              PR 评审 · 技术文档 · 架构汇报 · 视频工作流 — 一次编排，按场景自由交付
            </div>

            {/* 10 Native Diagram Family Pills (clean symmetrical 5 + 5 grid!) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(156px, auto))',
                gap: 14,
                justifyItems: 'center',
              }}
            >
              {[
                { name: 'Architecture', hl: true, c: COLORS.brandBlue },
                { name: 'Workflow', hl: false, c: COLORS.signal },
                { name: 'Sequence', hl: true, c: COLORS.backend },
                { name: 'Dataflow', hl: false, c: COLORS.messagebus },
                { name: 'Lifecycle', hl: false, c: COLORS.database },
                { name: 'ERD', hl: true, c: COLORS.ember },
                { name: 'Class', hl: false, c: COLORS.frontend },
                { name: 'Tree', hl: false, c: COLORS.backend },
                { name: 'Timeline', hl: false, c: COLORS.cloud },
                { name: 'Waterfall', hl: false, c: COLORS.security },
              ].map((d, idx) => {
                const chipT = easeOutCubic(progressBetween(frame, 4 + idx * 1.4, 16 + idx * 1.4));
                return (
                  <span
                    key={d.name}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 999,
                      fontFamily: FONTS.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      backgroundColor: d.hl ? COLORS.surface : 'rgba(255,255,255,0.68)',
                      border: `${d.hl ? '2px' : '1px'} solid ${d.hl ? d.c : COLORS.lineHi}`,
                      color: d.hl ? d.c : COLORS.muted,
                      boxShadow: d.hl ? `0 12px 30px ${d.c}22` : 'none',
                      opacity: chipT,
                      transform: `translateY(${(1 - chipT) * 18}px)`,
                    }}
                  >
                    {d.name}
                  </span>
                );
              })}
            </div>

            <div style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: COLORS.muted }}>
              EXPORT AS: &nbsp;
              <span style={{ color: COLORS.brandBlue }}>Dual-Theme Animated SVG</span>
              &nbsp;·&nbsp;
              <span style={{ color: COLORS.backend }}>Offline Stage HTML</span>
              &nbsp;·&nbsp;
              <span style={{ color: COLORS.ember }}>1080p60 MP4 / WebM</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 3.1: WHY DECLARATIVE CHOREOGRAPHY > DIRECT AI HAND-CODING (92 - 264) ==================== */}
      {frame >= 90 && howOut < 0.99 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 44,
            opacity: howIn * (1 - howOut),
            transform: `scale(${lerp(0.94, 1, howIn) * lerp(1, 1.07, howOut)})`,
          }}
        >
          <div style={{ width: 1620, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, marginTop: -22 }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <EditorialPill label="HOW IT WORKS · DETERMINISTIC CHOREOGRAPHY COMPILER" color={COLORS.brandBlue} />
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 54,
                  fontWeight: 800,
                  color: COLORS.ink,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                为什么不让 AI 直接手写动效？
                <span style={{ color: COLORS.brandBlue }}>AI 只写意图，引擎确定性编译。</span>
              </div>
            </div>

            {/* Split Editorial Grid: Left = Fragile Direct AI Hand-Coding | Right = Archify Declarative JSON -> Compiler */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '0.88fr 1.24fr', gap: 36, alignItems: 'stretch' }}>
              {/* LEFT: Direct AI Hand-Coding Pitfalls */}
              <div
                style={{
                  borderRadius: 22,
                  backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  border: `1.5px solid ${COLORS.security}44`,
                  padding: '26px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: '0 16px 44px rgba(18, 20, 23, 0.05)',
                }}
              >
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: COLORS.security, letterSpacing: '0.1em' }}>
                    VS. DIRECT AI HAND-CODED SVG / HTML / VIDEO
                  </div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.ink, marginTop: 6 }}>
                    直接让 AI 手写动画代码
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {[
                    {
                      title: '手猜像素坐标，改一处全图撞车',
                      sub: '元素遮挡、字数溢出、镜头走位全靠人肉反复微调',
                    },
                    {
                      title: '源码容易编造，与真实提交脱节',
                      sub: 'AI 随手改写示例行号与字段，代码一合并立刻过时',
                    },
                    {
                      title: '一次性死资产，贴不进 PR 与文档',
                      sub: '无法在 GitHub PR / GitLab MR 原生播放，也难复用',
                    },
                  ].map((item, idx) => {
                    const rowT = easeOutCubic(progressBetween(frame, 108 + idx * 14, 128 + idx * 14));
                    return (
                      <div
                        key={item.title}
                        style={{
                          padding: '13px 16px',
                          borderRadius: 13,
                          backgroundColor: '#FFF1F2',
                          border: `1px solid ${COLORS.security}33`,
                          opacity: rowT,
                          transform: `translateX(${(1 - rowT) * -18}px)`,
                        }}
                      >
                        <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, fontWeight: 800, color: COLORS.security }}>
                          ✗ &nbsp;{item.title}
                        </div>
                        <div style={{ fontFamily: FONTS.sans, fontSize: 13.5, color: COLORS.muted, marginTop: 4 }}>
                          {item.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Archify Declarative Choreography Spec -> Deterministic Compiler -> Any Output / Video Pipeline! */}
              <div
                style={{
                  borderRadius: 22,
                  backgroundColor: COLORS.surface,
                  border: `2px solid ${COLORS.brandBlue}`,
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: `0 24px 64px ${COLORS.brandBlue}1A, 0 6px 20px rgba(18, 20, 23, 0.06)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 800, color: COLORS.brandBlue, letterSpacing: '0.1em' }}>
                      ARCHIFY STORY CHOREOGRAPHY · DECLARATIVE SPEC
                    </div>
                    <div style={{ fontFamily: FONTS.display, fontSize: 25, fontWeight: 800, color: COLORS.ink, marginTop: 4 }}>
                      一份极简 JSON 编排 → 确定性编译多端交付
                    </div>
                  </div>
                  <EditorialPill label="ZERO KEYFRAMES" color={COLORS.backend} />
                </div>

                {/* Real Compact story-choreography JSON */}
                <div
                  style={{
                    borderRadius: 14,
                    backgroundColor: '#0C111D',
                    padding: '14px 18px',
                    fontFamily: FONTS.mono,
                    fontSize: 13.2,
                    lineHeight: 1.65,
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 11.5, marginBottom: 4 }}>
                    <span>pulse-billing.choreography.json</span>
                    <span style={{ color: COLORS.neonCyan }}>AI ONLY AUTHORS INTENT</span>
                  </div>
                  {[
                    { code: '"views": ["architecture", "sequence", "erd"],', c: '#E2E8F0', hl: false },
                    { code: '"transition": { "shared": ["checkout_api"] },   // 跨视图同源变形', c: COLORS.neonCyan, hl: true },
                    { code: '"trace": { "edges": ["m_claim", "m_enq"] },    // 原生路径语义流', c: COLORS.neonGreen, hl: true },
                    { code: '"detail": { "path": "src/routes/checkout.ts", "revision": "8bcb443" }', c: COLORS.neonAmber, hl: true },
                  ].map((ln, idx) => (
                    <div
                      key={idx}
                      style={{
                        color: ln.c,
                        backgroundColor: ln.hl ? `${ln.c}14` : 'transparent',
                        borderLeft: ln.hl ? `3px solid ${ln.c}` : '3px solid transparent',
                        padding: '1px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {ln.code}
                    </div>
                  ))}
                </div>

                {/* 3 Deterministic Compiler Superpowers + Direct Video Workflow Plug-In */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    {
                      tag: 'AUTO CAMERA',
                      title: '原生包围盒算镜头',
                      sub: 'fitCamera() 自动取景，改图重跑零返工',
                      color: COLORS.brandBlue,
                    },
                    {
                      tag: 'GUARDRAILS',
                      title: 'Git SHA 真实校验',
                      sub: '强校验文件行号与护栏，拒绝编造幻觉',
                      color: COLORS.backend,
                    },
                    {
                      tag: 'VIDEO PIPELINE',
                      title: '直入 PR & 视频流',
                      sub: '贴 PR/MR 动图，或出 1080p60 入 Remotion',
                      color: COLORS.ember,
                    },
                  ].map((p, idx) => {
                    const pT = spring({
                      frame: Math.max(0, frame - (142 + idx * 14)),
                      fps,
                      config: { damping: 16, stiffness: 150 },
                    });
                    return (
                      <div
                        key={p.tag}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          backgroundColor: COLORS.paper,
                          border: `1.4px solid ${p.color}55`,
                          opacity: pT,
                          transform: `translateY(${(1 - pT) * 18}px)`,
                        }}
                      >
                        <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 800, color: p.color, letterSpacing: '0.08em' }}>
                          ✓ {p.tag}
                        </div>
                        <div style={{ fontFamily: FONTS.display, fontSize: 16.5, fontWeight: 800, color: COLORS.ink, marginTop: 4 }}>
                          {p.title}
                        </div>
                        <div style={{ fontFamily: FONTS.sans, fontSize: 12.5, color: COLORS.muted, marginTop: 4, lineHeight: 1.45 }}>
                          {p.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BORDERLESS CAMERA-TRACKED WORLD ==================== */}
      <CameraRig x={camX} y={camY} zoom={camZoom}>
        {/* Architecture + Sequence Unified Morph Canvas */}
        <AbsoluteFill style={{ opacity: enterT * (1 - morphToErdT) }}>
          <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <filter id="light-token-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* STAGE A: Architecture Edges */}
            <g opacity={1 - morphToSeqT}>
              <path d="M 425 474 L 540 474" fill="none" stroke={COLORS.frontend} strokeWidth={2.8} />
              {/* Removed Sync Edge */}
              <path
                d="M 815 448 L 885 448 L 885 322 L 960 322"
                fill="none"
                stroke={COLORS.security}
                strokeWidth={2.4}
                strokeDasharray="7 5"
                opacity={lerp(0.95, 0.38, removeOldT)}
              />
              <text
                x="964"
                y="256"
                fill={COLORS.security}
                fontFamily={FONTS.mono}
                fontSize="13"
                fontWeight="700"
                opacity={lerp(1, 0.6, removeOldT)}
              >
                sync 200 OK (removed)
              </text>

              {/* Added Async Corridors */}
              <g opacity={addNewSpring}>
                <path
                  d="M 815 498 L 885 498 L 885 574 L 960 574"
                  fill="none"
                  stroke={COLORS.backend}
                  strokeWidth={3}
                />
                <path
                  d="M 1235 574 L 1350 574"
                  fill="none"
                  stroke={COLORS.messagebus}
                  strokeWidth={3}
                />
                <path
                  d="M 1615 574 L 1675 574 L 1675 376 L 1615 376"
                  fill="none"
                  stroke={COLORS.database}
                  strokeWidth={2.8}
                />
                <path
                  d="M 678 528 L 678 686"
                  fill="none"
                  stroke={COLORS.backend}
                  strokeWidth={2.6}
                />

                {/* Traveling Live Semantic Tokens — strictly locked to exact orthogonal SVG paths! */}
                {archFlowT > 0 && archFlowT < 1 && (() => {
                  const legs: { pts: [number, number][]; start: number; end: number; color: string }[] = [
                    { pts: ARCH_LEG_1, start: 0.0, end: 0.2, color: COLORS.frontend },
                    { pts: ARCH_LOCK_LEG, start: 0.22, end: 0.44, color: COLORS.backend },
                    { pts: ARCH_LEG_2, start: 0.24, end: 0.56, color: COLORS.backend },
                    { pts: ARCH_LEG_3, start: 0.58, end: 0.76, color: COLORS.messagebus },
                    { pts: ARCH_LEG_4, start: 0.78, end: 1.0, color: COLORS.database },
                  ];
                  return legs.map((leg, li) => {
                    if (archFlowT < leg.start || archFlowT > leg.end) return null;
                    const u = (archFlowT - leg.start) / (leg.end - leg.start);
                    const head = samplePolyline(leg.pts, easeInOutCubic(u));
                    const tail1 = samplePolyline(leg.pts, easeInOutCubic(Math.max(0, u - 0.09)));
                    const tail2 = samplePolyline(leg.pts, easeInOutCubic(Math.max(0, u - 0.18)));
                    return (
                      <g key={li} filter="url(#light-token-glow)">
                        <circle cx={tail2[0]} cy={tail2[1]} r={4.2} fill={leg.color} opacity={0.35} />
                        <circle cx={tail1[0]} cy={tail1[1]} r={6} fill={leg.color} opacity={0.68} />
                        <circle cx={head[0]} cy={head[1]} r={8.2} fill="#FFFFFF" stroke={leg.color} strokeWidth={3.2} />
                      </g>
                    );
                  });
                })()}
              </g>
            </g>

            {/* STAGE B: Sequence Lifelines & Crisp Messages */}
            {morphToSeqT > 0.05 && (
              <g opacity={morphToSeqT}>
                {[
                  { x: 378, color: COLORS.frontend },
                  { x: 788, color: COLORS.backend },
                  { x: 1202, color: COLORS.messagebus },
                ].map((line, i) => (
                  <line
                    key={i}
                    x1={line.x}
                    y1={274}
                    x2={line.x}
                    y2={lerp(278, 860, morphToSeqT)}
                    stroke={line.color}
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    opacity={0.42}
                  />
                ))}

                {/* Sequence Message 1: First Request -> 202 queued { invoiceId, jobId } */}
                <g opacity={seqMsg1T}>
                  <line
                    x1={378}
                    y1={362}
                    x2={lerp(378, 788, seqMsg1T)}
                    y2={362}
                    stroke={COLORS.frontend}
                    strokeWidth={3}
                  />
                  <text x={402} y={346} fill={COLORS.ink} fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
                    1. POST /checkout (Key: k1)
                  </text>

                  <line
                    x1={788}
                    y1={426}
                    x2={lerp(788, 1202, seqMsg1T)}
                    y2={426}
                    stroke={COLORS.messagebus}
                    strokeWidth={3}
                  />
                  <text x={812} y={410} fill={COLORS.messagebus} fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
                    enqueueCheckoutJob(&#123; orgId, idempotencyKey &#125;)
                  </text>

                  <line
                    x1={788}
                    y1={498}
                    x2={lerp(788, 378, seqMsg1T)}
                    y2={498}
                    stroke={COLORS.backend}
                    strokeWidth={3.2}
                    strokeDasharray="8 5"
                  />
                  <rect x={410} y={462} width={346} height={30} rx={8} fill={`${COLORS.backend}18`} stroke={COLORS.backend} />
                  <text x={426} y={482} fill={COLORS.backend} fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
                    202 queued &#123; invoiceId, jobId &#125;
                  </text>
                </g>

                {/* Sequence Message 2: Duplicate Request -> Idempotency Hit! */}
                <g opacity={seqMsg2T}>
                  <rect
                    x={318}
                    y={568}
                    width={940}
                    height={210}
                    rx={18}
                    fill="rgba(8, 145, 178, 0.05)"
                    stroke={`${COLORS.frontend}55`}
                    strokeDasharray="6 5"
                  />
                  <text x={346} y={602} fill={COLORS.frontend} fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>
                    DUPLICATE / RETRY REQUEST (SAME IDEMPOTENCY KEY: k1)
                  </text>
                  <line
                    x1={378}
                    y1={652}
                    x2={lerp(378, 788, seqMsg2T)}
                    y2={652}
                    stroke={COLORS.frontend}
                    strokeWidth={2.8}
                  />
                  <text x={402} y={638} fill={COLORS.ink} fontFamily={FONTS.mono} fontSize={15}>
                    2. POST /checkout (Key: k1 retry)
                  </text>
                  <line
                    x1={788}
                    y1={726}
                    x2={lerp(788, 378, seqMsg2T)}
                    y2={726}
                    stroke={COLORS.cloud}
                    strokeWidth={3}
                    strokeDasharray="8 5"
                  />
                  <rect x={402} y={690} width={356} height={30} rx={8} fill={`${COLORS.cloud}1A`} stroke={COLORS.cloud} />
                  <text x={418} y={710} fill={COLORS.cloud} fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
                    202 queued &#123; invoiceId &#125; (no re-queue)
                  </text>
                </g>
              </g>
            )}
          </svg>

          {/* SHARED MORPHING NODES (Glide cleanly from Architecture -> Sequence!) */}
          <LightArchifyNode
            x={clientX}
            y={clientY}
            w={clientW}
            h={clientH}
            title="Web Client"
            subtitle="Checkout UI · Retry Safe"
            color={COLORS.frontend}
            sigil="frontend"
            highlight={morphToSeqT > 0.1 && morphToSeqT < 0.9 ? 1 : 0.35}
          />
          <LightArchifyNode
            x={apiX}
            y={apiY}
            w={apiW}
            h={apiH}
            title="Checkout API"
            subtitle="POST /checkout → 202"
            color={COLORS.backend}
            sigil="backend"
            change={morphToSeqT < 0.2 ? 'modified' : undefined}
            sourceTag="SRC 2"
            highlight={0.9}
          />
          <LightArchifyNode
            x={queueX}
            y={queueY}
            w={queueW}
            h={queueH}
            title="Org Queue"
            subtitle="Per-org async partition"
            color={COLORS.messagebus}
            sigil="messagebus"
            change={morphToSeqT < 0.2 ? 'added' : undefined}
            opacity={addNewSpring}
            highlight={0.75}
          />

          {/* Architecture-Only Neighbor Nodes */}
          {morphToSeqT < 0.8 && (
            <>
              <LightArchifyNode
                x={960}
                y={268}
                w={335}
                h={106}
                title="Sync Charge & Mail"
                subtitle="Blocking 200 OK · retired"
                color={COLORS.security}
                sigil="backend"
                change={removeOldT > 0.15 ? 'removed' : undefined}
                opacity={1 - morphToSeqT * 1.4}
              />
              <LightArchifyNode
                x={534}
                y={686}
                w={290}
                h={100}
                title="Idempotency Lock"
                subtitle="UNIQUE(idempotency_key)"
                color={COLORS.backend}
                sigil="security"
                change="added"
                opacity={addNewSpring * (1 - morphToSeqT * 1.5)}
              />
              <LightArchifyNode
                x={1350}
                y={520}
                w={265}
                h={108}
                title="Async Worker"
                subtitle="Charges + sends receipt"
                color={COLORS.backend}
                sigil="backend"
                change="added"
                opacity={addNewSpring * (1 - morphToSeqT * 1.5)}
              />
              <LightArchifyNode
                x={1350}
                y={322}
                w={265}
                h={108}
                title="Invoices DB"
                subtitle="PostgreSQL · org_id"
                color={COLORS.database}
                sigil="database"
                change="modified"
                opacity={1 - morphToSeqT * 1.3}
              />
            </>
          )}
        </AbsoluteFill>

        {/* STAGE C: Borderless Floating ERD Schema Migration */}
        {morphToErdT > 0.04 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 96,
              opacity: morphToErdT,
              transform: `scale(${lerp(0.92, 1, morphToErdT)})`,
            }}
          >
            {/* Organizations Table */}
            <div
              style={{
                width: 390,
                borderRadius: 18,
                backgroundColor: COLORS.surface,
                border: `1.5px solid ${COLORS.database}66`,
                boxShadow: '0 22px 60px rgba(18, 20, 23, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: `${COLORS.database}12`,
                  borderBottom: `1px solid ${COLORS.line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 19, fontWeight: 800, color: COLORS.ink }}>
                  organizations
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 700, color: COLORS.database }}>
                  ENTITY
                </span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONTS.mono, fontSize: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.ink, fontWeight: 600 }}>
                  <span>PK id</span>
                  <span style={{ color: COLORS.muted }}>uuid</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.muted }}>
                  <span>slug</span>
                  <span>text NOT NULL UNIQUE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.muted }}>
                  <span>stripe_account_id</span>
                  <span>text NOT NULL</span>
                </div>
              </div>
            </div>

            {/* 1:N Relation Connector */}
            <svg width="110" height="60" style={{ overflow: 'visible' }}>
              <line x1="-24" y1="30" x2="132" y2="30" stroke={COLORS.backend} strokeWidth="3.2" />
              <line x1="0" y1="18" x2="0" y2="42" stroke={COLORS.backend} strokeWidth="3.2" />
              <path d="M 110 18 L 132 30 L 110 42" fill="none" stroke={COLORS.backend} strokeWidth="3.2" />
              <text x="55" y="14" textAnchor="middle" fill={COLORS.backend} fontFamily={FONTS.mono} fontSize="13.5" fontWeight="800">
                1 : N owns
              </text>
            </svg>

            {/* Invoices Table */}
            <div
              style={{
                width: 630,
                borderRadius: 18,
                backgroundColor: COLORS.surface,
                border: `2px solid ${COLORS.backend}`,
                boxShadow: `0 26px 70px ${COLORS.backend}1F, 0 10px 30px rgba(18, 20, 23, 0.08)`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 22px',
                  backgroundColor: `${COLORS.backend}12`,
                  borderBottom: `1px solid ${COLORS.line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: COLORS.ink }}>
                    invoices
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted, marginLeft: 12 }}>
                    db/schema.sql : L12–L21
                  </span>
                </div>
                <EditorialPill label="~ SCHEMA MIGRATED" color={COLORS.backend} />
              </div>
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONTS.mono, fontSize: 14.5 }}>
                {[
                  { col: 'PK id', type: 'uuid', change: 'unchanged' as const },
                  { col: '+ FK org_id', type: 'uuid NOT NULL', change: 'added' as const },
                  { col: '+ idempotency_key', type: 'text · UNIQUE INDEX', change: 'added' as const },
                  { col: '~ amount_cents', type: 'integer → bigint NOT NULL', change: 'modified' as const },
                  { col: 'status', type: "text DEFAULT 'queued'", change: 'unchanged' as const },
                ].map((r, idx) => {
                  const rowT = easeOutCubic(progressBetween(f, 476 + idx * 8, 502 + idx * 8));
                  const c =
                    r.change === 'added'
                      ? COLORS.backend
                      : r.change === 'modified'
                      ? COLORS.cloud
                      : COLORS.muted;
                  return (
                    <div
                      key={r.col}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 15px',
                        borderRadius: 10,
                        backgroundColor: r.change === 'unchanged' ? COLORS.paper : `${c}14`,
                        border: `1px solid ${r.change === 'unchanged' ? COLORS.line : `${c}55`}`,
                        opacity: erdRevealT * rowT,
                        transform: `translateX(${(1 - rowT) * 24}px)`,
                      }}
                    >
                      <span style={{ color: r.change === 'unchanged' ? COLORS.ink : c, fontWeight: 700 }}>
                        {r.col}
                      </span>
                      <span style={{ color: r.change === 'unchanged' ? COLORS.muted : COLORS.ink, fontWeight: 600 }}>
                        {r.type}
                      </span>
                    </div>
                  );
                })}
                <div
                  style={{
                    marginTop: 4,
                    padding: '9px 14px',
                    borderRadius: 9,
                    backgroundColor: 'rgba(8, 86, 245, 0.06)',
                    border: `1px solid ${COLORS.brandBlue}33`,
                    fontFamily: FONTS.mono,
                    fontSize: 12.5,
                    color: COLORS.brandBlue,
                    fontWeight: 700,
                    opacity: erdRevealT,
                  }}
                >
                  CREATE UNIQUE INDEX invoices_idempotency_key_idx ON invoices (idempotency_key);
                </div>
              </div>
            </div>
          </AbsoluteFill>
        )}
      </CameraRig>

      {/* Dark-Ink Git-Pinned Source Excerpt — Vertically Centered on Optical Axis (y=508, EXACT commit 8bcb443!) */}
      {codePanelT > 0.01 && (
        <div
          style={{
            position: 'absolute',
            right: 52,
            top: 508,
            width: 724,
            borderRadius: 20,
            backgroundColor: '#0C111D',
            border: `1px solid rgba(52, 211, 153, 0.45)`,
            boxShadow: '0 32px 84px rgba(18, 20, 23, 0.28)',
            transform: `translateY(-50%) translateX(${(1 - codePanelT) * 780}px)`,
            opacity: codePanelT,
            overflow: 'hidden',
            zIndex: 55,
          }}
        >
          <div
            style={{
              padding: '13px 20px',
              borderBottom: '1px solid rgba(148,163,184,0.16)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 700, color: '#F8FAFC' }}>
              src/routes/checkout.ts : L19–L34
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11.5,
                fontWeight: 700,
                color: COLORS.neonGreen,
                padding: '3px 10px',
                borderRadius: 999,
                backgroundColor: 'rgba(52, 211, 153, 0.14)',
              }}
            >
              PINNED @ 8bcb443
            </span>
          </div>
          <div style={{ padding: '16px 20px', fontFamily: FONTS.mono, fontSize: 12.2, lineHeight: 1.62 }}>
            {[
              { n: 19, code: '  if (!lock.acquired) {', hl: true, c: COLORS.neonAmber },
              {
                n: 20,
                code: '    return { status: 202, body: { invoiceId: lock.existingInvoiceId, status: "queued" as const } };',
                hl: true,
                c: COLORS.neonAmber,
              },
              { n: 21, code: '  }', hl: true, c: COLORS.neonAmber },
              { n: 23, code: '  const { jobId } = await enqueueCheckoutJob({', hl: true, c: COLORS.neonGreen },
              { n: 24, code: '    invoiceId,', hl: false },
              { n: 25, code: '    orgId: req.orgId,', hl: false },
              { n: 26, code: '    seatCount: req.seatCount,', hl: false },
              { n: 27, code: '    amountCents: req.amountCents,', hl: false },
              { n: 28, code: '    idempotencyKey: req.idempotencyKey,', hl: false },
              { n: 29, code: '  });', hl: false },
              { n: 31, code: '  return {', hl: true, c: COLORS.neonGreen },
              { n: 32, code: '    status: 202,', hl: true, c: COLORS.neonGreen },
              { n: 33, code: '    body: { invoiceId, jobId, status: "queued" as const },', hl: true, c: COLORS.neonGreen },
              { n: 34, code: '  };', hl: true, c: COLORS.neonGreen },
            ].map((row) => (
              <div
                key={row.n}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '1.5px 8px',
                  borderRadius: 5,
                  backgroundColor: row.hl ? `${row.c}1E` : 'transparent',
                  borderLeft: row.hl ? `3px solid ${row.c}` : '3px solid transparent',
                }}
              >
                <span style={{ color: '#475569', width: 22, textAlign: 'right', flexShrink: 0 }}>{row.n}</span>
                <span
                  style={{
                    color: row.hl ? '#FFFFFF' : '#94A3B8',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {row.code}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(148,163,184,0.16)',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              fontFamily: FONTS.sans,
              fontSize: 13.5,
              color: COLORS.neonAmber,
            }}
          >
            诚实边界：enqueueCheckoutJob() 为示例桩，仅返回示例 ID，不从动效虚构持久化保证。
          </div>
        </div>
      )}

      <FloatingCaption kicker="STORY CHOREOGRAPHY" text={caption} accent={COLORS.signal} />
    </AbsoluteFill>
  );
};
