# FDIC Insight Suite — Product Roadmap

A reusable analytics platform built on top of the FDIC bulk data (Institutions, Locations, RIS Call Reports). The aim is a portfolio of regulator-grade prototypes that share one semantic layer, one ingestion pipeline, and one composite-scoring engine.

---

## Build status

| # | Prototype | Status | File |
|---|-----------|--------|------|
| 10 | Semantic Layer (NL → filter compiler) | **Live** | `prototypes/semantic_layer.html` |
| 17 | Liquidity & Run-Risk Monitor | **Live** | `prototypes/liquidity_monitor.html` |
| 03 | Concentration & Funding X-Ray | **Live** | `prototypes/concentration_xray.html` |

Three prototypes shipped against eight quarters (2024 Q1 → 2025 Q4) of joined Call Report data covering 4,415 active institutions and 4,651 unique reporters.

---

## The 17-app catalog

Five capability families. Each family reuses the same data layer; each app adds either a new view, a new score, or a new workflow on top.

### Family A · Supervisory monitoring

The "watchlist" family — composite scores, percentile ranks, threshold tripwires.

**App 17 — Liquidity & Run-Risk Monitor** *(live)*
Six-component composite percentile-rank against the full population. Adjustable supervisory weights, 5-tier watchlist, per-bank drill with eight-quarter trend charts. SVB-shaped indicator set: uninsured deposits, noncore funding, L/D, deposit volatility, equity buffer, FHLB reliance.

**App 03 — Concentration & Funding X-Ray** *(live)*
Per-bank fingerprint across 7 axes (uninsured · large-depositor · HTM · noncore · FHLB · brokered · asset-quality stress). Heatmap watchlist plus radar drill-down with supervisory-threshold bars. Reads the same `liquidity_panel.json` — no rebuild required.

**App 21 — Early Warning (CAMELS-Lite)**
Unsupervised z-score of every reporter against a dynamic peer cohort (state × asset bucket × charter class). Surfaces banks whose deviation widens quarter-on-quarter even when absolute values are still inside thresholds. Becomes supervised once the historical Failures bulk file is added — labeled positives drive a logistic / GBM that ranks current panel by 1-year failure probability.

**App 09 — Tripwire Builder**
Lets a supervisor build named tripwires ("uninsured > 50% AND HTM > 25%"), saves them as a versioned object, and runs them across the panel each quarter. Output is a named cohort that flows into App 17 / App 03 drill-downs. Supports back-testing on the 8-quarter window.

### Family B · Concentration & exposure

The "stack vs the threshold" family — CRE/ADC/HTM/sector exposures.

**App 04 — CRE / ADC Examiner View** *(needs CDI rebuild)*
Adds the CDI concentration ratios (CRECONT, ADCCONT) to the panel and stacks every reporter against the FFIEC supervisory thresholds (300% CRE, 100% ADC). Time-series view of how many banks crossed in each direction over 8 quarters, plus per-bank breach-history badges in the X-Ray detail panel.

**App 05 — Sector Loan Concentration**
Decomposes loan book by major loan-mix category (1-4 fam, multifamily, C&I, agriculture, consumer, MMDC) using existing Call Report variables. Useful for "find me every bank with >40% ag loans in <state>" cohorts.

**App 12 — Securities-Portfolio Stress**
Stack HTM unrealized losses (SCHTMRES vs SCHTMVL or implied repricing) against tier-1 capital. Same visual pattern as App 03 but focused entirely on the AFS+HTM book — a direct SVB-style surfacing tool.

### Family C · Geography & branch network

**App 11 — Branch Footprint Explorer**
Map view of the Locations file. Filter by charter, asset bucket, state, MSA. Layer in deposits-by-branch from SOD (separate FDIC bulk pull). Useful for branch-rationalization analysis and de novo gap-finding.

**App 13 — Deposit-Geography Heatmap**
County-level deposit market-share rollup. Surfaces counties where one bank holds >40% share (CFPB / antitrust review angle). Drill down to the underlying bank list.

**App 19 — De Novo Tracker**
New-charter monitoring. Filter institutions where `ESTYMD` is within last 8 quarters. Track first-8-quarter growth and capital trajectory, compare against the historical de-novo cohort.

### Family D · Industry intelligence

**App 06 — QBP++ Dashboard**
Replicates the FDIC Quarterly Banking Profile aggregations (industry · state · class · asset bucket) but with full drill-through to underlying banks and the same percentile engine as App 17 surfacing outlier cohorts (e.g., "community banks in Texas this quarter — top decile L/D").

