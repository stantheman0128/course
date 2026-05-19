import { useModernSimulationResult } from '../../../shared/useSimulationResult';

export function Stats() {
  const result = useModernSimulationResult();
  const total = result.totalEarned + result.totalPending;
  const pct = (total / 128) * 100;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">Graduation</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${result.canGraduateNextSemester ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {result.canGraduateNextSemester ? 'Likely next semester' : 'Behind schedule'}
        </span>
      </div>
      <div className="text-5xl font-light tabular-nums tracking-tight">
        {total}<span className="text-gray-400 text-3xl"> / 128</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-gray-500 mt-3 tabular-nums">
        +{result.totalPending} pending · {128 - total} remaining
      </p>
    </section>
  );
}
