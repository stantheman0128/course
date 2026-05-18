import type { CategoryId, CategoryRule } from './types';

export const RULES_110: CategoryRule = {
  id: 'total', label: '畢業總學分', minCredits: 128, children: [
    {
      id: 'common', label: '一、校共同必修', minCredits: 32, children: [
        { id: 'common.chinese', label: '中文', minCredits: 4 },
        { id: 'common.english', label: '英文', minCredits: 6 },
        {
          id: 'common.general', label: '通識', minCredits: 18, children: [
            {
              id: 'common.general.liberal', label: '博雅', minCredits: 8,
              minPerChild: 2,
              children: [
                { id: 'common.general.liberal.humanities', label: '人文藝術', minCredits: 2 },
                { id: 'common.general.liberal.social',     label: '社會科學', minCredits: 2 },
                { id: 'common.general.liberal.natural',    label: '自然科學', minCredits: 2 },
                { id: 'common.general.liberal.logical',    label: '邏輯運算', minCredits: 2 },
              ],
              overflowTo: 'common.general',
            },
            { id: 'common.general.crossDomain', label: '跨域探索', minCredits: 4,
              overflowTo: 'common.general' },
            { id: 'common.general.selfLearning', label: '自主學習', minCredits: 0,
              maxCredits: 4, overflowTo: 'freeElective' },
          ],
          overflowTo: 'freeElective',
        },
        { id: 'common.pe', label: '體育', minCredits: 4 },
      ],
    },
    {
      id: 'core', label: '二、系核心必修', minCredits: 33, children: [
        {
          id: 'core.cs', label: '資訊課程', minCredits: 15,
          requiredCodes: ['CSU0001','CSU0002','CSU0013','CSU0018','CSU0029'],
        },
        {
          id: 'core.math', label: '數學必選修', minCredits: 12,
          requiredCodes: ['CSU0011','CSU0015','CSU0016'],
          alsoNeed: { from: ['MAU0178','MAU0179','MAU0180','MAU0181'], minCredits: 3 },
        },
        {
          id: 'core.project', label: '資訊專題', minCredits: 6,
          chooseN: 2,
          fromCodes: ['CSU0036','CSU0037','CSU0039','CSU0040'],
        },
      ],
    },
    {
      id: 'electives', label: '三、系選修', minCredits: 36, children: [
        {
          id: 'field', label: '領域選修', minCredits: 30,
          minPerChild: 3,
          children: [
            { id: 'field.theory',     label: '資訊理論', minCredits: 3 },
            { id: 'field.hardware',   label: '資訊硬體', minCredits: 3 },
            { id: 'field.system',     label: '資訊系統', minCredits: 3 },
            { id: 'field.network',    label: '電腦網路', minCredits: 3 },
            { id: 'field.multimedia', label: '多媒體處理', minCredits: 3 },
          ],
          overflowTo: 'deptElective',
        },
        { id: 'deptElective', label: '系選修', minCredits: 6, overflowTo: 'freeElective' },
      ],
    },
    { id: 'freeElective', label: '四、自由選修', minCredits: 27 },
  ],
};

export function findRule(root: CategoryRule, id: CategoryId): CategoryRule | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findRule(child, id);
    if (found) return found;
  }
  return undefined;
}

export function flattenRules(root: CategoryRule): CategoryRule[] {
  const out: CategoryRule[] = [root];
  for (const child of root.children ?? []) {
    out.push(...flattenRules(child));
  }
  return out;
}
