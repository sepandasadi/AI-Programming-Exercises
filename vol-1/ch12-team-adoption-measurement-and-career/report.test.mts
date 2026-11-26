import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { rates, relayPairs, seats } from './fixtures/relay-pilot.mts';
import type { TaskPair } from './pilot-types.mts';

const { compare, decision, pilotCostUsd, tokenCostUsd } =
  process.env.PILOT_IMPLEMENTATION === 'starter'
    ? await import('./starter/report.mts')
    : await import('./solution/report.mts');

const docs = relayPairs.filter(pair => pair.lane === 'docs');
const triage = relayPairs.filter(pair => pair.lane === 'triage');

function fourDocsPairs(): TaskPair[] {
  return [...docs, ...docs.map(pair => ({ ...pair, id: `${pair.id}-repeat` }))];
}

test('counts all assigned work and keeps effort and elapsed time separate', () => {
  const report = compare(relayPairs);
  assert.deepEqual(report, {
    lane: 'mixed',
    pairCount: 4,
    baseline: {
      authorMinutes: 380, reviewMinutes: 80, teamMinutes: 460,
      medianElapsedMinutes: 355, accepted: 4, observed: 4, escaped: 0,
    },
    assisted: {
      authorMinutes: 230, reviewMinutes: 250, teamMinutes: 480,
      medianElapsedMinutes: 262.5, accepted: 3, observed: 3, escaped: 1,
    },
  });
});

test('keeps the two task lanes visible', () => {
  const docsReport = compare(docs);
  assert.equal(docsReport.lane, 'docs');
  assert.equal(docsReport.baseline.teamMinutes, 180);
  assert.equal(docsReport.assisted.teamMinutes, 150);
  const triageReport = compare(triage);
  assert.equal(triageReport.lane, 'triage');
  assert.equal(triageReport.baseline.teamMinutes, 280);
  assert.equal(triageReport.assisted.teamMinutes, 330);
});

test('rejects a rollout decision for mixed lanes', () => {
  assert.throws(() => decision(compare(relayPairs)), /single task category/i);
});

test('replay prints decisions only for individual categories', () => {
  const replay = fileURLToPath(new URL('./solution/replay.mts', import.meta.url));
  const output = execFileSync(process.execPath, [replay], { encoding: 'utf8' });
  assert.match(output, /^All tasks\b/);
  const sections = output.split(/\n(?=Docs\n|Triage\n)/);
  const decisions = sections.map(section => section.match(/^Decision: .+$/m)?.[0]);
  assert.deepEqual(decisions, [undefined, 'Decision: extend', 'Decision: pause']);
});

test('rejects empty samples and duplicate pair IDs', () => {
  assert.throws(() => compare([]), /at least one pair/i);
  assert.throws(() => compare([...relayPairs, ...relayPairs]), /duplicate pair/i);
});

test('charges each token bucket and counts spend on abandoned work', () => {
  assert.equal(tokenCostUsd(relayPairs[0]!.assisted.usage, rates), 0.425);
  assert.deepEqual(pilotCostUsd(relayPairs, rates, seats), {
    seatUsd: 60, tokenUsd: 1.7, totalUsd: 61.7,
  });
  assert.deepEqual(pilotCostUsd(docs, rates, { count: 0, usdPerSeat: 20 }), {
    seatUsd: 0, tokenUsd: 0.85, totalUsd: 0.85,
  });
});

test('pauses on an observed defect even when other totals match the baseline', () => {
  const report = compare(triage);
  assert.equal(decision(report), 'pause');
  assert.equal(decision({
    ...report,
    assisted: { ...report.baseline, escaped: 1 },
  }), 'pause');
});

test('pauses when acceptance falls or reviewer capacity is exceeded', () => {
  const report = compare(fourDocsPairs());
  assert.equal(decision({
    ...report,
    assisted: { ...report.assisted, accepted: 3, observed: 3 },
  }), 'pause');
  assert.equal(decision({
    ...report,
    assisted: { ...report.assisted, reviewMinutes: report.baseline.reviewMinutes + 61 },
  }), 'pause');
});

test('extends a small sample and considers expansion only with sufficient evidence', () => {
  assert.equal(decision(compare(docs)), 'extend');
  const report = compare(fourDocsPairs());
  assert.equal(decision(report), 'consider-expansion');
  assert.equal(decision({
    ...report,
    assisted: { ...report.assisted, teamMinutes: report.baseline.teamMinutes },
  }), 'extend');
});

test('pending follow-up stays out of observed quality in either arm', () => {
  const pairs = fourDocsPairs();
  assert.equal(pairs.length, 4);
  const [first, ...rest] = pairs;
  assert.ok(first);
  for (const arm of ['baseline', 'assisted'] as const) {
    const report = compare([
      { ...first, [arm]: { ...first[arm], outcome: { kind: 'pending' } } },
      ...rest,
    ]);
    assert.equal(report[arm].accepted, 4);
    assert.equal(report[arm].observed, 3);
    assert.equal(report[arm].escaped, 0);
    assert.equal(decision(report), 'extend');
  }
});
