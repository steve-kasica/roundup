---
layout: workflow
title: "Times & Sunday Times Data Team - Open Data Investigations"
author: "Times Data Team"
publication: "The Times / The Sunday Times"
date: "2016-12-08"
original_url: "http://www.thetimes.co.uk/edition/news/consultants-take-billions-from-foreign-aid-budget-hw7b6bk3f"
github_url: ""
category: "pack"
difficulty: "simple"
data-link: /roundup/workflows/times-data/times-data.zip
nav_exclude: true
---

# Times & Sunday Times Data Team — Open Data Investigations

## Overview

This repository contains open data supporting data-driven investigations published in The Times and The Sunday Times. The primary workflow involves analyzing UK Department for International Development (DFID) foreign aid spending records, categorized by the Times Data Team. Additional datasets cover GP contract data and UK general election results.

## Stories and Data

### Consultants Take Billions From Foreign Aid Budget

- **Published:** [The Times, December 8, 2016](http://www.thetimes.co.uk/edition/news/consultants-take-billions-from-foreign-aid-budget-hw7b6bk3f)
- **Behind the numbers:** [Foreign aid: behind the numbers](http://www.thetimes.co.uk/article/foreign-aid-behind-the-numbers-5nbdjt0tx)
- **Data:** `Dfid spending records and Times categorisation_22_12_2016.xlsx` — DFID spending records with Times editorial categorization.

### GPs Award £2.4bn Deals to Their Own Companies

- **Published:** [The Times, November 11, 2015](http://www.thetimes.co.uk/tto/health/news/article4610741.ece)
- **Data:** [Clinical Commissioning Groups contracts and register of interests (Google Sheets)](https://docs.google.com/spreadsheets/d/17upfkHX0IoOPvas8BzjSFkSE06x-Scb4NxuHYGeafTY/view)

### Analysis: How the Conservatives Won (2015 General Election)

- **Published:** [Times Red Box, May 8, 2015](http://www.thetimes.co.uk/redbox/topic/the-result/election-2015-why-they-won)
- **Methodology:** [The election explained by the Times Data Team (Medium)](https://medium.com/digital-times/the-election-explained-by-the-times-data-team-482d3ab95f5c)
- **Data:** `general-election-2015-classification-tree/` directory.

### Sunday Times Panama Data

- **Data:** `sunday_times_panama_data/` directory and `sunday_times_panama_data.zip`.

## Workflow Steps

### Pre-processing

1. Open `Dfid spending records and Times categorisation_22_12_2016.xlsx` and export the relevant sheet as a CSV.

### Roundup Steps

1. Import the DFID spending CSV into Roundup.
2. Use _pack_ operations to join spending records with any relevant lookup or categorization tables.
3. Export the joined result for downstream analysis and reporting.
