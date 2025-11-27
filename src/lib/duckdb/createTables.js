// TODO: I might need to get more into sniff
// https://motherduck.com/blog/taming-wild-csvs-with-duckdb-data-engineering/
import { DUCKDB_TYPE_VARCHAR } from "./columnTypes";
import { getDuckDB } from "./duckdbClient";
import { SUPPORTED_TYPES } from "./columnTypes";

// Remove VARCHAR from auto type candidates b/c its the default
const AUTO_TYPE_CANDIDATES = SUPPORTED_TYPES.filter(
  (type) => type !== DUCKDB_TYPE_VARCHAR
);

export async function createTables(tableName, fileName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const results = [];

  // Create the table
  await conn.query(
    `CREATE TABLE "${tableName}" AS 
    SELECT * FROM read_csv_auto('${fileName}', 
    AUTO_TYPE_CANDIDATES=${JSON.stringify(AUTO_TYPE_CANDIDATES)});`
  );

  await conn.close();
  return results;
}
