import { describe, it, expect } from 'vitest';
import { findByCode, classifyCourse } from '../src/lib/catalog';
import type { CatalogCourse } from '../src/lib/types';

const sampleCatalog: CatalogCourse[] = [
  { code: 'CSU0018', name: '演算法', credits: 3, category: 'core.cs' },
  { code: 'CSC9007', name: '資安攻防演練', credits: 3, category: 'deptElective' },
];

const sampleLiberal = {
  '0AUG462': { category: 'common.general.liberal.social', name: '個人投資理財' },
};

describe('findByCode', () => {
  it('returns matching course', () => {
    const result = findByCode(sampleCatalog, 'CSU0018');
    expect(result?.name).toBe('演算法');
  });

  it('returns undefined for unknown code', () => {
    expect(findByCode(sampleCatalog, 'XXX0000')).toBeUndefined();
  });
});

describe('classifyCourse', () => {
  it('uses catalog category when found', () => {
    const result = classifyCourse('CSU0018', sampleCatalog, sampleLiberal);
    expect(result).toBe('core.cs');
  });

  it('uses liberal map when transcript-style code', () => {
    const result = classifyCourse('0AUG462', sampleCatalog, sampleLiberal);
    expect(result).toBe('common.general.liberal.social');
  });

  it('falls back to freeElective when unknown', () => {
    const result = classifyCourse('XXX0000', sampleCatalog, sampleLiberal);
    expect(result).toBe('freeElective');
  });
});
