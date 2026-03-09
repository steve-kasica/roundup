---
layout: workflow
title: "NPR - The Promise and Peril of School Vouchers"
author: ""
publication: "NPR"
date: "2017-05-12"
original_url: "http://www.npr.org/sections/ed/2017/05/12/520111511/the-promise-and-peril-of-school-vouchers"
github_url: ""
category: "pack"
difficulty: "simple"
data-link: /roundup/workflows/school-choice/school-choice.zip
nav_exclude: true
---

# The Promise and Peril of School Vouchers

## Overview

This workflow analyzes Indiana school choice (voucher) data, joining tables of voucher awards and dollar amounts per school to support data analysis for NPR Ed's May 12, 2017 story ["The Promise And Peril Of School Vouchers"](http://www.npr.org/sections/ed/2017/05/12/520111511/the-promise-and-peril-of-school-vouchers).

## Source

- **Publication:** NPR
- **Published:** May 12, 2017
- **Original Article URL:** http://www.npr.org/sections/ed/2017/05/12/520111511/the-promise-and-peril-of-school-vouchers

## Data Sources

Data comes from Indiana Choice Scholarship program annual reports and the Indiana Department of Education Compass:

- `awards_by_school_16_clean.csv` — number of vouchers awarded to each school in 2016.
- `amount_by_school_16_clean.csv` — total dollar amount of vouchers awarded to each school in 2016.

Reference data sources:

- [2014 Choice Scholarship Program Annual Report](http://indianapublicmedia.org/stateimpact/files/2014/01/Choice-Scholarship-Program-Annual-Report-012714.pdf)
- [2016 Choice Scholarship Program Annual Report](http://www.doe.in.gov/sites/default/files/news/2015-2016-choice-scholarship-program-report-final-april2016.pdf)
- [2017 Choice Scholarship Program Annual Report](http://www.doe.in.gov/sites/default/files/choice/2016-2017-choice-scholarship-program-report-feb24-final.pdf)
- [Indiana Department of Education Compass](https://compass.doe.in.gov/dashboard/overview.aspx)

## Workflow Steps

### Pre-processing

No pre-processing is required. The cleaned CSV files can be imported directly into Roundup.

### Roundup Steps

1. Load `awards_by_school_16_clean.csv` and `amount_by_school_16_clean.csv` into Roundup.
2. Create a _pack_ operation joining the two tables on `School No` (from `awards_by_school_16_clean.csv`) and `School No.` (from `amount_by_school_16_clean.csv`) using equality matching.
3. Inspect the result — the set of unique values in both join key columns is equal, so an inner join and outer join produce the same result.
4. Export the combined table as `awards_and_amount_by_school_16.csv` for further visualization and analysis.
