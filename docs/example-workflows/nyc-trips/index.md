---
layout: workflow
title: "NYC Rideshare Trips 2016 - Stack Analysis"
author: ""
publication: ""
date: ""
original_url: ""
github_url: ""
category: "stack"
difficulty: "moderate"
data-link: /roundup/workflows/nyc-trips/nyc-trips.zip
nav_exclude: true
---

# NYC Rideshare Trips 2016

## Overview

This workflow combines 2016 rideshare trip data from Gett, Lyft, and Uber into a unified monthly dataset for New York City, stacking the three carrier tables together for comparative analysis. The workflow also illustrates a known Roundup limitation: column names that are SQL reserved words (e.g., `Number`, `Minutes`) and the need for external aggregation to standardize differing data granularities before import.

## Data Sources

- `Gett_Trips_NYC_2016.csv` — daily Gett trip data for NYC in 2016 (10 columns × 110 rows).
- `Lyft_Trips_NYC_2016.csv` — daily Lyft trip data for NYC in 2016.
- `Uber_Trips_NYC_2016.csv` — daily Uber trip data for NYC in 2016 (10 columns × 2,619 rows).
- `data_reports_monthly_indicators_yellow (3).csv` — Yellow Cab data, aggregated by month.

Pre-aggregated monthly summaries (produced before Roundup):

- `gett_monthly.csv`
- `lyft_monthly.csv`
- `uber_monthly.csv`

## Known Limitations

- The Yellow Cab data is aggregated by month while the Gett, Lyft, and Uber data is by day, so aggregation must be performed externally before Roundup can combine them.
- Roundup does not currently support date column types or single-table aggregation, so pre-aggregation is required.
- Some column names are SQL reserved words (e.g., `Number`, `Minutes`), which is documented as an edge case for testing.

## Workflow Steps

### Pre-processing

1. Using an external tool (e.g., R, Excel, or Python), aggregate the daily trip data in `Gett_Trips_NYC_2016.csv`, `Lyft_Trips_NYC_2016.csv`, and `Uber_Trips_NYC_2016.csv` into monthly totals, producing `gett_monthly.csv`, `lyft_monthly.csv`, and `uber_monthly.csv`.

### Roundup Steps

1. Import `gett_monthly.csv`, `lyft_monthly.csv`, `uber_monthly.csv`, and `data_reports_monthly_indicators_yellow (3).csv` into Roundup.
2. In each of the Gett, Lyft, and Uber tables, add a `source` column containing the carrier name as a constant value (e.g., `Gett`, `Lyft`, `Uber`).
3. In each of the Gett, Lyft, and Uber tables, rename the trips count column to `trips`.
4. Create a _stack_ operation combining the Gett, Lyft, and Uber monthly tables.
5. Export the stacked result for downstream analysis in `analyze.R`.
