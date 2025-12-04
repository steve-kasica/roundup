import { JOIN_TYPES } from "../../slices/operationsSlice";
import { getDuckDB } from "./duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createPackView(queryData, columnList = null) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(queryData, columnList);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(data, columnList = null) {
  const leftTable = data.children[0].tableName;
  const leftColumns = data.children[0].columnNames;
  const rightTable = data.children[1].tableName;
  const rightColumns = data.children[1].columnNames;
  const { joinType, leftKey, rightKey, joinPredicate } = data;

  // TODO: refactor to util file for DRY
  const predicates = {
    EQUALS: `${leftTable}.${leftKey} = ${rightTable}.${rightKey}`,
    CONTAINS: `contains(${leftTable}.${leftKey}, ${rightTable}.${rightKey})`,
    STARTS_WITH: `starts_with(${leftTable}.${leftKey}, ${rightTable}.${rightKey})`,
    ENDS_WITH: `ends_with(${leftTable}.${leftKey}, ${rightTable}.${rightKey})`,
  };

  let definition = "";
  if (joinType === JOIN_TYPES.LEFT_ANTI) {
    definition = `
      SELECT *
      FROM ${leftTable} 
      ANTI JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      `;
  } else if (joinType === JOIN_TYPES.RIGHT_ANTI) {
    // Right anti-join: return rows from right table that don't match left table
    // Swap table order and use ANTI JOIN
    const rightAntiPredicate = predicates[joinPredicate]
      .replace(`${leftTable}.${leftKey}`, `${rightTable}.${rightKey}`)
      .replace(`${rightTable}.${rightKey}`, `${leftTable}.${leftKey}`);
    definition = `
      SELECT *
      FROM ${rightTable} 
      ANTI JOIN ${leftTable}
      ON ${rightAntiPredicate}
    `;
  } else if (joinType === JOIN_TYPES.FULL_ANTI) {
    // Full anti-join: return rows from both tables that don't match
    // Use FULL OUTER JOIN approach to get combined schema, then filter out matches
    definition = `
      SELECT ${leftTable}.*, ${rightTable}.*
      FROM ${leftTable} 
      FULL OUTER JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      WHERE ${leftTable}.${leftKey} IS NULL OR ${rightTable}.${rightKey} IS NULL
    `;
  } else if (joinType === JOIN_TYPES.FULL) {
    // Full outer join with custom ordering:
    // 1. Matched rows (both sides have values)
    // 2. Left-only rows (right side is NULL)
    // 3. Right-only rows (left side is NULL)
    definition = `
      SELECT *
      FROM ${leftTable} 
      FULL OUTER JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      ORDER BY 
        CASE 
          WHEN ${leftTable}.${leftKey} IS NOT NULL AND ${rightTable}.${rightKey} IS NOT NULL THEN 1
          WHEN ${leftTable}.${leftKey} IS NOT NULL AND ${rightTable}.${rightKey} IS NULL THEN 2
          WHEN ${leftTable}.${leftKey} IS NULL AND ${rightTable}.${rightKey} IS NOT NULL THEN 3
        END
    `;
  } else {
    // DuckDB offers native support for other supported join types
    definition = `
      SELECT *
      FROM ${leftTable} 
      ${joinType} JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
    `;
  }

  const columnSpec = columnList ? `(${columnList.join(", ")})` : "";
  const query = `
    CREATE OR REPLACE TABLE ${data.viewName}${columnSpec} AS
    ${definition}`;
  return query;
}
