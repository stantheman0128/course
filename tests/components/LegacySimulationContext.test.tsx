import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LegacySimulationProvider, useLegacySimulation } from '../../src/shared/LegacySimulationContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  <LegacySimulationProvider>{children}</LegacySimulationProvider>;

describe('useLegacySimulation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with EMPTY assumedPassed (per v1.7 §M1)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    expect(result.current.assumedPassed.size).toBe(0);
  });

  it('toggle adds and removes codes', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(false);
  });

  it('reset returns to EMPTY (not pre-filled, per inventory §M1)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    act(() => result.current.reset());
    expect(result.current.assumedPassed.size).toBe(0);
  });

  it('does NOT persist to localStorage (per inventory §M6 + §N6)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    // Inspect every storage key — none should belong to legacy
    const keys = Object.keys(localStorage);
    expect(keys.filter(k => k.includes('legacy') || k.includes('assumedPassed'))).toEqual([]);
  });
});
