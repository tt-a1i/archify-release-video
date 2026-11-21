import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CameraRig,
  EditorialPill,
  FloatingCaption,
  PaperCanvas,
  SemanticSigil,
} from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  lerp,
  progressBetween,
} from '../theme';

const DualThemeDiagramSurface: React.FC<{ theme: 'light' | 'dark'; pulseU: number }> = ({
  theme,
  pulseU,
}) => {
  const dark = theme === 'dark';
  const bg = dark ? '#0A0F1C' : '#FFFFFF';
  const card = dark ? '#11192B' : '#F8FAFC';
  const border = dark ? 'rgba(148,163,184,0.22)' : 'rgba(18,20,23,0.12)';
  const ink = dark ? '#F8FAFC' : '#121417';
  const muted = dark ? '#94A3B8' : '#5A616E';
  const green = dark ? '#34D399' : '#059669';
  const cyan = dark ? '#22D3EE' : '#0891B2';
  const orange = dark ? '#FB923C' : '#EA580C';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        borderRadius: 20,
        border: `1.5px solid ${border}`,
        padding: '28px 34px',
        boxShadow: dark ? '0 32px 80px rgba(0,0,0,0.45)' : '0 28px 72px rgba(18,20,23,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: cyan }}>
          {dark ? 'DARK THEME · prefers-color-scheme: dark' : 'LIGHT THEME · prefers-color-scheme: light'}
        </span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: muted }}>
          pulse-billing-{theme}.svg · Zero-Script Camo-safe (GitHub PR / GitLab MR)
        </span>
      </div>

      <svg width="980" height="310" viewBox="0 0 980 310" style={{ width: '100%', height: 'auto' }}>
        <path d="M 240 148 L 365 148" fill="none" stroke={cyan} strokeWidth="3.2" />
        <path d="M 615 148 L 735 148" fill="none" stroke={orange} strokeWidth="3.2" />
        <path
          d="M 490 210 L 490 264 L 845 264 L 845 210"
          fill="none"
          stroke={green}
          strokeWidth="2.8"
          strokeDasharray="7 5"
        />

        {/* Animated Semantic Token */}
        <circle cx={lerp(240, 735, pulseU)} cy={148} r={8.5} fill={green} />

        {/* Node 1 */}
        <g transform="translate(20, 88)">
          <rect width="220" height="120" rx="14" fill={card} stroke={cyan} strokeWidth="2.2" />
          <text x="22" y="48" fill={ink} fontFamily={FONTS.mono} fontSize="18" fontWeight="800">
            Checkout API
          </text>
          <text x="22" y="82" fill={muted} fontFamily={FONTS.sans} fontSize="14.5">
            202 queued · async
          </text>
        </g>

        {/* Node 2 */}
        <g transform="translate(365, 88)">
          <rect width="250" height="120" rx="14" fill={card} stroke={green} strokeWidth="2.4" />
          <text x="22" y="48" fill={ink} fontFamily={FONTS.mono} fontSize="18" fontWeight="800">
            Idempotency
          </text>
          <text x="22" y="82" fill={green} fontFamily={FONTS.mono} fontSize="13" fontWeight="800">
            + UNIQUE(idempotency_key)
          </text>
        </g>

        {/* Node 3 */}
        <g transform="translate(735, 88)">
          <rect width="220" height="120" rx="14" fill={card} stroke={orange} strokeWidth="2.2" />
          <text x="22" y="48" fill={ink} fontFamily={FONTS.mono} fontSize="18" fontWeight="800">
            Org Queue
          </text>
          <text x="22" y="82" fill={muted} fontFamily={FONTS.sans} fontSize="14.5">
            Per-org Worker
          </text>
        </g>
      </svg>
    </div>
  );
};

