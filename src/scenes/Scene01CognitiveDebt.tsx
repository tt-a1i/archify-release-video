import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ArchifyLockup,
  ArchifySymbol,
  CameraRig,
  EditorialPill,
  PaperCanvas,
} from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
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

const HIDDEN_TRUTHS = [
  {
    num: '01',
    title: '架构悄然漂移',
    desc: '绕过分层直连内部实现 — CI 不会报错',
    color: COLORS.ember,
  },
  {
    num: '02',
    title: '隐形循环与耦合',
    desc: '跨文件依赖越滚越大 — 单测照样全绿',
    color: COLORS.security,
  },
  {
    num: '03',
    title: '局部复杂度暗涨',
    desc: '嵌套分支激增，认知债留给下个月的维护者',
    color: COLORS.cloud,
  },
];

export const Scene01CognitiveDebt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const graph = useMemo(() => {
    const rand = mulberry32(4201);
    const nodes = Array.from({ length: 32 }).map((_, i) => {
      const angle = rand() * Math.PI * 2;
      const dist = 170 + rand() * 520;
      const cx = 960 + Math.cos(angle) * dist * 1.45;
      const cy = 540 + Math.sin(angle) * dist * 0.78;
      const ringA = -Math.PI / 2 + (i / 32) * Math.PI * 2;
      const rx = 960 + Math.cos(ringA) * 252;
      const ry = 540 + Math.sin(ringA) * 252;
      const hue = Math.round(((i / 32) * 330 + 195) % 360);
      const isAlert = i % 7 === 0 || i % 11 === 0;
      return { id: i, cx, cy, rx, ry, ringA, hue, isAlert };
    });

    const edges = Array.from({ length: 78 }).map((_, i) => {
      const a = Math.floor(rand() * 32);
      let b = Math.floor(rand() * 32);
      if (b === a) b = (a + 5) % 32;
      return { a, b, isBad: i < 12 };
    });

    return { nodes, edges };
  }, []);

  // ==================== CLEAN 4-BEAT FILM OPENING (465 frames = 15.5s) ====================
  // Beat 0 (0 - 54): Minimalist Archify Brand Sting (NO feature spoiler — clean brand signature!)
  const brandIn = spring({ frame, fps, config: { damping: 16, stiffness: 145 } });
  const brandSheenT = easeInOutCubic(progressBetween(frame, 12, 40));
  const brandOut = easeInOutQuart(progressBetween(frame, 40, 62));

  // Beat 1 (54 - 116): Proper Era Premise Setup ("AI 正在以前所未有的速度改写代码库")
  const eraIn = spring({
    frame: Math.max(0, frame - 52),
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  // Era headline glides gracefully upward to anchor the Prompt Capsule below it!
  const eraLiftT = easeInOutQuart(progressBetween(frame, 98, 128));

  // Beat 2 (108 - 196): Concrete Prompt typing -> Blazing Green CI Checkmarks -> "然后呢？"
  const promptIn = easeOutCubic(progressBetween(frame, 106, 126));
  const typedChars = Math.floor(
    interpolate(frame, [114, 148], [0, PROMPT_TEXT.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const enterFlashT = easeOutExpo(progressBetween(frame, 148, 164));
  const ciInSpring = spring({
    frame: Math.max(0, frame - 151),
    fps,
    config: { damping: 16, stiffness: 150 },
  });

  // Beat 3 (198 - 376): Peel away Green CI Illusion -> Spaghetti Chaos & Why AI Tests Can't Stop Drift!
  const peelT = easeInOutCubic(progressBetween(frame, 198, 236));
  const chaosBurstT = easeOutExpo(progressBetween(frame, 202, 250));
  const truthHeadlineIn = spring({
    frame: Math.max(0, frame - 228),
    fps,
    config: { damping: 16, stiffness: 135 },
  });

  // Beat 4 (376 - 465): Optical Reticle Lock-On -> Magnetic Snap to Circle -> Iris into Obsidian Atlas!
  const reticleInT = easeOutCubic(progressBetween(frame, 372, 400));
  const snapToCircleT = easeInOutQuart(progressBetween(frame, 386, 438));
  const portalDarkT = easeInOutCubic(progressBetween(frame, 414, 462));
  const reticleSpin = (frame - 372) * 2.4;

  // Cinematic Camera Rig
  const camZoom =
    lerp(1.05, 1.0, easeOutCubic(progressBetween(frame, 0, 56))) *
    lerp(1.0, 0.91, peelT) *
    lerp(1.0, 1.12, snapToCircleT);
  const camRotX = lerp(0, 7, peelT) * (1 - snapToCircleT);
  const camY = lerp(0, -18, peelT) * (1 - snapToCircleT);

  const textFadeForPortal = 1 - easeInCubic(progressBetween(frame, 372, 402));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas glowA={COLORS.ember} glowB={COLORS.signal} gridOpacity={0.6} />

      {/* Iris Shockwave Portal Transition (Light Paper -> Obsidian Tech Stage!) */}
      {portalDarkT > 0.001 && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.darkBg,
            clipPath: `circle(${portalDarkT * 135}% at 50% 50%)`,
            zIndex: 8,
          }}
        >
          <svg width="1920" height="1080" style={{ opacity: portalDarkT * 0.45 }}>
            <circle cx="960" cy="540" r="252" fill="none" stroke={COLORS.neonCyan} strokeWidth="1.2" opacity="0.4" />
            <circle cx="960" cy="540" r="360" fill="none" stroke={COLORS.neonGreen} strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
          </svg>
        </AbsoluteFill>
      )}

      {/* Persistent Subtle Top-Left Archify Brand Watermark after Brand Sting */}
      {brandOut > 0.25 && (
        <div
          style={{
            position: 'absolute',
            top: 38,
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

      <CameraRig zoom={camZoom} rotateX={camRotX} y={camY}>
        {/* ==================== BEAT 0: CLEAN MINIMAL ARCHIFY BRAND STING (0 - 62) ==================== */}
        {brandOut < 0.98 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 28,
              opacity: brandIn * (1 - brandOut),
              transform: `scale(${lerp(0.86, 1, brandIn) * lerp(1, 0.78, brandOut)}) translateY(${-brandOut * 120}px)`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 24px' }}>
                <ArchifyLockup width={520} variant="light" />
                {brandSheenT > 0.01 && brandSheenT < 0.99 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -20,
                      bottom: -20,
                      left: `${lerp(-30, 130, brandSheenT)}%`,
                      width: 96,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.82), transparent)',
                      transform: 'skewX(-24deg)',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  color: COLORS.muted,
                }}
              >
                NEW RELEASE FILM
              </span>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== CHAOTIC SPAGHETTI GRAPH -> MAGNETIC SNAP TO ATLAS CIRCLE ==================== */}
        {chaosBurstT > 0.01 && (
          <svg
            width="1920"
            height="1080"
            style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none' }}
          >
            <defs>
              <filter id="s1-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {graph.edges.map((e, idx) => {
              const na = graph.nodes[e.a];
              const nb = graph.nodes[e.b];
              const ax = lerp(960, lerp(na.cx, na.rx, snapToCircleT), chaosBurstT);
              const ay = lerp(540, lerp(na.cy, na.ry, snapToCircleT), chaosBurstT);
              const bx = lerp(960, lerp(nb.cx, nb.rx, snapToCircleT), chaosBurstT);
              const by = lerp(540, lerp(nb.cy, nb.ry, snapToCircleT), chaosBurstT);
              const pull = lerp(0.18, 0.58, snapToCircleT);
              const c1x = lerp(ax, 960, pull);
              const c1y = lerp(ay, 540, pull);
              const c2x = lerp(bx, 960, pull);
              const c2y = lerp(by, 540, pull);

              const strokeColor =
                portalDarkT > 0.3
                  ? e.isBad
                    ? COLORS.neonRose
                    : `hsl(${na.hue}, 70%, 62%)`
                  : e.isBad
                  ? COLORS.security
                  : COLORS.ink;

              const baseAlpha =
                portalDarkT > 0.3
                  ? e.isBad
                    ? 0.72
                    : 0.28
                  : e.isBad
                  ? 0.28 * textFadeForPortal + 0.35 * snapToCircleT
                  : 0.085 * textFadeForPortal + 0.14 * snapToCircleT;

              return (
                <path
                  key={idx}
                  d={`M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(
                    1
                  )} ${c2y.toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={e.isBad ? 1.8 : 1.1}
                  opacity={baseAlpha * chaosBurstT}
                />
              );
            })}

            {graph.nodes.map((n) => {
              const nx = lerp(960, lerp(n.cx, n.rx, snapToCircleT), chaosBurstT);
              const ny = lerp(540, lerp(n.cy, n.ry, snapToCircleT), chaosBurstT);
              const r = lerp(n.isAlert ? 7 : 4.5, 4.5, snapToCircleT);
              const fill =
                portalDarkT > 0.3
                  ? `hsl(${n.hue}, 72%, 64%)`
                  : n.isAlert
                  ? COLORS.security
                  : COLORS.inkSoft;
              return (
                <g key={n.id} opacity={chaosBurstT * (0.28 + 0.72 * snapToCircleT)}>
                  <circle cx={nx} cy={ny} r={r} fill={fill} />
                  {snapToCircleT > 0.45 && (
                    <line
                      x1={nx}
                      y1={ny}
                      x2={nx + Math.cos(n.ringA) * (16 + (n.id % 5) * 14) * snapToCircleT}
                      y2={ny + Math.sin(n.ringA) * (16 + (n.id % 5) * 14) * snapToCircleT}
                      stroke={portalDarkT > 0.3 ? `hsl(${n.hue}, 72%, 64%)` : COLORS.signal}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      opacity={(snapToCircleT - 0.45) * 1.8}
                    />
                  )}
                </g>
              );
            })}

            {reticleInT > 0.01 && (
              <g
                transform="translate(960, 540)"
                opacity={reticleInT}
                filter={portalDarkT > 0.25 ? 'url(#s1-glow)' : undefined}
              >
                <g transform={`rotate(${reticleSpin})`}>
                  <circle
                    r={lerp(420, 290, snapToCircleT)}
                    fill="none"
                    stroke={portalDarkT > 0.3 ? COLORS.neonCyan : COLORS.brandBlue}
                    strokeWidth={1.8}
                    strokeDasharray="18 14 4 14"
                    opacity={0.78}
                  />
                </g>
                <g transform={`rotate(${-reticleSpin * 0.7})`}>
                  <circle
                    r={lerp(480, 345, snapToCircleT)}
                    fill="none"
                    stroke={portalDarkT > 0.3 ? COLORS.neonGreen : COLORS.ember}
                    strokeWidth={1.2}
                    strokeDasharray="6 18"
                    opacity={0.55}
                  />
                </g>
                {[0, 90, 180, 270].map((deg) => (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <line
                      x1="0"
                      y1={-lerp(445, 315, snapToCircleT)}
                      x2="0"
                      y2={-lerp(410, 282, snapToCircleT)}
                      stroke={portalDarkT > 0.3 ? COLORS.neonCyan : COLORS.brandBlue}
                      strokeWidth={2.4}
                    />
                  </g>
                ))}
                <text
                  y={-lerp(468, 396, snapToCircleT)}
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
            )}
          </svg>
        )}

        {/* ==================== BEAT 1 & 2: ERA PREMISE -> SEAMLESSLY ANCHORS PROMPT & GREEN CI ==================== */}
        {frame >= 50 && peelT < 0.98 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
              opacity: eraIn * (1 - peelT),
              transform: `translateY(${-peelT * 90}px) scale(${lerp(1, 0.9, peelT)})`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
              {/* Era Statement — starts centered as full-screen editorial beat, then smoothly lifts to frame the prompt! */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  transform: `translateY(${lerp(120, 0, eraLiftT)}px) scale(${lerp(1.16, 0.88, eraLiftT)})`,
                }}
              >
                <EditorialPill label="THE AI CODING ERA" color={COLORS.brandBlue} />
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 60,
                    fontWeight: 800,
                    color: COLORS.ink,
                    letterSpacing: '-0.025em',
                    textAlign: 'center',
                  }}
                >
                  AI 正在以
                  <span
                    style={{
                      background: `linear-gradient(100deg, ${COLORS.brandBlue}, ${COLORS.brandTeal})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    前所未有的速度
                  </span>
                  改写代码库。
                </div>
              </div>

              {/* Concrete Prompt Capsule gliding smoothly underneath the era premise */}
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
                  transform: `translateY(${(1 - promptIn) * 34}px)`,
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
                        opacity: frame % 16 < 9 && frame < 150 ? 1 : 0,
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

              {/* Blazing Green CI Checkmarks */}
              <div
                style={{
                  display: 'flex',
                  gap: 22,
                  opacity: ciInSpring,
                  transform: `translateY(${(1 - ciInSpring) * 24}px)`,
                }}
              >
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
                      <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>
                        {ck.label}
                      </div>
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
                CI 全绿，测试全过。<span style={{ color: COLORS.muted }}>然后呢？</span>
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* ==================== BEAT 3: WHY CI & AI TESTS CAN'T STOP DRIFT ==================== */}
        {frame >= 220 && textFadeForPortal > 0.01 && (
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 25,
              opacity: truthHeadlineIn * textFadeForPortal,
              transform: `scale(${lerp(0.92, 1, truthHeadlineIn)})`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, maxWidth: 1460 }}>
              <EditorialPill label="BEYOND GREEN CI · WHY DEEP ARCHITECTURE ANALYSIS" color={COLORS.ember} />

              <div
                style={{
                  textAlign: 'center',
                  fontFamily: FONTS.display,
                  fontSize: 72,
                  fontWeight: 800,
                  lineHeight: 1.18,
                  letterSpacing: '-0.025em',
                  color: COLORS.ink,
                }}
              >
                AI 写的测试只验证
                <span style={{ color: COLORS.backend }}>「跑得通」</span>，
                <br />
                防不住
                <span
                  style={{
                    background: `linear-gradient(100deg, ${COLORS.emberLight} 0%, ${COLORS.ember} 48%, ${COLORS.emberDeep} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  架构漂移与认知负担
                </span>
                。
              </div>

              <div style={{ display: 'flex', gap: 68, marginTop: 18 }}>
                {HIDDEN_TRUTHS.map((item, idx) => {
                  const tSpring = spring({
                    frame: Math.max(0, frame - (260 + idx * 18)),
                    fps,
                    config: { damping: 16, stiffness: 140 },
                  });
                  return (
                    <div
                      key={item.num}
                      style={{
                        width: 390,
                        paddingTop: 18,
                        borderTop: `3px solid ${item.color}`,
                        opacity: tSpring,
                        transform: `translateY(${(1 - tSpring) * 32}px)`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 13,
                          fontWeight: 800,
                          color: item.color,
                          letterSpacing: '0.12em',
                        }}
                      >
                        {item.num} · HIDDEN BEHIND CI ✓
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 30,
                          fontWeight: 800,
                          color: COLORS.ink,
                          marginTop: 8,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 18,
                          color: COLORS.muted,
                          marginTop: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        )}
      </CameraRig>
    </AbsoluteFill>
  );
};
