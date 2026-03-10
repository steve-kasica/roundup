---
title: "Glossary"
layout: default
nav_exclude: true
---

# Glossary

### Composite table

A table that is created by combining data from multiple source tables through operations such as stacking and packing. A composite table is the result of a table consolidation process and serves as a unified table schema for analysis.

### Eager data integration

A data integration approach where all data is consolidated into a single composite table prior to other data wrangling tasks. This approach emphasizes having a complete, unified dataset available for analysis. This approach is one fundamental way that OpenRoundup differ from other research, open-source, and commercial data integration and ETL tools.

### Pack Operation

A data merging operation that combines tables based on shared columns, similar to a SQL `join`. Also referred to as packing tables together.

### Snowball approach

A method of composite table assembly where you start with one table and iteratively combine it with other tables, allowing you to build up a composite table in a step-by-step manner. This approach is one fundamental way that OpenRoundup differ from other research, open-source, and commercial data integration and ETL tools.

### Stack Operation

A data merging operation that combines tables by appending rows together, similar to a SQL `union`. Also referred to as stacking tables together.

### Table consolidation

The process of combining data from multiple static sources into a single, unified table for further analysis and visualization. In addition to combining tables together, this task also can encompase aligning schemas and removing irrelevant rows and columns. We use this term to describe a specific context of data integration:

- **Data is static**: You have a fixed set of tables that you want to combine together into a single composite table for analysis. Roundup is not designed for building repeatable data pipelines, or processing dynamic data.
- **Data is stored in heterogeneous data formats**: You have many CSVs, Excel files, etc. that need to be combined together into a data for analysis.
  - Implicit in this data format is the lack of contextual information about the data that is typically available in structured databases, such as data types, column schemas, and relationships between tables.
- **Data is in a tabular format**: Your data is organized in rows and columns that represent as a single table. Roundup does not support the integration of non-tabular data, such as text documents, nested data (e.g. nested JSON and XML), and images.
- **Wrangling is exploratory in nature**: You are not trying to build a repeatable data pipeline, but rather trying to understand the data and perform ad-hoc analysis. Roundup is not designed for building repeatable data pipelines, but rather for supporting the exploratory data wrangling process.

Table consolidation workflows can exist on a spectrum between two extremes: _eager table consolidation_ workflows, where tables are consolidated into a single composite table early in the data wrangling process, and _delayed table consolidation_ workflows, where tables are consolidated at the end of the data wrangling process. Roundup is designed to support _eager table consolidation_ workflows.
