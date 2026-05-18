/**
 * Integration tests — real data files plugged into simulate().
 *
 * These tests verify that transcript.json + catalog-110.json + liberal-courses.json
 * are consistent with each other and produce the expected graduation-credit totals.
 */

import { describe, it, expect } from 'vitest';
import { simulate } from '../src/lib/simulator';
import type { TranscriptRecord, CatalogCourse } from '../src/lib/types';
import type { LiberalMap } from '../src/lib/catalog';

import transcriptData   from '../src/data/transcript.json';
import catalogData      from '../src/data/catalog-110.json';
import liberalData      from '../src/data/liberal-courses.json';
import currentSemData   from '../src/data/current-semester.json';

const transcript   = transcriptData   as TranscriptRecord[];
const catalog      = catalogData      as CatalogCourse[];
const liberal      = liberalData      as LiberalMap;
const currentSem   = currentSemData.courses as { code: string; name: string }[];
const all114_2     = currentSem.map(c => c.code);

describe('Integration — real data', () => {
  it('test 1: empty assumed → totalEarned in [70, 80]', () => {
    const result = simulate(transcript, catalog, liberal, currentSem, []);
    expect(result.totalEarned).toBeGreaterThanOrEqual(70);
    expect(result.totalEarned).toBeLessThanOrEqual(80);
  });

  it('test 2: all 9 114-2 courses assumed → totalPending = 25', () => {
    const result = simulate(transcript, catalog, liberal, currentSem, all114_2);
    expect(result.totalPending).toBe(25);
  });

  it('test 3: all 9 assumed → core.cs node is fulfilled', () => {
    const result = simulate(transcript, catalog, liberal, currentSem, all114_2);
    const core    = result.tree.children?.find(c => c.id === 'core');
    const coreCs  = core?.children?.find(c => c.id === 'core.cs');
    expect(coreCs).toBeDefined();
    expect(coreCs!.fulfilled).toBe(true);
  });

  it('test 4: all assumed EXCEPT 演算法 (CSU0018) → core.cs NOT fulfilled', () => {
    const withoutAlgo = all114_2.filter(code => code !== 'CSU0018');
    const result = simulate(transcript, catalog, liberal, currentSem, withoutAlgo);
    const core    = result.tree.children?.find(c => c.id === 'core');
    const coreCs  = core?.children?.find(c => c.id === 'core.cs');
    expect(coreCs).toBeDefined();
    expect(coreCs!.fulfilled).toBe(false);
  });
});
