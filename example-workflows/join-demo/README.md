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

#### Email Domain Matching

- Customers with @gmail.com: Alice, Diana, Frank (3 customers)
- Stores with .com domains: All 9 stores
- **Result**: 3 × 9 = 27 rows!

#### Interest-Product Matching

- Customers interested in "electronics": Alice, Charlie, Eve, Henry (4 customers)
- Stores selling "electronics": MegaMart, TechHub, GadgetWorld, WindyBooks, DesertTech (5 stores)
- **Result**: 4 × 5 = 20 rows!

- Customers interested in "books": Bob, Charlie, Eve, Grace (4 customers)
- Stores selling "books": BookNook, WindyBooks, PortlandBooks (3 stores)
- **Result**: 4 × 3 = 12 rows!

### Different Join Types

- **Inner Join (exact city)**: 11 rows
- **Left Join (exact city)**: 14 rows
- **LIKE Join (email contains .com)**: 72 rows (8 customers × 9 stores)
- **LIKE Join (interests contain electronics)**: 20 rows
- **LIKE Join (interests contain books)**: 12 rows

## Example Queries

```sql
-- Traditional exact match join
SELECT c.customer_id, c.name, s.store_id, s.store_name, c.city
FROM customers c
JOIN stores s ON c.city = s.city;

-- LIKE join on interests/products (multiplicative explosion!)
SELECT c.customer_id, c.name, c.interests, s.store_id, s.store_name, s.products
FROM customers c
JOIN stores s ON c.interests LIKE '%electronics%' AND s.products LIKE '%electronics%';

-- Email domain matching (even bigger explosion!)
SELECT c.customer_id, c.name, c.email, s.store_id, s.store_name, s.email_domain
FROM customers c
JOIN stores s ON c.email LIKE '%@%.com' AND s.email_domain LIKE '%.com';

-- Mixed conditions (exact + LIKE)
SELECT c.customer_id, c.name, s.store_id, s.store_name, c.city
FROM customers c
JOIN stores s ON c.city = s.city
              AND c.interests LIKE '%' || s.category || '%';
```
