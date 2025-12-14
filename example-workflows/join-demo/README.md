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

<table>
    <tr>
        <th>customers.city</th>
        <th>stores.city</th>
        <th>name</th>
        <th>store_name</th>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Alice</td>
        <td>MegaMart</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Alice</td>
        <td>TechHub</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Alice</td>
        <td>BookNook</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Bob</td>
        <td>MegaMart</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Bob</td>
        <td>TechHub</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>New York</td>
        <td>New York</td>
        <td>Bob</td>
        <td>BookNook</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>Los Angeles</td>
        <td>Los Angeles</td>
        <td>Charlie</td>
        <td>SunnyMart</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>Los Angeles</td>
        <td>Los Angeles</td>
        <td>Charlie</td>
        <td>GadgetWorld</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>Los Angeles</td>
        <td>Los Angeles</td>
        <td>Diana</td>
        <td>SunnyMart</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>Los Angeles</td>
        <td>Los Angeles</td>
        <td>Diana</td>
        <td>GadgetWorld</td>
    </tr>
    <tr style="background-color:#e8f5e9">
        <td>Chicago</td>
        <td>Chicago</td>
        <td>Eve</td>
        <td>WindyBooks</td>
    </tr>
    <tr style="background-color:#fff3e0">
        <td>Miami</td>
        <td class="null-value">NULL</td>
        <td>Frank</td>
        <td class="null-value">NULL</td>
    </tr>
    <tr style="background-color:#fff3e0">
        <td>Miami</td>
        <td class="null-value">NULL</td>
        <td>Grace</td>
        <td class="null-value">NULL</td>
    </tr>
    <tr style="background-color:#fff3e0">
        <td>Seattle</td>
        <td class="null-value">NULL</td>
        <td>Henry</td>
        <td class="null-value">NULL</td>
    </tr>
    <tr style="background-color:#e3f2fd">
        <td class="null-value">NULL</td>
        <td>Phoenix</td>
        <td class="null-value">NULL</td>
        <td>PhoenixMart</td>
    </tr>
    <tr style="background-color:#e3f2fd">
        <td class="null-value">NULL</td>
        <td>Phoenix</td>
        <td class="null-value">NULL</td>
        <td>DesertTech</td>
    </tr>
    <tr style="background-color:#e3f2fd">
        <td class="null-value">NULL</td>
        <td>Portland</td>
        <td class="null-value">NULL</td>
        <td>PortlandBooks</td>
    </tr>
</table>

**New York**: 2 customers × 3 stores = 6 result rows
**Los Angeles**: 2 customers × 2 stores = 4 result rows  
**Chicago**: 1 customer × 1 store = 1 result row

**Inner Join Total**: 11 result rows

### 2. Unmatched Rows

**Customers without stores**: Miami (2 customers), Seattle (1 customer)
**Stores without customers**: Phoenix (2 stores), Portland (1 store)
