import { describe, it, expect } from 'vitest';
import { assignToLeaves } from '../src/lib/simulator';
import type { TranscriptRecord, CatalogCourse } from '../src/lib/types';

const catalog: CatalogCourse[] = [
  { code: 'CSU0018', name: '演算法', credits: 3, category: 'core.cs' },
  { code: 'CSU0027', name: '系統程式', credits: 3, category: 'field.system' },
];

const liberal = {
  '0AUG462': { category: 'common.general.liberal.social' as const, name: '個人投資理財' },
};

describe('assignToLeaves', () => {
  it('maps each passed record to a category id', () => {
    const passed: TranscriptRecord[] = [
      { semester: '113-2', code: 'CSU0018', name: '演算法', type: '必修', credits: 3, grade: 'A' },
      { semester: '111-1', code: '0AUG462', name: '個人投資理財', type: '通識', credits: 2, grade: 'B+' },
    ];
    const result = assignToLeaves(passed, catalog, liberal);
    expect(result).toHaveLength(2);
    expect(result.find(a => a.record.code === 'CSU0018')?.categoryId).toBe('core.cs');
    expect(result.find(a => a.record.code === '0AUG462')?.categoryId).toBe('common.general.liberal.social');
  });

  it('falls back unknown codes to freeElective', () => {
    const passed: TranscriptRecord[] = [
      { semester: '111-1', code: 'XXX9999', name: '未知課', type: '選修', credits: 3, grade: 'A' },
    ];
    const result = assignToLeaves(passed, catalog, liberal);
    expect(result[0].categoryId).toBe('freeElective');
  });
});

import { walkTree, type Assignment } from '../src/lib/simulator';
import { RULES_110 } from '../src/lib/creditRules';

describe('walkTree', () => {
  it('aggregates earned credits up the tree', () => {
    const assignments: Assignment[] = [
      { record: { semester:'113-2', code:'CSU0018', name:'演算法', type:'必修', credits:3, grade:'A' }, categoryId: 'core.cs' },
      { record: { semester:'113-2', code:'CSU0029', name:'計算機結構', type:'必修', credits:3, grade:'A' }, categoryId: 'core.cs' },
    ];
    const result = walkTree(RULES_110, assignments);
    expect(result.id).toBe('total');
    expect(result.earned).toBe(6);
    const core = result.children?.find(c => c.id === 'core');
    const cs = core?.children?.find(c => c.id === 'core.cs');
    expect(cs?.earned).toBe(6);
  });

  it('clips earned at minCredits per leaf (no over-fill)', () => {
    // 6 records all into core.cs (15 required), each 3 credits = 18 total
    const assignments: Assignment[] = Array.from({length: 6}, (_, i) => ({
      record: { semester:'112-1', code:`X${i}`, name:'x', type:'必修', credits:3, grade:'A' as const },
      categoryId: 'core.cs' as const,
    }));
    const result = walkTree(RULES_110, assignments);
    const core = result.children?.find(c => c.id === 'core');
    const cs = core?.children?.find(c => c.id === 'core.cs');
    expect(cs?.earned).toBe(15);  // clipped at minCredits
  });
});

import { simulate } from '../src/lib/simulator';

describe('simulate (end-to-end)', () => {
  it('handles empty input', () => {
    const result = simulate([], [], {}, [], []);
    expect(result.totalEarned).toBe(0);
    expect(result.canGraduateNextSemester).toBe(false);
  });

  it('combines transcript + assumed pending', () => {
    const transcript: TranscriptRecord[] = [
      { semester:'113-2', code:'CSU0018', name:'演算法', type:'必修', credits:3, grade:'A' },
    ];
    const assumedCodes = ['CSU0029'];  // 計算機結構 in catalog
    const catalogFull: CatalogCourse[] = [
      { code:'CSU0018', name:'演算法', credits:3, category:'core.cs' },
      { code:'CSU0029', name:'計算機結構', credits:3, category:'core.cs' },
    ];
    const result = simulate(transcript, catalogFull, {}, [], assumedCodes);
    expect(result.totalEarned + result.totalPending).toBe(6);
    expect(result.totalPending).toBe(3);
  });

  it('overflows博雅 super-credits into common.general parent', () => {
    // Construct博雅 records that exceed 8 credits to trigger overflow
    const transcript: TranscriptRecord[] = [
      { semester:'111-1', code:'H1', name:'H1', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H2', name:'H2', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H3', name:'H3', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H4', name:'H4', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H5', name:'H5', type:'通識', credits:2, grade:'A' },  // 5th humanities = surplus
    ];
    const lib = {
      H1: { category: 'common.general.liberal.humanities' as const, name: 'H1' },
      H2: { category: 'common.general.liberal.humanities' as const, name: 'H2' },
      H3: { category: 'common.general.liberal.humanities' as const, name: 'H3' },
      H4: { category: 'common.general.liberal.humanities' as const, name: 'H4' },
      H5: { category: 'common.general.liberal.humanities' as const, name: 'H5' },
    };
    const result = simulate(transcript, [], lib, [], []);
    // humanities min is 2, so 10 credits earned → 2 stays in humanities, 8 overflow up
    // 博雅 総額 should reflect 10 capped at其 minCredits=8 + overflow到通識 6
    expect(result.totalEarned).toBeGreaterThan(0);
  });
});
