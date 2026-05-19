import { useLegacySimulation } from '../../shared/LegacySimulationContext';
import currentSemester from '../../data/current-semester.json';
import catalog from '../../data/catalog-110.json';
import type { CatalogCourse } from '../../lib/types';

const catalogTyped = catalog as CatalogCourse[];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheet({ isOpen, onClose }: Props) {
  const { assumedPassed, toggle } = useLegacySimulation();

  return (
    <>
      <div
        className={`mobile-overlay${isOpen ? ' active' : ''}`}
        id="mobile-overlay"
        onClick={onClose}
      />
      <div className={`mobile-course-panel${isOpen ? ' active' : ''}`} id="mobile-panel">
        <div className="mobile-panel-handle" />
        <div className="mobile-panel-header">
          <div className="mobile-panel-header-icon">📚</div>
          <div>
            <h3>{currentSemester.semester}學期課程</h3>
            <p>點選模擬選課效果</p>
          </div>
        </div>
        <div className="mobile-panel-content">
          <div className="mobile-course-grid" id="mobile-courses">
            {currentSemester.courses.map(course => {
              const meta = catalogTyped.find(c => c.code === course.code);
              const credits = meta?.credits ?? 0;
              const selected = assumedPassed.has(course.code);
              return (
                <div
                  key={course.code}
                  className={`course-item-sim mobile-course-item${selected ? ' selected' : ''}`}
                  onClick={(e) => {
                    if ((e.target as HTMLInputElement).type !== 'checkbox') toggle(course.code);
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
        </div>
      </div>
    </>
  );
}
