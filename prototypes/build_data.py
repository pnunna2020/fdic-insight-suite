"""
FDIC Insight Suite — data preprocessor.

Reads the raw FDIC files in ../  and emits compact JSON in ./data/ that the
two HTML artifacts (semantic_layer.html and liquidity_monitor.html) load
client-side.

Outputs:
  data/variables.json        - unified variable dictionary (~2,700 vars)
  data/institutions.json     - slim institution index (~27,800 banks, 9 fields)
  data/liquidity_panel.json  - 8 quarters x 4,400 banks x 25 liquidity columns
  data/quarters.json         - quarter list and metadata
"""

import csv
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # FDIC-Prototype-Data/
DATA_OUT = Path(__file__).resolve().parent / "data"
RIS_ROOT = Path("/tmp/ris_all")                        # extracted earlier
DATA_OUT.mkdir(parents=True, exist_ok=True)

QUARTERS = ["2403", "2406", "2409", "2412", "2503", "2506", "2509", "2512"]
QUARTER_LABELS = {
    "2403": "2024 Q1", "2406": "2024 Q2", "2409": "2024 Q3", "2412": "2024 Q4",
    "2503": "2025 Q1", "2506": "2025 Q2", "2509": "2025 Q3", "2512": "2025 Q4",
}

# ---------------------------------------------------------------------------
# 1. Build the unified variable dictionary.
# ---------------------------------------------------------------------------
def build_variables():
    """Merge:
       - institutions_definitions.csv  (institution-level fields)
       - locations_definitions.csv     (branch-level fields)
       - sod_variables_definitions.csv (Summary of Deposits dict)
       - events_definitions.csv        (Failures/Assistance dict)
       - All Financial Reports.xlsx -> Reference-Variables&Definitions sheet
         (the ~2,300-variable RIS / Call Report dictionary)
    """
    variables = {}

    def add(name, label, definition, source, category):
        if not name:
            return
        name = name.strip().upper()
        if name in variables:
            # Prefer richer definition if duplicate.
            if len(definition or "") > len(variables[name].get("definition", "")):
                variables[name].update(label=label, definition=definition)
            return
        variables[name] = {
            "name": name,
            "label": (label or "").strip(),
            "definition": (definition or "").strip().replace("_x000D_\n", " ").replace("\n", " "),
            "source": source,
            "category": category,
        }

    # ---- institutions_definitions.csv ----
    with open(ROOT / "institutions_definitions.csv", encoding="utf-8") as f:
        # First line is just the header label, second line is the column header
        first = f.readline()
        rdr = csv.reader(f)
        header = next(rdr)
        for row in rdr:
            if len(row) >= 3:
                add(row[0], row[1], row[2], "institutions", "Institution metadata")

    # ---- locations_definitions.csv ----
    with open(ROOT / "locations_definitions.csv", encoding="utf-8") as f:
        rdr = csv.reader(f)
        header = next(rdr)
        for row in rdr:
            if len(row) >= 3:
                add(row[0], row[1], row[2], "locations", "Branch / Geography")

    # ---- sod_variables_definitions.csv ----
    with open(ROOT / "sod_variables_definitions.csv", encoding="utf-8") as f:
        rdr = csv.reader(f)
        header = next(rdr)
        for row in rdr:
            if len(row) >= 6 and row[1]:
                add(row[1], row[1], row[5], "sod", "Summary of Deposits (schema only)")

    # ---- events_definitions.csv ----
    with open(ROOT / "events_definitions.csv", encoding="utf-8") as f:
        rdr = csv.reader(f)
        header = next(rdr)
        for row in rdr:
            if len(row) >= 3:
                add(row[0], row[1], row[2], "events", "Failures / Assistance (schema only)")

    # ---- Reference-Variables&Definitions (xlsx) ----
    try:
        import openpyxl
        wb = openpyxl.load_workbook(ROOT / "All Financial Reports.xlsx", read_only=True, data_only=True)
        ws = wb["Reference-Variables&Definitions"]
        for r in ws.iter_rows(min_row=2, values_only=True):
            if r and r[0]:
                # Definitions often start with "( YTD, $ )" etc — keep as-is.
                add(r[0], r[1], r[2], "ris", "RIS / Call Report")
    except Exception as e:
        print(f"[warn] could not parse xlsx: {e}", file=sys.stderr)

    # Light-touch tagging: derive a domain from keywords for facet filters.
    DOMAIN_KEYWORDS = [
        ("Capital",      ["CAPITAL", "TIER", "CET1", "T1", "RISK-BASED", "RBC", "EQUITY", "EQ"]),
        ("Liquidity",    ["LIQUID", "DEPOSIT", "BROKER", "FHLB", "CORE", "UNINS", "REPO", "FED FUNDS"]),
        ("Asset Quality",["NONCURR", "NONACCR", "CHARGE", "ALLOWANCE", "PAST DUE", "NPL", "NCO"]),
        ("Earnings",     ["INCOME", "EXPENSE", "ROA", "ROE", "NIM", "MARGIN", "EARNINGS", "EFFICIENCY"]),
        ("Concentration",["CONCENTR", "CRE", "ADC", "CONSTRUCT", "AGRIC", "C&I", "REAL ESTATE"]),
        ("Securities",   ["SECURIT", "HTM", "AFS", "TREASURY", "MUNICIPAL", "MBS", "CMO"]),
        ("Loans",        ["LOAN", "LN", "MORTGAGE", "CONSUMER", "COMMERCIAL"]),
        ("Geography",    ["STATE", "COUNTY", "CBSA", "ZIP", "ADDRESS", "CITY", "MSA"]),
        ("Identity",     ["CERT", "RSSD", "NAME", "CHARTER", "DOCKET", "FDIC"]),
    ]
    for v in variables.values():
        text = (v["label"] + " " + v["definition"]).upper()
        domains = []
        for dom, kws in DOMAIN_KEYWORDS:
            if any(k in text for k in kws):
                domains.append(dom)
        v["domains"] = domains or ["Other"]

    out = list(variables.values())
    out.sort(key=lambda v: v["name"])
    with open(DATA_OUT / "variables.json", "w") as f:
        json.dump(out, f)
    print(f"variables.json: {len(out):,} variables")
    return variables


