import type { TaskPair } from '../pilot-types.mts';

// Synthetic records. A row represents two distinct tasks matched by scope.
const assistedUsage = { uncachedInput: 100_000, cachedInput: 50_000, output: 25_000 };
const noUsage = { uncachedInput: 0, cachedInput: 0, output: 0 };

export const relayPairs: readonly TaskPair[] = [
  {
    id: 'docs-1', lane: 'docs',
    baseline: {
      authorMinutes: 80, reviewMinutes: 15, elapsedMinutes: 300,
      outcome: { kind: 'clear' }, usage: noUsage,
    },
    assisted: {
      authorMinutes: 50, reviewMinutes: 25, elapsedMinutes: 190,
      outcome: { kind: 'clear' }, usage: assistedUsage,
    },
  },
  {
    id: 'docs-2', lane: 'docs',
    baseline: {
      authorMinutes: 70, reviewMinutes: 15, elapsedMinutes: 260,
      outcome: { kind: 'clear' }, usage: noUsage,
    },
    assisted: {
      authorMinutes: 45, reviewMinutes: 30, elapsedMinutes: 180,
      outcome: { kind: 'clear' }, usage: assistedUsage,
    },
  },
  {
    id: 'triage-1', lane: 'triage',
    baseline: {
      authorMinutes: 120, reviewMinutes: 25, elapsedMinutes: 410,
      outcome: { kind: 'clear' }, usage: noUsage,
    },
    assisted: {
      authorMinutes: 70, reviewMinutes: 95, elapsedMinutes: 335,
      outcome: { kind: 'escaped-defect' }, usage: assistedUsage,
    },
  },
  {
    id: 'triage-2', lane: 'triage',
    baseline: {
      authorMinutes: 110, reviewMinutes: 25, elapsedMinutes: 480,
      outcome: { kind: 'clear' }, usage: noUsage,
    },
    assisted: {
      authorMinutes: 65, reviewMinutes: 100, elapsedMinutes: 350,
      outcome: { kind: 'abandoned' }, usage: assistedUsage,
    },
  },
];

export const rates = { uncachedInput: 2, cachedInput: 0.5, output: 8 };
export const seats = { count: 3, usdPerSeat: 20 };
