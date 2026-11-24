import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { ArchifyPromoCut, SIXTY_SECOND_DURATION } from '../ArchifyPromoCut';
import { XCover, type XCoverVariant } from './XCover';

/** Cover used as the X video's opening frame, which X shows as the thumbnail. */
export const X_VIDEO_COVER: XCoverVariant = 'atlas';

const COVER_HOLD = 20;
const COVER_FADE = 10;

export const X_PROMO_DURATION = COVER_HOLD + SIXTY_SECOND_DURATION - COVER_FADE;

/** The 60-second cut for X, opening on its cover. */
export const XPromo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={COVER_HOLD}>
      <XCover variant={X_VIDEO_COVER} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: COVER_FADE })} />
    <TransitionSeries.Sequence durationInFrames={SIXTY_SECOND_DURATION}>
      <ArchifyPromoCut />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
