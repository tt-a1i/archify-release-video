import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ArchifySymbol } from '../components/ConsoleChrome';
import { ArchifyPromoCut, SIXTY_SECOND_DURATION, captionAt } from '../ArchifyPromoCut';
import { COLORS, FONTS } from '../theme';
import { FrozenScene } from './XCover';

/** Xiaohongshu feed format: 3:4 portrait. Chinese only. */
export const XHS_WIDTH = 1080;
export const XHS_HEIGHT = 1440;
export const XHS_VIDEO_DURATION = SIXTY_SECOND_DURATION;

export type XhsCoverVariant = 'atlas' | 'drift';

const gradientText = (from: string, to: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

const Kicker: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => (
  <span
    style={{
      alignSelf: 'flex-start',
      fontFamily: FONTS.mono,
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: '0.1em',
      color: dark ? COLORS.neonCyan : COLORS.brandBlue,
      padding: '12px 24px',
      borderRadius: 999,
      border: `2px solid ${dark ? 'rgba(34,211,238,0.45)' : 'rgba(8,86,245,0.3)'}`,
      backgroundColor: dark ? 'rgba(34,211,238,0.08)' : 'rgba(8,86,245,0.06)',
    }}
  >
    {text}
  </span>
);

const BrandRow: React.FC<{ dark: boolean; extra?: string }> = ({ dark, extra }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
    <ArchifySymbol size={56} />
    <span style={{ fontFamily: FONTS.display, fontSize: 44, fontWeight: 700, color: dark ? '#F8FAFC' : COLORS.ink }}>
      Archify
    </span>
    <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 600, color: dark ? COLORS.darkMuted : COLORS.muted, marginLeft: 6 }}>
      {extra ?? 'archify.si'}
    </span>
  </div>
);

const Headline: React.FC<{ lines: string[]; size: number; dark: boolean }> = ({ lines, size, dark }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {lines.map((text, i) => (
      <span
        key={text}
        style={{
          fontFamily: FONTS.display,
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          color: dark ? '#F8FAFC' : COLORS.ink,
          ...(i === lines.length - 1
            ? dark
              ? gradientText(COLORS.neonCyan, COLORS.neonGreen)
              : gradientText(COLORS.ember, COLORS.emberDeep)
            : {}),
        }}
      >
        {text}
      </span>
    ))}
  </div>
);

/** 3:4 cover. Big Chinese headline on top, a real frame of the film below. */
export const XhsCover: React.FC<{ variant: XhsCoverVariant }> = ({ variant }) => {
  if (variant === 'atlas') {
    // Atlas ring centre is about (960, 470) in the 1920x1080 scene.
    const scale = 1.25;
    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.darkBg }}>
        <div
          style={{
            position: 'absolute',
            left: 540 - 960 * scale,
            top: 1200 - 470 * scale,
            width: 1920,
            height: 1080,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <FrozenScene scene={2} frame={100} />
        </div>
        <AbsoluteFill
          style={{
            backgroundImage:
              'linear-gradient(180deg, #060911 0%, #060911 52%, rgba(6,9,17,0.6) 60%, rgba(6,9,17,0) 70%, rgba(6,9,17,0) 82%, #060911 97%), linear-gradient(90deg, #060911 0%, rgba(6,9,17,0) 14%, rgba(6,9,17,0) 86%, #060911 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 84, right: 84, top: 120, display: 'flex', flexDirection: 'column', gap: 40 }}>
          <Kicker text="ARCHIFY 3.3 · 开源" dark />
          <Headline lines={['CI 全绿，', '架构早已', '面目全非']} size={136} dark />
          <span style={{ fontFamily: FONTS.sans, fontSize: 42, fontWeight: 600, color: COLORS.darkMuted }}>
            AI 写代码的时代，用 Archify 看清架构
          </span>
        </div>
        <div style={{ position: 'absolute', left: 84, bottom: 72 }}>
          <BrandRow dark />
        </div>
      </AbsoluteFill>
    );
  }

  const cardWidth = 960;
  const cardScale = cardWidth / 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 90% 8%, rgba(226,80,14,0.12), transparent 40%), radial-gradient(circle at 5% 95%, rgba(29,187,183,0.12), transparent 40%)',
        }}
      />
      <div style={{ position: 'absolute', left: 84, right: 84, top: 110, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <Kicker text="ARCHIFY 3.3 · 开源" dark={false} />
        <Headline lines={['47 个 PR 测试全绿，', '架构悄悄走样']} size={96} dark={false} />
        <span style={{ fontFamily: FONTS.sans, fontSize: 42, fontWeight: 600, color: COLORS.muted }}>
          Archify 让架构漂移看得见
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: (XHS_WIDTH - cardWidth) / 2,
          top: 700,
          width: cardWidth,
          height: 1080 * cardScale,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 40px 90px rgba(18,20,23,0.18), 0 0 0 1px rgba(18,20,23,0.08)',
        }}
      >
        <div style={{ width: 1920, height: 1080, transform: `scale(${cardScale})`, transformOrigin: 'top left', position: 'relative' }}>
          <FrozenScene scene={1} frame={340} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 84, bottom: 72 }}>
        <BrandRow dark={false} />
      </div>
    </AbsoluteFill>
  );
};

const VIDEO_WIDTH = 1000;
const VIDEO_SCALE = VIDEO_WIDTH / 1920;
const VIDEO_TOP = 470;

/** 3:4 portrait video: fixed headline, the 16:9 cut in a card, large captions below it. */
export const XhsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const current = captionAt(frame);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 90% 6%, rgba(226,80,14,0.10), transparent 40%), radial-gradient(circle at 6% 96%, rgba(29,187,183,0.10), transparent 40%)',
        }}
      />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Kicker text="ARCHIFY 3.3 · 开源" dark={false} />
        <Headline lines={['AI 写的代码，', '架构还好吗？']} size={84} dark={false} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: (XHS_WIDTH - VIDEO_WIDTH) / 2,
          top: VIDEO_TOP,
          width: VIDEO_WIDTH,
          height: 1080 * VIDEO_SCALE,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: COLORS.darkBg,
          boxShadow: '0 30px 70px rgba(18,20,23,0.18), 0 0 0 1px rgba(18,20,23,0.08)',
        }}
      >
        <div style={{ width: 1920, height: 1080, transform: `scale(${VIDEO_SCALE})`, transformOrigin: 'top left', position: 'relative' }}>
          <ArchifyPromoCut captions="none" />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: VIDEO_TOP + 1080 * VIDEO_SCALE + 80,
          textAlign: 'center',
          fontFamily: FONTS.display,
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.3,
          textWrap: 'balance',
          color: COLORS.ink,
          opacity: current?.opacity ?? 0,
        }}
      >
        {current?.caption.zh}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, display: 'flex', justifyContent: 'center' }}>
        <BrandRow dark={false} extra="archify.si · 开源" />
      </div>
    </AbsoluteFill>
  );
};
