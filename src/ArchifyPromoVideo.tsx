import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { SCENE_DURATIONS, TOTAL_DURATION, TRANSITION_DURATION } from './timeline';
import { SoundTrack } from './components/SoundTrack';
import { Scene01CognitiveDebt } from './scenes/Scene01CognitiveDebt';
import { Scene02CodeAnalysisAtlas } from './scenes/Scene02CodeAnalysisAtlas';
import { Scene03StoryChoreography } from './scenes/Scene03StoryChoreography';
import { Scene04RealCasesShowcase } from './scenes/Scene04RealCasesShowcase';
import { Scene05WorkflowDeliverables } from './scenes/Scene05WorkflowDeliverables';
import { Scene06MetaOutro } from './scenes/Scene06MetaOutro';

export { SCENE_DURATIONS, TOTAL_DURATION, TRANSITION_DURATION };

export const ArchifyPromoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <SoundTrack />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene1}>
          <Scene01CognitiveDebt />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene2}>
          <Scene02CodeAnalysisAtlas />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene3}>
          <Scene03StoryChoreography />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene4}>
          <Scene04RealCasesShowcase />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene5}>
          <Scene05WorkflowDeliverables />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene6}>
          <Scene06MetaOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
