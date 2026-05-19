import { useModernSimulation } from '../../../shared/ModernSimulationContext';
import currentSemester from '../../../data/current-semester.json';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function Sidebar() {
  const { assumedPassed, toggle, reset } = useModernSimulation();
  const catalogTyped = catalog as CatalogCourse[];

  return (
    <aside className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📚 {currentSemester.semester} 學期課程</h2>
        <button onClick={reset} className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
          Reset
        </button>
      </div>
      <div className="space-y-2">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const checked = assumedPassed.has(course.code);
          return (
            <label
              key={course.code}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                checked ? 'bg-indigo-50 border border-indigo-300' : 'bg-white border border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(course.code)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{course.name}</div>
                <div className="text-xs text-gray-500">{meta?.credits ?? '?'} 學分</div>
              </div>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
