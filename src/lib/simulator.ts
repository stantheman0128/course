import type {
  TranscriptRecord, CatalogCourse, CategoryId, CategoryRule, NodeStatus, SimulationResult,
} from './types';
import { classifyCourse, type LiberalMap } from './catalog';
import { passedRecords, dedupByCode } from './transcript';
import { RULES_110, flattenRules } from './creditRules';

export interface Assignment {
  record: TranscriptRecord;
  categoryId: CategoryId;
}

export function assignToLeaves(
  passed: TranscriptRecord[],
  catalog: CatalogCourse[],
  liberal: LiberalMap,
): Assignment[] {
  return passed.map(record => ({
    record,
    categoryId: classifyCourse(record.code, catalog, liberal),
  }));
}

export function walkTree(
  rule: CategoryRule,
  assignments: Assignment[],
): NodeStatus {
  // Recursively build status for children first
  const children = (rule.children ?? []).map(c => walkTree(c, assignments));

  // Earned: if leaf, sum directly-assigned credits; if branch, sum children
  let earned = 0;
  let passedCourses: TranscriptRecord[] = [];
  if (children.length === 0) {
    const own = assignments.filter(a => a.categoryId === rule.id);
    earned = own.reduce((s, a) => s + a.record.credits, 0);
    passedCourses = own.map(a => a.record);
  } else {
    earned = children.reduce((s, c) => s + c.earned, 0);
    passedCourses = children.flatMap(c => c.passedCourses);
  }

  const required = rule.minCredits;
  const earnedClipped = Math.min(earned, required);
  const overflow = Math.max(0, earned - required);

  return {
    id: rule.id,
    label: rule.label,
    required,
    earned,                    // raw, not clipped
    earnedClipped,             // clipped for progress/fulfilled
    overflow,
    pending: 0,
    fulfilled: earnedClipped >= required,
    passedCourses,
    pendingCourses: [],
    gapCourses: [],
    children: children.length > 0 ? children : undefined,
  };
}

function applyOverflow(
  assignments: Assignment[],
  rules: CategoryRule,
): Assignment[] {
  // Build leaf credit totals
  const leafCredits = new Map<CategoryId, number>();
  for (const a of assignments) {
    leafCredits.set(a.categoryId, (leafCredits.get(a.categoryId) ?? 0) + a.record.credits);
  }

  // For each leaf, if earned > cap, move surplus to overflowTo (single pass)
  const adjusted = [...assignments];
  const all = flattenRules(rules);

  for (const node of all) {
    if (!node.maxCredits && !node.overflowTo) continue;
    const earned = leafCredits.get(node.id) ?? 0;
    const cap = node.maxCredits ?? node.minCredits;
    if (earned > cap && node.overflowTo) {
      const surplus = earned - cap;
      // Move surplus credits by re-assigning latest assignments
      let toMove = surplus;
      for (let i = adjusted.length - 1; i >= 0 && toMove > 0; i--) {
        if (adjusted[i].categoryId === node.id) {
          const credits = adjusted[i].record.credits;
          if (credits <= toMove) {
            adjusted[i] = { ...adjusted[i], categoryId: node.overflowTo };
            toMove -= credits;
          }
        }
      }
    }
  }

  return adjusted;
}

export function simulate(
  transcript: TranscriptRecord[],
  catalog: CatalogCourse[],
  liberal: LiberalMap,
  currentSemesterCourses: { code: string; name: string }[],
  assumedPassedCodes: string[],
): SimulationResult {
  // 1. Filter passed from transcript
  const passed = dedupByCode(passedRecords(transcript));

  // 2. Build pending records from assumed-passed codes
  const pendingRecords: TranscriptRecord[] = assumedPassedCodes.map(code => {
    const found = catalog.find(c => c.code === code);
    const csEntry = currentSemesterCourses.find(c => c.code === code);
    return {
      semester: '114-2',
      code,
      name: csEntry?.name ?? found?.name ?? code,
      type: '選修',
      credits: found?.credits ?? 0,
      grade: 'A',
    };
  });

  // 3. Assign to leaves (passed only) for totalEarned
  const passedAssigned = assignToLeaves(passed, catalog, liberal);
  const passedAdjusted = applyOverflow(passedAssigned, RULES_110);
  const passedTree = walkTree(RULES_110, passedAdjusted);
  const totalEarned = passedTree.earned;

  // 4. Assign to leaves (passed + pending) for display tree
  const allAssigned = assignToLeaves([...passed, ...pendingRecords], catalog, liberal);
  const adjusted = applyOverflow(allAssigned, RULES_110);
  const tree = walkTree(RULES_110, adjusted);

  // 5. Compute pending credits
  const pendingCredits = pendingRecords.reduce((s, r) => s + r.credits, 0);

  // 6. Collect unsatisfied nodes from display tree
  const unsatisfied: NodeStatus[] = [];
  const collect = (n: NodeStatus) => {
    if (!n.fulfilled) unsatisfied.push(n);
    n.children?.forEach(collect);
  };
  collect(tree);

  // 7. Graduability check: sum (required - earnedClipped) over unfulfilled leaves
  const remaining = unsatisfied
    .filter(n => !n.children)
    .reduce((s, n) => s + (n.required - n.earnedClipped), 0);
  const canGraduateNextSemester = remaining <= 25;

  return {
    totalRequired: 128,
    totalEarned,
    totalPending: pendingCredits,
    canGraduateNextSemester,
    tree,
    unsatisfiedCategories: unsatisfied,
  };
}
