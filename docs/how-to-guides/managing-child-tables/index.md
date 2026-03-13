---
title: Managing child tables
nav_exclude: true
layout: default
---

# Managing child tables

All operations in Roundup have two or more child tables, which can be either source tables uploaded directly to Roundup or other _materialized_ operations.

## Deleting child tables

To delete a child table, click the delete icon. It looks like a trash can/rubbish bin/garbage bin next to the table name in the operation view. This will delete the child table and remove it from an operation that depends upon it. You will be prompted to confirm this action before it is executed.

{% include video.html src="../../assets/delete-table" %}
