import { getDuckDB } from "./duckdbClient";

import { MATCH_TYPES } from "../../components/OperationDetail/PackDetail/PackOutputDetails/MatchDetail/withMatchDetailData";

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

  const matchTypes = {};
  matchTypes[
    MATCH_TYPES.LEFT_UNJOINED
  ] = `left_value IS NOT NULL AND right_value IS NULL`;
  matchTypes[
    MATCH_TYPES.RIGHT_UNJOINED
  ] = `left_value IS NULL AND right_value IS NOT NULL`;
  matchTypes[
    MATCH_TYPES.MATCHES
  ] = `left_value IS NOT NULL AND right_value IS NOT NULL`;

  // TODO: add pagination support
  // TODO: should i group this to addresses predicate duplication?
  const query = `
    SELECT 
        ${leftTableId}.${leftColumnId} AS left_value,
        ${rightTableId}.${rightColumnId} AS right_value,
        CASE 
            WHEN ${leftTableId}.${leftColumnId} IS NULL THEN 0
            ELSE COUNT(*) OVER (PARTITION BY ${leftTableId}.${leftColumnId})
        END as left_count,
        CASE 
            WHEN ${rightTableId}.${rightColumnId} IS NULL THEN 0
            ELSE COUNT(*) OVER (PARTITION BY ${rightTableId}.${rightColumnId})
        END as right_count,
        left_count * right_count AS total_count
    FROM ${leftTableId}
    FULL OUTER JOIN ${rightTableId}
    ON ${predicates[joinPredicate]}
    WHERE ${matchTypes[matchType]}
    ORDER BY ${order} ${order_direction}
    LIMIT ${limit};
`;
  console.log("Executing query:", query);
  const response = await conn.query(query);
  await conn.close();
  return response.toArray().map((proxyStruct) => proxyStruct.toJSON());
}
