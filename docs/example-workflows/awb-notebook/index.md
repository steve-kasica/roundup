---
layout: workflow
title: "Euros für Ärzte - AWB Drug Payment Reports Analysis"
author: ""
publication: ""
date: ""
original_url: ""
github_url: ""
category: "stack"
difficulty: "simple"
data-link: /roundup/workflows/awb-notebook/awb-notebook.zip
nav_exclude: true
---

# "Euros für Ärzte" — AWB Drug Payment Reports Analysis

## Overview

This workflow analyzes German pharmaceutical payment reports ("Anwendungsbeobachtungen"), stacking annual reports submitted to the Kassenärztliche Bundesvereinigung (KBV) into a single unified table for analysis. The data covers pharmacy payment records from 2009 through 2014, exported from two Excel workbooks.

## Data Sources

Data was exported from two Excel files:

- `AWB KBV Meldungen und Abschlusse 2004 - 2011.xlsx` — annual AWB notification and completion records for 2004–2011.
- `AWB KBV Meldungen und Abschlusse 2012 - 2014.xlsx` — annual AWB notification and completion records for 2012–2014.

The data is analyzed in the `awb_meldungen.ipynb` Jupyter notebook.

## Workflow Steps

### Pre-processing

1. Export individual year sheets (2009–2014) from both Excel files as CSV files named `meldungen-20XX.csv` (e.g. `meldungen-2009.csv`).

### Roundup Steps

1. Import all `meldungen-20*.csv` files into Roundup.
2. Create a _stack_ operation combining all the annual tables.
3. For each source table, add a new column containing the year (e.g. `2009` for `meldungen-2009.csv`).
4. For each source table, add a new column named `row_type` and populate it with the value `update`.
5. Materialize the stack and export the result.
