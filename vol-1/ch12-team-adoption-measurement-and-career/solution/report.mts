import type {
  ArmSummary, Attempt, PilotCost, PilotDecision, PilotReport, Seats, TaskPair, Usage,
} from '../pilot-types.mts';

function summarize(attempts: readonly Attempt[]): ArmSummary {
  let authorMinutes = 0;
  let reviewMinutes = 0;
  let accepted = 0;
  let observed = 0;
  let escaped = 0;

  for (const attempt of attempts) {
    authorMinutes += attempt.authorMinutes;
    reviewMinutes += attempt.reviewMinutes;
    const { kind } = attempt.outcome;
    if (kind !== 'abandoned') accepted++;
    if (kind === 'clear' || kind === 'escaped-defect') observed++;
    if (kind === 'escaped-defect') escaped++;
  }

  const times = attempts.map(attempt => attempt.elapsedMinutes).sort((a, b) => a - b);
  const lowerMiddle = Math.floor((times.length - 1) / 2);
  const upperMiddle = Math.floor(times.length / 2);
  const medianElapsedMinutes = (times[lowerMiddle]! + times[upperMiddle]!) / 2;

  return {
    authorMinutes, reviewMinutes, teamMinutes: authorMinutes + reviewMinutes,
    medianElapsedMinutes, accepted, observed, escaped,
  };
}

export function compare(pairs: readonly TaskPair[]): PilotReport {
  const first = pairs[0];
  if (!first) throw new Error('Supply at least one pair');
  if (new Set(pairs.map(pair => pair.id)).size !== pairs.length) {
    throw new Error('Duplicate pair ID');
  }

  return {
    lane: pairs.every(pair => pair.lane === first.lane) ? first.lane : 'mixed',
    pairCount: pairs.length,
    baseline: summarize(pairs.map(pair => pair.baseline)),
    assisted: summarize(pairs.map(pair => pair.assisted)),
  };
}

export function tokenCostUsd(usage: Usage, usdPerMillion: Usage) {
  return (
    usage.uncachedInput * usdPerMillion.uncachedInput +
    usage.cachedInput * usdPerMillion.cachedInput +
    usage.output * usdPerMillion.output
  ) / 1_000_000;
}

/** Assisted usage plus seat charges for one billing period. */
export function pilotCostUsd(
  pairs: readonly TaskPair[],
  usdPerMillion: Usage,
  seats: Seats,
): PilotCost {
  const unroundedTokenUsd = pairs.reduce((total, { assisted }) => {
    return total + tokenCostUsd(assisted.usage, usdPerMillion);
  }, 0);
  const seatUsd = seats.count * seats.usdPerSeat;
  const tokenUsd = Number(unroundedTokenUsd.toFixed(2));
  return { seatUsd, tokenUsd, totalUsd: Number((seatUsd + unroundedTokenUsd).toFixed(2)) };
}

export function decision(report: PilotReport): PilotDecision {
  if (report.lane === 'mixed') {
    throw new Error('Evaluate rollout for a single task category');
  }

  const { pairCount, baseline, assisted } = report;
  const extraReviewMinutesPerTask = (assisted.reviewMinutes - baseline.reviewMinutes) / pairCount;
  if (assisted.escaped > 0 || assisted.accepted < baseline.accepted || extraReviewMinutesPerTask > 15) {
    return 'pause';
  }
  if (
    pairCount < 4 || baseline.observed < baseline.accepted || assisted.observed < assisted.accepted ||
    assisted.teamMinutes >= baseline.teamMinutes
  ) {
    return 'extend';
  }
  return 'consider-expansion';
}
