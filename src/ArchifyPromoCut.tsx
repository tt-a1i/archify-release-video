import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { SoundTrack } from './components/SoundTrack';
import { FloatingCaption } from './components/ConsoleChrome';
import { CompactCutContext } from './cut/context';
import { SIXTY_SECOND_CLIPS, clipLength, editLength, type Clip, type SceneNumber } from './cut/clips';
import { useLocale } from './locale';
import { COLORS } from './theme';
import { Scene01CognitiveDebt } from './scenes/Scene01CognitiveDebt';
import { Scene02CodeAnalysisAtlas } from './scenes/Scene02CodeAnalysisAtlas';
import { Scene03StoryChoreography } from './scenes/Scene03StoryChoreography';
import { Scene04RealCasesShowcase } from './scenes/Scene04RealCasesShowcase';
import { Scene05WorkflowDeliverables } from './scenes/Scene05WorkflowDeliverables';
import { Scene06MetaOutro } from './scenes/Scene06MetaOutro';

const SCENES: Record<SceneNumber, React.FC> = {
  1: Scene01CognitiveDebt,
  2: Scene02CodeAnalysisAtlas,
  3: Scene03StoryChoreography,
  4: Scene04RealCasesShowcase,
  5: Scene05WorkflowDeliverables,
  6: Scene06MetaOutro,
};

export const SIXTY_SECOND_DURATION = editLength(SIXTY_SECOND_CLIPS);

const ClipCaptionOverlay: React.FC<{ clip: Clip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const locale = useLocale();
  if (!clip.caption) return null;
  const length = clipLength(clip);
  const opacity = interpolate(frame, [6, 16, length - 12, length - 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <FloatingCaption
      force
      size={32}
      dark={clip.caption.dark}
      accent={clip.caption.dark ? COLORS.neonCyan : COLORS.ember}
      text={locale === 'en' ? clip.caption.en : clip.caption.zh}
      opacity={opacity}
    />
  );
};

export const ArchifyPromoCut: React.FC = () => {
  return (
    <CompactCutContext.Provider value>
      <AbsoluteFill>
        <SoundTrack clips={SIXTY_SECOND_CLIPS} totalFrames={SIXTY_SECOND_DURATION} />
        <TransitionSeries>
          {SIXTY_SECOND_CLIPS.flatMap((clip, i) => {
            const Scene = SCENES[clip.scene];
            const items = [];
            if (i > 0) {
              items.push(
                <TransitionSeries.Transition
                  key={`t${i}`}
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: clip.transitionIn })}
                />
              );
            }
            items.push(
              <TransitionSeries.Sequence key={`c${i}`} durationInFrames={clipLength(clip)}>
                <Sequence from={-clip.from} layout="none">
                  <Scene />
                </Sequence>
                <ClipCaptionOverlay clip={clip} />
              </TransitionSeries.Sequence>
            );
            return items;
          })}
        </TransitionSeries>
      </AbsoluteFill>
    </CompactCutContext.Provider>
  );
};
