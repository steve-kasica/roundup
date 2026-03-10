---
title: "How to delete irrelevant columns"
layout: default
nav_exclude: true
---

# How to delete irrelevant columns

Deleting irrelevant columns is a common sub-task in _data consolidation_. Raw data often contains columns that are not needed for analysis, and removing them can simplify your workflow and improve performance. OpenRoundup offers multiple ways of removing columns throughout the workflow.

## Within an operation

You're able to delete columns from the schema view of both _stack_ and _pack_ operations. This is particularly useful for handling schema drift across tables, allowing you to delete irrelevant columns to align table schemas before stacking them together.

### Deleting columns within a stack

Within a stack operation, you can delete columns using shift+click selection on a contiguous block of child table columns. This is particularly useful for handling schema drift across tables, allowing you to delete irrelevant columns to align table schemas before stacking them together.
![alt text](./delete-columns-stack.gif)

### Deleting columns witthin a pack

TODO

## Deleting in bulk across all tables

From the columns list, in the left-hand sidebar, you can select multiple columns across tables and delete them in bulk via the actions dropdown. This way of deleting columns is particularly useful for _trimming_ source tables, removing irrelevant columns to reduce the complexity of aligning table columns within a _stack operation_.
![alt text](./delete-columns-bulk.gif)
