import { useSimulationResult } from '../../../shared/useSimulationResult';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function GapAdvisor() {
  const result = useSimulationResult();
  const catalogTyped = catalog as CatalogCourse[];

  // Show leaf-level unfulfilled categories (skip branch nodes)
  const leafGaps = result.unsatisfiedCategories.filter(n => !n.children);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">💡 缺口建議</h2>
      {result.canGraduateNextSemester && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-4">
          <p className="text-emerald-800 font-medium">
            ✅ 預估 115-1 可以畢業（剩 {leafGaps.reduce((s, n) => s + (n.required - n.earned), 0)} 學分）
          </p>
        </div>
      )}
      {leafGaps.length === 0 ? (
        <p className="text-gray-600">所有領域已達標 🎉</p>
      ) : (
        <ul className="space-y-3">
          {leafGaps.map(gap => {
            const shortage = gap.required - gap.earned;
            const candidates = catalogTyped.filter(c => c.category === gap.id).slice(0, 5);
            return (
              <li key={gap.id} className="border-l-4 border-amber-400 pl-3">
                <div className="font-medium">
                  {gap.label} — 還缺 {shortage} 學分
                </div>
                {candidates.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    建議：{candidates.map(c => c.name).join(', ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
