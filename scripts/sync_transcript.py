"""Convert scoreExport.xls to transcript.json.

Reads the NTNU score export and emits a JSON array of TranscriptRecord.
Skips zero-credit non-exemption records (military education courses).
"""
import json
import sys
from pathlib import Path

import pandas as pd


COLS = ['學年', '學期', '開課代碼', '課程名稱', '必/選/通', '學分', '成績', '備註']


def normalise_semester(year, term) -> str:
    return f"{int(year)}-{term}"


def normalise_grade(raw) -> str:
    # raw can be 'A+', 'A', ..., 'E', 'X', '停修', '抵免', or empty
    g = str(raw).strip()
    if g in ('A+','A','A-','B+','B','B-','C+','C','C-','D','E','X','停修','抵免'):
        return g
    raise ValueError(f'unknown grade: {raw!r}')


def normalise_type(raw) -> str:
    t = str(raw).strip()
    if t == '必修': return '必修'
    if t == '選修': return '選修'
    if t == '通識': return '通識'
    raise ValueError(f'unknown type: {raw!r}')


def main(xls_path: str, out_path: str) -> None:
    df = pd.read_excel(xls_path, header=None)
    # Row 0 is headers; row 1+ is data.
    df.columns = COLS
    df = df.iloc[1:].reset_index(drop=True)

    records = []
    for _, row in df.iterrows():
        credits = float(row['學分'])
        grade = normalise_grade(row['成績'])

        # Skip zero-credit non-exemption (military ed)
        if credits == 0 and grade != '抵免':
            continue

        rec = {
            'semester': normalise_semester(row['學年'], row['學期']),
            'code': str(row['開課代碼']).strip(),
            'name': str(row['課程名稱']).strip(),
            'type': normalise_type(row['必/選/通']),
            'credits': credits,
            'grade': grade,
        }
        note = str(row['備註']).strip()
        if note and note != 'nan':
            rec['note'] = note
        records.append(rec)

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f'Wrote {len(records)} records to {out_path}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
