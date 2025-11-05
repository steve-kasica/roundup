import { getDuckDB } from "./duckdbClient";

export async function calcPackStats(
  leftTableId,
  rightTableId,
  leftColumnName,
  rightColumnName,
  joinType
) {
  const db = await getDuckDB();
  const conn = await db.connect();
  // TODO: refactor to util file for DRY
  const predicates = {
    EQUALS: `${leftTableId}.${leftColumnName} = ${rightTableId}.${rightColumnName}`,
    CONTAINS: `contains(${leftTableId}.${leftColumnName}, ${rightTableId}.${rightColumnName})`,
    STARTS_WITH: `starts_with(${leftTableId}.${leftColumnName}, ${rightTableId}.${rightColumnName})`,
    ENDS_WITH: `ends_with(${leftTableId}.${leftColumnName}, ${rightTableId}.${rightColumnName})`,
  };
  const query = `
    -- Count output rows by join relationship type
    WITH join_analysis AS (
        SELECT 
            ${leftTableId}.${leftColumnName} AS left_value,
            ${rightTableId}.${rightColumnName} AS right_value
        FROM ${leftTableId}
        FULL OUTER JOIN ${rightTableId}
        ON ${predicates[joinType]}
    )
    SELECT 
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL THEN 1 END) as matches,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NULL THEN 1 END) as left_unmatched,
        COUNT(CASE WHEN left_value IS NULL AND right_value IS NOT NULL THEN 1 END) as right_unmatched
    FROM join_analysis
`;
  const response = await conn.query(query);
  await conn.close();
  const { matches, left_unmatched, right_unmatched } = response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert all counts to numbers
  return {
    matches: Number(matches),
    left_unmatched: Number(left_unmatched),
    right_unmatched: Number(right_unmatched),
  };
}
