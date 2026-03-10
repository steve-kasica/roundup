---
title: "How to combine tables together"
layout: default
nav_exclude: true
---

# How to combine tables together

OpenRoundup supports two main operations for combining tables together: _stack_ and _pack_. A stack operation combines tables vertically by appending rows together, equivalent to a SQL `UNION` operation. A pack operation combines tables horizontally by appending columns together.

## Stacking tables together

From the tables list, you can _stack_ tables together by selecting two or more uploaded tables and choosing "Stack" from the actions dropdown. This will create a new stack operation with the selected tables as input. Roundup will automatically focus on this newly created operation and display stack operation parameters in the left-hand sidebar.
![alt text](./create-stack.gif)

## Packing tables together

## Inserting tables into an existing operation

OpenRoundup also supports inserting tables into an existing stack or pack operation. To insert a table into an existing operation, select the table you want to insert and choose "Insert" from the actions dropdown. This will add a table to the current focused operation.
