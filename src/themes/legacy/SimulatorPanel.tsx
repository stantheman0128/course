import { useLegacySimulation } from '../../shared/LegacySimulationContext';
import currentSemester from '../../data/current-semester.json';
import catalog from '../../data/catalog-110.json';
import type { CatalogCourse } from '../../lib/types';

const catalogTyped = catalog as CatalogCourse[];

export function SimulatorPanel() {
  const { assumedPassed, toggle } = useLegacySimulation();
  return (
    <>
      <div className="simulator-panel-header">
        <div className="simulator-title">📚 {currentSemester.semester}學期課程</div>
      </div>
      <div className="course-grid" id="current-courses">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const credits = meta?.credits ?? 0;
          const selected = assumedPassed.has(course.code);
          return (
            <div
              key={course.code}
              className={`course-item-sim${selected ? ' selected' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLInputElement).type !== 'checkbox') {
                  toggle(course.code);
                }
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(course.code)}
              />
              <span className="course-name-sim">{course.name}</span>
              <span className="course-credits-sim">{credits}學分</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
