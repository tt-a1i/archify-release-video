import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArchifyLockup, CameraRig, EditorialPill, PaperCanvas } from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
  easeInOutCubic,
  easeOutCubic,
  lerp,
  progressBetween,
} from '../theme';
import { useT } from '../locale';

export const Scene06MetaOutro: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0 - 78): Engine Bootstrap Pullback
  const metaIn = easeOutCubic(progressBetween(frame, 0, 24));
  const metaOut = easeInOutCubic(progressBetween(frame, 62, 94));

  // Phase 2 (84 - 240): Official Light Archify Brand Lockup Finale
  const logoSpring = spring({
    frame: Math.max(0, frame - 86),
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const textSpring = spring({
    frame: Math.max(0, frame - 112),
    fps,
    config: { damping: 18, stiffness: 125 },
  });
  const cmdSpring = spring({
    frame: Math.max(0, frame - 142),
    fps,
    config: { damping: 18, stiffness: 130 },
  });
  const sheenT = easeInOutCubic(progressBetween(frame, 126, 174));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas glowA={COLORS.ember} glowB={COLORS.brandTeal} gridOpacity={0.6} />

      {/* PHASE 1: META BOOTSTRAP PIPELINE (Camera pulls back cleanly) */}
      {metaOut < 0.99 && (
        <CameraRig zoom={lerp(1.08, 0.88, metaOut)}>
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              opacity: metaIn * (1 - metaOut),
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 38 }}>
              <EditorialPill label="ENGINE BOOTSTRAP · BUILT WITH CODE" color={COLORS.brandBlue} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                {[
                  { label: 'Typed JSON IR', sub: '10 Native Diagram Families', color: COLORS.frontend },
                  { label: 'Deterministic Gate', sub: 'AST + Geometry + Git SHA', color: COLORS.backend },
                  { label: 'Story Choreography', sub: 'Morph · Camera · Metrics', color: COLORS.ember },
                  { label: 'SVG / Stage / MP4', sub: 'Portable & Self-Contained', color: COLORS.database },
                ].map((node, i) => (
                  <React.Fragment key={node.label}>
                    <div
                      style={{
                        padding: '22px 26px',
                        borderRadius: 16,
                        backgroundColor: COLORS.surface,
                        border: `1.5px solid ${node.color}66`,
                        boxShadow: '0 16px 40px rgba(18, 20, 23, 0.06)',
                        textAlign: 'center',
                        minWidth: 270,
                      }}
                    >
                      <div style={{ fontFamily: FONTS.mono, fontSize: 19, fontWeight: 800, color: node.color }}>
                        {node.label}
                      </div>
                      <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.muted, marginTop: 6 }}>
                        {node.sub}
                      </div>
                    </div>
                    {i < 3 && (
                      <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: COLORS.dim }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
                {t('你刚才看到的每一帧架构演进，都由代码与确定性规则驱动', 'Every frame you just saw was driven by code and deterministic rules.')}
              </div>
            </div>
          </AbsoluteFill>
        </CameraRig>
      )}

      {/* PHASE 2: OFFICIAL LIGHT ARCHIFY LOCKUP FINALE */}
      {frame >= 80 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
            {/* Official Light Archify Lockup with Gloss Sheen */}
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '10px 24px',
                transform: `scale(${interpolate(logoSpring, [0, 1], [0.86, 1])}) translateY(${interpolate(
                  logoSpring,
                  [0, 1],
                  [28, 0]
                )}px)`,
                opacity: logoSpring,
              }}
            >
              <ArchifyLockup width={560} variant="light" />
              {sheenT > 0.01 && sheenT < 0.99 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    bottom: -20,
                    left: `${lerp(-30, 130, sheenT)}%`,
                    width: 96,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
                    transform: 'skewX(-24deg)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>

            {/* Two Flagship Feature Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: textSpring,
                transform: `translateY(${interpolate(textSpring, [0, 1], [24, 0])}px)`,
              }}
            >
              <EditorialPill label={t("CODE ANALYSIS · 全仓星盘 × PR 影响", "CODE ANALYSIS · REPO ATLAS × PR IMPACT")} color={COLORS.backend} />
              <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.dim }}>×</span>
              <EditorialPill label={t("STORY CHOREOGRAPHY · 动态演示引擎", "STORY CHOREOGRAPHY · ANIMATION ENGINE")} color={COLORS.ember} />
            </div>

            {/* Signature Tagline with Warm Archify Gradient */}
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 48,
                fontWeight: 800,
                color: COLORS.ink,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                opacity: textSpring,
                transform: `translateY(${interpolate(textSpring, [0, 1], [24, 0])}px)`,
              }}
            >
              {t('AI 时代，把复杂代码变成看得懂的', 'For the AI era: complex code, ')}
              <span
                style={{
                  background: `linear-gradient(100deg, ${COLORS.emberLight} 0%, ${COLORS.ember} 48%, ${COLORS.emberDeep} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('动态真相', 'made clear in motion')}
              </span>
              {t('。', '.')}
            </div>

            {/* Crisp Dark-Ink Command Capsule on Bright Paper */}
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                opacity: cmdSpring,
                transform: `translateY(${interpolate(cmdSpring, [0, 1], [22, 0])}px)`,
              }}
            >
              <div
                style={{
                  padding: '16px 36px',
                  borderRadius: 999,
                  backgroundColor: COLORS.ink,
                  boxShadow: '0 22px 54px rgba(18, 20, 23, 0.22)',
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#F8FAFC',
                }}
              >
                <span style={{ color: COLORS.neonGreen }}>$</span> npx skills add https://archify.si --skill archify
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 600, color: COLORS.muted, letterSpacing: '0.04em' }}>
                archify.si &nbsp;·&nbsp; github.com/tt-a1i/archify &nbsp;·&nbsp; Apache-2.0 Open Source
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
