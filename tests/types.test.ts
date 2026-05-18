import { describe, it, expect } from 'vitest';
import { isPassed, type Grade } from '../src/lib/types';

describe('isPassed', () => {
  it('returns true for A+/A/A-/B+/B/B-/C+/C/C-/抵免', () => {
    const passing: Grade[] = ['A+','A','A-','B+','B','B-','C+','C','C-','抵免'];
    for (const g of passing) {
      expect(isPassed(g)).toBe(true);
    }
  });

  it('returns false for D/E/X/停修', () => {
    const failing: Grade[] = ['D','E','X','停修'];
    for (const g of failing) {
      expect(isPassed(g)).toBe(false);
    }
  });
});
