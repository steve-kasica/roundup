---
title: "Conceptual Guide"
layout: default
nav_order: 1
---

# Conceptual guide

This section contains conceptual guides that provide high-level overviews of key concepts and principles in Roundup. These guides are designed to help you understand the underlying ideas and approaches that inform the design and functionality of Roundup, and to provide a foundation for using Roundup effectively in your data consolidation workflows.

## OpenRoundup works within an _eager table consolidation_ workflows

We envision OpenRoundup being one of many tools used within an _eager table consolidation_ workflows: where users perform the step of integrating multiple tables together relatively early in the overall data wrangling workflow and perform further data wrangling tasks downstream. Typically data wrangling workflows performed in programming langauges, such as Python and R, follow what we call a _delayed table consolidation_ workflows: where the step of integrating multiple tables together is delayed until the end of the workflow, after all data cleaning and transformation steps have been performed on individual tables.

~[alt text](./delayed-integration.gif)~

In contrast, an _eager table consolidation_ workflow integrates tables as early in the process as possible, allowing users to perform data cleaning and transformation tasks on the consolidated table downstream. This approach is particularly useful for workflows that involve a large number of tables, where it may be more efficient to perform data cleaning and transformation tasks on a single consolidated table rather than on multiple individual tables.

~[alt text](./eager-integration.gif)~

Roundup expect a few tasks to be performed upstream, prior to importing data into roundup:

- **Data extraction**: Roundup does not support the extraction of data from unstructured sources, such as PDFs, websites, and APIs. We expect users to perform this step using external tools before importing data into Roundup. Roundup also expects that the first row of a table is the column header row, and that the column names are unique within a table.
- **Data aggregation**: Roundup does not _currently_ support the aggregation of data within a single table, so we expect users to perform this step using external tools before importing data into Roundup.
- **Data trimming**: Roundup works best when source tables have been trimmed of irrelevant columns or rows. While Roundup does support support limited deletion of rows and columns. It is advantageous to remove batches of irrelevant rows and columns using external tools before importing data into Roundup.

## Roundup supports a _snowball approach_ to composite table assembly

Roundup supports a _snowball approach_ to [composite table assembly](../reference/glossery#composite-table): the incremental assembly of a single integrated table through the composition of two operations on groups of tables, _stacking_ and _packing_. These operations are designed to be flexible and composable, allowing users to build complex data transformations through a series of simple steps.

![alt text](./snowball-animation.gif)

### _Stacking_ tables

TODO

### _Packing_ tables

TODO
