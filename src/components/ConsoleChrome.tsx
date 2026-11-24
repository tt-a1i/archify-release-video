import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useCompactCut } from '../cut/context';
import { COLORS, FONTS, clamp01, easeInOutCubic, easeOutCubic, easeOutExpo, lerp, progressBetween } from '../theme';

/**
 * Archify Official Architectural Paper Canvas (#F5F6F3)
 * Warm drafting grid + subtle Ember & Signal Teal horizon glow (matches archify.si)
 */
export const PaperCanvas: React.FC<{
  glowA?: string;
  glowB?: string;
  gridOpacity?: number;
}> = ({
  glowA = COLORS.ember,
  glowB = COLORS.signal,
  gridOpacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame * 0.014) * 50;
  const driftY = Math.cos(frame * 0.011) * 32;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      {/* Soft Architectural Horizon Glows */}
      <div
        style={{
          position: 'absolute',
          right: -180 + driftX,
          top: -280 + driftY,
          width: 1120,
          height: 820,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${glowA}1C 0%, ${glowA}08 42%, transparent 72%)`,
          filter: 'blur(36px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -240 - driftX * 0.7,
          bottom: -260 - driftY * 0.6,
          width: 1080,
          height: 820,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${glowB}16 0%, ${glowB}06 42%, transparent 72%)`,
          filter: 'blur(36px)',
        }}
      />

      {/* Precision 64px Drafting Grid with Soft Radial Fade */}
      <svg
        width="1920"
        height="1080"
        style={{ position: 'absolute', inset: 0, opacity: gridOpacity }}
      >
        <defs>
          <pattern id="paper-draft-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(18, 20, 23, 0.055)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="paper-grid-mask-grad" cx="50%" cy="46%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="72%" stopColor="white" stopOpacity="0.65" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="paper-grid-mask">
            <rect width="1920" height="1080" fill="url(#paper-grid-mask-grad)" />
          </mask>
        </defs>
        <rect width="1920" height="1080" fill="url(#paper-draft-grid)" mask="url(#paper-grid-mask)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Virtual Cinema Camera Rig (Pan + Zoom + 3D Dolly Perspective)
 * Keeps diagrams completely borderless and moves the lens across the infinite canvas.
 */
