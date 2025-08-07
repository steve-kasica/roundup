import { getDuckDB } from "./duckdbClient";

export async function calcPackStats(
  leftTableId,
  rightTableId,
  leftColumnId,
  rightColumnId,
  joinType
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
  const query = `
    -- Get detailed match type counts including one-to-one vs many-to-many breakdown
    SELECT 
        COUNT(CASE WHEN left_value IS NULL THEN 1 END) as left_unjoined,
        COUNT(CASE WHEN right_value IS NULL THEN 1 END) as right_unjoined,
        COUNT(CASE WHEN right_value IS NOT NULL AND left_value IS NOT NULL 
            AND left_matches = 1 AND right_matches = 1 THEN 1 END) as one_to_one_matches,
        COUNT(CASE WHEN right_value IS NOT NULL AND left_value IS NOT NULL 
            AND (left_matches > 1 OR right_matches > 1) THEN 1 END) as many_to_many_matches
    FROM (
        SELECT 
        ${leftTableId}.${leftColumnId} AS left_value,
        ${rightTableId}.${rightColumnId} AS right_value,
        COUNT(*) OVER (PARTITION BY ${leftTableId}.${leftColumnId}) as left_matches,
        COUNT(*) OVER (PARTITION BY ${rightTableId}.${rightColumnId}) as right_matches
        FROM ${leftTableId}
        FULL OUTER JOIN ${rightTableId}
        ON ${predicates[joinType]}
    ) join_analysis
`;
  const response = await conn.query(query);
  await conn.close();
  const {
    left_unjoined,
    right_unjoined,
    one_to_one_matches,
    many_to_many_matches,
  } = response.toArray().map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert all counts to numbers
  return {
    left_unjoined: Number(left_unjoined),
    right_unjoined: Number(right_unjoined),
    one_to_one_matches: Number(one_to_one_matches),
    many_to_many_matches: Number(many_to_many_matches),
  };
}
