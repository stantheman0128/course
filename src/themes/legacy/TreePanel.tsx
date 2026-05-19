import { useLegacySimulationResult } from '../../shared/useSimulationResult';
import { TreeNode } from './TreeNode';

interface TreePanelProps {
  onOpenSheet: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function TreePanel({ onOpenSheet, onToggleFullscreen, isFullscreen }: TreePanelProps) {
  const result = useLegacySimulationResult();
  const tree = result.tree;

  return (
    <>
      <div className="tree-header" id="tree-header">
        {/* 📚 course button — mobile only (CSS hides on ≥1200px) */}
        <button
          className="header-btn"
          id="course-btn"
          onClick={onOpenSheet}
          title="選課 (C)"
        >
          📚
        </button>

        <div className="tree-header-title">畢業學分架構</div>

        {/* Fullscreen toggle button */}
        <button
          className={`header-btn${isFullscreen ? ' active' : ''}`}
          id="fullscreen-btn"
          onClick={onToggleFullscreen}
          title="全螢幕 (F)"
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      <div id="tree-container">
        <ul className="tree" id="tree-root">
          <TreeNode node={tree} level={0} autoExpand={true} />
        </ul>
      </div>
    </>
  );
}
