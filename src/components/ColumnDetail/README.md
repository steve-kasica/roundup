# Column Detail Component

This component provides a detailed view of a single specific column in a dataset, displaying various statistics and visualizations related to that column. It is designed to help users understand the characteristics of the data contained within the column.

## Section features

This component is divided into three sections: Metadata, Quality, and Values.

### Metadata

This section displays basic information about the column, e.g. name, data type, mode, and min/max values for quantitative data. It helps users quickly grasp the nature of the data in the column in the same way that functions such as [`pandas.DataFrame.describe`](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.describe.html) or [`skimr`](https://docs.ropensci.org/skimr/) in R.

### Quality

This section provides insights into the quality of the data in the column in two novel metrics: completeness and uniqueness.

- **Completeness**: the proportion of null to non-null values in the column.
- **Uniqueness**: the proportion of unique values to duplicate values in the column.

This section include a donut chart visualization to help users quickly assess the quality of the data while providing exact number of the values that comprise each metric.

### Values

This seciton displays column values aggregated by two metrics: unique values and value length.

#### Unique values

When the Group by option is set to "Unique Values", the column values are aggregated by their unique values. Each unique value in the column is displayed along with the count of column cells that contain that value.
We visualize this data as a bar chart to help users quickly identify the most common values in the column. We follow the same approach used in commercial data profiling tools, such as Tableau Prep, that display the bar encoding the frequency of each unique value in the column behind the value label itself.

### Value length

When the Group by option is set to "Value Length", the column values are aggregated by their length (in characters). Each value length is displayed along with the count of column cells that have values of that length.
We visualize this data as a bar chart to help users quickly identify the most common value lengths in the column. This view is useful for identifying outliers or inconsistencies in data entry, such as unusually short or long values that may indicate errors or special cases.
