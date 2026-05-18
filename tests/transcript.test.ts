import { describe, it, expect } from 'vitest';
import { passedRecords, dedupByCode } from '../src/lib/transcript';
import type { TranscriptRecord } from '../src/lib/types';

const records: TranscriptRecord[] = [
  { semester: '111-1', code: 'CSU0001', name: '程式設計（一）', type: '必修', credits: 3, grade: 'E' },
  { semester: '112-1', code: 'CSU0001', name: '程式設計（一）', type: '必修', credits: 3, grade: 'C-' },
  { semester: '112-1', code: 'CSU0015', name: '機率論', type: '必修', credits: 3, grade: 'C' },
  { semester: '113-2', code: 'CSU0018', name: '演算法', type: '必修', credits: 3, grade: '停修' },
];

describe('passedRecords', () => {
  it('filters out failing grades', () => {
    const result = passedRecords(records);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.code).sort()).toEqual(['CSU0001', 'CSU0015']);
  });
});

describe('dedupByCode', () => {
  it('keeps one per code', () => {
    const passed = passedRecords(records);
    const result = dedupByCode(passed);
    expect(result).toHaveLength(2);
  });

  it('handles empty input', () => {
    expect(dedupByCode([])).toEqual([]);
  });
});