export const CameraRig: React.FC<{
  x?: number; // world coordinate focus offset X (px)
  y?: number; // world coordinate focus offset Y (px)
  zoom?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  perspective?: number;
  children: React.ReactNode;
}> = ({
  x = 0,
  y = 0,
  zoom = 1,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  perspective = 1600,
  children,
}) => (
  <AbsoluteFill
    style={{
      perspective,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${zoom}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${-x}px, ${-y}px, 0)`,
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

export const ArchifySymbol: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 44,
  style,
}) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 400 360" fill="none" style={style}>
    <path
      d="M151 94 81 164C67 178 60 191 60 212V248H97V212C97 204 100 199 106 193L179 120Z"
      fill={COLORS.brandBlue}
    />
    <path
      d="M238 135C252 132 261 126 270 116L321 167C334 180 339 194 339 213V248H303V213C303 204 300 199 294 193Z"
      fill={COLORS.brandTeal}
    />
    <rect x="146" y="16" width="110" height="104" rx="30" fill={COLORS.brandBlue} />
    <rect x="18" y="238" width="110" height="104" rx="28" fill={COLORS.brandBlue} />
    <rect x="274" y="238" width="108" height="104" rx="28" fill={COLORS.brandTeal} />
  </svg>
);

export const ArchifyLockup: React.FC<{
  width?: number;
  variant?: 'light' | 'dark';
  style?: React.CSSProperties;
}> = ({ width = 520, variant = 'light', style }) => (
  <svg
    width={width}
    height={(width * 240) / 875}
    viewBox="0 0 875 240"
    fill="none"
    style={style}
  >
    <g transform="translate(0 20) scale(.55)">
      <path
        d="M151 94 81 164C67 178 60 191 60 212V248H97V212C97 204 100 199 106 193L179 120Z"
        fill={COLORS.brandBlue}
      />
      <path
        d="M238 135C252 132 261 126 270 116L321 167C334 180 339 194 339 213V248H303V213C303 204 300 199 294 193Z"
        fill={COLORS.brandTeal}
      />
      <rect x="146" y="16" width="110" height="104" rx="30" fill={COLORS.brandBlue} />
      <rect x="18" y="238" width="110" height="104" rx="28" fill={COLORS.brandBlue} />
      <rect x="274" y="238" width="108" height="104" rx="28" fill={COLORS.brandTeal} />
    </g>
    <g fill={variant === 'light' ? '#111827' : '#F8FAFC'}>
      <path d="M279.71 150.77 270.09 175.375Q268.425 180.0 262.875 180.0H256.03Q254.365 180.0 253.1625 178.7975Q251.96 177.595 251.96 175.93Q251.96 175.005 252.7 173.34L298.025 56.605Q300.43 50.5 306.35 50.5H317.45Q323.37 50.5 325.775 56.605L370.915 173.34Q371.655 175.005 371.655 175.93Q371.655 177.595 370.4525 178.7975Q369.25 180.0 367.585 180.0H360.74Q355.19 180.0 353.525 175.375L343.905 150.77ZM337.43 134.12 311.9 68.075 286.185 134.12Z" />
      <path d="M439.51 88.795V94.715Q439.51 96.75 438.03 98.23Q436.55 99.71 434.515 99.71H423.785Q413.425 99.71 407.9675 105.1675Q402.51 110.625 402.51 120.985V175.005Q402.51 177.04 401.03 178.52Q399.55 180.0 397.515 180.0H390.67Q388.635 180.0 387.155 178.52Q385.675 177.04 385.675 175.005V88.795Q385.675 86.76 387.155 85.28Q388.635 83.8 390.67 83.8H397.515Q399.55 83.8 401.03 85.28Q402.51 86.76 402.51 88.795V94.53Q406.21 88.98 411.39 86.39Q416.57 83.8 424.895 83.8H434.515Q436.55 83.8 438.03 85.28Q439.51 86.76 439.51 88.795Z" />
      <path d="M516.43 151.51Q517.725 148.735 519.02 147.625Q520.315 146.515 522.535 146.515H528.085Q530.12 146.515 531.6 147.9025Q533.08 149.29 533.08 151.14Q533.08 157.43 528.085 164.645Q523.09 171.86 513.655 176.855Q504.22 181.85 491.455 181.85Q478.32 181.85 468.7 176.3Q459.08 170.75 453.9 161.0375Q448.72 151.325 448.165 139.3Q447.98 137.08 447.98 130.79Q447.98 126.35 448.165 124.5Q449.83 105.63 460.93 93.79Q472.03 81.95 491.455 81.95Q504.22 81.95 513.5625 86.8525Q522.905 91.755 527.8075 98.8775Q532.71 106.0 533.08 112.29Q533.265 114.325 531.6925 115.805Q530.12 117.285 528.085 117.285H522.535Q520.315 117.285 519.02 116.175Q517.725 115.065 516.43 112.29Q509.955 97.86 491.455 97.86Q481.28 97.86 473.695 104.705Q466.11 111.55 465.0 125.425Q464.815 127.46 464.815 132.085Q464.815 136.34 465.0 138.375Q466.295 152.25 473.7875 159.095Q481.28 165.94 491.455 165.94Q509.955 165.94 516.43 151.51Z" />
      <path d="M632.755 180.0H625.91Q623.875 180.0 622.395 178.52Q620.915 177.04 620.915 175.005V126.165Q620.915 112.29 614.07 105.075Q607.225 97.86 595.015 97.86Q582.99 97.86 576.0525 105.075Q569.115 112.29 569.115 126.165V175.005Q569.115 177.04 567.635 178.52Q566.155 180.0 564.12 180.0H557.275Q555.24 180.0 553.76 178.52Q552.28 177.04 552.28 175.005V53.645Q552.28 51.61 553.76 50.13Q555.24 48.65 557.275 48.65H564.12Q566.155 48.65 567.635 50.13Q569.115 51.61 569.115 53.645V94.53Q573.185 89.165 580.3075 85.5575Q587.43 81.95 597.79 81.95Q609.445 81.95 618.51 86.945Q627.575 91.94 632.6625 101.2825Q637.75 110.625 637.75 123.39V175.005Q637.75 177.04 636.27 178.52Q634.79 180.0 632.755 180.0Z" />
      <path d="M675.265 69.185H664.72Q662.685 69.185 661.205 67.705Q659.725 66.225 659.725 64.19V53.645Q659.725 51.61 661.205 50.13Q662.685 48.65 664.72 48.65H675.265Q677.3 48.65 678.78 50.13Q680.26 51.61 680.26 53.645V64.19Q680.26 66.225 678.78 67.705Q677.3 69.185 675.265 69.185ZM673.415 180.0H666.57Q664.535 180.0 663.055 178.52Q661.575 177.04 661.575 175.005V88.795Q661.575 86.76 663.055 85.28Q664.535 83.8 666.57 83.8H673.415Q675.45 83.8 676.93 85.28Q678.41 86.76 678.41 88.795V175.005Q678.41 177.04 676.93 178.52Q675.45 180.0 673.415 180.0Z" />
      <path d="M753.665 83.8Q755.7 83.8 757.18 85.28Q758.66 86.76 758.66 88.795V94.715Q758.66 96.75 757.18 98.23Q755.7 99.71 753.665 99.71H730.17V175.005Q730.17 177.04 728.69 178.52Q727.21 180.0 725.175 180.0H718.33Q716.295 180.0 714.815 178.52Q713.335 177.04 713.335 175.005V99.71H697.795Q695.76 99.71 694.28 98.23Q692.8 96.75 692.8 94.715V88.795Q692.8 86.76 694.28 85.28Q695.76 83.8 697.795 83.8H713.335V74.55Q713.335 58.64 720.735 50.87Q728.135 43.1 743.86 43.1H755.515Q757.55 43.1 759.03 44.58Q760.51 46.06 760.51 48.095V54.015Q760.51 56.05 759.03 57.53Q757.55 59.01 755.515 59.01H745.71Q736.645 59.01 733.4075 63.265Q730.17 67.52 730.17 75.475V83.8Z" />
      <path d="M795.25 215.15H787.665Q785.815 215.15 784.52 213.855Q783.225 212.56 783.225 210.71Q783.225 209.97 783.41 209.415L801.17 170.75L764.54 89.535Q764.355 88.98 764.355 88.24Q764.355 86.39 765.65 85.095Q766.945 83.8 768.795 83.8H776.38Q780.08 83.8 781.745 88.24L810.235 151.14L839.095 88.24Q840.76 83.8 844.46 83.8H852.045Q853.895 83.8 855.19 85.095Q856.485 86.39 856.485 88.24Q856.485 88.98 856.3 89.535L800.615 210.71Q798.95 215.15 795.25 215.15Z" />
    </g>
  </svg>
);

/**
 * Signature Archify Brand Assembly Reveal — 100% Archify DNA (NO generic white glare!):
 * 1. Blueprint drafting crosshairs + wireframe outlines draw the 3 Archify nodes
 * 2. Routed connector paths draw downward with two glowing semantic flow beads
 * 3. Nodes fill solidly into official Cobalt (#0856F5) & Teal (#1DBBB7)
 * 4. Official Rubik wordmark glides cleanly from behind an architectural hairline mask
 */
export const AnimatedArchifyBrandReveal: React.FC<{
  localFrame: number;
  width?: number;
}> = ({ localFrame, width = 560 }) => {
  // 0..14: Blueprint crosshairs & wireframe node strokes draw in
  const draftT = easeOutCubic(progressBetween(localFrame, 0, 14));
  // 10..24: 3 nodes solidly fill & settle
  const fillT = easeOutExpo(progressBetween(localFrame, 10, 24));
  // 14..30: 2 routed graph arms draw downward + semantic flow beads race down into child nodes
  const edgeT = easeInOutCubic(progressBetween(localFrame, 14, 29));
  // 24..40: Symbol slides left into lockup position & wordmark unveils behind clean mask
  const wordmarkT = easeOutExpo(progressBetween(localFrame, 22, 40));
  // Blueprint crosshairs gracefully vanish once assembled
  const guideFade = 1 - easeOutCubic(progressBetween(localFrame, 26, 38));

  // Center symbol before wordmark slides out, then glide cleanly into its exact lockup x=0 slot!
  const symbolShiftX = lerp(295, 0, wordmarkT);
  const perim = 420;

  return (
    <svg
      width={width}
      height={(width * 240) / 875}
      viewBox="0 0 875 240"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id="archify-wordmark-reveal">
          <rect x="242" y="20" width={lerp(0, 640, wordmarkT)} height="210" />
        </clipPath>
      </defs>

      {/* Architectural Symbol Group (3 Nodes + 2 Routed Edges) */}
      <g transform={`translate(${symbolShiftX.toFixed(1)} 20) scale(.55)`}>
        {/* Precision Blueprint Registration Crosshairs & Axis Guides */}
        {guideFade > 0.01 && (
          <g opacity={draftT * guideFade * 0.65}>
            <line x1="201" y1="-26" x2="201" y2="375" stroke={COLORS.brandBlue} strokeWidth="2" strokeDasharray="6 6" />
            <line x1="-18" y1="68" x2="418" y2="68" stroke={COLORS.brandBlue} strokeWidth="1.6" strokeDasharray="6 6" />
            <line x1="-18" y1="290" x2="418" y2="290" stroke={COLORS.brandTeal} strokeWidth="1.6" strokeDasharray="6 6" />
            <text x="272" y="42" fill={COLORS.brandBlue} fontFamily={FONTS.mono} fontSize="22" fontWeight="700">
              NODE_ROOT
            </text>
            <text x="-8" y="378" fill={COLORS.brandBlue} fontFamily={FONTS.mono} fontSize="20" fontWeight="700">
              01
            </text>
            <text x="366" y="378" fill={COLORS.brandTeal} fontFamily={FONTS.mono} fontSize="20" fontWeight="700">
              02
            </text>
          </g>
        )}

        {/* Routed Edges (Left Cobalt & Right Teal) unveiling along vertical clip */}
        <g opacity={clamp01(edgeT * 1.4)}>
          <path
            d="M151 94 81 164C67 178 60 191 60 212V248H97V212C97 204 100 199 106 193L179 120Z"
            fill={COLORS.brandBlue}
            opacity={edgeT}
          />
          <path
            d="M238 135C252 132 261 126 270 116L321 167C334 180 339 194 339 213V248H303V213C303 204 300 199 294 193Z"
            fill={COLORS.brandTeal}
            opacity={edgeT}
          />
        </g>

        {/* Live Semantic Flow Beads racing down the 2 routed arms during assembly! */}
        {edgeT > 0.05 && edgeT < 0.96 && (
          <g>
            <circle
              cx={lerp(165, 78, edgeT)}
              cy={lerp(110, 232, edgeT)}
              r={13}
              fill="#FFFFFF"
              stroke={COLORS.brandBlue}
              strokeWidth={5}
            />
            <circle
              cx={lerp(245, 321, edgeT)}
              cy={lerp(122, 232, edgeT)}
              r={13}
              fill="#FFFFFF"
              stroke={COLORS.brandTeal}
              strokeWidth={5}
            />
          </g>
        )}

        {/* 3 Official Archify Nodes: Wireframe Blueprint Stroke -> Solid Cobalt & Teal Fill */}
        {[
          { x: 146, y: 16, w: 110, h: 104, rx: 30, color: COLORS.brandBlue, delay: 0 },
          { x: 18, y: 238, w: 110, h: 104, rx: 28, color: COLORS.brandBlue, delay: 0.14 },
          { x: 274, y: 238, w: 108, h: 104, rx: 28, color: COLORS.brandTeal, delay: 0.22 },
        ].map((box, idx) => {
          const localFill = clamp01((fillT - box.delay) / (1 - box.delay));
          return (
            <g key={idx}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={box.rx}
                fill={box.color}
                fillOpacity={localFill}
                stroke={box.color}
                strokeWidth={guideFade > 0.05 ? 5 : 0}
                strokeDasharray={perim}
                strokeDashoffset={perim * (1 - draftT)}
              />
            </g>
          );
        })}
      </g>

      {/* Clean Architectural Hairline Mask Unveiling the Official Rubik Wordmark */}
      {wordmarkT > 0.02 && wordmarkT < 0.96 && (
        <line
          x1={242 + lerp(0, 625, wordmarkT)}
          y1="44"
          x2={242 + lerp(0, 625, wordmarkT)}
          y2="196"
          stroke={COLORS.brandBlue}
          strokeWidth="2.5"
          opacity={Math.sin(wordmarkT * Math.PI)}
        />
      )}

      <g clipPath="url(#archify-wordmark-reveal)" fill="#111827" transform={`translate(${lerp(-24, 0, wordmarkT).toFixed(1)}, 0)`}>
        <path d="M279.71 150.77 270.09 175.375Q268.425 180.0 262.875 180.0H256.03Q254.365 180.0 253.1625 178.7975Q251.96 177.595 251.96 175.93Q251.96 175.005 252.7 173.34L298.025 56.605Q300.43 50.5 306.35 50.5H317.45Q323.37 50.5 325.775 56.605L370.915 173.34Q371.655 175.005 371.655 175.93Q371.655 177.595 370.4525 178.7975Q369.25 180.0 367.585 180.0H360.74Q355.19 180.0 353.525 175.375L343.905 150.77ZM337.43 134.12 311.9 68.075 286.185 134.12Z" />
        <path d="M439.51 88.795V94.715Q439.51 96.75 438.03 98.23Q436.55 99.71 434.515 99.71H423.785Q413.425 99.71 407.9675 105.1675Q402.51 110.625 402.51 120.985V175.005Q402.51 177.04 401.03 178.52Q399.55 180.0 397.515 180.0H390.67Q388.635 180.0 387.155 178.52Q385.675 177.04 385.675 175.005V88.795Q385.675 86.76 387.155 85.28Q388.635 83.8 390.67 83.8H397.515Q399.55 83.8 401.03 85.28Q402.51 86.76 402.51 88.795V94.53Q406.21 88.98 411.39 86.39Q416.57 83.8 424.895 83.8H434.515Q436.55 83.8 438.03 85.28Q439.51 86.76 439.51 88.795Z" />
        <path d="M516.43 151.51Q517.725 148.735 519.02 147.625Q520.315 146.515 522.535 146.515H528.085Q530.12 146.515 531.6 147.9025Q533.08 149.29 533.08 151.14Q533.08 157.43 528.085 164.645Q523.09 171.86 513.655 176.855Q504.22 181.85 491.455 181.85Q478.32 181.85 468.7 176.3Q459.08 170.75 453.9 161.0375Q448.72 151.325 448.165 139.3Q447.98 137.08 447.98 130.79Q447.98 126.35 448.165 124.5Q449.83 105.63 460.93 93.79Q472.03 81.95 491.455 81.95Q504.22 81.95 513.5625 86.8525Q522.905 91.755 527.8075 98.8775Q532.71 106.0 533.08 112.29Q533.265 114.325 531.6925 115.805Q530.12 117.285 528.085 117.285H522.535Q520.315 117.285 519.02 116.175Q517.725 115.065 516.43 112.29Q509.955 97.86 491.455 97.86Q481.28 97.86 473.695 104.705Q466.11 111.55 465.0 125.425Q464.815 127.46 464.815 132.085Q464.815 136.34 465.0 138.375Q466.295 152.25 473.7875 159.095Q481.28 165.94 491.455 165.94Q509.955 165.94 516.43 151.51Z" />
        <path d="M632.755 180.0H625.91Q623.875 180.0 622.395 178.52Q620.915 177.04 620.915 175.005V126.165Q620.915 112.29 614.07 105.075Q607.225 97.86 595.015 97.86Q582.99 97.86 576.0525 105.075Q569.115 112.29 569.115 126.165V175.005Q569.115 177.04 567.635 178.52Q566.155 180.0 564.12 180.0H557.275Q555.24 180.0 553.76 178.52Q552.28 177.04 552.28 175.005V53.645Q552.28 51.61 553.76 50.13Q555.24 48.65 557.275 48.65H564.12Q566.155 48.65 567.635 50.13Q569.115 51.61 569.115 53.645V94.53Q573.185 89.165 580.3075 85.5575Q587.43 81.95 597.79 81.95Q609.445 81.95 618.51 86.945Q627.575 91.94 632.6625 101.2825Q637.75 110.625 637.75 123.39V175.005Q637.75 177.04 636.27 178.52Q634.79 180.0 632.755 180.0Z" />
        <path d="M675.265 69.185H664.72Q662.685 69.185 661.205 67.705Q659.725 66.225 659.725 64.19V53.645Q659.725 51.61 661.205 50.13Q662.685 48.65 664.72 48.65H675.265Q677.3 48.65 678.78 50.13Q680.26 51.61 680.26 53.645V64.19Q680.26 66.225 678.78 67.705Q677.3 69.185 675.265 69.185ZM673.415 180.0H666.57Q664.535 180.0 663.055 178.52Q661.575 177.04 661.575 175.005V88.795Q661.575 86.76 663.055 85.28Q664.535 83.8 666.57 83.8H673.415Q675.45 83.8 676.93 85.28Q678.41 86.76 678.41 88.795V175.005Q678.41 177.04 676.93 178.52Q675.45 180.0 673.415 180.0Z" />
        <path d="M753.665 83.8Q755.7 83.8 757.18 85.28Q758.66 86.76 758.66 88.795V94.715Q758.66 96.75 757.18 98.23Q755.7 99.71 753.665 99.71H730.17V175.005Q730.17 177.04 728.69 178.52Q727.21 180.0 725.175 180.0H718.33Q716.295 180.0 714.815 178.52Q713.335 177.04 713.335 175.005V99.71H697.795Q695.76 99.71 694.28 98.23Q692.8 96.75 692.8 94.715V88.795Q692.8 86.76 694.28 85.28Q695.76 83.8 697.795 83.8H713.335V74.55Q713.335 58.64 720.735 50.87Q728.135 43.1 743.86 43.1H755.515Q757.55 43.1 759.03 44.58Q760.51 46.06 760.51 48.095V54.015Q760.51 56.05 759.03 57.53Q757.55 59.01 755.515 59.01H745.71Q736.645 59.01 733.4075 63.265Q730.17 67.52 730.17 75.475V83.8Z" />
        <path d="M795.25 215.15H787.665Q785.815 215.15 784.52 213.855Q783.225 212.56 783.225 210.71Q783.225 209.97 783.41 209.415L801.17 170.75L764.54 89.535Q764.355 88.98 764.355 88.24Q764.355 86.39 765.65 85.095Q766.945 83.8 768.795 83.8H776.38Q780.08 83.8 781.745 88.24L810.235 151.14L839.095 88.24Q840.76 83.8 844.46 83.8H852.045Q853.895 83.8 855.19 85.095Q856.485 86.39 856.485 88.24Q856.485 88.98 856.3 89.535L800.615 210.71Q798.95 215.15 795.25 215.15Z" />
      </g>
    </svg>
  );
};

/**
 * Minimal Editorial Floating Caption (NO bulky boxes!)
 */
export const FloatingCaption: React.FC<{
  kicker?: string;
  text: string;
  accent?: string;
  dark?: boolean;
  opacity?: number;
  /** Render even inside the compact cut, which hides scene-authored captions. */
  force?: boolean;
  /** Caption text size in px. */
  size?: number;
}> = ({ kicker, text, accent = COLORS.ember, dark = false, opacity = 1, force = false, size = 21 }) =>
  useCompactCut() && !force ? null : (
  <div
    style={{
      position: 'absolute',
      bottom: 40,
      left: 72,
      right: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      opacity,
      zIndex: 60,
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '11px 24px',
        borderRadius: 999,
        backgroundColor: dark ? 'rgba(6, 9, 17, 0.72)' : 'rgba(255, 255, 255, 0.84)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(18,20,23,0.09)'}`,
        boxShadow: dark
          ? '0 12px 36px rgba(0,0,0,0.55)'
          : '0 10px 30px rgba(18, 20, 23, 0.08)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {kicker && (
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: accent,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {kicker}
        </span>
      )}
      {kicker && (
        <span
          style={{
            width: 1,
            height: 15,
            backgroundColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(18,20,23,0.16)',
          }}
        />
      )}
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: size,
          fontWeight: 600,
          color: dark ? COLORS.darkInk : COLORS.ink,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  </div>
);

