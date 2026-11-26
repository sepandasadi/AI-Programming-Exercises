import { rates, relayPairs, seats } from '../fixtures/relay-pilot.mts';
import { compare, decision, pilotCostUsd } from './report.mts';

const docs = relayPairs.filter(pair => pair.lane === 'docs');
const triage = relayPairs.filter(pair => pair.lane === 'triage');

const overall = compare(relayPairs);
console.log('All tasks (summary)');
console.table({ baseline: overall.baseline, assisted: overall.assisted });

for (const [label, pairs] of [['Docs', docs], ['Triage', triage]] as const) {
  const report = compare(pairs);
  console.log(label);
  console.table({ baseline: report.baseline, assisted: report.assisted });
  console.log(`Decision: ${decision(report)}`);
}

const cost = pilotCostUsd(relayPairs, rates, seats);
console.log(
  `Assisted tool spend: $${cost.totalUsd.toFixed(2)} ` +
  `($${cost.seatUsd.toFixed(2)} seats + $${cost.tokenUsd.toFixed(2)} metered usage)`,
);
