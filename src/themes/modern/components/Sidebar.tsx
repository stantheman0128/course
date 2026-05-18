import { useSimulation } from '../../../shared/SimulationContext';
import currentSemester from '../../../data/current-semester.json';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function Sidebar() {
  const { assumedPassed, toggle, reset } = useSimulation();
  const catalogTyped = catalog as CatalogCourse[];

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">
          Current Semester · {currentSemester.semester}
        </h2>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-900">Reset</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const checked = assumedPassed.has(course.code);
          return (
            <label
              key={course.code}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                checked ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(course.code)}
                className="w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{course.name}</div>
                <div className={`text-xs ${checked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {meta?.credits ?? '?'} cr
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
