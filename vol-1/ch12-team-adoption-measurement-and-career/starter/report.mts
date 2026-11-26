import type { PilotCost, PilotDecision, PilotReport, Seats, TaskPair, Usage } from '../pilot-types.mts';

export function compare(_pairs: readonly TaskPair[]): PilotReport {
  throw new Error('Implement compare in Exercise 2');
}

export function decision(_report: PilotReport): PilotDecision {
  throw new Error('Implement decision in Exercise 2');
}

export function tokenCostUsd(_usage: Usage, _usdPerMillion: Usage): number {
  throw new Error('Implement tokenCostUsd in Exercise 3');
}

export function pilotCostUsd(
  _pairs: readonly TaskPair[],
  _usdPerMillion: Usage,
  _seats: Seats,
): PilotCost {
  throw new Error('Implement pilotCostUsd in Exercise 3');
}
