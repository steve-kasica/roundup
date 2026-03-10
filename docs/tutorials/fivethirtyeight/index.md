---
layout: workflow
title: "FiveThirtyEight - Infrastructure Jobs as a Measuring Stick for State-Level Spending"
author: ""
publication: "FiveThirtyEight"
date: ""
original_url: "https://fivethirtyeight.com/features/using-infrastructure-jobs-as-a-measuring-stick-for-state-level-spending/"
github_url: ""
category: "pack"
difficulty: "moderate"
data-link: /roundup/workflows/fivethirtyeight/fivethirtyeight.zip
nav_exclude: true
---

# Infrastructure Jobs as a Measuring Stick for State-Level Spending

## Overview

This workflow reproduces the data wrangling behind FiveThirtyEight's story ["Using Infrastructure Jobs as a Measuring Stick For State-Level Spending"](https://fivethirtyeight.com/features/using-infrastructure-jobs-as-a-measuring-stick-for-state-level-spending/). The analysis joins multiple normalized tables from the Bureau of Labor Statistics (BLS) State and Metro Area Employment data — originally structured as a relational database — to produce a combined dataset mapping construction employment by state and industry over time.

## Source

- **Publication:** FiveThirtyEight
- **Original Article URL:** https://fivethirtyeight.com/features/using-infrastructure-jobs-as-a-measuring-stick-for-state-level-spending/

## Data Sources

Data comes from the [Bureau of Labor Statistics (BLS) State and Metro Area Employment (SAE) program](http://download.bls.gov/pub/time.series/sm/):

- `sm.data.62.Construction.Current.tsv` — raw construction employment payroll data by series ID.
- `sm.series.tsv` — series metadata mapping series IDs to state and industry codes.
- `sm.industry.tsv` — industry code lookup table.
- `payroll-states.csv` — state name lookup table.

## Workflow Steps

### Pre-processing

1. Download the data files from BLS:
   - `sm.data.62.Construction.Current` → `sm.data.62.Construction.Current.tsv`
   - `sm.series` → `sm.series.tsv`
   - `sm.area` → `sm.industry.tsv`

### Roundup Steps

1. Upload the four files into Roundup. Rename them for clarity:
   - `sm.data.62.Construction.Current.tsv` → `state pay raw`
   - `sm.series.tsv` → `series raw`
   - `sm.industry.tsv` → `industry raw`
   - `payroll-states.csv` → `state`
2. Create a _pack_ operation joining `series raw` and `state` on the `state_code` column (full outer join).
3. Create a second _pack_ operation joining the result from step 2 with `industry raw` on the `industry_code` column (full outer join).
4. Create a third _pack_ operation joining the result from step 3 with `state pay raw` on the `series_id` column (full outer join).
5. Export the final joined table for downstream analysis in `infrastructure-jobs.R`.
