import { getDuckDB } from "../duckdbClient";

// Register a single file in DuckDB's virtual FS
export async function registerFile(file, db) {
  const duckdb = db || (await getDuckDB());
  const text = await file.text();
  return duckdb.registerFileText(file.name, text);
}

// Register multiple files in DuckDB's virtual FS
export async function registerFiles(files) {
  const db = await getDuckDB();
  return Promise.all(files.map((file) => registerFile(file, db)));
}
