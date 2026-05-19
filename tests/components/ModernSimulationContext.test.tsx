import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ModernSimulationProvider, useModernSimulation } from '../../src/shared/ModernSimulationContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  <ModernSimulationProvider>{children}</ModernSimulationProvider>;

describe('useModernSimulation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with default 9 assumed-passed codes', () => {
    const { result } = renderHook(() => useModernSimulation(), { wrapper });
    expect(result.current.assumedPassed.size).toBe(9);
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
  });

  it('toggle adds and removes codes', () => {
    const { result } = renderHook(() => useModernSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(false);
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
  });

  it('reset restores default 9 codes', () => {
    const { result } = renderHook(() => useModernSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    act(() => result.current.reset());
    expect(result.current.assumedPassed.size).toBe(9);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useModernSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    const stored = localStorage.getItem('course.assumedPassed.v1');
    expect(stored).toBeTruthy();
    const codes = JSON.parse(stored!);
    expect(codes).not.toContain('CSU0018');
  });
});
