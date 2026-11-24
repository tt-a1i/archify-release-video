import React from 'react';
import { Composition, Still } from 'remotion';
import './fonts.css';
import { ArchifyPromoVideo, SCENE_DURATIONS, TOTAL_DURATION } from './ArchifyPromoVideo';
import { Scene01CognitiveDebt } from './scenes/Scene01CognitiveDebt';
import { Scene02CodeAnalysisAtlas } from './scenes/Scene02CodeAnalysisAtlas';
import { Scene03StoryChoreography } from './scenes/Scene03StoryChoreography';
import { Scene04RealCasesShowcase } from './scenes/Scene04RealCasesShowcase';
import { Scene05WorkflowDeliverables } from './scenes/Scene05WorkflowDeliverables';
import { Scene06MetaOutro } from './scenes/Scene06MetaOutro';
import { FPS, HEIGHT, WIDTH } from './theme';
import { PromoLocaleContext } from './locale';
import { ArchifyPromoCut, SIXTY_SECOND_DURATION } from './ArchifyPromoCut';
import { XCover, type XCoverVariant } from './covers/XCover';
import { XPromo, X_PROMO_DURATION } from './covers/XPromo';
import type { PromoLocale } from './locale';

const X_COVER_VARIANTS: XCoverVariant[] = ['atlas', 'tree', 'drift'];
const LOCALES: PromoLocale[] = ['zh', 'en'];

const Localized = <P extends object>(Component: React.FC<P>, locale: PromoLocale): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <PromoLocaleContext.Provider value={locale}>
      <Component {...props} />
    </PromoLocaleContext.Provider>
  );
  return Wrapped;
};

const EnglishPromo: React.FC = () => (
  <PromoLocaleContext.Provider value="en">
    <ArchifyPromoVideo />
  </PromoLocaleContext.Provider>
);

const EnglishCut: React.FC = () => (
  <PromoLocaleContext.Provider value="en">
    <ArchifyPromoCut />
  </PromoLocaleContext.Provider>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArchifyReleasePromo"
        component={ArchifyPromoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ArchifyReleasePromoEN"
        component={EnglishPromo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ArchifyReleasePromo60"
        component={ArchifyPromoCut}
        durationInFrames={SIXTY_SECOND_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ArchifyReleasePromo60EN"
        component={EnglishCut}
        durationInFrames={SIXTY_SECOND_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {LOCALES.map((locale) => (
        <React.Fragment key={locale}>
          {X_COVER_VARIANTS.map((variant) => (
            <Still
              key={variant}
              id={`XCover-${variant}-${locale}`}
              component={Localized(XCover, locale)}
              defaultProps={{ variant }}
              width={WIDTH}
              height={HEIGHT}
            />
          ))}
          <Composition
            id={`XPromo-${locale}`}
            component={Localized(XPromo, locale)}
            durationInFrames={X_PROMO_DURATION}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        </React.Fragment>
      ))}
      <Composition
        id="01-CognitiveDebt"
        component={Scene01CognitiveDebt}
        durationInFrames={SCENE_DURATIONS.scene1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="02-CodeAnalysisAtlas"
        component={Scene02CodeAnalysisAtlas}
        durationInFrames={SCENE_DURATIONS.scene2}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="03-StoryChoreography"
        component={Scene03StoryChoreography}
        durationInFrames={SCENE_DURATIONS.scene3}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="04-RealCases-Tokio-Vue"
        component={Scene04RealCasesShowcase}
        durationInFrames={SCENE_DURATIONS.scene4}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="05-WorkflowAndDeliverables"
        component={Scene05WorkflowDeliverables}
        durationInFrames={SCENE_DURATIONS.scene5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="06-MetaOutro"
        component={Scene06MetaOutro}
        durationInFrames={SCENE_DURATIONS.scene6}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
