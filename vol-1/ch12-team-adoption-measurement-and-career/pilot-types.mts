export type Usage = {
  uncachedInput: number;
  cachedInput: number;
  output: number;
};

export type Outcome = {
  kind: 'clear' | 'escaped-defect' | 'pending' | 'abandoned';
};

export type Attempt = {
  authorMinutes: number;
  reviewMinutes: number;
  elapsedMinutes: number;
  outcome: Outcome;
  usage: Usage;
};

export type TaskPair = {
  id: string;
  lane: 'docs' | 'triage';
  baseline: Attempt;
  assisted: Attempt;
};

export type ArmSummary = {
  authorMinutes: number;
  reviewMinutes: number;
  teamMinutes: number;
  medianElapsedMinutes: number;
  accepted: number;
  observed: number;
  escaped: number;
};

export type PilotReport = {
  lane: TaskPair['lane'] | 'mixed';
  pairCount: number;
  baseline: ArmSummary;
  assisted: ArmSummary;
};

export type PilotDecision = 'pause' | 'extend' | 'consider-expansion';
export type Seats = { count: number; usdPerSeat: number };
export type PilotCost = { seatUsd: number; tokenUsd: number; totalUsd: number };
