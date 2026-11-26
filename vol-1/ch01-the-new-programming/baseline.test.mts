import assert from 'node:assert/strict';
import test from 'node:test';
import { matchSections } from './match-sections.mts';

const sections = [
  {
    id: 'incident',
    heading: 'Incident ROLLBACK',
    body: 'Page the release owner.',
  },
  {
    id: 'staging',
    heading: 'Deploy safely',
    body: 'Rehearse rollback in staging.',
  },
  {
    id: 'review',
    heading: 'Review checklist',
    body: 'Link the issue and describe the change.',
  },
];

test('finds a heading match and a body match', () => {
  assert.deepEqual(matchSections(sections, 'Rollback'), [
    'incident',
    'staging',
  ]);
});

test('returns no sections for an unrelated term', () => {
  assert.deepEqual(matchSections(sections, 'backfill'), []);
});
