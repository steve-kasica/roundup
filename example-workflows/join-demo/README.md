# Join Demo: Multiplicative Effect Example

This directory contains two small tables that demonstrate the multiplicative effect of joining on non-key columns, plus scenarios with unmatched rows and LIKE/CONTAINS matching.

## Tables

### customers.csv

- 8 customers across 5 cities (New York, Los Angeles, Chicago, Miami, Seattle)
- Multiple customers per city in some cases
- Columns: customer_id, name, city, age, email, interests

### stores.csv

- 9 stores across 5 cities (New York, Los Angeles, Chicago, Phoenix, Portland)
- Multiple stores per city in some cases
- Columns: store_id, store_name, city, category, products, email_domain

## Join Scenarios

### 1. Exact Match Joins (on city)

**New York**: 2 customers × 3 stores = 6 result rows
**Los Angeles**: 2 customers × 2 stores = 4 result rows  
**Chicago**: 1 customer × 1 store = 1 result row

**Inner Join Total**: 11 result rows

### 2. Unmatched Rows

**Customers without stores**: Miami (2 customers), Seattle (1 customer)
**Stores without customers**: Phoenix (2 stores), Portland (1 store)

### 3. LIKE/CONTAINS Scenarios (Multiplicative Explosion!)
