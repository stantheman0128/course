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
