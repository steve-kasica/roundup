---
layout: workflow
title: "WUFT - Power Access Across Income Levels After Hurricane Irma"
author: "Joan Meiners, Bailey LeFever, Liana Zafran"
publication: "WUFT"
date: "2017-09-01"
original_url: "https://www.wuft.org/news/energy-burden/the-storm/"
github_url: "https://github.com/beecycles/Power_of_Irma"
category: "pack"
difficulty: "moderate"
data-link: /roundup/workflows/Power_of_Irma/Power_of_Irma.zip
nav_exclude: true
---

# Power Access Across Income Levels After Hurricane Irma

## Overview

This workflow analyzes the relationship between property values and power outage durations, housing code violations, and solar energy use across income levels in Gainesville, Florida, in the wake of Hurricane Irma. The data supports a series of stories on energy burden published by WUFT, including analyses by Joan Meiners (power outages), Bailey LeFever (housing code violations), and Liana Zafran (solar energy use).

## Authors & Sources

- **Authors:** Joan Meiners, Bailey LeFever, Liana Zafran
- **Publication:** WUFT
- **Original Article URL:** https://www.wuft.org/news/energy-burden/the-storm/
- **GitHub Repository:** https://github.com/beecycles/Power_of_Irma

## Data Sources

Data comes from public records obtained from Gainesville Regional Utilities (GRU) and the City of Gainesville. Address data were joined to county-assessed property value data provided by Dr. Hal Knowles. Analyses were restricted to postal codes within Gainesville city limits and to properties valued at between $20,000 and $2 million.

- `GRU_power.csv` — GRU power outage records by address.
- `GRU_water.csv` — GRU water service records by address.
- `Liana_Solar.csv` — solar energy usage data by address.
- `Bailey_codeviolations.csv` — housing code violation records by address.
- `value.csv` — county-assessed property values by address.

## Workflow Steps

### Reproducing `liana_code.R` (Solar Energy Analysis)

#### Roundup Steps

1. Import `Liana_Solar.csv` and `value.csv` into Roundup.
2. Create a _pack_ operation merging `Liana_Solar.csv` and `value.csv` on the `address` column.
3. Filter results to a left join, keeping all rows from `Liana_Solar.csv`.
4. Export results.

### Reproducing `EJUF_GRUcode.R` (Power Outage and Water Analysis)

#### Roundup Steps

1. Import `GRU_power.csv`, `GRU_water.csv`, and `value.csv` into Roundup.
2. Create a _pack_ operation joining `GRU_power.csv` and `GRU_water.csv` on the `ADDRESS` column using a left join (keeping all rows from `power`). Name this operation `GRU`.
3. Create a _pack_ operation joining `GRU` and `value.csv` on the `ADDRESS` column using a left join (keeping all rows from `GRU`). Name this operation `combined`.
4. Export results.

### Post-Roundup Steps

Statistical analyses (generalized linear models) were conducted in R, log-transforming both predictor (property values) and response variables to achieve near-normal distributions. Statistical significance was evaluated at p < 0.05.
