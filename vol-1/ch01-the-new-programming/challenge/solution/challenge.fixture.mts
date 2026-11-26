import assert from 'node:assert/strict';
import test from 'node:test';
import { matchSections } from './match-sections.mts';

test('matches around punctuation in input order', () => {
  const sections = [
    { id: 'z', heading: '(ROLLBACK)', body: 'See the runbook.' },
    { id: 'a', heading: 'Deploy', body: 'If needed: rollback.' },
    { id: 'skip', heading: 'Checklist', body: 'Use prerollback.' },
  ];

  assert.deepEqual(matchSections(sections, 'RoLLbaCK'), ['z', 'a']);
});
