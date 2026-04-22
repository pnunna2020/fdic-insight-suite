# Push the prepared repo to GitHub

I prepared a fully-formed git repo with one initial commit. My sandbox can't reach `api.github.com` or push as you, so the last 30 seconds need to happen from your machine.

You have two artifacts in the workspace folder, either works:

- `FDIC-Prototypes.gitbundle` — single-file git bundle (smaller, recommended)
- `FDIC-Prototypes-repo.tar.gz` — full repo tarball (alternative)

## Easiest path (gitbundle, 4 commands)

```bash
# 1. Create the empty repo on GitHub at https://github.com/pnunna2020/FDIC-Prototypes
#    (web UI: New → name 'FDIC-Prototypes' → leave README/gitignore unchecked → Create)

# 2. Clone the bundle locally:
git clone /path/to/FDIC-Prototypes.gitbundle FDIC-Prototypes
cd FDIC-Prototypes

# 3. Point at the GitHub repo:
git remote remove origin
git remote add origin https://github.com/pnunna2020/FDIC-Prototypes.git

# 4. Push:
git push -u origin main
```

## Alternative path (tarball)

```bash
tar xzf FDIC-Prototypes-repo.tar.gz
cd fdic-prototypes-repo
git push -u origin main      # remote already configured
```

## What's in the repo

```
.gitignore
README.md
DATA-NEEDS.md
events_definitions.csv
institutions_definitions.csv
locations_definitions.csv
sod_variables_definitions.csv
prototypes/
├── build_data.py
├── index.html
├── liquidity_monitor.html
└── semantic_layer.html
```

The large bulk files (`institutions.csv`, `locations.csv`, the RIS .zip, `Research Report.pdf`,
`All Financial Reports.xlsx`) and the derived `prototypes/data/*.json` files are intentionally
**excluded via .gitignore** — they are reproducible from the FDIC portal and would push the
repo well past GitHub's 100 MB soft cap. Anyone cloning re-runs `python3 prototypes/build_data.py`
after dropping the bulk files in.

## If you'd rather I push directly

You can either:
1. Generate a **GitHub Personal Access Token** with `repo` scope and paste it back here — I can push using it.
2. Install the GitHub CLI (`gh`) on your machine and run `gh auth login`, then I can drive `gh` for you.

Either is fine; the four-command path above is usually faster.
