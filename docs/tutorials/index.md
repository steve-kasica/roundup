---
title: Tutorials
nav_order: 2
layout: default
---

# Tutorials

Our collection of tutorials reproduces real-world computational and data journalism workflows written by journalists at leading news organizations, including _The New York Times_, _ProPublica_, _BuzzFeed News_, and more. Each workflow was originally performed in programming languages, such as Python or R, and these tutorials show how to reproduce the equivalent consolidated data table using OpenRoundup's click-based interface. It provides a practical activity, complete with source data and step-by-step instructions, to help you learn how to use OpenRoundup to [consolidate tables](../references/glossary#consolidate-tables).

If you're new to OpenRoundup, we recommend starting with the [conceptual guide](../conceptual-guide/) before diving into these tutorials.

We also categorize these workflows by type and difficulty.

- **Type**:
  - **stack-only**: Only uses stack operations to combine tables by appending rows together.
  - **pack-only**: Only uses pack operations to combine tables by joining columns together.
  - **hybrid**: Combines both stack and pack operations in the same workflow.
- **Difficulty**:
  - **simple**:
  - **moderate**: A workflow that involves multiple stack and/or pack operations, some data transformations, and requires more familiarity with OpenRoundup's features.
  - **advanced**: A workflow that involves complex combinations of stack and pack operations, significant data transformations, and may require creative

## Getting started

These tutorials provide an easy-to-follow introduction to using OpenRoundup with real-world data and workflows.

### [U.S. Refugee Resettlement](./2015-11-refugees-in-the-united-states/)

**workflow type**: _Pack-only_

This workflow analyzes U.S. refugee resettlement data by state, combining a table of refugee arrivals by destination with a table of U.S. Census state population estimates to calculate per-capita refugee resettlement rates by state. It showcases how the _pack_ operation surfaces common problems when joining tables together and how to resolve those mismatches by modifying the pack parameters.

## Next steps

Once you've got the basics down, these tutorials will help you learn how to use OpenRoundup for more complex workflows.

### [Voter Registration](./2018-voter-registration/)

**workflow type**: _Stack-only_

This workflow analyzes Maryland voter registration data across multiple elections to identify registration trends, patterns of voter movement between counties, and demographic shifts in voter registration over time. In this workflow, we compose multiple stack operations together to incrementally assemble 11 tables of annually published voter registration data.

### [Crime and Heat](./2018-05-31-crime-and-heat-analysis/)

**workflow type**: _Hybrid_

This workflow analyzes the relationship between violent crime and daily temperature in St. Louis, Missouri, by combining data from NOAA and the metropolitan police department. It uses both _stack_ and _pack_ operations to combine multiple 2 tables of weather and 1 table of crime incident data.

### [IRS Audit Rates by County](./auditData/)

**workflow type** : _Hybrid_

This workflow maps the distribution of IRS audits across U.S. counties, revealing that the audit rate in each county largely reflects how many taxpayers claimed the Earned Income Tax Credit (EITC). It involves stacking four tables together and then _packing_ the results with a fifth table. It is illustrative of instances where we use pre-processing in an external tool to address common data issues that are not yet supported or not planned on being supported in OpenRoundup.

<!-- ## Advanced workflows

#### [Democratic Candidate Co-Donors](./2019-04-democratic-candidate-codonors/)

**workflow type** : _Hybrid_

This workflow analyzes donors who gave more than $200 to multiple Democratic presidential candidates in the first quarter of the 2020 election cycle, using data from Federal Election Commission (FEC) campaign filings.

#### Long-Term Care Complaints Database

**workflow type** : _Hybrid workflow_ -->

_Last Updated:_ {{ site.time | date: '%B %d, %Y' }}
