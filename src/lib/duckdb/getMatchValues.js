import { getDuckDB } from "./duckdbClient";
import { MATCH_TYPES } from "../../components/OperationsList/PackOperationParams/PackOutputDetails/MatchDetail/withMatchDetailData";
import { escapeColumnName } from "./utilities";

export async function getMatchValues(
  leftTableId,
  rightTableId,
  leftColumnName,
  rightColumnName,
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
    EQUALS: `${leftTableId}.${escapeColumnName(
      leftColumnName
    )} = ${rightTableId}.${escapeColumnName(rightColumnName)}`,
    CONTAINS: `contains(${leftTableId}.${escapeColumnName(
      leftColumnName
    )}, ${rightTableId}.${escapeColumnName(rightColumnName)})`,
    STARTS_WITH: `starts_with(${leftTableId}.${escapeColumnName(
      leftColumnName
    )}, ${rightTableId}.${escapeColumnName(rightColumnName)})`,
    ENDS_WITH: `ends_with(${leftTableId}.${escapeColumnName(
      leftColumnName
    )}, ${rightTableId}.${escapeColumnName(rightColumnName)})`,
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
          ${escapeColumnName(leftColumnName)} AS left_value,
          COUNT(*) as left_count
        FROM ${leftTableId}
        GROUP BY ${escapeColumnName(leftColumnName)}
      ),
      right_counts AS (
        SELECT 
          ${escapeColumnName(rightColumnName)} AS right_value,
          COUNT(*) as right_count
        FROM ${rightTableId}
        GROUP BY ${escapeColumnName(rightColumnName)}
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
      ${leftTableId}.${escapeColumnName(leftColumnName)} AS left_value,
      NULL AS right_value,
      COUNT(DISTINCT ${leftTableId}.${escapeColumnName(
      leftColumnName
    )}) AS left_count,
      0 AS right_count
    FROM ${leftTableId}
    WHERE ${leftTableId}.${escapeColumnName(
      leftColumnName
    )} NOT IN (SELECT DISTINCT ${rightTableId}.${escapeColumnName(
      rightColumnName
    )} FROM ${rightTableId} WHERE ${rightTableId}.${escapeColumnName(
      rightColumnName
    )} IS NOT NULL)
    GROUP BY ${leftTableId}.${escapeColumnName(leftColumnName)}
    LIMIT ${limit};
    `;
  } else if (matchType === MATCH_TYPES.RIGHT_UNJOINED) {
    query = `
    SELECT 
      NULL AS left_value,
      ${rightTableId}.${escapeColumnName(rightColumnName)} AS right_value,
      0 AS left_count,
      COUNT(DISTINCT ${rightTableId}.${escapeColumnName(
      rightColumnName
    )}) AS right_count
    FROM ${rightTableId}
    WHERE ${rightTableId}.${escapeColumnName(
      rightColumnName
    )} NOT IN (SELECT DISTINCT ${leftTableId}.${escapeColumnName(
      leftColumnName
    )} FROM ${leftTableId} WHERE ${leftTableId}.${escapeColumnName(
      leftColumnName
    )} IS NOT NULL)
    GROUP BY ${rightTableId}.${escapeColumnName(rightColumnName)}
    LIMIT ${limit};    
    `;
  } else {
    throw new Error(`Unsupported match type: ${matchType}`);
  }

  const response = await conn.query(query);
  await conn.close();
  return response.toArray().map((proxyStruct) => proxyStruct.toJSON());
}
