import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface LegacySimulationContextValue {
  assumedPassed: Set<string>;
  toggle: (code: string) => void;
  reset: () => void;
}

const LegacySimulationContext = createContext<LegacySimulationContextValue | null>(null);

export function LegacySimulationProvider({ children }: { children: ReactNode }) {
  const [assumedPassed, setAssumedPassed] = useState<Set<string>>(new Set());

  const value = useMemo<LegacySimulationContextValue>(() => ({
    assumedPassed,
    toggle: (code: string) => {
      setAssumedPassed(prev => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        return next;
      });
    },
    reset: () => setAssumedPassed(new Set()),
  }), [assumedPassed]);

  return (
    <LegacySimulationContext.Provider value={value}>
      {children}
    </LegacySimulationContext.Provider>
  );
}

export function useLegacySimulation(): LegacySimulationContextValue {
  const ctx = useContext(LegacySimulationContext);
  if (!ctx) throw new Error('useLegacySimulation must be inside LegacySimulationProvider');
  return ctx;
}
