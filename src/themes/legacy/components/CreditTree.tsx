import { useState } from 'react';
import { useLegacySimulationResult } from '../../../shared/useSimulationResult';
import type { NodeStatus } from '../../../lib/types';

export function CreditTree() {
  const result = useLegacySimulationResult();
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">畢業學分架構</h2>
      <TreeNode node={result.tree} defaultExpanded={2} depth={0} />
    </div>
  );
}

function TreeNode({ node, defaultExpanded, depth }: { node: NodeStatus; defaultExpanded: number; depth: number }) {
  const [expanded, setExpanded] = useState(depth < defaultExpanded);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const statusColor = node.fulfilled
    ? 'text-emerald-600'
    : node.earned > 0 ? 'text-amber-500' : 'text-red-500';

  const statusIcon = node.fulfilled ? '✅' : (node.earned > 0 ? '⚠️' : '○');

  return (
    <div className="ml-4 my-1">
      <div
        className={`flex items-center gap-2 ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setExpanded(e => !e)}
      >
        {hasChildren && <span>{expanded ? '▼' : '▶'}</span>}
        <span className={statusColor}>{statusIcon}</span>
        <span className="font-medium">{node.label}</span>
        <span className="text-sm text-gray-600">
          {node.earned}/{node.required}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden max-w-xs">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
            style={{ width: `${Math.min(100, (node.earned / node.required) * 100)}%` }}
          />
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-2 mt-1">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} defaultExpanded={defaultExpanded} depth={depth + 1} />
          ))}
        </div>
      )}
      {expanded && !hasChildren && node.passedCourses.length > 0 && (
        <div className="ml-8 text-xs text-gray-600 mt-1">
          {node.passedCourses.map(c => (
            <div key={c.code}>{c.name} ({c.grade}, {c.semester})</div>
          ))}
        </div>
      )}
    </div>
  );
}
