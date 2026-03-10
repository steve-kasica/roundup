---
layout: workflow
title: "The Oregonian - Long-Term Care Complaints Database"
author: "Fedor Zarkhin"
publication: "The Oregonian / OregonLive"
date: "2017-04-21"
original_url: "https://www.oregonlive.com/senior-care"
github_url: "https://github.com/TheOregonian/long-term-care-db"
category: "hybrid"
difficulty: "complex"
data-link: /roundup/workflows/long-term-care-db/long-term-care-db.zip
nav_exclude: true
---

# Long-Term Care Complaints Database

## Overview

This workflow processes Oregon long-term care facility complaint records to reveal that state officials excluded nearly 8,000 substantiated complaints from the state's public website. The analysis supported ["Kept in the Dark"](https://www.oregonlive.com/senior-care), published online by The Oregonian/OregonLive on April 21, 2017 (print: April 23).

This workflow is notable for combining both stacking and packing operations, including an exotic left anti-join to remove 52 records mislabelled as unsubstantiated — a capability that enables novice database users to perform sophisticated join types.

## Data Sources

- `nf-complaints.csv`, `alf-complaints.csv`, `rcf-complaints.csv` — complaint records for nursing facilities, assisted living facilities, and residential care facilities respectively, exported from state records.
- `oregonian-abuse-records-2016.csv` — five-year abuse records from a 2016 state data request.
- `52-mislabelled-as-unsubstantiated.csv` — 52 records incorrectly labelled as unsubstantiated.
- `olro_outcome_codes.csv` — OLRO outcome code lookup table.
- `data/raw/APD_FacilityRecords.csv` — facility metadata.
- `data/scraped/scraped_complaints_3_25.csv` — scraped complaint data.

## Workflow Steps

### Pre-processing

1. Open `Oregonian Abuse records 5 years May 2016.xlsx` in Excel, remove the top three metadata rows, and save as `oregonian-abuse-records-2016.csv`.
2. For each sheet (`NF Complaints`, `ALF Complaints`, `RCF Complaints`) in `Copy of Oregonian Data Request Facility Abuse Records April 2016.xlsx`, remove the blank second row and export as `nf-complaints.csv`, `alf-complaints.csv`, and `rcf-complaints.csv`.
3. Open `52 mislabelled as unsubstantiated.xlsx`, add a header `abuse_number`, and export as `52-mislabelled-as-unsubstantiated.csv`.
4. Open `data/raw/OLRO Outcome Codes.xlsx`, remove the first three metadata rows, and save as `olro_outcome_codes.csv`.

### Roundup Steps

1. Import `nf-complaints.csv`, `alf-complaints.csv`, and `rcf-complaints.csv`.
2. Create a _stack_ operation combining the three tables into `ten_year_complaints`. (Roundup handles the `Abuse_CbcAbuse`/`CbcAbuse` column name mismatch automatically.)
3. Keep only the columns: `Abuse_Number`, `Facility ID`, `Incident Date`, `Fac Type`, `Investigation Results`, `FacilityInvestResultsAbuse`, `FacilityInvestResultsRule`.
4. Import `52-mislabelled-as-unsubstantiated.csv`.
5. Create a _pack_ operation between `52-mislabelled-as-unsubstantiated` and `ten_year_complaints` on `Abuse_Number`, configured as a **left anti-join** to remove the 52 mislabelled records.
6. Materialize as `cleaned_complaints`.
7. Import `oregonian-abuse-records-2016.csv`.
8. Create a _stack_ combining `oregonian-abuse-records-2016` and `cleaned_complaints`.
   - In `oregonian-abuse-records-2016`: swap columns at indices 11 and 16, delete columns at indices 12–16, add a `source` column with value `2`.
   - In `cleaned_complaints`: add a `source` column with value `1`.
9. Materialize as `five_year_ready`.
10. Import `scraped_complaints_3_25.csv` and create a _pack_ with `five_year_ready` on `Abuse_Number` (left outer join). Rename to `merged`.
11. Materialize `merged`.
12. Import `olro_outcome_codes.csv`, remove `column3`, and create a _pack_ joining on `Outcome Code` / `Code` (left outer join). Rename to `merged2`.
13. Import `APD_FacilityRecords.csv`, remove unneeded columns (`FACID`, `Facility Address`, `Other Services`, `Owner`).
14. Create a _pack_ joining `merged2` and `APD_FacilityRecords` on `Facility ID` (left outer join). Rename to `merged_com_fac`.
15. Export the final table.
