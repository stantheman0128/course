import { useMemo } from 'react';
import { simulate } from '../lib/simulator';
import { useModernSimulation } from './ModernSimulationContext';
import transcript from '../data/transcript.json';
import catalog from '../data/catalog-110.json';
import liberal from '../data/liberal-courses.json';
import currentSemester from '../data/current-semester.json';
import type { TranscriptRecord, CatalogCourse, SimulationResult } from '../lib/types';
import type { LiberalMap } from '../lib/catalog';

export function useSimulationResult(): SimulationResult {
  const { assumedPassed } = useModernSimulation();

  return useMemo(() => {
    return simulate(
      transcript as TranscriptRecord[],
      catalog as CatalogCourse[],
      liberal as LiberalMap,
      currentSemester.courses,
      Array.from(assumedPassed),
    );
  }, [assumedPassed]);
}
