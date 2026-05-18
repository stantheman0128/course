import { describe, it, expect } from 'vitest';
import { RULES_110, findRule, flattenRules } from '../src/lib/creditRules';
import type { CategoryId } from '../src/lib/types';

describe('RULES_110 structure', () => {
  it('root requires 128 credits', () => {
    expect(RULES_110.id).toBe('total');
    expect(RULES_110.minCredits).toBe(128);
  });

  it('top-level children sum to 128', () => {
    const sum = (RULES_110.children ?? []).reduce((acc, c) => acc + c.minCredits, 0);
    expect(sum).toBe(128);
  });

  it('has 4 top-level categories: common, core, electives, freeElective', () => {
    const ids = (RULES_110.children ?? []).map(c => c.id);
    expect(ids).toEqual(['common', 'core', 'electives', 'freeElective']);
  });

  it('has 5 領域 leaves', () => {
    const field = findRule(RULES_110, 'field');
    expect(field?.children).toHaveLength(5);
    expect(field?.children?.map(c => c.id).sort()).toEqual([
      'field.hardware', 'field.multimedia', 'field.network',
      'field.system', 'field.theory',
    ]);
  });
});

describe('flattenRules', () => {
  it('yields all rule nodes', () => {
    const flat = flattenRules(RULES_110);
    const ids = flat.map(r => r.id);
    expect(ids).toContain('common.chinese');
    expect(ids).toContain('core.cs');
    expect(ids).toContain('field.system');
  });
});
