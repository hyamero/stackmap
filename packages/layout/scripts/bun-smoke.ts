import { deepStrictEqual } from 'node:assert';
import { commerceApi, groupedPlatform } from '@stackmap/core/samples';
import { commerceApiLayout } from '../../viewer/src/samples/commerce-api.layout';
import { groupedPlatformLayout } from '../../viewer/src/samples/grouped-platform.layout';
import { layoutDiagram } from '../src/index';

// Runs under the Bun runtime (vitest runs under Node), and doubles as a drift check on the baked samples.
deepStrictEqual(await layoutDiagram(commerceApi), commerceApiLayout);
deepStrictEqual(await layoutDiagram(groupedPlatform), groupedPlatformLayout);
console.log('✓ bun runtime: layouts match the baked samples');