export const Scene05WorkflowDeliverables: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part A (0 - 195): Floating Dual-Theme Diagonal Sweep with 3D parallax
  // Part B (195 - 390): Borderless 4-Stage AI Loop with Camera Dolly Tracking along pulse!
  const partAIn = spring({ frame, fps, config: { damping: 17, stiffness: 130 } });
  const themeSweepT = easeInOutQuart(progressBetween(frame, 44, 134));
  const partOutT = easeInOutCubic(progressBetween(frame, 180, 212));

  const loopIn = easeOutCubic(progressBetween(frame, 198, 228));
  const pulseStage = progressBetween(frame, 222, 336);
  const resolvedT = easeOutCubic(progressBetween(frame, 322, 354));

  // Camera tracks across the 4-stage pipeline, then pulls back wide for the Green Resolved hero shot!
  const loopPullBack = easeInOutCubic(progressBetween(frame, 326, 366));
  const loopCamX = lerp(-240, 240, easeInOutCubic(pulseStage)) * (1 - loopPullBack);
  const loopCamZoom = lerp(1.18, 1.0, loopPullBack);

  const isLoop = frame >= 198;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas
        glowA={isLoop ? COLORS.backend : COLORS.brandBlue}
        glowB={isLoop ? COLORS.signal : COLORS.ember}
        gridOpacity={0.55}
      />

      {/* ==================== PART A: DUAL-THEME PR SVG SWEEP ==================== */}
      {partOutT < 0.99 && (
        <AbsoluteFill
          style={{
            opacity: partAIn * (1 - partOutT),
            transform: `translateY(${-partOutT * 46}px)`,
          }}
        >
          <div style={{ position: 'absolute', top: 38, left: 56, display: 'flex', alignItems: 'center', gap: 14, zIndex: 50 }}>
            <EditorialPill label="ZERO-FRICTION DELIVERY" color={COLORS.brandBlue} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.muted }}>
              GITHUB PR & GITLAB MR · 4 PRESETS STAGE · 1080P60 VIDEO PIPELINE
            </span>
          </div>

          <CameraRig
            zoom={lerp(0.96, 1.03, themeSweepT)}
            rotateY={lerp(5, -5, themeSweepT)}
            rotateX={2.5}
          >
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 1180, display: 'flex', flexDirection: 'column', gap: 36 }}>
                {/* Dual-Theme Sweeping Surface (NO heavy browser window wrapper!) */}
                <div style={{ position: 'relative', width: '100%', height: 428 }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <DualThemeDiagramSurface theme="light" pulseU={(frame % 52) / 52} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      clipPath: `polygon(${lerp(116, 14, themeSweepT)}% 0%, 100% 0%, 100% 100%, ${lerp(
                        100,
                        -2,
                        themeSweepT
                      )}% 100%)`,
                    }}
                  >
                    <DualThemeDiagramSurface theme="dark" pulseU={(frame % 52) / 52} />
                  </div>
                  {/* Sleek Feathered Optical Gradient Ribbon along Light <-> Dark Sweep */}
                  {themeSweepT > 0.01 && themeSweepT < 0.99 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -28,
                        bottom: -28,
                        left: `${lerp(108, 6, themeSweepT)}%`,
                        width: 84,
                        transform: 'translateX(-82px) rotate(11deg)',
                        background: `linear-gradient(90deg, transparent, ${COLORS.brandTeal}1C 55%, ${COLORS.ember}44 92%, #FFFFFF 100%)`,
                        boxShadow: `12px 0 36px ${COLORS.ember}44`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* Borderless Editorial 3-Column Deliverable Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 44, padding: '0 12px' }}>
                  {[
                    {
                      title: '无脚本双主题动态 SVG',
                      sub: '零 <script> 零外链，直贴 GitHub PR、GitLab MR 与文档自动播放',
                      color: COLORS.brandBlue,
                    },
                    {
                      title: '1080p60 MP4 / WebM',
                      sub: '直出无损动效片段，无缝并入 Remotion、剪映或 Premiere 视频制作流',
                      color: COLORS.ember,
                    },
                    {
                      title: '4 预设离线 Stage HTML',
                      sub: '实时切换 Classic / Signal Flow / Blueprint / Editorial，随时暂停核对源码',
                      color: COLORS.backend,
                    },
                  ].map((d) => (
                    <div key={d.title} style={{ paddingTop: 14, borderTop: `3px solid ${d.color}` }}>
                      <div style={{ fontFamily: FONTS.display, fontSize: 23, fontWeight: 800, color: COLORS.ink }}>
                        {d.title}
                      </div>
                      <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>
                        {d.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AbsoluteFill>
          </CameraRig>

          <FloatingCaption
            kicker="DELIVERABLES"
            text="一次编排，直出贴入 GitHub PR / GitLab MR 的无脚本动图 SVG、4 预设 Stage 与可并入视频流的 1080p60 素材"
            accent={COLORS.brandBlue}
            opacity={1 - partOutT}
          />
        </AbsoluteFill>
      )}

      {/* ==================== PART B: CAMERA-TRACKED CLOSED AI LOOP ==================== */}
      {loopIn > 0.01 && (
        <AbsoluteFill style={{ opacity: loopIn }}>
          <div style={{ position: 'absolute', top: 38, left: 56, display: 'flex', alignItems: 'center', gap: 14, zIndex: 50 }}>
            <EditorialPill label="CLOSED ENGINEERING LOOP" color={COLORS.backend} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.muted }}>
              FACTS BY ARCHIFY · VERDICT BY HUMAN · FIX BY AGENT
            </span>
          </div>

          <CameraRig x={loopCamX} zoom={loopCamZoom}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 1680, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: 54, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.02em' }}>
                    不止于看懂，直接把证据喂回给{' '}
                    <span style={{ color: COLORS.backend }}>Coding Agent</span>
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: COLORS.muted, marginTop: 12 }}>
                    工具负责确定性事实与清晰表达，人类永远握紧最终判断
                  </div>
                </div>

                <div style={{ position: 'relative', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
                  {/* Live Progress Track */}
                  <svg width="1680" height="250" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
                    <line x1="200" y1="125" x2="1480" y2="125" stroke={COLORS.lineHi} strokeWidth="4" />
                    <line
                      x1="200"
                      y1="125"
                      x2={lerp(200, 1480, easeInOutCubic(pulseStage))}
                      y2="125"
                      stroke={COLORS.backend}
                      strokeWidth="5"
                    />
                    {pulseStage > 0.02 && pulseStage < 0.98 && (
                      <circle
                        cx={lerp(200, 1480, easeInOutCubic(pulseStage))}
                        cy={125}
                        r={10}
                        fill="#FFFFFF"
                        stroke={COLORS.backend}
                        strokeWidth={3.5}
                      />
                    )}
                  </svg>

                  {[
                    {
                      step: '01',
                      title: 'Atlas 静态诊断',
                      sub: '捕获循环依赖、架构漂移与嵌套复杂度',
                      badge: '1 cycle · 2 drift',
                      color: COLORS.security,
                      sigil: 'security' as const,
                      activeAt: 0.0,
                    },
                    {
                      step: '02',
                      title: 'Copy Task for AI',
                      sub: '一键生成带源码快照与校验摘要的结构化任务',
                      badge: 'SHA-verified brief',
                      color: COLORS.frontend,
                      sigil: 'backend' as const,
                      activeAt: 0.28,
                    },
                    {
                      step: '03',
                      title: 'Coding Agent 修复',
                      sub: 'Cursor · Claude Code · Codex 精准落地补丁',
                      badge: 'targeted patch',
                      color: COLORS.database,
                      sigil: 'cloud' as const,
                      activeAt: 0.56,
                    },
                    {
                      step: '04',
                      title: 'Re-analyze 复检',
                      sub: '原地重算前后对照，确认架构与复杂度清零',
                      badge: resolvedT > 0.4 ? '✓ 0 cycles · 0 drift' : 're-checking…',
                      color: COLORS.backend,
                      sigil: 'lifecycle' as const,
                      activeAt: 0.82,
                    },
                  ].map((card, idx) => {
                    const isLit = pulseStage >= card.activeAt;
                    const isGreenFinal = idx === 3 && resolvedT > 0.4;
                    return (
                      <div
                        key={card.step}
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          height: 256,
                          padding: '24px 26px',
                          borderRadius: 18,
                          backgroundColor: isGreenFinal ? '#ECFDF5' : COLORS.surface,
                          border: `2px solid ${isLit ? card.color : COLORS.lineHi}`,
                          boxShadow: isLit
                            ? `0 22px 54px ${card.color}20, 0 6px 20px rgba(18,20,23,0.06)`
                            : '0 10px 28px rgba(18,20,23,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transform: `translateY(${isLit ? -8 : 0}px)`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: card.color }}>
                            STEP {card.step}
                          </span>
                          <SemanticSigil kind={card.sigil} color={card.color} size={22} />
                        </div>
                        <div>
                          <div style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: COLORS.ink }}>
                            {card.title}
                          </div>
                          <div style={{ fontFamily: FONTS.sans, fontSize: 14.5, color: COLORS.muted, marginTop: 8, lineHeight: 1.5 }}>
                            {card.sub}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: 13,
                            fontWeight: 800,
                            padding: '8px 12px',
                            borderRadius: 10,
                            backgroundColor: `${card.color}16`,
                            color: card.color,
                            border: `1px solid ${card.color}44`,
                            textAlign: 'center',
                          }}
                        >
                          {card.badge}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AbsoluteFill>
          </CameraRig>

          <FloatingCaption
            kicker="AI LOOP"
            text="发现结构债？一键复制带源码依据的 AI Task 给 Coding Agent 修复，再原地 Re-analyze 验绿"
            accent={COLORS.backend}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
