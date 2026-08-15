/**
 * Scene ids in save-code bit order.
 *
 * APPEND ONLY. The index is what a passport code carries, so reordering this
 * list sends every student in every classroom to the wrong scene.
 */
export const SCENE_ORDER: string[] = ['MV-01', 'CB-01'];