# ---------------------------------------------------------------------------
# 2. Slim institutions index.
# ---------------------------------------------------------------------------
INSTITUTION_FIELDS = [
    "CERT", "NAME", "STNAME", "CITY", "ASSET", "DEP", "EQ",
    "BKCLASS", "ACTIVE", "SPECGRP", "SPECGRPN", "FDICREGN",
    "FDICSUPV", "ESTYMD", "STALP", "ZIP", "WEBADDR", "REGAGNT",
]

def build_institutions():
    src = ROOT / "institutions.csv"
    with open(src, encoding="utf-8", errors="replace") as f:
        rdr = csv.DictReader(f)
        # Strip surrounding quotes from header keys.
        rdr.fieldnames = [h.strip('"') for h in rdr.fieldnames]
        rows = []
        for r in rdr:
            row = {k: (r.get(k, "") or "").strip('"') for k in INSTITUTION_FIELDS if k in r}
            for numcol in ("ASSET", "DEP", "EQ"):
                v = row.get(numcol, "")
                try:
                    row[numcol] = float(v) if v not in ("", None) else None
                except ValueError:
                    row[numcol] = None
            rows.append(row)
    with open(DATA_OUT / "institutions.json", "w") as f:
        json.dump(rows, f)
    print(f"institutions.json: {len(rows):,} banks")
    return rows


# ---------------------------------------------------------------------------
# 3. Liquidity / run-risk panel: 25 columns x 4,400 banks x 8 quarters.
# ---------------------------------------------------------------------------
# Variable selection rationale (post-SVB lens):
#   Sources: CDI (concentration / key indicators), RAT (pre-computed ratios),
#            FTS (raw financial time series).
LIQUIDITY_VARS = {
    "CDI": [
        "COREDEP",      # core (retail) deposits
        "DEPLGAMT",     # large-account deposits ($)
        "DEPSMAMT",     # small-account deposits ($)
        "DEPINS",       # estimated insured deposits
    ],
    "RAT": [
        "DEPDASTR",     # deposits / assets
        "LNLSDEPR",     # loans / deposits
        "DEPINSY1",     # insured / total deposits (%)
        "DEPNIY1",      # non-int / total deposits (%)
        "NCOREQ1",      # noncore funding / assets (qtr)
        "NCOREY1",      # noncore funding / assets (ytd)
        "ROAQ",         # return on assets (qtr)
        "NIMQY1",       # net interest margin (qtr)
        "NPERFV",       # noncurrent assets+OREO / assets
        "EQV",          # equity / assets
    ],
    "FTS": [
        "ASSET",        # total assets (size)
        "DEP",          # total deposits
        "DEPDOM",       # domestic deposits
        "DEPI",         # interest-bearing deposits
        "DEPNI",        # non-interest-bearing deposits
        "EQ",           # equity capital
        "EFHLBADV",     # FHLB advances (some banks)
        "OTHBFHLB",     # FHLB borrowings (carrying value, more populated)
        "ISECBROK",     # securities sold under brokered arrangements
        "SCHTMRES",     # HTM securities residual
        "ALNSCHTM",     # allowance / HTM
        "DEPLGA",       # large deposit amounts (advanced detail)
    ],
}

