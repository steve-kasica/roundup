---
layout: workflow
title: "Join Demo - Multiplicative Effect Example"
author: ""
publication: ""
date: ""
original_url: ""
github_url: ""
category: "pack"
difficulty: "simple"
data-link: /roundup/workflows/join-demo/join-demo.zip
nav_exclude: true
---

# Join Demo: Multiplicative Effect Example

## Overview

This is a demonstration workflow illustrating how joining tables on non-key columns produces a multiplicative effect on row count. It also demonstrates what happens with unmatched rows and shows how LIKE/CONTAINS matching works in Roundup's pack operation. It is intended as a teaching example rather than a real-world analysis.

## Data Sources

Two small CSV tables are provided:

- `customers.csv` — 8 customers across 5 cities (New York, Los Angeles, Chicago, Miami, Seattle), with columns: `customer_id`, `name`, `city`, `age`, `email`, `interests`.
- `stores.csv` — 9 stores across 5 cities (New York, Los Angeles, Chicago, Phoenix, Portland), with columns: `store_id`, `store_name`, `city`, `category`, `products`, `email_domain`.
- `customers2.csv` — a variant of `customers.csv` for additional join scenarios.
- `online_customers.csv` — online customer data for CONTAINS/LIKE matching examples.

## Key Concepts Demonstrated

### Multiplicative Effect (Exact Match Join on `city`)

Joining `customers` and `stores` on `city` produces more rows than either source table because multiple customers and stores share the same city:

- **New York**: 2 customers × 3 stores = 6 rows
- **Los Angeles**: 2 customers × 2 stores = 4 rows
- **Chicago**: 1 customer × 1 store = 1 row
- **Inner Join Total**: 11 rows from 8 customers and 9 stores

### Unmatched Rows

- **Customers without stores**: Miami (2 customers), Seattle (1 customer)
- **Stores without customers**: Phoenix (2 stores), Portland (1 store)

## Workflow Steps

### Roundup Steps

1. Import `customers.csv` and `stores.csv` into Roundup.
2. Create a _pack_ operation joining the two tables on the `city` column using equality matching.
3. Observe the multiplicative effect: the result has more rows than either source table.
4. Experiment with join predicates (inner, left outer, right outer, full outer) to see how unmatched rows are handled.
5. Try CONTAINS matching on the `email` and `email_domain` columns using `online_customers.csv` to demonstrate fuzzy/partial matching.