**App 14 — M&A Intelligence**
Quarterly merger and structure-change feed from the MERG / STRU files. LLM-generated executive summaries of each transaction (acquirer/target snapshot, pro-forma footprint, deposit overlap). Subscribe-to-bank watchlists.

**App 15 — Failure Forensics** *(needs Failures bulk)*
Historical failure case-studies. For every failed bank in the bulk file, pull the 8 quarters before failure and surface which of our composite scores would have flagged it, when, and at what tier. Drives credibility for App 21.

**App 20 — Industry Trend Atlas**
Long-form trend explorer for any variable in the dictionary, plotted national + state + asset-bucket. Layered annotations for rate-cycle moves, regulatory deadlines, major M&A.

### Family E · Per-bank deep-dive & narrative

**App 18 — Bank Profile Explorer**
The "one page per bank" canonical view. Pulls together: identity (Institutions), branches (Locations), 8-quarter ratio history (RAT), key-indicator stack (CDI), peer comparison (App 07 cohort), tripwire status (App 09), composite scores (App 17 + App 03), M&A history (App 14). Built on the semantic layer for any-variable lookup.

**App 16 — Examiner Report Generator**
Turns the Bank Profile (App 18) into a downloadable supervisory pre-exam packet: one PDF/.docx with executive summary, peer comparison, ratio trends, concentration warnings, and an LLM narrative cross-checked against the underlying numbers.

**App 22 — Public Disclosure Drafter**
Same engine as App 16 but produces shareholder/board-ready deck (.pptx) — bank-side use case.

### Foundation

**App 10 — Semantic Layer** *(live)*
The 2,635-variable unified dictionary + NL-to-filter compiler. Every other app sits on top of this. Future work: add LLM-assisted variable-meaning disambiguation, variable-lineage view (which schema · which file · which RIS field code), and saved-query sharing.

**Layer 0 — Schema-aware ingestion**
One-command refresh that pulls the latest RIS quarterly drop, diffs the dictionary against last quarter (added/retired/renamed variables), and republishes `liquidity_panel.json` + `variables.json` with a versioned manifest. Without this, every quarter is a manual rebuild.

**App 07 — Peer Cohort Builder**
Standalone tool to build/save/share named peer cohorts (asset × geography × charter × custom filter). Cohorts become reusable inputs to App 17 / App 18 / App 21.

---

## Suggested build order

The order below maximizes shared infrastructure and visible momentum.

1. **Now:** App 04 (CRE/ADC) — small CDI rebuild, slots straight into the X-Ray UI we just shipped.
2. **Next:** App 18 (Bank Profile) — the "every demo points here" page; pulls together everything we've built. Plus App 07 (Peer Cohorts) which App 18 needs.
3. **Then:** App 14 (M&A Intelligence) — fastest "wow" feature for an exec audience; needs only MERG/STRU + an LLM call.
4. **Foundation milestone:** Layer 0 (ingestion automation). Should land before we promise quarterly refresh to anyone external.
5. **Extended:** App 16 (Examiner Report Generator) — leverages App 18 plus a Word/PDF skill. This is the obvious commercial-pilot deliverable.
6. **Long lead:** App 21 (Early Warning supervised model) once Failures bulk is loaded and labeled.

---

## Cross-cutting infrastructure to invest in

These aren't apps but they multiply the value of every app above.

- **Versioned panel manifests** so every screenshot and report can be traced back to a specific data vintage.
- **Shared composite engine** (currently inline in each prototype) factored into one JS module — guarantees App 17 and App 03 stay calibrated against the same population baseline.
- **LLM call adapter** (single configurable endpoint — local Llama, Claude API, or Bedrock) for the narrative apps (#14, #16, #22). Should default off in the local prototype and only turn on with explicit user/key.
- **Auth + audit trail layer** before any external pilot — supervisors need to see who ran which query against which vintage.
- **Export pipeline** — one shared "to .xlsx", "to .pdf", "to .docx" path for every drill-down, so report generation is consistent across apps.

---

## Federal-pilot readiness checklist

Items that need to be addressed before this is suitable for an FDIC pilot beyond the local-machine demo:

- [ ] FedRAMP-aligned hosting decision (IL2/IL4 path)
- [ ] SSO + RBAC (likely via PIV/CAC)
- [ ] Audit logging on every query
- [ ] Data-vintage manifest exposed in every export
- [ ] Source-of-truth attribution on every chart back to RIS field code
- [ ] Section 508 compliance pass on the UI
- [ ] Penetration-test of the deployed surface
