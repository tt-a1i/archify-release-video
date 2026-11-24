import { createContext, useContext } from 'react';

/**
 * True inside the 60-second cut. Scene-authored captions are written for the
 * full film and are too long to read at the cut's pace, so the cut hides them
 * and draws its own short caption per clip.
 */
export const CompactCutContext = createContext(false);

export const useCompactCut = (): boolean => useContext(CompactCutContext);
