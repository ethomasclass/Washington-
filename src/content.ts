/**
 * The scene registry.
 *
 * Scenes live one to a file under scenes/. In the real build these are JSON on
 * disk loaded per act, which is also the payload strategy: a class period only
 * ever needs one act resident.
 */

import { MV01 } from './scenes/mv01';
import { CB01 } from './scenes/cb01';
import { CB03 } from './scenes/cb03';
import type { Scene } from './types';

export * from './types';

export const SCENES: Record<string, Scene> = {
  [MV01.id]: MV01,
  [CB01.id]: CB01,
  [CB03.id]: CB03,
};

export const FIRST_SCENE = MV01.id;

export const sceneList = (): Scene[] => Object.values(SCENES);
