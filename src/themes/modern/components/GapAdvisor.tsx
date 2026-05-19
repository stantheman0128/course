import { useModernSimulationResult } from '../../../shared/useSimulationResult';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function GapAdvisor() {
  const result = useModernSimulationResult();
  const catalogTyped = catalog as CatalogCourse[];
  const leafGaps = result.unsatisfiedCategories.filter(n => !n.children);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
        Recommendations for next semester
      </h2>
      {leafGaps.length === 0 ? (
        <p className="text-gray-700">All categories fulfilled.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {leafGaps.map(gap => {
            const shortage = gap.required - gap.earned;
            const candidates = catalogTyped.filter(c => c.category === gap.id).slice(0, 3);
            return (
              <li key={gap.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-sm">{gap.label}</span>
                  <span className="text-xs tabular-nums text-rose-600">−{shortage} cr</span>
                </div>
                {candidates.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {candidates.map(c => c.name).join(' · ')}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
