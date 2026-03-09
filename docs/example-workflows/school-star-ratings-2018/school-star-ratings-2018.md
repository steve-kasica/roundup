---
layout: workflow
title: "Baltimore Sun - Maryland Schools Star Ratings Analysis"
author: "Christine Zhang"
publication: "Baltimore Sun"
date: "2018-12-04"
original_url: "https://www.baltimoresun.com/news/maryland/education/k-12/bs-md-star-rating-release-20181203-story.html"
github_url: "https://github.com/baltimore-sun-data/school-star-ratings-2018"
category: "pack"
difficulty: "moderate"
data-link: /roundup/workflows/school-star-ratings-2018/school-star-ratings-2018.zip
nav_exclude: true
---

# Maryland Schools Star Ratings Analysis

## Overview

This workflow joins four tables to analyze Maryland's first-ever public school star ratings, published by the Maryland State Department of Education. The analysis supported a December 4, 2018 Baltimore Sun story ["Maryland releases first star ratings for every public school; 60 percent earn four or five stars out of five"](https://www.baltimoresun.com/news/maryland/education/k-12/bs-md-star-rating-release-20181203-story.html) by Liz Bowie and Talia Richman.

## Author & Source

- **Author:** Christine Zhang
- **Publication:** Baltimore Sun
- **Published:** December 4, 2018
- **Original Article URL:** https://www.baltimoresun.com/news/maryland/education/k-12/bs-md-star-rating-release-20181203-story.html
- **GitHub Repository:** https://github.com/baltimore-sun-data/school-star-ratings-2018

## Data Sources

All source files are in the `input/` directory:

- `accountability_schools_download_file.csv` (81 KB) — school accountability scores and star ratings from the Maryland State Department of Education Report Card.
- `addresses_add.csv` (1 KB) — supplemental address data.
- `EDGE_GEOCODE_PUBLICSCH_1617.csv` (21,113 KB) — geocoded public school locations from the National Center for Education Statistics for 2016–17.
- `School_Directory_2018.csv` (176 KB) — Maryland school directory for 2018.

## Known Limitations

The full join across `scores` and `directory` tables requires matching on both `lea_number` and `school_number` (a composite key). Roundup does not yet support joining on multiple columns simultaneously, which prevents full reproduction of this workflow within Roundup alone.

## Workflow Steps

### Pre-processing

No pre-processing is required. The CSV files can be imported directly into Roundup.

### Roundup Steps

1. Load `accountability_schools_download_file.csv`, `addresses_add.csv`, `EDGE_GEOCODE_PUBLICSCH_1617.csv`, and `School_Directory_2018.csv` into Roundup.
2. Create _pack_ operations to join the tables. Note the multi-column join limitation described above.
3. Export the joined result for downstream analysis in `analysis.ipynb`.

### Post-Roundup Steps

Mapping outputs are produced in `mapping.ipynb`. The complete analysis is available in `analysis.ipynb`.
