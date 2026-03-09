---
layout: workflow
title: "Los Angeles Times - California H-2A Temporary Agricultural Worker Visas Analysis"
author: "Ben Welsh"
publication: "Los Angeles Times"
date: "2017-05-25"
original_url: "http://www.latimes.com/projects/la-fi-farm-labor-guestworkers/"
github_url: "https://github.com/datadesk/california-h2a-visas-analysis"
category: "stack"
difficulty: "simple"
data-link: /roundup/workflows/california-h2a-visas-analysis/california-h2a-visas-analysis.zip
table-count: 9
nav_exclude: true
---

# California H-2A Temporary Agricultural Worker Visas Analysis

## Overview

This workflow analyzes data on temporary H-2A agricultural worker visas granted by the U.S. Department of Labor. The analysis supported the May 25, 2017 Los Angeles Times story ["To keep crops from rotting in the field, farmers say they need Trump to let in more temporary workers"](http://www.latimes.com/projects/la-fi-farm-labor-guestworkers/).

## Data Sources

Data comes from the U.S. Department of Labor's H-2A program records, provided as large XLSX files. Each file contains data for a single year, and the workflow stacks data from 10 years (2008-2017) to analyze trends over time. However, XLSX file for 2013 is corrupt and cannot be included in the workflow, so the analysis is based on 9 years of data.

## Workflow Steps

### Pre-processing

The original XLSX source files are too large to upload directly into Roundup, so the following pre-processing steps are necessary to trim them down:

1. Open the large XLSX source files from 2008 to 2017, e.g. `2008.xlsx`, and remove unnecessary columns to reduce file size below the 100 MB upload limit.
2. Save the trimmed files as `.csv` files with the same name, e.g. `2008.csv`.

### Roundup Steps

This is a stack-only workflow, and while the user can choose to stack all the pre-processed CSVs together in a single stack operation, the workflow steps described here create a composite table of multiple stack operations. There is significant schema drift across the source files, so stacking them in smaller batches allows for easier inspection and handling of schema differences.

1. Import the `.csv` files from 2008-2017 into Roundup.
2. Delete columns across tables that are not relevant to the analysis, such as those related to employer contact information. While the column removal in pre-processing reduces the file sizes, this form of table trimming makes schema alignment easier. Roundup can also be used to trim tables, although conceptually this is a precursory step.
   ![delete columns](img/delete-columns.png)

   Removing the following columns by name reduces the total number of columns in the workflow from 339 to 94 (decreasing the number of columns by approximately 72%):
   - `AGENT_*` (e.g. `AGENT_CITY`, `AGENT_STATE`, etc.)
   - `APPLICATION_TYPE`
   - `BASIC_*` (e.g. `BASIC_PAY_RATE_FROM`, `BASIC_PAY_RATE_TO`, etc.)
   - `CASE_RECEIVED_DATE`
   - `CERTIFICATION_END_DATE`
   - `DECISION_DATE`
   - `EMPLOYER_*` (excluding `EMPLOYER_NAME`)
   - `EMP_*` (e.g. `EMP_EXPERIENCE_REQD`)
   - `JOB_*` (excluding `JOB_TITLE`)
   - `L*` (e.g. `LAWFIRM_NAME`)
   - `M*` (e.g. `MAJOR`)
   - `NA*` (e.g. `NAICS_CODE`,)
   - `NBR_WORKERS_REQUESTED`
   - `O*` (e.g. `ORGANIZTION_FLAG`)
   - `REQUESTED_*` (e.g. `REQUESTED_START_DATE_OF_NEED`)
   - `S*` (e.g. `SOC_CODE`)
   - `T*` (e.g. `TRAINING_REQ`)
   - `V*` (e.g. `VISA_CLASS`)

3. _Stack_ tables `2017` and `2016` into a single stack operation.
   ![alt text](img/first-stack.png)
4. Rearrange and delete columns until the schemas of the two tables match, including the following columns only:
   - `CASE_NUMBER`
   - `CASE_STATUS`
   - `NBR_WORKERS_CERTIFIED`
   - `EMPLOYER_NAME`
   - `WORKSITE_CITY`
   - `WORKSITE_STATE`
   - `PRIMARY_CROP`
   - `JOB_TITLE`
   - `CERTIFICATION_BEGIN_DATE`
5. Materialize the first stack operation and inspect results.
6. Stack tables `2015` and `2014` into a second stack operation, and repeat steps 4 and 5 to match the schema of the first stack.
7. Repeat the stacking process for the remaining tables, creating a total of 5 stack operations:
   - Stack `2017` and `2016`
   - Stack `2015` and `2014`
   - Stack `2012` and `2011`
   - Stack `2010` and `2009`
   - Use table `2008` as is, since it has the same schema as the other tables after column deletion
