import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { ArchifySymbol } from '../components/ConsoleChrome';
import { CompactCutContext } from '../cut/context';
import { useLocale } from '../locale';
import { COLORS, FONTS } from '../theme';
import { Scene01CognitiveDebt } from '../scenes/Scene01CognitiveDebt';
import { Scene02CodeAnalysisAtlas } from '../scenes/Scene02CodeAnalysisAtlas';

export type XCoverVariant = 'atlas' | 'tree' | 'drift';

interface Copy {
  kicker: string;
  lines: Array<{ text: string; accent?: boolean }>;
  sub: string;
}

const COPY: Record<XCoverVariant, { zh: Copy; en: Copy }> = {
  atlas: {
    zh: {
      kicker: 'ARCHIFY 3.3 · 代码分析',
      lines: [{ text: 'CI 全绿，' }, { text: '架构早已面目全非', accent: true }],
      sub: 'Archify 把代码真实的架构画给你看',
    },
    en: {
      kicker: 'ARCHIFY 3.3 · CODE ANALYSIS',
      lines: [{ text: 'Green CI.' }, { text: 'Drifting' }, { text: 'architecture.', accent: true }],
      sub: 'Archify shows what your code actually became.',
    },
  },
  tree: {
    zh: {
      kicker: 'ARCHIFY 3.3 · 代码分析',
      lines: [{ text: '整个代码库，' }, { text: '一眼看清结构', accent: true }],
      sub: '六种语言静态分析 · Apache-2.0 开源',
    },
    en: {
      kicker: 'ARCHIFY 3.3 · CODE ANALYSIS',
      lines: [{ text: 'Your whole repo,' }, { text: 'mapped in 3D.', accent: true }],
      sub: 'Static analysis for six languages. Open source.',
    },
  },
  drift: {
    zh: {
      kicker: 'ARCHIFY 3.3',
      lines: [{ text: '47 个 PR' }, { text: '测试全绿，' }, { text: '架构悄悄走样', accent: true }],
      sub: 'Archify 让架构漂移看得见',
    },
    en: {
      kicker: 'ARCHIFY 3.3',
      lines: [{ text: '47 PRs.' }, { text: 'All green.' }, { text: 'Architecture:' }, { text: 'drifted.', accent: true }],
      sub: 'Archify makes architecture drift visible.',
    },
  },
};

/** A scene frozen at one frame, with scene captions hidden. */
const FrozenScene: React.FC<{ scene: 1 | 2; frame: number }> = ({ scene, frame }) => {
  const Scene = scene === 1 ? Scene01CognitiveDebt : Scene02CodeAnalysisAtlas;
  return (
    <CompactCutContext.Provider value>
      <Sequence from={-frame} layout="none">
        <Scene />
      </Sequence>
    </CompactCutContext.Provider>
  );
};

const TextBlock: React.FC<{ copy: Copy; dark: boolean; size: number; width: number }> = ({
  copy,
  dark,
  size,
  width,
}) => {
  const ink = dark ? '#F8FAFC' : COLORS.ink;
  const muted = dark ? COLORS.darkMuted : COLORS.muted;
  const accent = dark
    ? `linear-gradient(90deg, ${COLORS.neonCyan}, ${COLORS.neonGreen})`
    : `linear-gradient(90deg, ${COLORS.ember}, ${COLORS.emberDeep})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: 0,
        bottom: 0,
        width,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 36,
      }}
    >
      <span
        style={{
          alignSelf: 'flex-start',
          fontFamily: FONTS.mono,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: dark ? COLORS.neonCyan : COLORS.brandBlue,
          padding: '10px 20px',
          borderRadius: 999,
          border: `1.5px solid ${dark ? 'rgba(34,211,238,0.45)' : 'rgba(8,86,245,0.3)'}`,
          backgroundColor: dark ? 'rgba(34,211,238,0.08)' : 'rgba(8,86,245,0.06)',
        }}
      >
        {copy.kicker}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {copy.lines.map((line) => (
          <span
            key={line.text}
            style={{
              fontFamily: FONTS.display,
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: ink,
              whiteSpace: 'nowrap',
              ...(line.accent
                ? { backgroundImage: accent, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                : {}),
            }}
          >
            {line.text}
          </span>
        ))}
      </div>
      <span style={{ fontFamily: FONTS.sans, fontSize: 32, fontWeight: 500, color: muted, lineHeight: 1.35 }}>
        {copy.sub}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
        <ArchifySymbol size={44} />
        <span style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 700, color: ink }}>Archify</span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 600, color: muted, marginLeft: 8 }}>
          archify.si
        </span>
      </div>
    </div>
  );
};

/** 16:9 cover for X. Text sits in the left half; the right half shows a real frame of the film. */
export const XCover: React.FC<{ variant: XCoverVariant }> = ({ variant }) => {
  const locale = useLocale();
  const copy = COPY[variant][locale];

  if (variant === 'drift') {
    const cardWidth = 1040;
    const scale = cardWidth / 1920;
    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(226,80,14,0.10), transparent 45%), radial-gradient(circle at 10% 90%, rgba(29,187,183,0.10), transparent 40%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 90,
            top: (1080 - 1080 * scale) / 2,
            width: cardWidth,
            height: 1080 * scale,
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 40px 90px rgba(18,20,23,0.18), 0 0 0 1px rgba(18,20,23,0.08)',
          }}
        >
          <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative' }}>
            <FrozenScene scene={1} frame={340} />
          </div>
        </div>
        <TextBlock copy={copy} dark={false} size={locale === 'zh' ? 84 : 80} width={640} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.darkBg }}>
      <div style={{ position: 'absolute', inset: 0, transform: 'translateX(360px) scale(0.92)' }}>
        <FrozenScene scene={2} frame={variant === 'atlas' ? 100 : 470} />
      </div>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(90deg, #060911 0%, #060911 34%, rgba(6,9,17,0.88) 46%, rgba(6,9,17,0.2) 66%, rgba(6,9,17,0) 78%)',
        }}
      />
      {/* Fade the scene's clipped side panels and top navigation into the background. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(270deg, #060911 0%, rgba(6,9,17,0.9) 6%, rgba(6,9,17,0) 16%), linear-gradient(180deg, #060911 0%, rgba(6,9,17,0) 12%, rgba(6,9,17,0) 88%, #060911 100%)',
        }}
      />
      <TextBlock copy={copy} dark size={locale === 'zh' ? 92 : 100} width={860} />
    </AbsoluteFill>
  );
};
