---
layout: workflow
title: "Center for Public Integrity - Injustice at Work: Employment Discrimination Analysis"
author: "Joe Yerardi"
publication: "Center for Public Integrity"
date: "2019-02-28"
original_url: "https://publicintegrity.org/workers-rights/workplace-inequities/injustice-at-work/workplace-discrimination-cases/"
github_url: ""
category: "stack"
difficulty: "moderate"
data-link: /roundup/workflows/employment-discrimination/employment-discrimination.zip
nav_exclude: true
---

# Injustice at Work: Employment Discrimination Analysis

## Overview

This workflow analyzes employment discrimination cases filed with the federal Equal Employment Opportunity Commission (EEOC) and state and local fair employment practices agencies, covering fiscal years 2010–2017. The analysis supported the ["Injustice at Work"](https://publicintegrity.org/topics/workers-rights/workplace-inequities/injustice-at-work/) project, with its first story published February 28, 2019 by the Center for Public Integrity in partnership with [Vox](https://www.vox.com/policy-and-politics/2019/2/28/18241973/workplace-discrimination-cpi-investigation-eeoc).

## Author & Source

- **Author:** Joe Yerardi
- **Publication:** Center for Public Integrity
- **Published:** February 28, 2019
- **Original Article URL:** https://publicintegrity.org/workers-rights/workplace-inequities/injustice-at-work/workplace-discrimination-cases/

## Data Sources

- `data/complaints_10.txt` — tab-delimited discrimination charges for fiscal year 2010, from the EEOC.
- `data/complaints_11_17.txt` — tab-delimited discrimination charges for fiscal years 2011–2017, from the EEOC.
- `data/cases_by_basis.csv` — outcomes by specific discrimination basis (e.g., Race-Black/African-American).
- `data/cases_by_grouped_basis.csv` — outcomes by grouped discrimination basis (e.g., Race).
- `data/cases_by_basis_and_closure_action.csv` — outcomes by basis and closure action.
- `data/cases_by_year.csv` — outcomes by year.
- `data/basis_grouped_basis_crosswalk.csv` — mapping between specific and grouped bases.

## Workflow Steps

### Pre-processing

The `process_eeoc.sh` bash script concatenates annual discrimination charge data for fiscal years 2011–2017. Individual year files (e.g. `complaints_10.tsv` through `complaints_17.tsv`) are extracted by filtering `complaints_11_17.txt`.

### Roundup Steps

1. Import `complaints_10.tsv` through `complaints_17.tsv` into Roundup (one file per year).
2. Create a _stack_ operation combining `complaints_10.tsv` and `complaints_11.tsv`, aligning columns across the two schemas.
3. Add the remaining years (12–17) to the stack; their schemas conform to the 2011 schema.
4. Materialize the stacked table and export.

### Post-Roundup Steps

The stacked, unified complaints dataset is analyzed in the `employment-discrimination.ipynb` Jupyter notebook to produce summary statistics and the outputs in `data/cases_by_*.csv`.
