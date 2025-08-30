import { getDuckDB } from "./duckdbClient";
import { MATCH_TYPES } from "../../components/OperationsList/PackOperationParams/PackOutputDetails/MatchDetail/withMatchDetailData";

export async function getMatchValues(
  leftTableId,
  rightTableId,
  leftColumnId,
  rightColumnId,
  joinPredicate,
  matchType,
  limit = 100,
  order = "total_count",
  order_direction = "DESC"
) {
  const db = await getDuckDB();
  const conn = await db.connect();
  // TODO: refactor to util file for DRY
  const predicates = {
    EQUALS: `${leftTableId}.${leftColumnId} = ${rightTableId}.${rightColumnId}`,
    CONTAINS: `contains(${leftTableId}.${leftColumnId}, ${rightTableId}.${rightColumnId})`,
    STARTS_WITH: `starts_with(${leftTableId}.${leftColumnId}, ${rightTableId}.${rightColumnId})`,
    ENDS_WITH: `ends_with(${leftTableId}.${leftColumnId}, ${rightTableId}.${rightColumnId})`,
  };

  const ctePredicates = {
    EQUALS: `l.left_value = r.right_value`,
    CONTAINS: `contains(l.left_value, r.right_value)`,
    STARTS_WITH: `starts_with(l.left_value, r.right_value)`,
    ENDS_WITH: `ends_with(l.left_value, r.right_value)`,
  };

  let query = "";
  if (matchType === MATCH_TYPES.MATCHES) {
    query = `
      WITH left_counts AS (
        SELECT 
          ${leftColumnId} AS left_value,
          COUNT(*) as left_count
        FROM ${leftTableId}
        GROUP BY ${leftColumnId}
      ),
      right_counts AS (
        SELECT 
          ${rightColumnId} AS right_value,
          COUNT(*) as right_count
        FROM ${rightTableId}
        GROUP BY ${rightColumnId}
      )
      SELECT 
        l.left_value,
        r.right_value,
        l.left_count,
        r.right_count
      FROM left_counts l
      JOIN right_counts r ON ${ctePredicates[joinPredicate]}
      ORDER BY l.left_count * r.right_count ${order_direction}
      LIMIT ${limit};
    `;
  } else if (matchType === MATCH_TYPES.LEFT_UNJOINED) {
    query = `
    SELECT 
      ${leftTableId}.${leftColumnId} AS left_value,
      NULL AS right_value,
      COUNT(DISTINCT ${leftTableId}.${leftColumnId}) AS left_count,
      0 AS right_count
    FROM ${leftTableId}
    WHERE ${leftTableId}.${leftColumnId} NOT IN (SELECT DISTINCT ${rightTableId}.${rightColumnId} FROM ${rightTableId} WHERE ${rightTableId}.${rightColumnId} IS NOT NULL)
    GROUP BY ${leftTableId}.${leftColumnId}
    LIMIT ${limit};
    `;
  } else if (matchType === MATCH_TYPES.RIGHT_UNJOINED) {
    query = `
    SELECT 
      NULL AS left_value,
      ${rightTableId}.${rightColumnId} AS right_value,
      0 AS left_count,
      COUNT(DISTINCT ${rightTableId}.${rightColumnId}) AS right_count
    FROM ${rightTableId}
    WHERE ${rightTableId}.${rightColumnId} NOT IN (SELECT DISTINCT ${leftTableId}.${leftColumnId} FROM ${leftTableId} WHERE ${leftTableId}.${leftColumnId} IS NOT NULL)
    GROUP BY ${rightTableId}.${rightColumnId}
    LIMIT ${limit};    
    `;
  } else {
    throw new Error(`Unsupported match type: ${matchType}`);
  }

  console.log("Executing query:", query);
  const response = await conn.query(query);
  await conn.close();
  return response.toArray().map((proxyStruct) => proxyStruct.toJSON());
}
