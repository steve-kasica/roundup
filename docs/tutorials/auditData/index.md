---
layout: workflow
title: "ProPublica - IRS Audit Rates by County"
author: "Hannah Fresques"
publication: "ProPublica"
date: "2019-04-01"
original_url: "https://projects.propublica.org/graphics/eitc-audit"
github_url: "https://github.com/propublica/auditData"
category: "hybrid"
difficulty: "moderate"
data-link: ./auditData.zip
nav_exclude: true
---

# IRS Audit Rates by County

## Overview

This workflow processes data backing ProPublica's April 1, 2019 investigation ["Where in The U.S. Are You Most Likely to Be Audited by the IRS?"](https://projects.propublica.org/graphics/eitc-audit). The analysis maps the distribution of IRS audits across U.S. counties, revealing that the audit rate in each county largely reflects how many taxpayers claimed the Earned Income Tax Credit (EITC).

## Data Sources

- `Bloomquist - Regional Bias in IRS Audit Selection Data.xlsx` — estimated number of tax exams (audits) per county for tax years 2012–15, calculated by Kim M. Bloomquist using audit coverage rates from the annual IRS Data Book.
- `County-2012.xlsx`, `County-2013.xlsx`, `County-2014.xlsx`, `County-2015.xlsx` — number of tax filings per county for each year, downloaded from the [IRS website](https://www.irs.gov/statistics/soi-tax-stats-county-data).

## Workflow Steps

### Pre-processing

1. Open each of the four county filings spreadsheets (`County-2012.xlsx` through `County-2015.xlsx`) in Excel. These files have nested headers; flatten them so that all column names appear in a single header row.
   ![nested headers](img/nested_headers.png)
2. In each spreadsheet, create a combined FIPS code column by concatenating the state FIPS code with the county FIPS code to create a unique county identifier.
3. Export each sheet as a CSV.

### Roundup Steps

1. Import the four county filings CSV files and the Bloomquist audit data into Roundup.
2. Create a _stack_ operation combining the four county filing tables.
3. Trim the stack operation to retain only the first five columns (out of 256) and materialize.
4. Create a _pack_ operation joining the stacked county filings to the Bloomquist audit data on the combined FIPS code column, using a left join.
