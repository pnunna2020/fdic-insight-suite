# FDIC Insight Suite — Prototypes

A reusable AI-product framework for federal banking data, built on top of the FDIC BankFind bulk-download corpus.
This repo contains **seven** working prototypes: the semantic layer (Layer 1) plus six Layer-2 applications, all sharing one preprocessed data layer derived from the FDIC Call Report bulk download (CDI · RAT · FTS · Institutions · Locations).

| # | App | What it does |
|---|-----|--------------|
| 10 | [Semantic Layer](prototypes/semantic_layer.html) | Natural-language query over the 2,635-variable unified dictionary |
| 17 | [Liquidity &amp; Run-Risk Monitor](prototypes/liquidity_monitor.html) | 6-component composite run-risk score, adjustable weights |
| 3  | [Concentration &amp; Funding X-Ray](prototypes/concentration_xray.html) | 7-axis per-bank risk fingerprint + heatmap + radar drill-down |
| 4  | [CRE / ADC Examiner](prototypes/cre_examiner.html) | Supervisory 300%/100% Tier-1 concentration review (LNRERT1R, LNCONT1R) |
| 18 | [Bank Profile Explorer](prototypes/bank_profile.html) | Central single-bank hub with cross-app deep-links |
| 7  | [Peer Cohort Builder](prototypes/peer_cohort.html) | Dynamic peer groups + percentile ranking on 10 ratios |
| 14 | [M&amp;A Intelligence](prototypes/ma_intelligence.html) | Target / acquirer composite scoring + same-state pairing |

## Repo layout

```
FDIC-Prototype-Data/
├── README.md                       # this file
├── DATA-NEEDS.md                   # bulk files still needed from FDIC portal
├── institutions.csv                # 27,832 banks (current snapshot, 140 cols)
├── institutions_definitions.csv    # institution variable dictionary
├── locations.csv                   # 78,353 branches (geocoded)
├── locations_definitions.csv       # branch variable dictionary
├── events_definitions.csv          # failures schema (data not yet pulled)
├── sod_variables_definitions.csv   # Summary of Deposits schema (data not yet pulled)
├── All Financial Reports.xlsx      # FDIC API URL catalogue + 2,334-var RIS dictionary
├── ris2403-ris2512-csv.zip         # RIS Call Report — 8 quarters (2024 Q1 → 2025 Q4)
├── ris2403-ris2512-sas.zip         # same data in SAS format
├── Research Report.pdf             # background research catalog
└── prototypes/
    ├── index.html                  # launcher
    ├── semantic_layer.html         # App #10 — NL → variable filter
    ├── liquidity_monitor.html      # App #17 — Liquidity & Run-Risk Monitor
    ├── build_data.py               # preprocessor (RIS .zip → compact JSON)
    └── data/
        ├── variables.json          # unified 2,635-variable dictionary
        ├── institutions.json       # slim institutions index
        ├── liquidity_panel.json    # 4,651 banks × 26 cols × 8 quarters
        └── quarters.json           # quarter labels
```

## Running the prototypes

The two HTML apps are pure client-side and load the JSON files in `prototypes/data/`.
Most browsers block `fetch()` against `file://` URLs, so serve them over HTTP:

```bash
cd FDIC-Prototype-Data/prototypes
python3 -m http.server 8000
# then open http://localhost:8000/
```

You can rebuild the JSON layer at any time after dropping new RIS quarters in:

```bash
# Extract any new RIS .zip into /tmp/ris_all/  (or update the path in build_data.py)
unzip ../ris2403-ris2512-csv.zip -d /tmp/ris_all
python3 build_data.py
```

## What's in each prototype

### App #10 — Semantic Layer (semantic_layer.html)
- Loads the unified 2,635-variable dictionary (RIS, Institutions, Locations, SOD schema, Failures schema).
- Faceted browsing by **domain** (Capital, Liquidity, Asset Quality, Earnings, Concentration, …) and **source**.
- Plain-text search across name, label, definition.
- Natural-language query box with a **deterministic, transparent compiler** that maps phrases like
  "community banks in Texas with assets over 1 billion and loans/deposits above 90%" to structured filters.
- "Interpreted as:" panel shows the parsed filter chain so users can see what they got.
- Runs the filter against the 27,832-bank universe and returns up to 300 ranked results.

> The deterministic parser is the **scaffolding**; the production version slots an LLM into the same place,
> using `data/variables.json` as the system-prompt dictionary and few-shot examples from the FDIC's
> "Common Financial Reports" workbook (`All Financial Reports.xlsx`).

### App #17 — Liquidity & Run-Risk Monitor (liquidity_monitor.html)
Computes a composite per-bank run-risk score across all 8 quarters using:

| Component                | Variable(s)         | Direction |
|--------------------------|---------------------|-----------|
| Uninsured deposit ratio  | (DEP − DEPINS) / DEP | higher = risk |
| Noncore funding / assets | NCOREQ1             | higher = risk |
| Loans / deposits         | LNLSDEPR            | higher = risk |
| Deposit volatility (8q)  | stddev(QoQ% in DEP) | higher = risk |
| Equity / assets          | EQV                 | lower = risk |
| FHLB borrowings / assets | OTHBFHLB / ASSET    | higher = risk |

Each component is percentile-ranked across the universe for the selected quarter. Weights are user-adjustable
(defaults: 35/20/15/15/10/5). Composite score 0–100 → tier 1 (green) through tier 5 (red watchlist).

Drill-down panel shows:
- Score breakdown and plain-English drivers
- 8-quarter deposit & insured-deposit trend chart
- 8-quarter ratio trend chart (uninsured %, L/D, equity %)
- Full ratio detail vs. supervisory thresholds

## Data status & gaps

The `prototypes/data/` files are reproducible from the raw bulk downloads in this folder.
Several adjacent FDIC bulk files would unlock additional apps — see `DATA-NEEDS.md`.

## Architecture (the bigger picture)

- **Layer 1 (platform, reusable):** semantic layer over the variable dictionary, entity index across CERT/RSSD/LEI,
  peer-grouping engine, evaluation harness.
- **Layer 2 (apps):** the 12 + 18 candidate applications surveyed in the original research report.
- **Layer 3 (delivery):** chat, reports, dashboards, API, MCP server.

The two prototypes here demonstrate Layer 1 (semantic layer) and one Layer 2 app (Liquidity Monitor).
The same `data/liquidity_panel.json` and `data/institutions.json` will power Concentration X-Ray, QBP++, and
Bank Profile Explorer with no additional preprocessing.
