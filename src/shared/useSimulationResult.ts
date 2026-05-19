import { useMemo } from 'react';
import { simulate } from '../lib/simulator';
import { useLegacySimulation } from './LegacySimulationContext';
import { useModernSimulation } from './ModernSimulationContext';
import transcript from '../data/transcript.json';
import catalog from '../data/catalog-110.json';
import liberal from '../data/liberal-courses.json';
import currentSemester from '../data/current-semester.json';
import type { TranscriptRecord, CatalogCourse, SimulationResult } from '../lib/types';
import type { LiberalMap } from '../lib/catalog';

function runSimulate(assumedPassed: Set<string>): SimulationResult {
  return simulate(
    transcript as TranscriptRecord[],
    catalog as CatalogCourse[],
    liberal as LiberalMap,
    currentSemester.courses,
    Array.from(assumedPassed),
  );
}

export function useLegacySimulationResult(): SimulationResult {
  const { assumedPassed } = useLegacySimulation();
  return useMemo(() => runSimulate(assumedPassed), [assumedPassed]);
}

export function useModernSimulationResult(): SimulationResult {
  const { assumedPassed } = useModernSimulation();
  return useMemo(() => runSimulate(assumedPassed), [assumedPassed]);
}
