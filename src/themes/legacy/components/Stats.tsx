import { useLegacySimulationResult } from '../../../shared/useSimulationResult';

export function Stats() {
  const result = useLegacySimulationResult();
  const percentage = ((result.totalEarned + result.totalPending) / 128 * 100).toFixed(1);

  return (
    <div className="grid grid-cols-4 gap-5 p-6">
      <StatCard label="已修學分" value={result.totalEarned} color="text-indigo-600" />
      <StatCard label="本學期" value={`+${result.totalPending}`} color="text-amber-500" />
      <StatCard label="畢業學分" value={128} color="text-red-500" />
      <StatCard label="完成度" value={`${percentage}%`} color="text-emerald-500" />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg p-5 text-center">
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-2">{label}</div>
    </div>
  );
}
