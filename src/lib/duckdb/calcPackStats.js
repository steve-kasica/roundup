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
    -- Count output rows by join relationship type
    WITH join_analysis AS (
        SELECT 
            ${leftTableId}.${leftColumnId} AS left_value,
            ${rightTableId}.${rightColumnId} AS right_value,
            COUNT(*) OVER (PARTITION BY ${leftTableId}.${leftColumnId}) as left_matches,
            COUNT(*) OVER (PARTITION BY ${rightTableId}.${rightColumnId}) as right_matches
        FROM ${leftTableId}
        FULL OUTER JOIN ${rightTableId}
        ON ${predicates[joinType]}
    )
    SELECT 
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL 
                   AND left_matches = 1 AND right_matches = 1 THEN 1 END) as one_to_one_matches,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL 
                   AND left_matches = 1 AND right_matches > 1 THEN 1 END) as one_to_many_matches,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL 
                   AND left_matches > 1 AND right_matches = 1 THEN 1 END) as many_to_one_matches,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL 
                   AND left_matches > 1 AND right_matches > 1 THEN 1 END) as many_to_many_matches,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NULL THEN 1 END) as one_to_zero_matches,
        COUNT(CASE WHEN left_value IS NULL AND right_value IS NOT NULL THEN 1 END) as zero_to_one_matches
    FROM join_analysis
`;
  const response = await conn.query(query);
  await conn.close();
  const {
    one_to_one_matches,
    one_to_many_matches,
    many_to_one_matches,
    many_to_many_matches,
    one_to_zero_matches,
    zero_to_one_matches,
  } = response.toArray().map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert all counts to numbers
  return {
    one_to_one_matches: Number(one_to_one_matches),
    one_to_many_matches: Number(one_to_many_matches),
    many_to_one_matches: Number(many_to_one_matches),
    many_to_many_matches: Number(many_to_many_matches),
    one_to_zero_matches: Number(one_to_zero_matches),
    zero_to_one_matches: Number(zero_to_one_matches),
  };
}
