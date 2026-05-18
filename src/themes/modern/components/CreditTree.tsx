import { useState } from 'react';
import { useSimulationResult } from '../../../shared/useSimulationResult';
import type { NodeStatus } from '../../../lib/types';

export function CreditTree() {
  const result = useSimulationResult();
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Categories</h2>
      {result.tree.children?.map(node => (
        <ModernNode key={node.id} node={node} depth={0} />
      ))}
    </section>
  );
}

function ModernNode({ node, depth }: { node: NodeStatus; depth: number }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const pct = Math.min(100, (node.earned / node.required) * 100);

  const statusBg = node.fulfilled
    ? 'bg-emerald-50 border-emerald-200'
    : node.earned > 0 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

  return (
    <div className="my-2">
      <button
        onClick={() => hasChildren && setExpanded(e => !e)}
        className={`w-full text-left p-3 rounded-lg border ${statusBg} flex items-center gap-3`}
      >
        {hasChildren && <span className="text-gray-400 text-xs">{expanded ? '−' : '+'}</span>}
        <span className="flex-1 font-medium text-sm">{node.label}</span>
        <span className="text-xs tabular-nums text-gray-700">
          {node.earned} / {node.required}
        </span>
        <div className="w-24 h-1.5 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
        </div>
      </button>
      {expanded && hasChildren && (
        <div className="ml-6 mt-1 space-y-1">
          {node.children!.map(child => (
            <ModernNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
