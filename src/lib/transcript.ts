import { isPassed, type TranscriptRecord } from './types';

export function passedRecords(records: TranscriptRecord[]): TranscriptRecord[] {
  return records.filter(r => isPassed(r.grade));
}

export function dedupByCode(records: TranscriptRecord[]): TranscriptRecord[] {
  const seen = new Map<string, TranscriptRecord>();
  for (const r of records) {
    if (!seen.has(r.code)) {
      seen.set(r.code, r);
    }
  }
  return Array.from(seen.values());
}