export const EditorialPill: React.FC<{
  label: string;
  color: string;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ label, color, dark = false, style }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 999,
      backgroundColor: dark ? `${color}1C` : `${color}14`,
      border: `1px solid ${color}${dark ? '66' : '44'}`,
      color,
      fontFamily: FONTS.mono,
      fontSize: 12.5,
      fontWeight: 700,
      letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: dark ? `0 0 10px ${color}` : 'none',
      }}
    />
    {label}
  </span>
);

export type SigilKind =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'messagebus'
  | 'security'
  | 'cloud'
  | 'lifecycle';

export const SemanticSigil: React.FC<{ kind: SigilKind; color: string; size?: number }> = ({
  kind,
  color,
  size = 18,
}) => {
  switch (kind) {
    case 'frontend':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <rect x="2" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.6" />
          <line x1="2" y1="6.5" x2="16" y2="6.5" stroke={color} strokeWidth="1.3" />
          <circle cx="4.5" cy="4.8" r="0.85" fill={color} />
          <circle cx="7" cy="4.8" r="0.85" fill={color} />
        </svg>
      );
    case 'backend':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <path d="M6.5 4.5 2.5 9l4 4.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.5 4.5 15.5 9l-4 4.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'database':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <ellipse cx="9" cy="4.5" rx="5.5" ry="2.2" stroke={color} strokeWidth="1.6" />
          <path d="M3.5 4.5v9c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2v-9" stroke={color} strokeWidth="1.6" />
          <path d="M3.5 9c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2" stroke={color} strokeWidth="1.3" opacity="0.7" />
        </svg>
      );
    case 'messagebus':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <line x1="2" y1="5" x2="16" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="2" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="4" y="7.2" width="3.5" height="3.6" rx="0.8" fill={color} />
          <rect x="10.2" y="7.2" width="3.5" height="3.6" rx="0.8" fill={color} opacity="0.65" />
        </svg>
      );
    case 'security':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <path d="M9 2 14.5 4.2V8.8C14.5 12.2 12.1 14.9 9 16 5.9 14.9 3.5 12.2 3.5 8.8V4.2L9 2Z" stroke={color} strokeWidth="1.6" />
          <path d="M6.8 9.2 8.4 10.8 11.6 7.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <path d="M5.5 13.5h7.8a2.7 2.7 0 0 0 .3-5.4A4.2 4.2 0 0 0 5.6 6.8 3.1 3.1 0 0 0 5.5 13.5Z" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case 'lifecycle':
      return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="5.8" stroke={color} strokeWidth="1.6" />
          <circle cx="9" cy="9" r="2.3" fill={color} />
        </svg>
      );
  }
};
