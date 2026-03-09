---
title: "Conceptual framework"
layout: default
---

# Conceptual framework

Round is desgined to support _table consolidation_: the processing of combining multiple tables stored in flat files together into a single consolidated table for analysis. To accomplish this task, Roundup's user interface instantiates a conceptual framework for data integration that diverges from other open-source and commercial tools in two key ways: a _snowball approach_ to table assembly within a _eager data integration_ workflow.

## Roundup is designed to support _table consolidation_

When should you use Roundup? We use the term _table consolidation_ to describe a specific context of data integration:

- **Data is stored in heterogeneous data formats**: You have many CSVs, Excel files, etc. that need to be combined together into a data for analysis.
  - Implicit in this data format is the lack of contextual information about the data that is typically available in structured databases, such as data types, column schemas, and relationships between tables.
- **Data is in a tabular format**: Your data is organized in rows and columns that represent as a single table. Roundup does not support the integration of non-tabular data, such as text documents, nested data (e.g. nested JSON and XML), and images.
- **Wrangling is exploratory in nature**: You are not trying to build a repeatable data pipeline, but rather trying to understand the data and perform ad-hoc analysis. Roundup is not designed for building repeatable data pipelines, but rather for supporting the exploratory data wrangling process.

## Roundup employs a _snowball approach_ to table assembly

Roundup supports a _snowball approach_ to table assembly: the incremental assembly of a single integrated table through the composition of two operations on groups of tables, _stacking_ and _packing_. These operations are designed to be flexible and composable, allowing users to build complex data transformations through a series of simple steps.

![alt text](./snowball-animation.gif)

### _Stacking_ tables

TODO

### _Packing_ tables

TODO

## Roundup works within an _eager data integration_ workflows

We envision Roundup being one of many tools used within an _eager data integration_ workflows: where users perform the step of integrating multiple tables together relatively early in the overall data wrangling workflow and perform further data wrangling tasks downstream. Typically data wrangling workflows performed in programming langauges, such as Python and R, follow what we call a _delayed data integration_ workflows: where the step of integrating multiple tables together is delayed until the end of the workflow, after all data cleaning and transformation steps have been performed on individual tables.

~[alt text](./delayed-integration.gif)~

In contrast, an _eager data integration_ workflow integrates tables as early in the process as possible, allowing users to perform data cleaning and transformation tasks on the consolidated table downstream. This approach is particularly useful for workflows that involve a large number of tables, where it may be more efficient to perform data cleaning and transformation tasks on a single consolidated table rather than on multiple individual tables.

~[alt text](./eager-integration.gif)~

Roundup expect a few tasks to be performed upstream, prior to importing data into roundup:

- **Data extraction**: Roundup does not support the extraction of data from unstructured sources, such as PDFs, websites, and APIs. We expect users to perform this step using external tools before importing data into Roundup. Roundup also expects that the first row of a table is the column header row, and that the column names are unique within a table.
- **Data aggregation**: Roundup does not _currently_ support the aggregation of data within a single table, so we expect users to perform this step using external tools before importing data into Roundup.
- **Data trimming**: Roundup works best when source tables have been trimmed of irrelevant columns or rows. While Roundup does support the deletion of columns, it does not _currently_ support the deletion of rows. We expect users to perform this step using external tools before importing data into Roundup.
