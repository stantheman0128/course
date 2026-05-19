import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import currentSemester from '../data/current-semester.json';

const DEFAULT_CODES = new Set(currentSemester.courses.map(c => c.code));
const STORAGE_KEY = 'course.assumedPassed.v1';

interface ModernSimulationContextValue {
  assumedPassed: Set<string>;
  toggle: (code: string) => void;
  reset: () => void;
}

const ModernSimulationContext = createContext<ModernSimulationContextValue | null>(null);

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(DEFAULT_CODES);
    const codes = JSON.parse(raw) as string[];
    return new Set(codes);
  } catch {
    return new Set(DEFAULT_CODES);
  }
}

function saveToStorage(codes: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(codes)));
}

export function ModernSimulationProvider({ children }: { children: ReactNode }) {
  const [assumedPassed, setAssumedPassed] = useState<Set<string>>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(assumedPassed);
  }, [assumedPassed]);

  const value = useMemo<ModernSimulationContextValue>(() => ({
    assumedPassed,
    toggle: (code: string) => {
      setAssumedPassed(prev => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        return next;
      });
    },
    reset: () => setAssumedPassed(new Set(DEFAULT_CODES)),
  }), [assumedPassed]);

  return (
    <ModernSimulationContext.Provider value={value}>
      {children}
    </ModernSimulationContext.Provider>
  );
}

export function useModernSimulation(): ModernSimulationContextValue {
  const ctx = useContext(ModernSimulationContext);
  if (!ctx) throw new Error('useModernSimulation must be inside ModernSimulationProvider');
  return ctx;
}
