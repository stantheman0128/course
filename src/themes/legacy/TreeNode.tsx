import { useState } from 'react';
import type { NodeStatus } from '../../lib/types';

interface TreeNodeProps {
  node: NodeStatus;
  level: number;
  autoExpand: boolean;
}

/** Determine visual status from earnedClipped vs required (per spec v2 §3) */
function getStatus(node: NodeStatus): 'completed' | 'partial' | 'incomplete' {
  if (node.earnedClipped >= node.required) return 'completed';
  if (node.earnedClipped > 0) return 'partial';
  return 'incomplete';
}

function statusIcon(status: 'completed' | 'partial' | 'incomplete'): string {
  if (status === 'completed') return '✓';
  if (status === 'partial') return '⚠';
  return '✗';
}

/** True when toggle arrow should be shown */
function hasContent(node: NodeStatus): boolean {
  if (node.children && node.children.length > 0) return true;
  if (
    node.passedCourses.length > 0 ||
    node.pendingCourses.length > 0 ||
    node.gapCourses.length > 0
  ) return true;
  return false;
}

function LeafBuckets({ node }: { node: NodeStatus }) {
  const [completedOpen, setCompletedOpen] = useState(false);

  const passed = node.passedCourses;
  const pending = node.pendingCourses;
  const gap = node.gapCourses;

  // gapCourses are shown as 還需 when leaf is incomplete/partial (these are the not-yet-passed
  // required or fromCodes entries). When the leaf is completed, any remaining gap entries
  // become 可選 (theoretical alternatives). Per spec: gapCourses for completed leaves →
  // skip 還需, show as 可選.
  const status = getStatus(node);
  const showAsIncomplete = status !== 'completed';

  const incompleteCourses = showAsIncomplete ? gap : [];
  const availableCourses = showAsIncomplete ? [] : gap;

  // gapCourses are CatalogCourse entries with no semester notes, so header is always 還需修習.
  const incompleteHeader = '✗ 還需修習';

  const hasAnyBucket =
    passed.length > 0 ||
    pending.length > 0 ||
    incompleteCourses.length > 0 ||
    availableCourses.length > 0;

  if (!hasAnyBucket) return null;

  return (
    <>
      {/* a) 已修課程 (collapsed by default) */}
      {passed.length > 0 && (
        <li>
          <div
            className="completed-summary"
            onClick={() => setCompletedOpen(o => !o)}
          >
            <span className="completed-summary-text">
              ✓ 已修 {passed.length} 門課程
            </span>
            <span className={`completed-summary-toggle${completedOpen ? ' expanded' : ''}`}>
              ▼
            </span>
          </div>
          <div className={`completed-courses-list${completedOpen ? ' show' : ''}`}>
            <div className="completed-courses-inner">
              {passed.map(course => (
                <div key={course.code} className="course-detail completed">
                  <span>{course.name}</span>
                  <div className="course-info">
                    <span>{course.credits}學分</span>
                    {course.grade && (
                      <span className="course-tag tag-grade">{course.grade}</span>
                    )}
                    {course.semester && (
                      <span className="course-tag tag-semester">{course.semester}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </li>
      )}

      {/* b) 新增課程 (simulated pending) */}
      {pending.length > 0 && (
        <>
          <li className="section-header">✨ 新增課程</li>
          {pending.map(course => (
            <li key={course.code}>
              <div className="course-detail new">
                <span>{course.name}</span>
                <div className="course-info">
                  <span>{course.credits}學分</span>
                  <span className="course-tag tag-new">NEW</span>
                </div>
              </div>
            </li>
          ))}
        </>
      )}

      {/* c) 還需修習 / 修課中 */}
      {incompleteCourses.length > 0 && (
        <>
          <li className="section-header">{incompleteHeader}</li>
          {incompleteCourses.map(course => (
            <li key={course.code}>
              <div
                className="course-detail"
                style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  borderLeftColor: '#ef4444',
                }}
              >
                <span>{course.name}</span>
                <div className="course-info">
                  <span>{course.credits}學分</span>
                </div>
              </div>
            </li>
          ))}
        </>
      )}

      {/* d) 可選課程 */}
      {availableCourses.length > 0 && (
        <>
          <li className="section-header">💡 可選課程</li>
          {availableCourses.map(course => (
            <li key={course.code}>
              <div className="course-detail available">
                <span>{course.name}</span>
                <span>{course.credits}學分</span>
              </div>
            </li>
          ))}
        </>
      )}
    </>
  );
}

export function TreeNode({ node, level, autoExpand }: TreeNodeProps) {
  const status = getStatus(node);
  const [expanded, setExpanded] = useState(() => {
    // root always expanded; children auto-expand if incomplete or partial
    if (level === 0) return true;
    return autoExpand && (status === 'incomplete' || status === 'partial');
  });

  const hasChildren = node.children && node.children.length > 0;
  const showToggle = hasContent(node);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showToggle) setExpanded(prev => !prev);
  };

  return (
    <li className="tree-node">
      <div className="node-content" onClick={handleContentClick}>
        {/* Status icon */}
        <div className={`node-icon status-${status}`}>
          {statusIcon(status)}
        </div>

        {/* Label */}
        <div className="node-label">{node.label}</div>

        {/* Credits */}
        {node.required > 0 && (
          <div className="node-credits">
            <span className="credits-earned">{node.earned}</span>
            <span style={{ color: '#d1d5db' }}> / </span>
            <span className="credits-required">{node.required}</span>
            {node.overflow > 0 && (
              <span className="badge badge-info">超修 {node.overflow}</span>
            )}
          </div>
        )}

        {/* Toggle arrow */}
        {showToggle && (
          <div className={`toggle-icon${expanded ? ' expanded' : ''}`}>▶</div>
        )}
      </div>

      {/* Children */}
      {showToggle && (
        <ul className={`tree-children${expanded ? ' show' : ''}`}>
          <div className="tree-children-inner">
            {hasChildren
              ? node.children!.map(child => (
                  <TreeNode
                    key={child.id}
                    node={child}
                    level={level + 1}
                    autoExpand={true}
                  />
                ))
              : <LeafBuckets node={node} />
            }
          </div>
        </ul>
      )}
    </li>
  );
}
