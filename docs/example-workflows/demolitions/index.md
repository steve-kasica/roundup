---
layout: workflow
title: "Austin American-Statesman - Residential Demolitions in Austin"
author: "Phil Jankowski"
publication: "Austin American-Statesman"
date: "2018-10-12"
original_url: "https://www.statesman.com/news/20181012/in-austin-home-demolitions-soar-along-with-economic-fortunes"
github_url: ""
category: "stack"
difficulty: "simple"
data-link: /roundup/workflows/demolitions/demolitions.zip
nav_exclude: true
---

# Residential Demolitions in Austin

## Overview

This workflow processes Austin construction permit data to analyze trends in residential demolitions, combining records for full and partial demolitions into a single dataset. The analysis supported an October 12, 2018 Austin American-Statesman [article](https://www.statesman.com/news/20181012/in-austin-home-demolitions-soar-along-with-economic-fortunes) by Phil Jankowski about soaring home demolitions alongside Austin's rising economic fortunes.

## Author & Source

- **Author:** Phil Jankowski
- **Publication:** Austin American-Statesman
- **Published:** October 12, 2018
- **Original Article URL:** https://www.statesman.com/news/20181012/in-austin-home-demolitions-soar-along-with-economic-fortunes

## Data Sources

Data comes from the City of Austin's construction permit records, downloaded from the city's open data portal and split into two files:

- `full-downloaded.csv` — permits for complete home demolitions.
- `partials-downloaded.csv` — permits for partial home demolitions.

## Workflow Steps

### Pre-processing

No pre-processing is required. The CSV files can be imported directly into Roundup.

### Roundup Steps

1. Import `full-downloaded.csv` and `partials-downloaded.csv` into Roundup.
2. In the `full-downloaded.csv` table, insert a new column named `demo_type` and populate all rows with the value `full`.
3. In the `partials-downloaded.csv` table, insert a new column named `demo_type` and populate all rows with the value `partial`.
4. Create a _stack_ operation combining the two tables.
5. Export the stacked result as `stacked.csv`.

### Post-Roundup Steps

The stacked data is used in Jupyter notebooks in the `/notebooks/` folder to produce analyses of full demolitions, partial demolitions, and contractors. Key outputs include:

- `data-processed/top_demos_year_zip.csv` — demolitions per year by ZIP code (used for a line chart graphic).
- `data-processed/demos_by_zip.csv` — total demolitions by ZIP code from 2008–2017 (used for a map graphic).