def read_quarter_file(path, key_col, fields):
    """Return dict[CERT] -> {field: value} for requested fields."""
    out = {}
    with open(path, encoding="utf-8", errors="replace") as f:
        rdr = csv.reader(f)
        header = [h.strip().strip('"') for h in next(rdr)]
        idx = {h: i for i, h in enumerate(header)}
        if key_col not in idx:
            raise RuntimeError(f"{path}: no {key_col} column. Have: {header[:10]}")
        ki = idx[key_col]
        keep = [(f, idx[f]) for f in fields if f in idx]
        missing = [f for f in fields if f not in idx]
        if missing:
            print(f"  [warn] missing in {path.name}: {missing}")
        for row in rdr:
            cert = row[ki]
            rec = {}
            for f, i in keep:
                v = row[i] if i < len(row) else ""
                if v == "" or v is None:
                    rec[f] = None
                else:
                    # FTS values have thousand-separator commas in raw CSV.
                    s = v.replace(",", "").strip()
                    try:
                        rec[f] = float(s)
                    except ValueError:
                        rec[f] = v
            out[cert] = rec
    return out


def build_liquidity_panel():
    """Output structure:
       { quarters: ["2024 Q1", ...],
         banks:    {CERT: {"name":..., "state":..., "asset_q":[...], ...}},
         columns:  [list of variable names included] }
    """
    columns = sum(LIQUIDITY_VARS.values(), [])
    panel = {q: {} for q in QUARTERS}

    for q in QUARTERS:
        qdir = RIS_ROOT / f"ris{q}"
        cdi = read_quarter_file(qdir / f"CDI{q}.CSV", "CERT", LIQUIDITY_VARS["CDI"])
        rat = read_quarter_file(qdir / f"RAT{q}.CSV", "CERT", LIQUIDITY_VARS["RAT"])
        fts = read_quarter_file(qdir / f"FTS{q}.CSV", "CERT", LIQUIDITY_VARS["FTS"])
        certs = set(cdi) | set(rat) | set(fts)
        for cert in certs:
            merged = {}
            merged.update(cdi.get(cert, {}))
            merged.update(rat.get(cert, {}))
            merged.update(fts.get(cert, {}))
            panel[q][cert] = merged
        print(f"  {q}: {len(certs):,} banks")

    # Pivot to bank-major: {cert: {col: [q1..q8]}}.  Easier client-side.
    all_certs = set()
    for q in QUARTERS:
        all_certs |= set(panel[q].keys())

    bank_index = {}
    for cert in all_certs:
        rec = {"q": []}
        for col in columns:
            rec[col] = []
        for q in QUARTERS:
            qrow = panel[q].get(cert, {})
            rec["q"].append(QUARTER_LABELS[q])
            for col in columns:
                rec[col].append(qrow.get(col))
        bank_index[cert] = rec

    # Attach human-readable name + state from institutions.csv for join convenience.
    inst_lookup = {}
    with open(ROOT / "institutions.csv", encoding="utf-8", errors="replace") as f:
        rdr = csv.DictReader(f)
        rdr.fieldnames = [h.strip('"') for h in rdr.fieldnames]
        for r in rdr:
            cert = (r.get("CERT") or "").strip('"')
            inst_lookup[cert] = {
                "name":   (r.get("NAME") or "").strip('"'),
                "state":  (r.get("STALP") or "").strip('"'),
                "city":   (r.get("CITY") or "").strip('"'),
                "class":  (r.get("BKCLASS") or "").strip('"'),
                "active": (r.get("ACTIVE") or "").strip('"'),
            }

    enriched = {}
    for cert, rec in bank_index.items():
        info = inst_lookup.get(cert, {})
        enriched[cert] = {**rec, "_meta": info}

    out = {
        "quarters": [QUARTER_LABELS[q] for q in QUARTERS],
        "columns":  columns,
        "banks":    enriched,
    }
    with open(DATA_OUT / "liquidity_panel.json", "w") as f:
        json.dump(out, f)
    print(f"liquidity_panel.json: {len(enriched):,} banks x {len(columns)} cols x 8 quarters")


# ---------------------------------------------------------------------------
def main():
    build_variables()
    build_institutions()
    build_liquidity_panel()
    # quarters.json
    with open(DATA_OUT / "quarters.json", "w") as f:
        json.dump({"quarters": [QUARTER_LABELS[q] for q in QUARTERS]}, f)


if __name__ == "__main__":
    main()
