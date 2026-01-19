import { getDuckDB } from "./duckdbClient";

/**
 * Ranks column pairs from two tables by calculating the Jaccard Index for each pair.
 *
 * The Jaccard Index measures the similarity between two sets by dividing the size of the
 * intersection by the size of the union. This function computes the Jaccard Index for all
 * possible pairs of columns (cartesian product) from the specified columns in two tables,
 * comparing the unique values in each column pair.
 *
 * Results are sorted in descending order by Jaccard Index, with the most similar column
 * pairs appearing first. The Jaccard Index ranges from 0 (no overlap) to 1 (identical sets).
 *
 * @param {String} leftTableDatabaseName: The name of the left table in the database
 * @param {Array<String>} leftColumnsDatabaseNames: the name of the columns in the left table
 * @param {String} rightTableDatabaseName: The name of the right table in the database
 * @param {Array<String>} rightColumnsDatabaseNames: the name of the columns in the right table
 * @param {Number} offset: The number of rows to skip (default: 0)
 * @param {Number} limit: The maximum number of rows to return (default: 100)
 * @returns {Promise<Array<{left_column: string, right_column: string, jaccard_index: number}>>}
 */
export async function rankColumnKeys(
  leftTableDatabaseName,
  leftColumnsDatabaseNames,
  rightTableDatabaseName,
  rightColumnsDatabaseNames,
  offset = 0,
  limit = 100
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Generate a query for each column pair (cartesian product)
  const queries = [];
  for (const leftCol of leftColumnsDatabaseNames) {
    for (const rightCol of rightColumnsDatabaseNames) {
      queries.push(`
        SELECT 
          '${leftCol}' as left_column,
          '${rightCol}' as right_column,
          (
            SELECT COUNT(*) FROM (
              SELECT DISTINCT "${leftCol}" as val FROM ${leftTableDatabaseName}
              WHERE "${leftCol}" IS NOT NULL
              INTERSECT
              SELECT DISTINCT "${rightCol}" as val FROM ${rightTableDatabaseName}
              WHERE "${rightCol}" IS NOT NULL
            )
          )::FLOAT / NULLIF((
            SELECT COUNT(*) FROM (
              SELECT DISTINCT "${leftCol}" as val FROM ${leftTableDatabaseName}
              WHERE "${leftCol}" IS NOT NULL
              UNION
              SELECT DISTINCT "${rightCol}" as val FROM ${rightTableDatabaseName}
              WHERE "${rightCol}" IS NOT NULL
            )
          )::FLOAT, 0) as jaccard_index
      `);
    }
  }

  const query =
    queries.join(" UNION ALL ") +
    ` ORDER BY jaccard_index DESC OFFSET ${offset} LIMIT ${limit}`;

  const result = await conn.query(query);
  console.log("rankColumnKeys query:", query);
  await conn.close();

  return result.toArray().map((proxyStructRow) => {
    const plainObject = { ...proxyStructRow };
    return plainObject;
  });
}
