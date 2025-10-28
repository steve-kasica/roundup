import {
  validateMissingLeftJoinKey,
  validateMissingRightJoinKey,
} from "../../slices/alertsSlice/Alerts/PackOperationAlerts/MissingJoinKey";
import { validateMissingJoinPredicate } from "../../slices/alertsSlice/Alerts/PackOperationAlerts/MissingJoinPredicate";
import { validateMissingJoinType } from "../../slices/alertsSlice/Alerts/PackOperationAlerts/MissingJoinType";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import { getDuckDB } from "./duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createPackView(opData, columnList = null) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(opData, columnList);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(op, columnList = null) {
  const table1 = op.children[0].id;
  const table2 = op.children[1].id;
  const { joinType, joinKey1, joinKey2, joinPredicate } = op;

  // These are fatal errors - we cannot proceed
  validateMissingLeftJoinKey(op);
  validateMissingRightJoinKey(op);
  validateMissingJoinPredicate(op);
  validateMissingJoinType(op);

  // TODO: refactor to util file for DRY
  const predicates = {
    EQUALS: `${table1}.${joinKey1} = ${table2}.${joinKey2}`,
    CONTAINS: `contains(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
    STARTS_WITH: `starts_with(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
    ENDS_WITH: `ends_with(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
  };

  let definition = "";
  if (joinType === JOIN_TYPES.LEFT_ANTI) {
    definition = `
      SELECT *
      FROM ${table1} 
      ANTI JOIN ${table2}
      ON ${predicates[joinPredicate]}
      `;
  } else if (joinType === JOIN_TYPES.RIGHT_ANTI) {
    // Right anti-join: return rows from right table that don't match left table
    // Swap table order and use ANTI JOIN
    const rightAntiPredicate = predicates[joinPredicate]
      .replace(`${table1}.${joinKey1}`, `${table2}.${joinKey2}`)
      .replace(`${table2}.${joinKey2}`, `${table1}.${joinKey1}`);
    definition = `
      SELECT *
      FROM ${table2} 
      ANTI JOIN ${table1}
      ON ${rightAntiPredicate}
    `;
  } else if (joinType === JOIN_TYPES.FULL_ANTI) {
    // Full anti-join: return rows from both tables that don't match
    // Use FULL OUTER JOIN approach to get combined schema, then filter out matches
    definition = `
      SELECT ${table1}.*, ${table2}.*
      FROM ${table1} 
      FULL OUTER JOIN ${table2}
      ON ${predicates[joinPredicate]}
      WHERE ${table1}.${joinKey1} IS NULL OR ${table2}.${joinKey2} IS NULL
    `;
  } else {
    // DuckDB offers native support for other supported join types
    definition = `
      SELECT *
      FROM ${table1} 
      ${joinType} JOIN ${table2}
      ON ${predicates[joinPredicate]}
    `;
  }

  const columnSpec = columnList ? `(${columnList.join(", ")})` : "";
  const query = `
    CREATE OR REPLACE VIEW ${op.id}${columnSpec} AS
    ${definition}`;
  return query;
}
