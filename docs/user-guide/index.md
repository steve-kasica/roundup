---
title: User Guide
nav_order: 2
layout: default
---

# Using Roundup

This document provides more in-depth instructions on specific aspects of using Roundup.

## Table of contents

TODO

## Instructions

TODO

### Working with columns

TODO

#### Comparing values between multiple columns

TODO

#### Deleting columns

Roundup offers two ways to delete columns: within a table via the schema editor or across all tables via the columns list.

##### Deleting from a table

TODO

#### Deleting columns within a stack

Within a stack operation, you can delete columns using shift+click selection upon a contiguous block of child table columns. This is particularly useful for handling schema drift across tables, allowing you to delete irrelevant columns to align table schemas before stacking them together.
![alt text](./delete-columns-stack.gif)

##### Deleting in bulk across all tables

From the columns list, in the left-hand sidebar, you can select multiple columns across tables and delete them in bulk via the actions dropdown. This way of deleting columns is particularly useful for _trimming_ source tables, removing irrelevant columns to reduce the complexity of aligning table columns within a _stack operation_.
![alt text](./delete-columns-bulk.gif)

#### Getting single column summaries

TODO

#### Hiding columns from the table view

TODO

#### Rearranging columns within a table

TODO

#### Renaming columns

TODO

### Working with tables

TODO

#### Deleting tables

TODO

#### Inserting tables into an existing operation

TODO

#### Changing table position within an operation

TODO

#### Renaming a table

TODO

### Working with operations

TODO

### General operation management

TODO

#### Deleting operations

TODO

#### Renaming operations

TODO

#### Working with stack operations

#### Creating a stack operation

In Roundup, you can create a stack operation by selecting two or more tables and choosing "Stack" from the actions dropdown. This will create a new stack operation with the selected tables as input. Roundup will automatically focus on this newly created operation and display stack operation parameters in the left-hand sidebar.
![alt text](./create-stack.gif)

##### Changing table order

TODO

#### Working with pack operations

TODO

##### Specifying parameters

TODO
