# Bulk files still needed from the FDIC portal

The two prototypes shipped today work entirely from the data already in this folder.
The following additional bulk downloads from the FDIC BankFind portal would unlock the next four apps without changing the architecture.

Source: <https://banks.data.fdic.gov/bankfind-suite/bulkData/bulkDataDownload>

## Tier 1 — high impact, low effort

| Dataset                 | Why we need it | Unlocks |
|-------------------------|----------------|---------|
| **Failures & Assistance** (event-driven, 1934+) | Labels for the failure-prediction model. Train Early Warning, validate Liquidity Monitor against actual failures. | App #7 — CAMELS-Lite Early Warning · App #9 — Failed-Bank Analog Finder |
| **Summary of Deposits (SOD)** (annual June 30, 1994+) | Branch-level deposit dollars. We have branch counts but not dollars. | App #3 — Deposit Market Share Atlas · App #14 — Banking Desert Atlas |
| **Pre-2024 RIS (CDI/RAT/FTS) historical** | Through-the-cycle baselines. 8 quarters covers recent only. We need 2008–2010 and 2018–2019 minimum. | Backtest of Apps #5, #7, #17 against past stress periods |

## Tier 2 — composable

| Dataset | Source | Unlocks |
|---------|--------|---------|
| HMDA (mortgage-level) | CFPB | Apps #14, #15 — Fair lending, banking desert |
| FFIEC UBPR | FFIEC | Validate Apps #4, #5 against canonical peer ratios |
| Fed NIC structure | FRB | Holding-company rollups for Apps #2, #6 |
| SEC EDGAR (BHC filings) | SEC | Qualitative signal layer for Apps #2, #11 |
| FDIC EDO + OCC + Fed enforcement actions | Three agencies | App #21 — Enforcement Intelligence |
| Census ACS + FEMA NRI | Census, FEMA | Apps #14 (demographics), #18 (climate) |

## How to drop new bulk files into this repo

Place the file in the project root, then re-run the preprocessor:

```bash
cd prototypes
python3 build_data.py
```

The preprocessor will pick up new variables automatically and extend `data/variables.json`.
For new RIS quarters (e.g. `ris2603-ris2606-csv.zip`), update `QUARTERS` and `QUARTER_LABELS`
near the top of `build_data.py`.
