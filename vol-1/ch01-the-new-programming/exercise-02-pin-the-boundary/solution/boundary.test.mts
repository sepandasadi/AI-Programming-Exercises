import assert from 'node:assert/strict';
import test from 'node:test';
import { matchSections } from './match-sections.mts';

test('matches rollback as a whole term', () => {
  const sections = [
    {
      id: 'exact',
      heading: 'Rollback',
      body: 'Use this procedure.',
    },
    {
      id: 'plural',
      heading: 'Policy',
      body: 'Track all rollbacks.',
    },
  ];

  const ids = matchSections(sections, 'rollback');
  assert.deepEqual(ids, ['exact']);
});
