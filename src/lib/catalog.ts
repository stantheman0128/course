import type { CatalogCourse, CategoryId } from './types';

export type LiberalMap = Record<string, { category: CategoryId; name: string }>;

export function findByCode(
  catalog: CatalogCourse[],
  code: string,
): CatalogCourse | undefined {
  return catalog.find(c => c.code === code);
}

export function classifyCourse(
  code: string,
  catalog: CatalogCourse[],
  liberal: LiberalMap,
): CategoryId {
  const fromCatalog = findByCode(catalog, code);
  if (fromCatalog) return fromCatalog.category;

  const fromLiberal = liberal[code];
  if (fromLiberal) return fromLiberal.category;

  return 'freeElective';
}
