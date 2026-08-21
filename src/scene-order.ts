/**
 * Scene ids in save-code bit order.
 *
 * APPEND ONLY. The index is what a passport code carries, so reordering this
 * list sends every student in every classroom to the wrong scene.
 */
export const SCENE_ORDER: string[] = [
  'MV-01', 'CB-01', 'CB-03', 'CB-02',
  // The rebuilt Act 2. The three ids above were the old build's three
  // separate Cambridge scenes; Cambridge is one continuous place now, so
  // they are dead and stay where they are — an index in this list is a bit
  // pattern in every save code that has ever been written down.
  'CB-CAMP', 'CB-HQ', 'CB-HQ-UP', 'CB-CAMP-W', 'CB-HQ-W', 'CB-HQ-UP-W',
  // Act 3.
  'BK-LINES', 'BK-FERRY', 'BK-HOUSE', 'BK-FERRY-N',
  // Act 4.
  'DL-BANK', 'DL-BANK-N', 'TR-STREET', 'TR-STREET-A',
];
