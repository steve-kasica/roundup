---
layout: workflow
title: "Baby Name Politics - U.S. Baby Names by State and Year"
author: ""
publication: ""
date: ""
original_url: ""
github_url: ""
category: "stack"
difficulty: "simple"
data-link: /roundup/workflows/babyname_politics/babyname_politics.zip
nav_exclude: true
---

# Baby Name Politics

## Overview

This workflow stacks 51 baby name data tables — one per U.S. state and the District of Columbia — into a single unified dataset of approximately 6.6 million rows. It demonstrates Roundup's scalability and data profiling capabilities when combining a large number of identically-schemed source tables.

## Data Sources

Baby name data comes from the [U.S. Social Security Administration](https://www.ssa.gov/oact/babynames/limits.html), which publishes annual baby name counts by state. Each source file is a `.txt` file for one U.S. state or D.C., containing name, sex, and count per year.

## Workflow Stats

- **Source tables:** 51 (50 states + D.C.)
- **Export row count:** 6,600,640
- **Export column count:** 5
- **Export size:** ~123 MB

## Workflow Steps

### Pre-processing (Optional)

The following pre-processing steps can be performed before loading data into Roundup, but are not required:

- Convert the `.txt` source files to `.csv` format.
- Add column headers to the source files if they are absent.

### Roundup Steps

1. Load all `.txt` files from the `states` directory into Roundup.
2. Create a _stack_ operation combining all 51 tables into a single table (Stack-1).
3. Materialize Stack-1 and inspect results — confirm that row counts and column schemas are consistent across all source tables.
4. Export the materialized result as a CSV.

### Post-Roundup Steps

The exported dataset can be used for downstream analysis relating baby name popularity trends to political and cultural data, as described in `babyname_politics.Rproj`.
