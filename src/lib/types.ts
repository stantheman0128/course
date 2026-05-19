export type Semester = `${number}-${1 | 2 | '暑'}`;

export type Grade =
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D'  | 'E' | 'X'
  | '停修' | '抵免';

export interface TranscriptRecord {
  semester: Semester;
  code: string;
  name: string;
  type: '必修' | '選修' | '通識';
  credits: number;
  grade: Grade;
  note?: string;
}

export function isPassed(grade: Grade): boolean {
  return !['D', 'E', 'X', '停修'].includes(grade);
}

export type CategoryId =
  | 'total'
  | 'common'
  | 'common.chinese' | 'common.english'
  | 'common.general'
  | 'common.general.liberal'
  | 'common.general.liberal.humanities'
  | 'common.general.liberal.social'
  | 'common.general.liberal.natural'
  | 'common.general.liberal.logical'
  | 'common.general.crossDomain'
  | 'common.general.selfLearning'
  | 'common.pe'
  | 'core' | 'core.cs' | 'core.math' | 'core.project'
  | 'electives' | 'field'
  | 'field.theory' | 'field.hardware' | 'field.system'
  | 'field.network' | 'field.multimedia'
  | 'deptElective'
  | 'freeElective';

export interface CatalogCourse {
  code: string;
  name: string;
  credits: number;
  category: CategoryId;
  alternativeCategories?: CategoryId[];
  available?: boolean;
}

export interface CategoryRule {
  id: CategoryId;
  label: string;
  minCredits: number;
  maxCredits?: number;
  minPerChild?: number;
  overflowTo?: CategoryId;
  requiredCodes?: string[];
  chooseN?: number;
  fromCodes?: string[];
  alsoNeed?: { from: string[]; minCredits: number };
  children?: CategoryRule[];
}

export interface NodeStatus {
  id: CategoryId;
  label: string;
  required: number;
  earned: number;              // raw, NOT clipped — may exceed required
  earnedClipped: number;       // Math.min(earned, required), for progress bar / fulfilled
  overflow: number;            // Math.max(0, earned - required), for "超修 N" display
  pending: number;
  fulfilled: boolean;          // earnedClipped >= required
  passedCourses: TranscriptRecord[];
  pendingCourses: CatalogCourse[];
  gapCourses: CatalogCourse[];
  children?: NodeStatus[];
}

export interface SimulationResult {
  totalRequired: 128;
  totalEarned: number;
  totalPending: number;
  canGraduateNextSemester: boolean;
  tree: NodeStatus;
  unsatisfiedCategories: NodeStatus[];
}
