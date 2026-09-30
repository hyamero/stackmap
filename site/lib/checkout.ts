import type { DiagramKind } from '@stackmap/core';

/**
 * The #kinds scene's card slots: slot i holds each kind's node here, or nothing. A card keeps its slot
 * from one kind to the next, so it glides to its new place instead of swapping (Motion board, #kinds).
 */
export const SLOTS: Record<DiagramKind, (string | null)[]> = {
  architecture: ['storefront', 'edge', 'api', 'stripe', 'orders', 'events'],
  dataflow: ['cart', 'priced', 'payment', null, 'row', 'placed'],
  workflow: ['add', 'validate', 'charge', 'create', 'pay', 'declined'],
  lifecycle: ['created', 'awaiting', 'failed', 'fulfilled', 'paid', 'cancelled'],
  sequence: ['api', 'storefront', null, 'orders', 'stripe', null],
};

export const SLOT_COUNT = 6;
