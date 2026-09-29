import { deepStrictEqual } from 'node:assert';
import { commerceApi, GALLERY, groupedPlatform } from '@stackmap/core/samples';
import { galleryLayouts } from '../../viewer/src/samples/gallery.layout';
import { commerceApiLayout } from '../../viewer/src/samples/commerce-api.layout';
import { groupedPlatformLayout } from '../../viewer/src/samples/grouped-platform.layout';
import { layoutDiagram } from '../src/index';

// Runs under the Bun runtime (vitest runs under Node), and doubles as a drift check on the baked samples.
deepStrictEqual(await layoutDiagram(commerceApi), commerceApiLayout);
deepStrictEqual(await layoutDiagram(groupedPlatform), groupedPlatformLayout);
for (const [name, draft] of Object.entries(GALLERY)) deepStrictEqual(await layoutDiagram(draft), galleryLayouts[name]);
console.log('✓ bun runtime: layouts match the baked samples');
